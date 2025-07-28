const { supabaseClient } = require('../config/supabase.config');

// Obtener todos los miembros de una familia
const getFamilyMembers = async (familyId) => {
  try {
    const { data: members, error } = await supabaseClient
      .from('family_members')
      .select('user_id')
      .eq('family_id', familyId);
    
    if (error) throw error;
    return members || [];
  } catch (error) {
    console.error('Error getting family members:', error);
    return [];
  }
};

// Crear notificación para todos los miembros de la familia
const notifyFamilyMembers = async (familyId, currentUserId, type, title, message, link = null) => {
  try {
    const members = await getFamilyMembers(familyId);
    
    // Notificar a todos excepto quien hace la acción
    const notifications = members
      .filter(member => member.user_id !== currentUserId)
      .map(member => ({
        user_id: member.user_id,
        type,
        title,
        message,
        link
      }));
    
    if (notifications.length > 0) {
      const { error } = await supabaseClient
        .from('notifications')
        .insert(notifications);
      
      if (error) throw error;
      console.log(`Created ${notifications.length} family notifications`);
    }
  } catch (error) {
    console.error('Error notifying family members:', error);
  }
};

// Obtener nombre del usuario
const getUserName = async (userId) => {
  try {
    const { data: user, error } = await supabaseClient.auth.admin.getUserById(userId);
    if (error) throw error;
    return user?.user?.user_metadata?.full_name || user?.user?.email || 'Usuario';
  } catch (error) {
    console.error('Error getting user name:', error);
    return 'Usuario';
  }
};

module.exports = {
  getFamilyMembers,
  notifyFamilyMembers,
  getUserName
};