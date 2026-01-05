import { Injectable, Logger } from '@nestjs/common';

export interface SmsCommand {
  to: string;
  message: string;
  deviceId: string;
  deviceName: string;
}

export interface SmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  /**
   * Envía un comando SMS al dispositivo GPS
   *
   * TODO: Integrar con proveedor SMS real (Twilio, Vonage, etc.)
   * Por ahora, solo registra el comando en logs
   */
  async sendSmsCommand(smsCommand: SmsCommand): Promise<SmsResult> {
    try {
      this.logger.log(`📱 SMS Command Request:`);
      this.logger.log(`  Device: ${smsCommand.deviceName} (${smsCommand.deviceId})`);
      this.logger.log(`  To: ${smsCommand.to}`);
      this.logger.log(`  Command: ${smsCommand.message}`);

      // TODO: Integración con proveedor SMS
      // Opciones recomendadas para República Dominicana:
      // 1. Twilio (https://www.twilio.com)
      // 2. Vonage/Nexmo (https://www.vonage.com)
      // 3. AWS SNS (https://aws.amazon.com/sns)
      // 4. MessageBird (https://www.messagebird.com)

      // Ejemplo de integración con Twilio:
      /*
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

      const client = require('twilio')(accountSid, authToken);

      const message = await client.messages.create({
        body: smsCommand.message,
        from: twilioPhone,
        to: smsCommand.to,
      });

      this.logger.log(`✅ SMS sent successfully. SID: ${message.sid}`);

      return {
        success: true,
        messageId: message.sid,
      };
      */

      // Por ahora, simulamos el envío exitoso
      this.logger.log(`✅ SMS command logged (integration pending)`);

      return {
        success: true,
        messageId: `sim-${Date.now()}`,
      };
    } catch (error) {
      this.logger.error(`❌ Error sending SMS: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Valida el formato del número de teléfono
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Acepta formatos:
    // +18091234567
    // 18091234567
    // 8091234567
    const phoneRegex = /^\+?1?8\d{9}$/;
    return phoneRegex.test(phoneNumber.replace(/[\s-()]/g, ''));
  }

  /**
   * Normaliza el número de teléfono al formato E.164
   */
  normalizePhoneNumber(phoneNumber: string): string {
    // Limpia el número
    let cleaned = phoneNumber.replace(/[\s-()]/g, '');

    // Si no tiene código de país, asume RD (+1809)
    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('1')) {
        cleaned = '+' + cleaned;
      } else if (cleaned.startsWith('809') || cleaned.startsWith('829') || cleaned.startsWith('849')) {
        cleaned = '+1' + cleaned;
      } else {
        cleaned = '+1809' + cleaned;
      }
    }

    return cleaned;
  }
}
