# 📱 Instalación de Dependencias para Notificaciones

## Dependencias Necesarias

Para el sistema de notificaciones por WhatsApp y Email, necesitas instalar los siguientes paquetes:

```bash
cd backend

# WhatsApp con Baileys
npm install @whiskeysockets/baileys qrcode-terminal pino

# Email con SendGrid
npm install @sendgrid/mail

# Utilidades
npm install node-cron
```

## Configuración de Variables de Entorno

Agrega estas variables a tu archivo `backend/.env`:

```env
# SendGrid Email
SENDGRID_API_KEY=tu_api_key_de_sendgrid
SENDGRID_FROM_EMAIL=noreply@tudominio.com
SENDGRID_FROM_NAME=Prologix GPS Tracking

# WhatsApp (Baileys se configura automáticamente con QR)
WHATSAPP_ENABLED=true

# Notificaciones
NOTIFICATIONS_ENABLED=true
```

## Obtener API Key de SendGrid

1. Ve a https://sendgrid.com y crea una cuenta gratuita
2. Verifica tu email
3. Ve a Settings → API Keys
4. Crea un nuevo API Key con permisos de "Mail Send"
5. Copia el API Key y guárdalo en `.env`

## Configurar WhatsApp

1. Cuando inicies el backend por primera vez, verás un código QR en la terminal
2. Escanea el código QR con tu WhatsApp (Dispositivos vinculados)
3. La sesión se guardará automáticamente en `backend/whatsapp-session`
4. No necesitas escanear el QR nuevamente hasta que la sesión expire

## Notas Importantes

- **SendGrid**: Tiene un límite gratuito de 100 emails por día
- **Baileys**: Es una librería no oficial. WhatsApp puede bloquear números que envían muchos mensajes
- **Recomendación**: Usa un número de WhatsApp Business separado para las notificaciones
