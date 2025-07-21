# Opciones de Hosting Gratuito para Genea

Este documento presenta un resumen de las diferentes opciones gratuitas para desplegar la aplicación Genea.

## Opciones para el Backend (API)

### 1. Render (Recomendado)
- **Ventajas**: Fácil de configurar, integración con GitHub, 512MB RAM, SSL gratuito
- **Limitaciones**: 750 horas gratis por mes, se suspende después de 15 minutos de inactividad
- **URL de ejemplo**: https://genea-api.onrender.com

### 2. Railway
- **Ventajas**: 512MB RAM, 1GB de almacenamiento, SSL gratuito
- **Limitaciones**: $5 de crédito gratis por mes, se necesita tarjeta de crédito para verificación
- **URL de ejemplo**: https://genea-api.railway.app

### 3. Fly.io
- **Ventajas**: 3 aplicaciones gratuitas, 256MB RAM, SSL gratuito
- **Limitaciones**: Requiere tarjeta de crédito para verificación
- **URL de ejemplo**: https://genea-api.fly.dev

### 4. Heroku (Alternativa)
- **Ventajas**: Fácil de usar, bien establecido
- **Limitaciones**: Ya no ofrece plan gratuito, pero tiene un plan hobby económico ($7/mes)
- **URL de ejemplo**: https://genea-api.herokuapp.com

## Opciones para el Frontend (Cliente)

### 1. Vercel (Recomendado)
- **Ventajas**: Optimizado para React, despliegue automático desde GitHub, SSL gratuito
- **Limitaciones**: Algunas funciones avanzadas son de pago
- **URL de ejemplo**: https://genea.vercel.app

### 2. Netlify
- **Ventajas**: Fácil de usar, despliegue automático desde GitHub, SSL gratuito
- **Limitaciones**: Límite de compilación de 300 minutos por mes
- **URL de ejemplo**: https://genea.netlify.app

### 3. GitHub Pages
- **Ventajas**: Totalmente gratuito, integrado con GitHub
- **Limitaciones**: Solo para sitios estáticos, requiere configuración adicional para SPAs
- **URL de ejemplo**: https://tu-usuario.github.io/genea

## Opciones para la Base de Datos

### 1. MongoDB Atlas (Recomendado)
- **Ventajas**: Cluster compartido gratuito (M0), 512MB de almacenamiento
- **Limitaciones**: Rendimiento limitado, conexiones limitadas
- **URL de ejemplo**: mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/genea

### 2. Firebase Firestore
- **Ventajas**: Escalable, tiempo real, integrado con Firebase Auth
- **Limitaciones**: 1GB de almacenamiento, 50K lecturas/día, 20K escrituras/día
- **Nota**: Requeriría cambios en el código para usar Firestore en lugar de MongoDB

## Opciones para Autenticación y Almacenamiento

### 1. Firebase Authentication (Recomendado)
- **Ventajas**: Fácil de implementar, múltiples proveedores de autenticación
- **Limitaciones**: 10K autenticaciones/mes en el plan gratuito

### 2. Firebase Storage
- **Ventajas**: 5GB de almacenamiento, 1GB de transferencia/día
- **Limitaciones**: Velocidad limitada en el plan gratuito

## Configuración de Dominio Personalizado (Opcional)

Si deseas un dominio personalizado en lugar de usar los subdominios gratuitos:

1. **Compra un dominio**: Proveedores económicos como Namecheap, GoDaddy o Google Domains (desde $10/año)
2. **Configura DNS**: Apunta tu dominio a los servicios donde has desplegado tu aplicación
3. **Configura SSL**: La mayoría de los proveedores mencionados ofrecen SSL gratuito con Let's Encrypt

## Recomendación Final

Para un despliegue completamente gratuito con buen rendimiento:
- **Backend**: Render
- **Frontend**: Vercel
- **Base de datos**: MongoDB Atlas
- **Autenticación y almacenamiento**: Firebase

Esta combinación te permitirá tener una aplicación completamente funcional sin costo mensual, ideal para un proyecto personal o una startup en fase inicial.