const { supabaseClient } = require('../config/supabase.config');
const { checkBarbaraDescendant } = require('../utils/barbara-descendant-checker');

// Verificar y actualizar licencia por descendencia
exports.checkAndUpdateDescendantLicense = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.uid;
    
    // Verificar acceso a la familia
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('id')
      .eq('family_id', familyId)
      .eq('user_id', userId);
    
    if (memberError || !memberCheck || memberCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta familia'
      });
    }
    
    // Verificar si es descendiente de Barbará
    const isDescendant = await checkBarbaraDescendant(familyId);
    
    if (isDescendant) {
      // Actualizar licencia a gratuita
      const { error: updateError } = await supabaseClient
        .from('families')
        .update({
          license_status: 'active',
          license_type: 'free',
          license_expires_at: '2099-12-31T23:59:59.000Z',
          payment_status: 'free',
          updated_at: new Date().toISOString()
        })
        .eq('id', familyId);
      
      if (updateError) throw updateError;
      
      return res.status(200).json({
        success: true,
        message: 'Licencia actualizada: Descendiente de Barbará detectado',
        isDescendant: true,
        licenseType: 'free'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'No se detectó descendencia de Barbará',
      isDescendant: false
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verificando descendencia',
      error: error.message
    });
  }
};

// Obtener estado de descendencia
exports.getDescendantStatus = async (req, res) => {
  try {
    const { familyId } = req.params;
    const userId = req.user.uid;
    
    // Verificar acceso
    const { data: memberCheck, error: memberError } = await supabaseClient
      .from('family_members')
      .select('id')
      .eq('family_id', familyId)
      .eq('user_id', userId);
    
    if (memberError || !memberCheck || memberCheck.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'No tienes acceso a esta familia'
      });
    }
    
    const isDescendant = await checkBarbaraDescendant(familyId);
    
    res.status(200).json({
      success: true,
      data: {
        familyId,
        isBarbaraDescendant: isDescendant,
        message: isDescendant ? 
          'Esta familia tiene descendientes de Barbará y califica para licencia gratuita' :
          'No se detectaron descendientes de Barbará en esta familia'
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verificando descendencia',
      error: error.message
    });
  }
};