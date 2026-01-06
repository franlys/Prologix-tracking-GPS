const https = require('https');

const API_URL = 'https://prologix-tracking-gps-production.up.railway.app';

// Datos del usuario de prueba para Google Play
const testUser = {
  name: 'Google Play Test User',
  email: 'googleplay.test@prologix.com',
  password: 'GooglePlay2026!'
};

// Función para registrar el usuario
async function createTestUser() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(testUser);

    const options = {
      hostname: 'prologix-tracking-gps-production.up.railway.app',
      port: 443,
      path: '/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          console.log('✅ Usuario de prueba creado exitosamente');
          console.log('Response:', body);
          resolve(JSON.parse(body));
        } else if (res.statusCode === 400 || res.statusCode === 409) {
          console.log('⚠️  El usuario ya existe o hay un error de validación');
          console.log('Response:', body);
          resolve({ message: 'Usuario ya existe', existing: true });
        } else {
          console.log(`❌ Error: ${res.statusCode}`);
          console.log('Response:', body);
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error en la petición:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Función para hacer login y obtener el token
async function loginUser() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      email: testUser.email,
      password: testUser.password
    });

    const options = {
      hostname: 'prologix-tracking-gps-production.up.railway.app',
      port: 443,
      path: '/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Login exitoso');
          const response = JSON.parse(body);
          resolve(response);
        } else {
          console.log(`❌ Error en login: ${res.statusCode}`);
          console.log('Response:', body);
          reject(new Error(`Login failed: ${res.statusCode}`));
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error en login:', error);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Función para iniciar trial de PROFESIONAL
async function updateSubscription(token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      plan: 'PROFESIONAL'
    });

    const options = {
      hostname: 'prologix-tracking-gps-production.up.railway.app',
      port: 443,
      path: '/subscriptions/trial/start',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Bearer ${token}`
      }
    };

    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        console.log(`Trial activation status: ${res.statusCode}`);
        console.log('Response:', body);
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Trial de PROFESIONAL activado exitosamente');
          resolve(JSON.parse(body));
        } else {
          console.log('⚠️  No se pudo activar el trial (puede que ya tenga un plan activo)');
          resolve({ message: 'Trial activation skipped', body });
        }
      });
    });

    req.on('error', (error) => {
      console.error('⚠️  Error al actualizar suscripción:', error.message);
      resolve({ error: error.message });
    });

    req.write(data);
    req.end();
  });
}

// Ejecutar el script
async function main() {
  console.log('🚀 Creando usuario de prueba para Google Play...\n');
  console.log('API URL:', API_URL);
  console.log('Usuario:', testUser.email);
  console.log('Contraseña:', testUser.password);
  console.log('\n' + '='.repeat(50) + '\n');

  try {
    // Paso 1: Crear usuario
    console.log('📝 Paso 1: Registrando usuario...');
    const registerResult = await createTestUser();

    // Esperar un momento para que se procese
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Paso 2: Login para obtener token
    console.log('\n🔐 Paso 2: Iniciando sesión...');
    const loginResult = await loginUser();
    const token = loginResult.token || loginResult.access_token || loginResult.accessToken;

    if (!token) {
      console.log('⚠️  No se obtuvo token, pero el usuario fue creado');
      console.log('Puedes configurar la suscripción manualmente desde la base de datos');
      return;
    }

    console.log('Token obtenido:', token.substring(0, 20) + '...');

    // Paso 3: Actualizar suscripción (opcional, puede fallar si no hay endpoint)
    console.log('\n💳 Paso 3: Activando trial de PROFESIONAL...');
    await updateSubscription(token);

    console.log('\n' + '='.repeat(50));
    console.log('\n✅ PROCESO COMPLETADO\n');
    console.log('Credenciales para Google Play Console:');
    console.log('Email: googleplay.test@prologix.com');
    console.log('Password: GooglePlay2026!');
    console.log('\nPuedes usar estas credenciales ahora en Play Console.');
    console.log('\n' + '='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Error en el proceso:', error.message);
    console.error('\nIntenta crear el usuario manualmente desde la app o base de datos.');
  }
}

main();
