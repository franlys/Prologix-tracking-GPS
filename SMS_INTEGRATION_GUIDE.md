# 📱 Guía de Integración SMS para Comandos GPS

Esta guía explica cómo integrar el sistema de comandos SMS con proveedores reales para enviar comandos a dispositivos GPS.

## 🎯 Estado Actual

### ✅ Implementado

1. **Frontend** - Pantalla de comandos SMS completa
   - Interfaz de usuario intuitiva
   - Librería de comandos predefinidos (GT06, TK103)
   - Selector de dispositivos
   - Comandos personalizados
   - Categorización por función

2. **Backend** - API REST funcional
   - Endpoint: `POST /api/devices/:id/sms`
   - Servicio SMS con logging
   - Validación de números telefónicos
   - Normalización formato E.164
   - Verificación de ownership del dispositivo

### 🔧 Pendiente para Producción

1. Configurar número de teléfono del GPS en cada dispositivo
2. Integrar con proveedor SMS real (Twilio, Vonage, AWS SNS)
3. Almacenar historial de comandos SMS en base de datos

---

## 🚀 Integración con Proveedores SMS

### Opción 1: Twilio (Recomendado)

**Pros:**
- ✅ Amplia cobertura en República Dominicana
- ✅ Excelente documentación y SDKs
- ✅ Precios competitivos (~$0.0075 USD por SMS)
- ✅ Dashboard completo con analytics
- ✅ API confiable y estable

**Costos estimados:**
- **SMS saliente a RD**: ~$0.0075 USD por mensaje
- **Número local RD**: ~$1 USD/mes
- **No hay costo de setup**

#### Pasos de Integración:

1. **Crear cuenta en Twilio**
```bash
# Visita: https://www.twilio.com/try-twilio
# Obtén $15 USD de crédito gratis para pruebas
```

2. **Instalar dependencia**
```bash
cd backend
npm install twilio
```

3. **Configurar variables de entorno**
```bash
# backend/.env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+18091234567  # Tu número Twilio
```

4. **Actualizar `sms.service.ts`**
```typescript
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private twilioClient: twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    }
  }

  async sendSmsCommand(smsCommand: SmsCommand): Promise<SmsResult> {
    try {
      const message = await this.twilioClient.messages.create({
        body: smsCommand.message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: smsCommand.to,
      });

      this.logger.log(`✅ SMS sent successfully. SID: ${message.sid}`);

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      this.logger.error(`❌ Error sending SMS: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
```

---

### Opción 2: Vonage (Nexmo)

**Pros:**
- ✅ Buena cobertura internacional
- ✅ Precios competitivos
- ✅ API sencilla
- ✅ Soporte para SMS bidireccional

**Costos estimados:**
- **SMS a RD**: ~$0.01 USD por mensaje
- **Crédito inicial**: €2 gratis

#### Pasos de Integración:

1. **Crear cuenta**
```bash
# Visita: https://dashboard.nexmo.com/sign-up
```

2. **Instalar SDK**
```bash
npm install @vonage/server-sdk
```

3. **Configurar variables de entorno**
```bash
# backend/.env
VONAGE_API_KEY=your_api_key
VONAGE_API_SECRET=your_api_secret
VONAGE_PHONE_NUMBER=18091234567
```

4. **Código de integración**
```typescript
import { Vonage } from '@vonage/server-sdk';

@Injectable()
export class SmsService {
  private vonage: Vonage;

  constructor() {
    this.vonage = new Vonage({
      apiKey: process.env.VONAGE_API_KEY,
      apiSecret: process.env.VONAGE_API_SECRET,
    });
  }

  async sendSmsCommand(smsCommand: SmsCommand): Promise<SmsResult> {
    try {
      const response = await this.vonage.sms.send({
        to: smsCommand.to,
        from: process.env.VONAGE_PHONE_NUMBER,
        text: smsCommand.message,
      });

      return {
        success: true,
        messageId: response.messages[0]['message-id'],
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
```

---

### Opción 3: AWS SNS (Amazon Simple Notification Service)

**Pros:**
- ✅ Integración con AWS existente
- ✅ Escalabilidad automática
- ✅ Pay-as-you-go pricing
- ✅ Sin costos mensuales fijos

**Costos estimados:**
- **SMS a RD**: ~$0.00645 USD por mensaje
- **Sin costos fijos**

#### Pasos de Integración:

1. **Configurar AWS credentials**
```bash
# backend/.env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

2. **Instalar SDK**
```bash
npm install @aws-sdk/client-sns
```

3. **Código de integración**
```typescript
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

@Injectable()
export class SmsService {
  private snsClient: SNSClient;

  constructor() {
    this.snsClient = new SNSClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async sendSmsCommand(smsCommand: SmsCommand): Promise<SmsResult> {
    try {
      const command = new PublishCommand({
        PhoneNumber: smsCommand.to,
        Message: smsCommand.message,
      });

      const response = await this.snsClient.send(command);

      return {
        success: true,
        messageId: response.MessageId,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
```

---

## 📋 Configuración de Números de Teléfono del GPS

Para que el sistema funcione, cada dispositivo GPS necesita tener configurado su número de teléfono.

### Opción A: Agregar campo a GPS-Trace/Traccar

**En GPS-Trace:**
- Ir a configuración del dispositivo
- Buscar campo "Phone Number" o "SIM Number"
- Agregar número en formato internacional: +18091234567

**En Traccar:**
- Panel Admin → Devices → Seleccionar dispositivo
- Attributes → Add → `phone` → `+18091234567`

### Opción B: Crear tabla de configuración propia

```sql
-- Migration: backend/migrations/add-device-phone-numbers.sql
CREATE TABLE IF NOT EXISTS "device_configs" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "device_id" VARCHAR NOT NULL UNIQUE,
  "phone_number" VARCHAR,
  "gps_model" VARCHAR,
  "sim_provider" VARCHAR,
  "notes" TEXT,
  "created_at" TIMESTAMP DEFAULT now(),
  "updated_at" TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_device_configs_device_id"
  ON "device_configs" ("device_id");
```

**Actualizar `devices.service.ts`:**
```typescript
async sendSmsCommand(deviceId: string, command: string, userId: string) {
  const device = await this.getDeviceById(deviceId, userId);

  // Obtener configuración del dispositivo
  const config = await this.deviceConfigRepo.findOne({
    where: { deviceId }
  });

  if (!config?.phoneNumber) {
    throw new BadRequestException(
      'Este dispositivo no tiene número de teléfono configurado'
    );
  }

  // ... resto del código
}
```

---

## 📊 Historial de Comandos SMS (Opcional)

Para auditoría y debugging, puedes almacenar el historial de comandos:

```sql
-- Migration: backend/migrations/add-sms-history.sql
CREATE TABLE IF NOT EXISTS "sms_commands_history" (
  "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "device_id" VARCHAR NOT NULL,
  "user_id" UUID NOT NULL,
  "command" VARCHAR NOT NULL,
  "phone_number" VARCHAR NOT NULL,
  "status" VARCHAR DEFAULT 'pending',
  "message_id" VARCHAR,
  "error_message" TEXT,
  "sent_at" TIMESTAMP DEFAULT now(),
  FOREIGN KEY ("user_id") REFERENCES "users" ("id")
);

CREATE INDEX IF NOT EXISTS "idx_sms_history_device"
  ON "sms_commands_history" ("device_id");
CREATE INDEX IF NOT EXISTS "idx_sms_history_user"
  ON "sms_commands_history" ("user_id");
```

---

## 🧪 Testing

### Probar con Mock (Actual)

El sistema actual registra comandos en logs sin enviarlos:

```bash
# Ver logs del backend
cd backend
npm run start:dev

# Enviar comando desde frontend
# Los logs mostrarán:
# 📱 SMS Command Request:
#   Device: Mi GPS (abc123)
#   To: +18091234567
#   Command: LOCATE#
# ✅ SMS command logged (integration pending)
```

### Probar con Twilio Sandbox

```bash
# 1. Crear cuenta Twilio trial
# 2. Verificar tu número de teléfono
# 3. Usar el número de prueba gratuito
# 4. ¡Enviar comandos reales!
```

---

## 💰 Comparación de Costos

| Proveedor | Costo por SMS a RD | Costo Mensual Fijo | Crédito Inicial |
|-----------|-------------------|-------------------|----------------|
| **Twilio** | $0.0075 USD | $1 USD (número local) | $15 USD |
| **Vonage** | $0.01 USD | $0 USD | €2 |
| **AWS SNS** | $0.00645 USD | $0 USD | $0 |

**Estimación para 100 comandos SMS/mes:**
- Twilio: ~$1.75 USD/mes
- Vonage: ~$1.00 USD/mes
- AWS SNS: ~$0.65 USD/mes

---

## 🔐 Seguridad y Mejores Prácticas

1. **Rate Limiting**
```typescript
// Limitar comandos por usuario
@Throttle(5, 60) // 5 comandos por minuto
@Post(':id/sms')
async sendSmsCommand() { ... }
```

2. **Validación de comandos peligrosos**
```typescript
const DANGEROUS_COMMANDS = ['STOP#', 'FACTORY#'];

if (DANGEROUS_COMMANDS.includes(command)) {
  // Requerir confirmación adicional
  // O restringir solo a admins
}
```

3. **Logging completo**
```typescript
// Registrar TODOS los comandos para auditoría
await this.smsHistoryRepo.save({
  deviceId,
  userId,
  command,
  phoneNumber,
  timestamp: new Date(),
});
```

4. **Variables de entorno seguras**
```bash
# Nunca commitear .env al repositorio
# Usar secretos encriptados en producción (Railway, etc.)
```

---

## 🎓 Comandos GPS más Comunes

### Comandos de Rastreo
```
LOCATE#           - Ubicación actual
URL#              - Link de Google Maps
STATUS#           - Estado del GPS (batería, señal)
```

### Control del Vehículo
```
STOP#             - Cortar motor (⚠️ solo detenido)
RESUME#           - Restaurar motor
```

### Configuración
```
APN#internet.com# - Configurar APN
ADMIN#8091234567# - Número administrador
TIMEZONE#E#4#     - Zona horaria GMT-4 (RD)
```

### Seguridad
```
SOS#8091234567#   - Número de emergencia
RESET#            - Reiniciar GPS
FACTORY#          - Reset de fábrica (⚠️)
```

---

## 📞 Soporte

Para dudas sobre integración SMS:

1. **Twilio:** https://www.twilio.com/docs/sms
2. **Vonage:** https://developer.vonage.com/messaging/sms/overview
3. **AWS SNS:** https://docs.aws.amazon.com/sns/latest/dg/sns-sms.html

Para configuración de GPS específicos:
- Consultar manual del fabricante
- Contactar al proveedor del GPS (TKSTAR, Concox, etc.)

---

## ✅ Checklist de Producción

- [ ] Elegir proveedor SMS (Twilio recomendado)
- [ ] Crear cuenta y obtener credenciales
- [ ] Configurar variables de entorno en Railway
- [ ] Agregar números de teléfono a todos los dispositivos
- [ ] Implementar integración con el proveedor elegido
- [ ] Probar con dispositivo real
- [ ] Configurar rate limiting
- [ ] (Opcional) Implementar historial de comandos
- [ ] (Opcional) Agregar notificaciones de respuesta del GPS

---

**Generado por Claude Code - Sistema GPS Prologix**
