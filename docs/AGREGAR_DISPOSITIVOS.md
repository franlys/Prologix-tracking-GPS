# 📍 Guía: Cómo Agregar Dispositivos GPS a Usuarios

## 🎯 Resumen del Sistema

Prologix GPS Tracking utiliza **GPS-Trace** como proveedor de servicios de rastreo GPS. Los dispositivos físicos GPS se registran directamente en GPS-Trace, y nuestra aplicación obtiene los datos a través de su API.

---

## 📋 Proceso para Agregar Dispositivos a un Usuario

### Paso 1: Registrar el Dispositivo GPS en GPS-Trace

1. **Accede al portal de GPS-Trace**
   - URL: https://gps-trace.com
   - Inicia sesión con las credenciales del partner de Prologix

2. **Crear una cuenta de usuario en GPS-Trace** (si es un nuevo cliente)
   - Ve a "Users" → "Add User"
   - Completa la información del cliente:
     - Nombre
     - Email
     - Contraseña temporal
   - **IMPORTANTE:** Guarda el `User ID` que GPS-Trace asigna

3. **Registrar el dispositivo GPS físico**
   - Ve a "Devices" → "Add Device"
   - Ingresa la información del dispositivo:
     - **IMEI**: Número único del dispositivo GPS (15 dígitos)
     - **Nombre**: Nombre descriptivo (ej: "Toyota Corolla - Juan Pérez")
     - **Tipo**: Modelo del dispositivo GPS
   - Asigna el dispositivo al usuario creado en el paso 2

### Paso 2: Vincular el Usuario en Prologix

1. **Accede a la base de datos de Prologix**
   ```bash
   cd backend
   npm run typeorm:cli -- query "UPDATE users SET \"gpsTraceUserId\" = 'ID_DE_GPS_TRACE' WHERE email = 'email@usuario.com';"
   ```

   O usa un cliente de PostgreSQL:
   ```sql
   UPDATE users
   SET "gpsTraceUserId" = 'abc123xyz'
   WHERE email = 'email@usuario.com';
   ```

2. **Verificar la vinculación**
   ```sql
   SELECT id, email, name, "gpsTraceUserId"
   FROM users
   WHERE email = 'email@usuario.com';
   ```

### Paso 3: Verificar en la Aplicación

1. El usuario debe cerrar sesión y volver a iniciar sesión
2. Al entrar a "Dispositivos" o "Mapa", debería ver sus dispositivos GPS
3. Los dispositivos se actualizan automáticamente cada 10 segundos

---

## 🔧 Panel de Administración (Próximamente)

Estamos desarrollando un panel de administración en la aplicación Prologix donde los administradores podrán:

- ✅ Ver todos los usuarios registrados
- ✅ Editar el `gpsTraceUserId` de cada usuario
- ✅ Ver qué dispositivos tiene asignado cada usuario
- ✅ Gestionar planes de suscripción

---

## 📝 Ejemplo Completo

### Cliente: Juan Pérez (nuevo)

1. **En GPS-Trace:**
   - Crear usuario: juan.perez@example.com
   - GPS-Trace asigna User ID: `gps-user-12345`
   - Registrar dispositivo GPS con IMEI: `123456789012345`
   - Nombre del dispositivo: "Camioneta Juan"
   - Asignar dispositivo al usuario `gps-user-12345`

2. **En Prologix:**
   - Juan ya está registrado en Prologix con email: juan.perez@example.com
   - Ejecutar SQL:
     ```sql
     UPDATE users
     SET "gpsTraceUserId" = 'gps-user-12345'
     WHERE email = 'juan.perez@example.com';
     ```

3. **Resultado:**
   - Juan inicia sesión en la app Prologix
   - Ve su dispositivo "Camioneta Juan" en el mapa
   - Puede ver ubicación en tiempo real, historial, estadísticas, etc.

---

## 🚨 Solución de Problemas

### El usuario no ve sus dispositivos

**Posibles causas:**
1. ✅ Verificar que el `gpsTraceUserId` esté correcto
   ```sql
   SELECT "gpsTraceUserId" FROM users WHERE email = 'usuario@example.com';
   ```

2. ✅ Verificar que el dispositivo esté asignado al usuario en GPS-Trace

3. ✅ Verificar que el dispositivo GPS esté enviando datos
   - En GPS-Trace, revisar la última actualización del dispositivo

4. ✅ Revisar logs del backend de Prologix
   ```bash
   cd backend
   npm run start:dev
   # Buscar errores relacionados con GPS-Trace API
   ```

### Errores de autenticación con GPS-Trace

Verificar que el token de partner esté configurado:
```bash
# En backend/.env
GPS_TRACE_PARTNER_TOKEN=tu_token_aqui
GPS_TRACE_API_URL=https://api.gps-trace.com/v1
```

---

## 🔐 Seguridad

- ❌ NUNCA compartir las credenciales de GPS-Trace con usuarios finales
- ✅ Solo administradores de Prologix deben tener acceso al portal GPS-Trace
- ✅ Los usuarios de Prologix solo ven SUS dispositivos asignados
- ✅ El `GPS_TRACE_PARTNER_TOKEN` debe mantenerse secreto y nunca enviarse al frontend

---

## 📞 Soporte

Para asistencia con la integración GPS-Trace o problemas con dispositivos:
- Email: soporte@prologix.com
- Documentación GPS-Trace: https://gps-trace.com/api/docs
