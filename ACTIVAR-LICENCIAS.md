# 🔑 CÓMO ACTIVAR LICENCIAS DE GENEA

## ⚡ PROCESO RÁPIDO

### 1. Ver solicitudes pendientes
```bash
cd /home/gustavo/Documents/dev/genea
node activate-license.js list
```

### 2. Activar licencia
```bash
node activate-license.js activate "Nombre Exacto de la Familia"
```

### 3. Confirmar al cliente
Enviar mensaje: "✅ Tu licencia de Genea está activada por 1 año"

---

## 📋 EJEMPLO COMPLETO

```bash
# 1. Ir al directorio
cd /home/gustavo/Documents/dev/genea

# 2. Ver quién pidió licencia
node activate-license.js list

# 3. Activar (usar nombre exacto que aparece en la lista)
node activate-license.js activate "Familia García"

# 4. Listo! ✅
```

---

## 💰 PRECIO ACTUAL
- **$30 USD por año**
- **Transferencia a Mercado Pago**
- **Activación manual**

---

## 🆘 SI ALGO FALLA
1. Verificar que estés en el directorio correcto
2. Verificar variables de entorno (.env)
3. Usar nombre exacto de la familia (copiar/pegar)

---

**📌 RECORDATORIO: Este archivo está en la raíz del proyecto Genea**