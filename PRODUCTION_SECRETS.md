# 🔐 SECRETS DE PRODUCCIÓN

**⚠️ IMPORTANTE:** Este archivo contiene secretos generados. NO lo subas a GitHub.

---

## JWT Secret (Generado Automáticamente)

Usa este valor para la variable `JWT_SECRET` en Railway:

```
JWT_SECRET=974e271a7c0f917261c0b9cf056300388f8a3fd768f1b047b52879d66c84c7a002659276256cd91064ffc315e67e52df7e74948cc9b48a93f98fae7e64416136
```

---

## Cómo Generar Nuevos Secretos

Si necesitas generar un nuevo JWT secret:

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

---

## Variables de Entorno Completas para Railway

Copia estas variables directamente en Railway:

### Variables Estáticas

```env
PORT=3000
NODE_ENV=production
JWT_EXPIRES_IN=7d
GPS_TRACE_API_URL=https://api.gps-trace.com
CORS_ORIGIN=*
```

### Variables con Referencias a PostgreSQL

```env
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_NAME=${{Postgres.PGDATABASE}}
```

### Variables Secretas

```env
JWT_SECRET=974e271a7c0f917261c0b9cf056300388f8a3fd768f1b047b52879d66c84c7a002659276256cd91064ffc315e67e52df7e74948cc9b48a93f98fae7e64416136
```

### GPS-Trace Token

**⚠️ IMPORTANTE:** Verifica con GPS-Trace si este token es de producción:

```env
GPS_TRACE_PARTNER_TOKEN=0aND8tB2hzHzsOWsdcoiDuYCcdd3Wg1VaQbfBWex7TwvfZ7Ufpv0Di10tiqx4dJT
```

Si el token actual es de prueba/sandbox, contacta a GPS-Trace para obtener el token de producción.

---

## Checklist de Seguridad

- [ ] JWT_SECRET es diferente al de desarrollo
- [ ] GPS_TRACE_PARTNER_TOKEN validado (no es de prueba)
- [ ] Este archivo NO está en Git (.gitignore lo excluye)
- [ ] Passwords de usuarios de prueba cambiadas en producción
- [ ] CORS configurado apropiadamente

---

## Crear Usuario Administrador en Producción

Una vez el backend esté en Railway, crea un usuario admin:

```bash
curl -X POST https://TU-BACKEND-URL.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@prologix.com",
    "password": "PASSWORD_SEGURO_AQUI",
    "name": "Administrador Prologix"
  }'
```

**Guarda las credenciales de forma segura.**

---

**⚠️ NUNCA COMPARTAS ESTOS SECRETOS EN:**
- Repositorios públicos
- Slack/Discord/WhatsApp
- Screenshots
- Emails sin encriptar

**Solo compártelos de forma segura con el equipo autorizado.**
