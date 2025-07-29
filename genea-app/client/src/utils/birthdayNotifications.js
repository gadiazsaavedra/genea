// Utilidad para notificaciones de cumpleaños
export const checkBirthdays = (people) => {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();
  
  const upcomingBirthdays = [];
  const todayBirthdays = [];
  
  people.forEach(person => {
    if (!person.birth_date) return;
    
    const birthDate = new Date(person.birth_date);
    const birthMonth = birthDate.getMonth() + 1;
    const birthDay = birthDate.getDate();
    
    // Cumpleaños hoy
    if (birthMonth === todayMonth && birthDay === todayDay) {
      const age = today.getFullYear() - birthDate.getFullYear();
      todayBirthdays.push({
        ...person,
        age,
        daysUntil: 0
      });
    }
    
    // Próximos cumpleaños (próximos 7 días)
    const thisYearBirthday = new Date(today.getFullYear(), birthMonth - 1, birthDay);
    const nextYearBirthday = new Date(today.getFullYear() + 1, birthMonth - 1, birthDay);
    
    let targetBirthday = thisYearBirthday;
    if (thisYearBirthday < today) {
      targetBirthday = nextYearBirthday;
    }
    
    const daysUntil = Math.ceil((targetBirthday - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil > 0 && daysUntil <= 7) {
      const age = targetBirthday.getFullYear() - birthDate.getFullYear();
      upcomingBirthdays.push({
        ...person,
        age,
        daysUntil
      });
    }
  });
  
  return {
    todayBirthdays: todayBirthdays.sort((a, b) => a.age - b.age),
    upcomingBirthdays: upcomingBirthdays.sort((a, b) => a.daysUntil - b.daysUntil)
  };
};

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('Este navegador no soporta notificaciones');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

export const showBirthdayNotification = (person, daysUntil = 0) => {
  if (Notification.permission !== 'granted') return;
  
  const title = daysUntil === 0 
    ? `🎉 ¡Feliz cumpleaños ${person.first_name}!`
    : `🎂 Próximo cumpleaños: ${person.first_name}`;
    
  const body = daysUntil === 0
    ? `${person.first_name} ${person.last_name || ''} cumple ${person.age} años hoy`
    : `${person.first_name} ${person.last_name || ''} cumplirá ${person.age} años en ${daysUntil} día${daysUntil > 1 ? 's' : ''}`;
  
  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `birthday-${person.id}`,
    requireInteraction: true
  });
  
  notification.onclick = () => {
    window.focus();
    notification.close();
  };
  
  // Auto cerrar después de 10 segundos
  setTimeout(() => notification.close(), 10000);
};