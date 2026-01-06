import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class LegalController {
  @Get('account-deletion')
  getAccountDeletionPolicy(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Eliminación de Cuenta - Prologix GPS</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 {
            color: #667eea;
            margin-bottom: 10px;
            font-size: 2em;
        }
        h2 {
            color: #667eea;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 1.5em;
            border-bottom: 2px solid #667eea;
            padding-bottom: 5px;
        }
        h3 {
            color: #764ba2;
            margin-top: 20px;
            margin-bottom: 10px;
            font-size: 1.2em;
        }
        p, li {
            margin-bottom: 10px;
        }
        ul {
            margin-left: 20px;
        }
        .highlight {
            background-color: #fff3cd;
            padding: 15px;
            border-left: 4px solid #ffc107;
            margin: 20px 0;
        }
        .success {
            color: #10b981;
        }
        .warning {
            color: #f59e0b;
        }
        .danger {
            color: #ef4444;
        }
        .contact {
            background-color: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        code {
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🗑️ Política de Eliminación de Cuenta</h1>
            <p><strong>Prologix GPS</strong></p>
        </div>

        <h2>📱 Cómo eliminar tu cuenta</h2>
        <p>Los usuarios de Prologix GPS pueden solicitar la eliminación de su cuenta y todos los datos asociados siguiendo estos pasos:</p>

        <h3>Opción 1: Desde la aplicación móvil</h3>
        <ol>
            <li>Abre la app Prologix GPS</li>
            <li>Ve a tu <strong>Perfil</strong> (ícono de usuario en la parte superior)</li>
            <li>Toca <strong>Configuración</strong></li>
            <li>Desplázate hasta el final y toca <strong>Eliminar Cuenta</strong></li>
            <li>Confirma la eliminación ingresando tu contraseña</li>
            <li>Tu cuenta será eliminada inmediatamente</li>
        </ol>

        <h3>Opción 2: Solicitud por correo electrónico</h3>
        <p>Si no puedes acceder a la aplicación, envía un correo electrónico a:</p>
        <p><strong>Email:</strong> <a href="mailto:elmaestrogonzalez30@gmail.com">elmaestrogonzalez30@gmail.com</a></p>
        <p><strong>Asunto:</strong> "Solicitud de Eliminación de Cuenta - Prologix GPS"</p>
        <p><strong>Contenido del mensaje:</strong></p>
        <ul>
            <li>Tu nombre completo</li>
            <li>Email registrado en la app</li>
            <li>Motivo de eliminación (opcional)</li>
        </ul>
        <p>Procesaremos tu solicitud en un plazo máximo de <strong>48 horas</strong>.</p>

        <h2>✅ Datos que se eliminarán</h2>
        <p>Cuando elimines tu cuenta, se borrarán permanentemente los siguientes datos:</p>

        <h3 class="success">Información personal:</h3>
        <ul>
            <li>Nombre</li>
            <li>Dirección de correo electrónico</li>
            <li>Contraseña (hasheada)</li>
            <li>Foto de perfil</li>
        </ul>

        <h3 class="success">Datos de la aplicación:</h3>
        <ul>
            <li>Todos tus dispositivos GPS registrados</li>
            <li>Configuraciones de dispositivos</li>
            <li>Geofences creadas</li>
            <li>Alertas y notificaciones configuradas</li>
            <li>Historial de rutas y ubicaciones</li>
            <li>Configuraciones de compartir con otros usuarios</li>
        </ul>

        <h3 class="success">Datos de suscripción:</h3>
        <ul>
            <li>Información del plan actual</li>
            <li>Historial de suscripciones</li>
        </ul>

        <h2>⏱️ Datos que se conservan</h2>
        <p>Algunos datos se conservan por razones legales y de seguridad:</p>

        <h3 class="warning">Conservación temporal (30 días):</h3>
        <ul>
            <li>Registros de transacciones financieras (requerido por ley)</li>
            <li>Logs de auditoría de seguridad</li>
        </ul>

        <h3 class="warning">Conservación permanente (anonimizados):</h3>
        <ul>
            <li>Estadísticas agregadas de uso (sin identificación personal)</li>
            <li>Reportes de fallos y errores (sin datos personales)</li>
        </ul>

        <h2>📅 Período de retención</h2>
        <ul>
            <li><strong>Eliminación inmediata:</strong> Tu cuenta y datos personales se eliminan de forma inmediata e irreversible</li>
            <li><strong>Retención de backups:</strong> Los datos pueden persistir en backups del sistema por hasta 30 días adicionales</li>
            <li><strong>Datos financieros:</strong> Se conservan por 5 años según requerimientos fiscales y legales de República Dominicana</li>
        </ul>

        <div class="highlight">
            <h3 class="danger">⚠️ IMPORTANTE: La eliminación de tu cuenta es PERMANENTE e IRREVERSIBLE</h3>
            <p><strong>Al eliminar tu cuenta:</strong></p>
            <ul>
                <li class="danger">❌ Perderás acceso a todos tus dispositivos GPS configurados</li>
                <li class="danger">❌ Se eliminarán todas tus geofences y alertas</li>
                <li class="danger">❌ Se cancelará tu suscripción actual (sin reembolso)</li>
                <li class="danger">❌ Perderás todo el historial de rutas y ubicaciones</li>
                <li class="danger">❌ Los usuarios con quienes compartiste dispositivos perderán el acceso</li>
            </ul>
        </div>

        <h2>💡 Alternativa: Cancelar suscripción sin eliminar cuenta</h2>
        <p>Si solo deseas cancelar tu plan de pago pero mantener tu cuenta:</p>
        <ol>
            <li>Ve a <strong>Perfil</strong> → <strong>Suscripción</strong></li>
            <li>Toca <strong>Cancelar Suscripción</strong></li>
            <li>Tu cuenta se mantendrá activa con el plan gratuito (1 dispositivo)</li>
        </ol>

        <h2>❓ Preguntas frecuentes</h2>

        <h3>¿Puedo recuperar mi cuenta después de eliminarla?</h3>
        <p>No. La eliminación es permanente. Deberás crear una nueva cuenta si deseas usar Prologix GPS nuevamente.</p>

        <h3>¿Mis dispositivos GPS físicos dejarán de funcionar?</h3>
        <p>No. Tus dispositivos GPS continuarán funcionando, pero ya no los podrás rastrear a través de Prologix GPS. Deberás configurarlos con otra plataforma.</p>

        <h3>¿Qué pasa con los usuarios con quienes compartí mis dispositivos?</h3>
        <p>Perderán inmediatamente el acceso a los dispositivos que compartiste con ellos.</p>

        <h3>¿Se cancelará automáticamente mi suscripción?</h3>
        <p>Sí. Tu suscripción se cancelará automáticamente sin reembolso del período restante.</p>

        <div class="contact">
            <h2>📞 Contacto</h2>
            <p>Para cualquier consulta sobre la eliminación de tu cuenta o datos, contáctanos:</p>
            <ul>
                <li><strong>Email:</strong> <a href="mailto:elmaestrogonzalez30@gmail.com">elmaestrogonzalez30@gmail.com</a></li>
                <li><strong>Desarrollador:</strong> Prologix GPS</li>
                <li><strong>Sitio web:</strong> <a href="https://prologix-tracking-gps-production.up.railway.app">https://prologix-tracking-gps-production.up.railway.app</a></li>
            </ul>
        </div>

        <p style="text-align: center; margin-top: 40px; color: #6b7280; font-size: 0.9em;">
            Última actualización: Enero 2026
        </p>
    </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  @Get('privacy-policy')
  getPrivacyPolicy(@Res() res: Response) {
    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Política de Privacidad - Prologix GPS</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }
        h1 { color: #667eea; margin-bottom: 20px; font-size: 2em; }
        h2 { color: #667eea; margin-top: 30px; margin-bottom: 15px; font-size: 1.5em; }
        p, li { margin-bottom: 10px; }
        ul { margin-left: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔒 Política de Privacidad</h1>
        <p><strong>Prologix GPS</strong></p>
        <p><em>Última actualización: Enero 2026</em></p>

        <h2>1. Información que recopilamos</h2>
        <ul>
            <li><strong>Información personal:</strong> Nombre, email</li>
            <li><strong>Datos de ubicación:</strong> Ubicación GPS de dispositivos rastreados</li>
            <li><strong>Datos de uso:</strong> Historial de rutas, geofences, alertas</li>
        </ul>

        <h2>2. Cómo usamos tu información</h2>
        <ul>
            <li>Proporcionar servicios de rastreo GPS</li>
            <li>Enviar notificaciones y alertas</li>
            <li>Mejorar la experiencia del usuario</li>
        </ul>

        <h2>3. Compartir información</h2>
        <p>No vendemos ni compartimos tu información personal con terceros, excepto:</p>
        <ul>
            <li>Cuando compartes dispositivos con otros usuarios (controlado por ti)</li>
            <li>Cuando lo requiere la ley</li>
        </ul>

        <h2>4. Seguridad</h2>
        <p>Usamos cifrado HTTPS/TLS para proteger tus datos en tránsito.</p>

        <h2>5. Tus derechos</h2>
        <ul>
            <li>Acceder a tus datos</li>
            <li>Modificar tu información</li>
            <li>Eliminar tu cuenta</li>
        </ul>

        <h2>6. Contacto</h2>
        <p><strong>Email:</strong> <a href="mailto:elmaestrogonzalez30@gmail.com">elmaestrogonzalez30@gmail.com</a></p>
    </div>
</body>
</html>
    `;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }
}
