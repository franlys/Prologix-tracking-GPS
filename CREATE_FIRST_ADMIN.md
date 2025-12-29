# 🔐 Crear Primer Usuario Admin

## Método 1: Usando Railway CLI (Recomendado)

### Paso 1: Instalar Railway CLI

```bash
# Windows (PowerShell como Administrador)
iwr https://railway.app/install.ps1 | iex

# O descargar desde: https://railway.app/install
```

### Paso 2: Login a Railway

```bash
railway login
```

### Paso 3: Conectar a tu proyecto

```bash
cd backend
railway link
# Selecciona: Prologix-tracking-GPS-production
```

### Paso 4: Conectar a PostgreSQL

```bash
railway connect postgres
```

### Paso 5: Actualizar tu usuario a Admin

```sql
-- Ver tus usuarios actuales
SELECT id, email, name, role FROM users;

-- Actualizar tu usuario a admin (reemplaza con tu email)
UPDATE users
SET role = 'admin'
WHERE email = 'franlysgonzaleztejeda@gmail.com';

-- Verificar
SELECT id, email, name, role FROM users WHERE role = 'admin';

-- Salir
\q
```

---

## Método 2: Usando Railway Dashboard (Más fácil)

### Paso 1: Ir a Railway Dashboard

1. Abre https://railway.app
2. Login con tu cuenta
3. Click en tu proyecto: **Prologix-tracking-GPS-production**
4. Click en **postgres** (el servicio de base de datos)

### Paso 2: Abrir Query

1. Click en la pestaña **Data**
2. Verás una interfaz para ejecutar queries SQL

### Paso 3: Ejecutar SQL

```sql
-- Ver usuarios
SELECT id, email, name, role, subscription_plan FROM users;

-- Actualizar a admin (reemplaza con tu email)
UPDATE users
SET role = 'admin',
    subscription_plan = 'EMPRESARIAL'
WHERE email = 'franlysgonzaleztejeda@gmail.com';

-- Verificar cambio
SELECT id, email, name, role FROM users WHERE role = 'admin';
```

---

## Método 3: Crear Admin desde cero (si no tienes cuenta)

Si quieres crear un admin completamente nuevo:

```sql
-- Primero necesitas hashear la contraseña
-- Usa este hash para la contraseña: "Admin123"
-- Hash bcrypt: $2a$10$YourHashedPasswordHere

INSERT INTO users (email, password, name, role, subscription_plan, phone_number)
VALUES (
  'admin@prologix.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye/IUBfQqBT5K6DAYZPjX1aNCN3mqMfFe', -- Contraseña: Admin123
  'Administrador Prologix',
  'admin',
  'EMPRESARIAL',
  '+18091234567'
);
```

---

## Acceder al Panel Admin

### 1. Web (Vercel)

```
URL: https://prologix-tracking-gps-frontend.vercel.app/users
```

1. Abre el navegador
2. Ve a la URL de arriba
3. Login con tu cuenta admin
4. Serás redirigido al dashboard
5. Navega manualmente a: `/users`

### 2. Agregar Ruta en la App (Recomendado)

Voy a crear un botón en el dashboard para que los admins accedan fácilmente.

---

## ¿Cómo funciona el Panel Admin?

### Para Instaladores/Admin:

1. **Login** con cuenta admin
2. **Ir a** `/users` o click en botón "Panel Admin"
3. **Buscar cliente** por nombre o email
4. **Click** "Vincular GPS"
5. **Ingresar** ID de GPS-Trace del dispositivo instalado
6. **Guardar**

### Para Clientes:

1. Cliente **se registra** en la app
2. Instalador **vincula GPS** desde panel admin
3. Cliente **recarga app** → Ve sus dispositivos

---

## Crear Múltiples Admins

Una vez que tengas el primer admin, puedes crear más desde SQL:

```sql
-- Crear otro admin
INSERT INTO users (email, password, name, role, subscription_plan)
VALUES (
  'instalador1@prologix.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMye/IUBfQqBT5K6DAYZPjX1aNCN3mqMfFe',
  'Juan Instalador',
  'admin',
  'EMPRESARIAL'
);
```

O actualizar usuario existente:

```sql
UPDATE users
SET role = 'admin'
WHERE email = 'email-del-instalador@example.com';
```

---

## Verificar que funcionó

1. **Logout** de la app (si estabas logueado)
2. **Login** con tu cuenta admin
3. **Ir a** `https://prologix-tracking-gps-frontend.vercel.app/users`
4. **Deberías ver** el panel con lista de usuarios

---

## Próximos pasos

Una vez que tengas tu primer admin:

1. ✅ Crea cuenta de prueba como cliente normal
2. ✅ Login como admin
3. ✅ Vincula GPS a ese cliente de prueba
4. ✅ Logout y login como cliente
5. ✅ Verifica que vea sus dispositivos

---

**Última actualización:** 29 de Diciembre 2025
