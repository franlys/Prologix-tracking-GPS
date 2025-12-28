import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
  proto,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class WhatsAppService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WhatsAppService.name);
  private sock: WASocket | null = null;
  private readonly isEnabled: boolean;
  private readonly authPath: string;
  private isConnected = false;

  constructor() {
    this.isEnabled = process.env.WHATSAPP_ENABLED === 'true';
    this.authPath = path.join(process.cwd(), 'whatsapp-session');

    // Create auth directory if it doesn't exist
    if (!fs.existsSync(this.authPath)) {
      fs.mkdirSync(this.authPath, { recursive: true });
    }
  }

  async onModuleInit() {
    if (this.isEnabled) {
      await this.connect();
    } else {
      this.logger.warn('⚠️  WhatsApp notifications disabled (WHATSAPP_ENABLED=false)');
    }
  }

  async onModuleDestroy() {
    if (this.sock) {
      await this.sock.logout();
      this.logger.log('👋 WhatsApp disconnected');
    }
  }

  private async connect() {
    try {
      const { state, saveCreds } = await useMultiFileAuthState(this.authPath);

      this.sock = makeWASocket({
        auth: state,
        printQRInTerminal: true, // Shows QR in terminal
        logger: {
          level: 'silent', // Can be 'error', 'warn', 'info', 'debug', 'trace'
          error: () => {},
          warn: () => {},
          info: () => {},
          debug: () => {},
          trace: () => {},
          child: () => ({
            level: 'silent',
            error: () => {},
            warn: () => {},
            info: () => {},
            debug: () => {},
            trace: () => {},
            child: () => ({} as any),
          }),
        },
      });

      this.sock.ev.on('creds.update', saveCreds);

      this.sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
          this.logger.log('\n📱 Scan this QR code with WhatsApp:\n');
        }

        if (connection === 'close') {
          const shouldReconnect =
            (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;

          this.isConnected = false;
          this.logger.warn('❌ WhatsApp connection closed');

          if (shouldReconnect) {
            this.logger.log('🔄 Reconnecting...');
            setTimeout(() => this.connect(), 5000);
          }
        } else if (connection === 'open') {
          this.isConnected = true;
          this.logger.log('✅ WhatsApp connected successfully!');
        }
      });
    } catch (error) {
      this.logger.error('❌ Failed to connect to WhatsApp:', error.message);
    }
  }

  async sendNotification(
    phoneNumber: string,
    message: string,
    deviceName?: string,
  ): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.warn(`WhatsApp disabled. Would send to: ${phoneNumber}`);
      return false;
    }

    if (!this.isConnected || !this.sock) {
      this.logger.error('❌ WhatsApp is not connected');
      return false;
    }

    try {
      // Format phone number (remove spaces, dashes, etc.)
      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');

      // WhatsApp expects number in format: countrycode + number + @s.whatsapp.net
      // Example: 18091234567@s.whatsapp.net for Dominican Republic
      const jid = `${formattedNumber}@s.whatsapp.net`;

      // Build message with formatting
      const fullMessage = deviceName
        ? `🚗 *Prologix GPS - ${deviceName}*\n\n${message}\n\n_Notificación automática del sistema GPS_`
        : `🚗 *Prologix GPS*\n\n${message}\n\n_Notificación automática del sistema GPS_`;

      await this.sock.sendMessage(jid, {
        text: fullMessage,
      });

      this.logger.log(`✅ WhatsApp sent to ${phoneNumber}: ${message.substring(0, 50)}...`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send WhatsApp to ${phoneNumber}:`, error.message);
      return false;
    }
  }

  async sendLocation(
    phoneNumber: string,
    latitude: number,
    longitude: number,
    deviceName: string,
  ): Promise<boolean> {
    if (!this.isConnected || !this.sock) {
      this.logger.error('❌ WhatsApp is not connected');
      return false;
    }

    try {
      const formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
      const jid = `${formattedNumber}@s.whatsapp.net`;

      // Send location
      await this.sock.sendMessage(jid, {
        location: {
          degreesLatitude: latitude,
          degreesLongitude: longitude,
        },
      });

      // Send follow-up message
      await this.sock.sendMessage(jid, {
        text: `📍 *Ubicación de ${deviceName}*\n\nCoordenadas: ${latitude}, ${longitude}\n\n_Prologix GPS Tracking_`,
      });

      this.logger.log(`✅ WhatsApp location sent to ${phoneNumber}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send WhatsApp location:`, error.message);
      return false;
    }
  }

  // Check if WhatsApp is ready
  isReady(): boolean {
    return this.isConnected && this.sock !== null;
  }

  // Get connection status
  getStatus(): { connected: boolean; enabled: boolean } {
    return {
      connected: this.isConnected,
      enabled: this.isEnabled,
    };
  }
}
