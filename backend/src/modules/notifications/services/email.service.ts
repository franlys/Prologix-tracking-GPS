import { Injectable, Logger } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly isEnabled: boolean;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    this.isEnabled = !!apiKey && process.env.NOTIFICATIONS_ENABLED === 'true';

    if (this.isEnabled) {
      sgMail.setApiKey(apiKey);
      this.logger.log('📧 SendGrid Email Service initialized');
    } else {
      this.logger.warn('⚠️  Email notifications disabled (missing SENDGRID_API_KEY or NOTIFICATIONS_ENABLED=false)');
    }
  }

  async sendNotification(
    to: string,
    subject: string,
    message: string,
    deviceName?: string,
  ): Promise<boolean> {
    if (!this.isEnabled) {
      this.logger.warn(`Email notifications disabled. Would send to: ${to}`);
      return false;
    }

    try {
      const htmlContent = this.buildEmailTemplate(subject, message, deviceName);

      await sgMail.send({
        to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@prologix.com',
          name: process.env.SENDGRID_FROM_NAME || 'Prologix GPS Tracking',
        },
        subject,
        html: htmlContent,
      });

      this.logger.log(`✅ Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}:`, error.response?.body || error.message);
      return false;
    }
  }

  private buildEmailTemplate(subject: string, message: string, deviceName?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      padding: 30px;
    }
    .alert-badge {
      display: inline-block;
      background-color: #dc2626;
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 15px;
    }
    .device-name {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 10px;
    }
    .message {
      background-color: #f8fafc;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .button {
      display: inline-block;
      background-color: #3b82f6;
      color: white;
      padding: 12px 24px;
      border-radius: 6px;
      text-decoration: none;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚗 Prologix GPS Tracking</h1>
    </div>
    <div class="content">
      <div class="alert-badge">Alerta GPS</div>
      ${deviceName ? `<div class="device-name">📍 ${deviceName}</div>` : ''}
      <h2>${subject}</h2>
      <div class="message">
        ${message}
      </div>
      <p style="color: #64748b; font-size: 14px;">
        Esta es una notificación automática del sistema de rastreo GPS Prologix.
        Por favor, no responda a este correo.
      </p>
    </div>
    <div class="footer">
      <p><strong>Prologix GPS Tracking</strong></p>
      <p>Sistema de Rastreo GPS en Tiempo Real</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Método para enviar reportes o resúmenes
  async sendDailyReport(to: string, devices: any[]): Promise<boolean> {
    if (!this.isEnabled) return false;

    const subject = 'Resumen Diario - Prologix GPS';
    const devicesOnline = devices.filter(d => d.online).length;
    const devicesOffline = devices.length - devicesOnline;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; }
    .stats { display: flex; gap: 20px; margin: 20px 0; }
    .stat-card { flex: 1; background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; }
    .stat-number { font-size: 32px; font-weight: bold; color: #3b82f6; }
    .stat-label { color: #64748b; margin-top: 5px; }
  </style>
</head>
<body>
  <h2>📊 Resumen Diario de Dispositivos</h2>
  <div class="stats">
    <div class="stat-card">
      <div class="stat-number">${devices.length}</div>
      <div class="stat-label">Total Dispositivos</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color: #10b981;">${devicesOnline}</div>
      <div class="stat-label">En Línea</div>
    </div>
    <div class="stat-card">
      <div class="stat-number" style="color: #dc2626;">${devicesOffline}</div>
      <div class="stat-label">Fuera de Línea</div>
    </div>
  </div>
</body>
</html>
    `;

    try {
      await sgMail.send({
        to,
        from: {
          email: process.env.SENDGRID_FROM_EMAIL || 'noreply@prologix.com',
          name: process.env.SENDGRID_FROM_NAME || 'Prologix GPS',
        },
        subject,
        html: htmlContent,
      });

      this.logger.log(`✅ Daily report sent to ${to}`);
      return true;
    } catch (error) {
      this.logger.error(`❌ Failed to send daily report:`, error.message);
      return false;
    }
  }
}
