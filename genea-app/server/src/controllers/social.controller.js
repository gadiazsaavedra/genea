const { supabaseClient } = require('../config/supabase.config');
const aiService = require('../services/ai.service');

const socialController = {
  // Buscar conexiones entre familias
  findFamilyConnections: async (req, res) => {
    try {
      const { familyId } = req.params;
      const userId = req.user.uid;

      // Obtener personas de la familia actual
      const { data: currentFamily, error: currentError } = await supabaseClient
        .from('people')
        .select('*')
        .eq('family_id', familyId);

      if (currentError) throw currentError;

      // Buscar en otras familias públicas
      const { data: otherFamilies, error: otherError } = await supabaseClient
        .from('people')
        .select(`
          *,
          families!inner(
            id,
            name,
            is_public
          )
        `)
        .neq('family_id', familyId)
        .eq('families.is_public', true);

      if (otherError) throw otherError;

      const connections = [];

      // Buscar coincidencias por apellido
      for (const person of currentFamily) {
        const matches = otherFamilies.filter(other => 
          other.last_name?.toLowerCase() === person.last_name?.toLowerCase() ||
          other.maiden_name?.toLowerCase() === person.last_name?.toLowerCase() ||
          other.last_name?.toLowerCase() === person.maiden_name?.toLowerCase()
        );

        for (const match of matches) {
          const relationship = aiService.analyzeRelationship(person, match);
          
          if (relationship.confidence > 0.5) {
            connections.push({
              person_in_family: person,
              person_in_other_family: match,
              other_family: match.families,
              suggested_relationship: relationship.type,
              confidence: relationship.confidence,
              evidence: relationship.evidence
            });
          }
        }
      }

      res.status(200).json({
        success: true,
        data: connections.sort((a, b) => b.confidence - a.confidence)
      });

    } catch (error) {
      console.error('Error finding family connections:', error);
      res.status(500).json({
        success: false,
        message: 'Error buscando conexiones familiares'
      });
    }
  },

  // Solicitar conexión con otra familia
  requestFamilyConnection: async (req, res) => {
    try {
      const { targetFamilyId, personId, targetPersonId, relationship, message } = req.body;
      const userId = req.user.uid;

      // Verificar que el usuario pertenece a una familia
      const { data: userFamily, error: familyError } = await supabaseClient
        .from('family_members')
        .select('family_id')
        .eq('user_id', userId)
        .single();

      if (familyError || !userFamily) {
        return res.status(403).json({
          success: false,
          message: 'No perteneces a ninguna familia'
        });
      }

      // Crear solicitud de conexión
      const { data: connection, error: connectionError } = await supabaseClient
        .from('family_connections')
        .insert({
          requesting_family_id: userFamily.family_id,
          target_family_id: targetFamilyId,
          requesting_person_id: personId,
          target_person_id: targetPersonId,
          suggested_relationship: relationship,
          message: message,
          requested_by: userId,
          status: 'pending'
        })
        .select()
        .single();

      if (connectionError) throw connectionError;

      // Notificar a los administradores de la familia objetivo
      const { data: targetAdmins, error: adminError } = await supabaseClient
        .from('family_members')
        .select('user_id')
        .eq('family_id', targetFamilyId)
        .eq('role', 'admin');

      if (!adminError && targetAdmins) {
        for (const admin of targetAdmins) {
          await supabaseClient
            .from('notifications')
            .insert({
              user_id: admin.user_id,
              type: 'family_connection_request',
              title: 'Nueva solicitud de conexión familiar',
              message: `Una familia quiere conectarse contigo`,
              data: { connection_id: connection.id },
              link: `/connections/${connection.id}`
            });
        }
      }

      res.status(201).json({
        success: true,
        data: connection
      });

    } catch (error) {
      console.error('Error requesting family connection:', error);
      res.status(500).json({
        success: false,
        message: 'Error solicitando conexión familiar'
      });
    }
  },

  // Obtener solicitudes de conexión pendientes
  getPendingConnections: async (req, res) => {
    try {
      const userId = req.user.uid;

      // Obtener familias del usuario
      const { data: userFamilies, error: familyError } = await supabaseClient
        .from('family_members')
        .select('family_id')
        .eq('user_id', userId);

      if (familyError) throw familyError;

      const familyIds = userFamilies.map(f => f.family_id);

      // Obtener conexiones pendientes
      const { data: connections, error: connectionError } = await supabaseClient
        .from('family_connections')
        .select(`
          *,
          requesting_family:requesting_family_id(name),
          target_family:target_family_id(name),
          requesting_person:requesting_person_id(first_name, last_name),
          target_person:target_person_id(first_name, last_name)
        `)
        .in('target_family_id', familyIds)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (connectionError) throw connectionError;

      res.status(200).json({
        success: true,
        data: connections
      });

    } catch (error) {
      console.error('Error getting pending connections:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo conexiones pendientes'
      });
    }
  },

  // Aprobar o rechazar conexión
  respondToConnection: async (req, res) => {
    try {
      const { connectionId } = req.params;
      const { action, response_message } = req.body; // 'approve' or 'reject'
      const userId = req.user.uid;

      // Verificar que el usuario puede responder a esta conexión
      const { data: connection, error: connectionError } = await supabaseClient
        .from('family_connections')
        .select(`
          *,
          target_family:target_family_id(
            family_members!inner(user_id, role)
          )
        `)
        .eq('id', connectionId)
        .single();

      if (connectionError || !connection) {
        return res.status(404).json({
          success: false,
          message: 'Conexión no encontrada'
        });
      }

      const isAdmin = connection.target_family.family_members.some(
        member => member.user_id === userId && member.role === 'admin'
      );

      if (!isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para responder a esta conexión'
        });
      }

      // Actualizar estado de la conexión
      const { error: updateError } = await supabaseClient
        .from('family_connections')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          response_message: response_message,
          responded_by: userId,
          responded_at: new Date().toISOString()
        })
        .eq('id', connectionId);

      if (updateError) throw updateError;

      // Si se aprueba, crear la relación
      if (action === 'approve') {
        await supabaseClient
          .from('relationships')
          .insert({
            person1_id: connection.requesting_person_id,
            person2_id: connection.target_person_id,
            relationship_type: connection.suggested_relationship,
            is_cross_family: true,
            created_at: new Date().toISOString()
          });
      }

      // Notificar al solicitante
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: connection.requested_by,
          type: 'family_connection_response',
          title: `Conexión familiar ${action === 'approve' ? 'aprobada' : 'rechazada'}`,
          message: `Tu solicitud de conexión fue ${action === 'approve' ? 'aprobada' : 'rechazada'}`,
          data: { connection_id: connectionId }
        });

      res.status(200).json({
        success: true,
        message: `Conexión ${action === 'approve' ? 'aprobada' : 'rechazada'} correctamente`
      });

    } catch (error) {
      console.error('Error responding to connection:', error);
      res.status(500).json({
        success: false,
        message: 'Error respondiendo a la conexión'
      });
    }
  },

  // Obtener estadísticas sociales
  getSocialStats: async (req, res) => {
    try {
      const userId = req.user.uid;

      // Obtener familias del usuario
      const { data: userFamilies, error: familyError } = await supabaseClient
        .from('family_members')
        .select('family_id')
        .eq('user_id', userId);

      if (familyError) throw familyError;

      const familyIds = userFamilies.map(f => f.family_id);

      // Estadísticas
      const stats = {
        connected_families: 0,
        pending_requests: 0,
        total_connections: 0,
        popular_surnames: []
      };

      // Conexiones aprobadas
      const { data: approvedConnections, error: approvedError } = await supabaseClient
        .from('family_connections')
        .select('*')
        .in('requesting_family_id', familyIds)
        .eq('status', 'approved');

      if (!approvedError) {
        stats.connected_families = approvedConnections.length;
      }

      // Solicitudes pendientes
      const { data: pendingConnections, error: pendingError } = await supabaseClient
        .from('family_connections')
        .select('*')
        .in('target_family_id', familyIds)
        .eq('status', 'pending');

      if (!pendingError) {
        stats.pending_requests = pendingConnections.length;
      }

      res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error getting social stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas sociales'
      });
    }
  }
};

module.exports = socialController;