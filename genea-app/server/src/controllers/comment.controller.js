const { supabaseClient } = require('../config/supabase.config');

const commentController = {
  // Crear un nuevo comentario
  createComment: async (req, res) => {
    try {
      const { content, media_id } = req.body;
      const userId = req.user.uid;
      
      if (!content || !media_id) {
        return res.status(400).json({
          success: false,
          message: 'Contenido y foto son requeridos'
        });
      }
      
      // Obtener nombre del usuario
      const { data: user, error: userError } = await supabaseClient.auth.admin.getUserById(userId);
      const userName = user?.user?.user_metadata?.full_name || user?.user?.email || 'Usuario';
      
      // Verificar que el medio existe y el usuario tiene acceso
      const { data: media, error: mediaError } = await supabaseClient
        .from('media')
        .select('*, people:person_id(family_id)')
        .eq('id', mediaId)
        .single();
      
      if (mediaError || !media) {
        return res.status(404).json({ 
          success: false,
          message: 'Medio no encontrado' 
        });
      }
      
      // Verificar acceso a la familia
      const { data: memberCheck, error: memberError } = await supabaseClient
        .from('family_members')
        .select('id')
        .eq('family_id', media.people.family_id)
        .eq('user_id', userId);
      
      if (memberError || !memberCheck || memberCheck.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este contenido'
        });
      }
      
      // Crear el comentario
      const { data: comment, error: commentError } = await supabaseClient
        .from('comments')
        .insert([{
          media_id: mediaId,
          user_id: userId,
          user_name: userName,
          user_photo_url: userPhotoURL,
          text,
          mentions: mentions || []
        }])
        .select()
        .single();
      
      if (commentError) throw new Error(commentError.message);
      
      // Crear notificaciones para las menciones
      if (mentions && mentions.length > 0) {
        const notificationPromises = mentions.map(mention => {
          return supabaseClient
            .from('notifications')
            .insert([{
              user_id: mention.userId,
              type: 'mention',
              title: 'Te han mencionado en un comentario',
              message: `${userName} te ha mencionado en un comentario: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
              data: {
                mediaId,
                commentId: comment.id
              },
              link: `/media/${mediaId}`
            }]);
        });
        
        await Promise.all(notificationPromises);
      }
      
      res.status(201).json({
        success: true,
        message: 'Comentario creado correctamente',
        data: comment
      });
    } catch (error) {
      console.error('Error al crear comentario:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al crear comentario', 
        error: error.message 
      });
    }
  },
  
  // Obtener comentarios de un medio
  getMediaComments: async (req, res) => {
    try {
      const { mediaId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user.uid;
      
      // Verificar que el medio existe y el usuario tiene acceso
      const { data: media, error: mediaError } = await supabaseClient
        .from('media')
        .select('*, people:person_id(family_id)')
        .eq('id', mediaId)
        .single();
      
      if (mediaError || !media) {
        return res.status(404).json({ 
          success: false,
          message: 'Medio no encontrado' 
        });
      }
      
      // Verificar acceso a la familia
      const { data: memberCheck, error: memberError } = await supabaseClient
        .from('family_members')
        .select('id')
        .eq('family_id', media.people.family_id)
        .eq('user_id', userId);
      
      if (memberError || !memberCheck || memberCheck.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'No tienes acceso a este contenido'
        });
      }
      
      // Calcular paginación
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      // Obtener comentarios
      const { data: comments, error: commentsError, count } = await supabaseClient
        .from('comments')
        .select('*', { count: 'exact' })
        .eq('media_id', mediaId)
        .order('created_at', { ascending: false })
        .range(from, to);
      
      if (commentsError) throw new Error(commentsError.message);
      
      res.status(200).json({
        success: true,
        data: {
          comments,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
          totalComments: count
        }
      });
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al obtener comentarios', 
        error: error.message 
      });
    }
  },
  
  // Actualizar un comentario
  updateComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const { text, mentions } = req.body;
      const userId = req.user.uid;
      
      // Buscar el comentario
      const { data: comment, error: commentError } = await supabaseClient
        .from('comments')
        .select('*')
        .eq('id', commentId)
        .single();
      
      if (commentError || !comment) {
        return res.status(404).json({ 
          success: false,
          message: 'Comentario no encontrado' 
        });
      }
      
      // Verificar que el usuario es el autor del comentario
      if (comment.user_id !== userId) {
        return res.status(403).json({ 
          success: false,
          message: 'No tienes permisos para editar este comentario' 
        });
      }
      
      // Actualizar el comentario
      const { data: updatedComment, error: updateError } = await supabaseClient
        .from('comments')
        .update({
          text,
          mentions: mentions || comment.mentions,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single();
      
      if (updateError) throw new Error(updateError.message);
      
      res.status(200).json({
        success: true,
        message: 'Comentario actualizado correctamente',
        data: updatedComment
      });
    } catch (error) {
      console.error('Error al actualizar comentario:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al actualizar comentario', 
        error: error.message 
      });
    }
  },
  
  // Eliminar un comentario
  deleteComment: async (req, res) => {
    try {
      const { commentId } = req.params;
      const userId = req.user.uid;
      
      // Buscar el comentario
      const { data: comment, error: commentError } = await supabaseClient
        .from('comments')
        .select('*')
        .eq('id', commentId)
        .single();
      
      if (commentError || !comment) {
        return res.status(404).json({ 
          success: false,
          message: 'Comentario no encontrado' 
        });
      }
      
      // Verificar que el usuario es el autor del comentario o un administrador
      const { data: userRole, error: roleError } = await supabaseClient
        .from('family_members')
        .select('role')
        .eq('user_id', userId)
        .eq('family_id', comment.family_id)
        .single();
      
      const isAdmin = userRole && userRole.role === 'admin';
      
      if (comment.user_id !== userId && !isAdmin) {
        return res.status(403).json({ 
          success: false,
          message: 'No tienes permisos para eliminar este comentario' 
        });
      }
      
      // Eliminar el comentario
      const { error: deleteError } = await supabaseClient
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (deleteError) throw new Error(deleteError.message);
      
      res.status(200).json({ 
        success: true,
        message: 'Comentario eliminado correctamente' 
      });
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al eliminar comentario', 
        error: error.message 
      });
    }
  }
};

module.exports = commentController;