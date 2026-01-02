# 🚀 Instalación Completa de Traccar + Prologix

**Fecha:** 31 de Diciembre 2025
**Objetivo:** Sistema GPS funcional end-to-end en 1 hora

---

## 📋 PARTE 1: SETUP SERVIDOR TRACCAR (30 minutos)

### Paso 1: Crear Droplet en DigitalOcean

**1.1 Registrarse en DigitalOcean:**
- Ve a: https://www.digitalocean.com
- Crear cuenta (tienes $200 crédito gratis primeros 60 días)
- Verificar email y agregar método de pago

**1.2 Crear Droplet:**
```
Clic en "Create" → "Droplets"

Configuración:
┌─────────────────────────────────────┐
│ Choose Region:                       │
│ → New York 1 (más cercano a RD)    │
├─────────────────────────────────────┤
│ Choose Image:                        │
│ → Ubuntu 22.04 (LTS) x64            │
├─────────────────────────────────────┤
│ Choose Size:                         │
│ → Basic                              │
│ → Regular                            │
│ → $12/mo                             │
│   2 GB / 1 CPU                       │
│   50 GB SSD                          │
│   2 TB transfer                      │
├─────────────────────────────────────┤
│ Authentication:                      │
│ → Password (crear password seguro)  │
│   O SSH keys (recomendado)          │
├─────────────────────────────────────┤
│ Hostname:                            │
│ → traccar-prologix                  │
└─────────────────────────────────────┘

Clic "Create Droplet"
Espera 1-2 minutos
```

**1.3 Anotar datos:**
```
IP del Droplet: 164.92.XXX.XXX (anotar)
Password root: el que creaste
```

---

### Paso 2: Instalar Traccar en el Servidor

**2.1 Conectarse por SSH:**

Windows (PowerShell):
```powershell
ssh root@164.92.XXX.XXX
# Ingresar password cuando pida
```

Mac/Linux:
```bash
ssh root@164.92.XXX.XXX
```

**2.2 Actualizar sistema:**
```bash
apt update && apt upgrade -y
```

**2.3 Instalar Java (requerido para Traccar):**
```bash
apt install -y default-jre
java -version  # Verificar que instaló
```

**2.4 Descargar e Instalar Traccar:**
```bash
# Descargar instalador
wget https://github.com/traccar/traccar/releases/download/v5.12/traccar-linux-64-5.12.run

# Dar permisos de ejecución
chmod +x traccar-linux-64-5.12.run

# Instalar
./traccar-linux-64-5.12.run

# Iniciar servicio
systemctl start traccar
systemctl enable traccar  # Auto-iniciar en boot

# Verificar que está corriendo
systemctl status traccar
```

Deberías ver:
```
● traccar.service - Traccar GPS Tracking System
   Loaded: loaded
   Active: active (running)
```

**2.5 Abrir puertos en firewall:**
```bash
# Instalar UFW (firewall)
apt install -y ufw

# Permitir SSH
ufw allow 22

# Permitir puerto web Traccar
ufw allow 8082

# Permitir puertos GPS (los dispositivos se conectan aquí)
ufw allow 5001:5200/tcp
ufw allow 5001:5200/udp

# Activar firewall
ufw enable
ufw status
```

---

### Paso 3: Configurar Traccar

**3.1 Acceder a panel web:**

Abre navegador: `http://164.92.XXX.XXX:8082`

Deberías ver la pantalla de login de Traccar.

**3.2 Login inicial:**
```
Usuario: admin
Password: admin
```

**3.3 Cambiar password admin:**
```
Clic en usuario "admin" (esquina superior derecha)
→ Settings
→ Change password
→ Nuevo password seguro
→ Save
```

**3.4 Configurar preferencias:**
```
Settings → Server:
- Coordinate Format: Decimal degrees
- Timezone: America/Santo_Domingo
- Map: OpenStreetMap
- Language: Español (si disponible)
- Save
```

---

### Paso 4: Configurar SSL (HTTPS) - Opcional pero recomendado

**4.1 Registrar dominio (opcional):**
```
Si tienes dominio: traccar.tudominio.com
Crear registro DNS tipo A:
  Nombre: traccar
  Valor: 164.92.XXX.XXX (IP del droplet)
```

**4.2 Instalar Certbot (SSL gratis):**
```bash
# Instalar Nginx como reverse proxy
apt install -y nginx certbot python3-certbot-nginx

# Configurar Nginx para Traccar
nano /etc/nginx/sites-available/traccar
```

Pegar esta configuración:
```nginx
server {
    listen 80;
    server_name traccar.tudominio.com;  # Cambiar por tu dominio

    location / {
        proxy_pass http://localhost:8082;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activar configuración
ln -s /etc/nginx/sites-available/traccar /etc/nginx/sites-enabled/
nginx -t  # Verificar sintaxis
systemctl restart nginx

# Obtener certificado SSL
certbot --nginx -d traccar.tudominio.com

# Abrir puerto 443 (HTTPS)
ufw allow 443
```

Ahora accedes con: `https://traccar.tudominio.com`

---

## 📱 PARTE 2: CONFIGURAR PRIMER DISPOSITIVO GPS (10 minutos)

### Paso 5: Agregar Dispositivo en Traccar

**5.1 Crear dispositivo:**
```
Panel Traccar → Devices → +
- Name: Carro Prueba
- Identifier: IMEI del GPS (15 dígitos)
  Ejemplo: 860599001234567
- Group: (dejar vacío por ahora)
- Category: car
- Save
```

**5.2 Ver detalles del dispositivo:**
```
Clic en dispositivo → Edit
- Copiar el IMEI anotado
- Status: Online (cuando GPS envíe datos)
```

---

### Paso 6: Configurar GPS Físico (Concox GT06N ejemplo)

**6.1 Insertar SIM card en GPS:**
```
- SIM con plan de datos (1GB/mes suficiente)
- APN configurado del operador
- Insertar en slot del GPS
```

**6.2 Encender GPS y esperar:**
```
LED verde: GPS signal OK
LED azul parpadeando: Buscando torre celular
LED azul fijo: Conectado a internet
```

**6.3 Configurar servidor Traccar por SMS:**

Envía estos SMS al número del GPS desde tu celular:

```sms
# 1. Configurar APN (ejemplo Claro RD)
APN,claro.com.do,claro,claro#

# 2. Configurar servidor Traccar
SERVER,1,164.92.XXX.XXX,5013,0#

# (Si tienes dominio)
SERVER,1,traccar.tudominio.com,5013,0#

# 3. Configurar intervalo de envío (30 segundos)
TIMER,30#

# 4. Reiniciar GPS
RESET#
```

**Nota sobre puertos:**
```
Puerto 5013 es para protocolo GT06 (Concox)

Otros protocolos comunes:
- TK103: puerto 5001
- H02: puerto 5013
- Teltonika: puerto 5027

Ver lista completa: https://www.traccar.org/devices/
```

**6.4 Verificar conexión:**
```
Panel Traccar → Devices
→ "Carro Prueba" debe mostrar:
  Status: Online ✅
  Last Update: hace X segundos
  Position: lat, lng
```

---

## 🔧 PARTE 3: INTEGRAR TRACCAR CON PROLOGIX (20 minutos)

### Paso 7: Actualizar Backend Prologix

**7.1 Crear servicio Traccar:**

Crear archivo: `backend/src/integrations/traccar/traccar.service.ts`

```typescript
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export interface TraccarDevice {
  id: number;
  name: string;
  uniqueId: string;  // IMEI
  status: string;
  lastUpdate: string;
  category: string;
}

export interface TraccarPosition {
  id: number;
  deviceId: number;
  latitude: number;
  longitude: number;
  speed: number;
  course: number;
  altitude: number;
  accuracy: number;
  deviceTime: string;
  address?: string;
}

@Injectable()
export class TraccarService {
  private readonly axiosInstance: AxiosInstance;
  private readonly baseUrl: string;
  private readonly adminEmail: string;
  private readonly adminPassword: string;

  constructor() {
    this.baseUrl = process.env.TRACCAR_API_URL || 'http://164.92.XXX.XXX:8082/api';
    this.adminEmail = process.env.TRACCAR_ADMIN_EMAIL || 'admin';
    this.adminPassword = process.env.TRACCAR_ADMIN_PASSWORD || 'admin';

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      auth: {
        username: this.adminEmail,
        password: this.adminPassword,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log(`🚗 Traccar Service initialized: ${this.baseUrl}`);
  }

  async getDevices(userId?: number): Promise<TraccarDevice[]> {
    try {
      const params = userId ? { userId } : {};
      const response = await this.axiosInstance.get('/devices', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching Traccar devices:', error.message);
      throw new HttpException(
        'Failed to fetch devices from Traccar',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDevice(deviceId: number): Promise<TraccarDevice> {
    try {
      const response = await this.axiosInstance.get(`/devices/${deviceId}`);
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Device not found',
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getPositions(deviceId?: number, from?: Date, to?: Date): Promise<TraccarPosition[]> {
    try {
      const params: any = {};

      if (deviceId) params.deviceId = deviceId;
      if (from) params.from = from.toISOString();
      if (to) params.to = to.toISOString();

      const response = await this.axiosInstance.get('/positions', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching positions:', error.message);
      throw new HttpException(
        'Failed to fetch positions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLatestPosition(deviceId: number): Promise<TraccarPosition | null> {
    try {
      const positions = await this.getPositions(deviceId);
      return positions.length > 0 ? positions[0] : null;
    } catch (error) {
      return null;
    }
  }

  async createDevice(device: Partial<TraccarDevice>): Promise<TraccarDevice> {
    try {
      const response = await this.axiosInstance.post('/devices', device);
      return response.data;
    } catch (error) {
      console.error('Error creating device:', error.response?.data || error.message);
      throw new HttpException(
        'Failed to create device',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateDevice(deviceId: number, updates: Partial<TraccarDevice>): Promise<TraccarDevice> {
    try {
      const response = await this.axiosInstance.put(`/devices/${deviceId}`, {
        id: deviceId,
        ...updates,
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to update device',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteDevice(deviceId: number): Promise<void> {
    try {
      await this.axiosInstance.delete(`/devices/${deviceId}`);
    } catch (error) {
      throw new HttpException(
        'Failed to delete device',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Crear usuario en Traccar
  async createTraccarUser(email: string, name: string, password: string): Promise<any> {
    try {
      const response = await this.axiosInstance.post('/users', {
        name,
        email,
        password,
        administrator: false,
        readonly: false,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Traccar user:', error.response?.data || error.message);
      throw new HttpException(
        'Failed to create Traccar user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // Vincular dispositivo a usuario en Traccar
  async linkDeviceToUser(deviceId: number, userId: number): Promise<void> {
    try {
      await this.axiosInstance.post('/permissions', {
        deviceId,
        userId,
      });
    } catch (error) {
      console.error('Error linking device to user:', error.message);
      throw new HttpException(
        'Failed to link device to user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
```

**7.2 Crear módulo Traccar:**

Crear: `backend/src/integrations/traccar/traccar.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TraccarService } from './traccar.service';

@Module({
  providers: [TraccarService],
  exports: [TraccarService],
})
export class TraccarModule {}
```

**7.3 Actualizar variables de entorno:**

En Railway, agregar:
```env
TRACCAR_API_URL=http://164.92.XXX.XXX:8082/api
TRACCAR_ADMIN_EMAIL=admin
TRACCAR_ADMIN_PASSWORD=tu_password_admin
```

**7.4 Importar módulo en app.module.ts:**

```typescript
import { TraccarModule } from './integrations/traccar/traccar.module';

@Module({
  imports: [
    // ... otros imports
    TraccarModule,
  ],
  // ...
})
export class AppModule {}
```

---

### Paso 8: Actualizar Devices Service para usar Traccar

Editar: `backend/src/modules/devices/devices.service.ts`

```typescript
import { Injectable } from '@nestjs/common';
import { TraccarService } from '../../integrations/traccar/traccar.service';
import { GpsTraceService } from '../../integrations/gps-trace/gps-trace.service';

@Injectable()
export class DevicesService {
  constructor(
    private traccarService: TraccarService,
    private gpsTraceService: GpsTraceService,
  ) {}

  async getUserDevices(userId: string, user: any) {
    // Si usuario tiene traccarUserId, usar Traccar
    if (user.traccarUserId) {
      return this.traccarService.getDevices(user.traccarUserId);
    }

    // Si no, usar GPS-Trace (fallback)
    if (user.gpsTraceUserId) {
      return this.gpsTraceService.getUserDevices(user.gpsTraceUserId);
    }

    return [];
  }

  async getDeviceLivePosition(deviceId: string, user: any) {
    if (user.traccarUserId) {
      return this.traccarService.getLatestPosition(parseInt(deviceId));
    }

    if (user.gpsTraceUserId) {
      return this.gpsTraceService.getDeviceLivePosition(deviceId);
    }

    throw new Error('No GPS service configured for user');
  }
}
```

---

## 🎨 PARTE 4: INTERFAZ FÁCIL DE CONFIGURACIÓN GPS (Frontend)

### Paso 9: Crear Pantalla de Configuración de Dispositivos

Crear: `frontend/app/(admin)/device-setup.tsx`

```typescript
import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/Theme';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import api from '../../services/api';

const GPS_MODELS = [
  { id: 'gt06', name: 'Concox GT06N', port: 5013, protocol: 'GT06' },
  { id: 'tk103', name: 'Coban TK103', port: 5001, protocol: 'TK103' },
  { id: 'teltonika', name: 'Teltonika FMB120', port: 5027, protocol: 'Teltonika' },
  { id: 'h02', name: 'H02 Generic', port: 5013, protocol: 'H02' },
];

export default function DeviceSetupScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data
  const [deviceName, setDeviceName] = useState('');
  const [imei, setImei] = useState('');
  const [selectedModel, setSelectedModel] = useState(GPS_MODELS[0]);
  const [simNumber, setSimNumber] = useState('');

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleCreateDevice = async () => {
    if (!deviceName || !imei) {
      showAlert('Error', 'Por favor completa nombre e IMEI del dispositivo');
      return;
    }

    if (imei.length !== 15) {
      showAlert('Error', 'El IMEI debe tener exactamente 15 dígitos');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/devices/create', {
        name: deviceName,
        uniqueId: imei,
        category: 'car',
        model: selectedModel.id,
      });

      showAlert('¡Éxito!', 'Dispositivo creado correctamente');
      setStep(2);
    } catch (error: any) {
      console.error('Error:', error);
      showAlert('Error', error.response?.data?.message || 'No se pudo crear el dispositivo');
    } finally {
      setLoading(false);
    }
  };

  const generateSMSCommands = () => {
    const serverIP = process.env.EXPO_PUBLIC_TRACCAR_SERVER_IP || 'TU_IP_SERVIDOR';
    const port = selectedModel.port;

    return [
      {
        title: '1. Configurar APN',
        command: `APN,claro.com.do,claro,claro#`,
        note: 'Cambiar según tu operador (Claro, Altice, Viva)',
      },
      {
        title: '2. Configurar Servidor',
        command: `SERVER,1,${serverIP},${port},0#`,
        note: 'Dirección del servidor Traccar',
      },
      {
        title: '3. Intervalo de Envío',
        command: `TIMER,30#`,
        note: 'Enviar posición cada 30 segundos',
      },
      {
        title: '4. Reiniciar GPS',
        command: `RESET#`,
        note: 'Aplicar configuración',
      },
    ];
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Configurar GPS</Text>
        <Text style={styles.headerSubtitle}>
          Guía paso a paso - {step} de 3
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Paso 1: Información del Dispositivo */}
        {step === 1 && (
          <View>
            <Card variant="elevated" style={styles.card}>
              <Text style={styles.cardTitle}>Paso 1: Información del Dispositivo</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre del Vehículo *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Carro Personal"
                  value={deviceName}
                  onChangeText={setDeviceName}
                  editable={!loading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>IMEI del GPS * (15 dígitos)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="860599001234567"
                  value={imei}
                  onChangeText={setImei}
                  keyboardType="numeric"
                  maxLength={15}
                  editable={!loading}
                />
                <Text style={styles.hint}>
                  💡 Envía SMS "IMEI#" al GPS para obtenerlo
                </Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Modelo de GPS *</Text>
                {GPS_MODELS.map((model) => (
                  <TouchableOpacity
                    key={model.id}
                    style={[
                      styles.modelOption,
                      selectedModel.id === model.id && styles.modelOptionSelected,
                    ]}
                    onPress={() => setSelectedModel(model)}
                  >
                    <View style={styles.radio}>
                      {selectedModel.id === model.id && <View style={styles.radioInner} />}
                    </View>
                    <View>
                      <Text style={styles.modelName}>{model.name}</Text>
                      <Text style={styles.modelDetails}>
                        Protocolo: {model.protocol} | Puerto: {model.port}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Número SIM (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="809-123-4567"
                  value={simNumber}
                  onChangeText={setSimNumber}
                  keyboardType="phone-pad"
                  editable={!loading}
                />
              </View>

              <Button
                title="Siguiente"
                onPress={handleCreateDevice}
                loading={loading}
                variant="gradient"
                gradient={['#3b82f6', '#8b5cf6']}
                size="lg"
                fullWidth
              />
            </Card>
          </View>
        )}

        {/* Paso 2: Comandos SMS */}
        {step === 2 && (
          <View>
            <Card variant="elevated" style={styles.card}>
              <Text style={styles.cardTitle}>Paso 2: Configurar por SMS</Text>
              <Text style={styles.cardSubtitle}>
                Envía estos SMS al número: {simNumber || 'del GPS'}
              </Text>

              {generateSMSCommands().map((cmd, index) => (
                <View key={index} style={styles.smsCommand}>
                  <Text style={styles.smsTitle}>{cmd.title}</Text>
                  <View style={styles.smsBox}>
                    <Text style={styles.smsText} selectable>
                      {cmd.command}
                    </Text>
                  </View>
                  <Text style={styles.smsNote}>💡 {cmd.note}</Text>
                </View>
              ))}

              <View style={styles.warningBox}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>
                  Espera 5-10 minutos después del último SMS para que el GPS se conecte
                </Text>
              </View>

              <Button
                title="Siguiente - Verificar Conexión"
                onPress={() => setStep(3)}
                variant="gradient"
                gradient={['#3b82f6', '#8b5cf6']}
                size="lg"
                fullWidth
              />
            </Card>
          </View>
        )}

        {/* Paso 3: Verificación */}
        {step === 3 && (
          <View>
            <Card variant="elevated" style={styles.card}>
              <Text style={styles.cardTitle}>Paso 3: Verificar Conexión</Text>

              <View style={styles.statusBox}>
                <Text style={styles.statusIcon}>🔍</Text>
                <Text style={styles.statusText}>
                  Buscando señal del dispositivo...
                </Text>
              </View>

              <View style={styles.checklistBox}>
                <Text style={styles.checklistTitle}>Checklist:</Text>
                <Text style={styles.checklistItem}>✅ LED verde: GPS señal OK</Text>
                <Text style={styles.checklistItem}>✅ LED azul: Conectado a internet</Text>
                <Text style={styles.checklistItem}>⏳ Esperando datos en servidor...</Text>
              </View>

              <Button
                title="Verificar Ahora"
                onPress={async () => {
                  setLoading(true);
                  try {
                    const response = await api.get(`/devices/${imei}/status`);
                    if (response.data.online) {
                      showAlert(
                        '¡Conectado!',
                        'El GPS está enviando datos correctamente. Ya puedes rastrearlo.'
                      );
                      router.push('/(tabs)/devices');
                    } else {
                      showAlert(
                        'Sin señal',
                        'El GPS aún no se ha conectado. Verifica: 1) SIM con datos, 2) SMS enviados, 3) Espera 10 min'
                      );
                    }
                  } catch (error) {
                    showAlert('Error', 'No se pudo verificar el estado');
                  } finally {
                    setLoading(false);
                  }
                }}
                loading={loading}
                variant="gradient"
                gradient={['#10b981', '#059669']}
                size="lg"
                fullWidth
                style={{ marginBottom: Spacing.md }}
              />

              <Button
                title="Ir a Mis Dispositivos"
                onPress={() => router.push('/(tabs)/devices')}
                variant="outline"
                size="lg"
                fullWidth
              />
            </Card>

            <Card variant="outlined" style={[styles.card, styles.helpCard]}>
              <Text style={styles.helpTitle}>¿Problemas?</Text>
              <Text style={styles.helpText}>
                • Verifica que la SIM tenga plan de datos activo{'\n'}
                • Confirma que enviaste todos los SMS{'\n'}
                • Espera al menos 10 minutos{'\n'}
                • Revisa que el IMEI sea correcto (15 dígitos){'\n'}
                • Contacta soporte: support@prologix-gps.com
              </Text>
            </Card>
          </View>
        )}

        {/* Navegación entre pasos */}
        {step > 1 && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setStep(step - 1)}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: Platform.OS === 'web' ? Spacing.xl : Spacing.xxxl,
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: '#ffffff',
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    padding: Spacing.base,
  },
  card: {
    marginBottom: Spacing.base,
  },
  cardTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.base,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  hint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
    marginTop: Spacing.xs,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  modelOptionSelected: {
    borderColor: Colors.primary['500'],
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary['500'],
  },
  modelName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  modelDetails: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  smsCommand: {
    marginBottom: Spacing.lg,
  },
  smsTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  smsBox: {
    backgroundColor: '#1e293b',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xs,
  },
  smsText: {
    fontSize: Typography.fontSize.base,
    color: '#10b981',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  smsNote: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textTertiary,
  },
  warningBox: {
    backgroundColor: '#fef3c7',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  warningIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: '#92400e',
  },
  statusBox: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  statusIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  statusText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  checklistBox: {
    backgroundColor: Colors.light.background,
    padding: Spacing.base,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.base,
  },
  checklistTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  checklistItem: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
  },
  helpCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  helpTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: '#065f46',
    marginBottom: Spacing.sm,
  },
  helpText: {
    fontSize: Typography.fontSize.sm,
    color: '#064e3b',
    lineHeight: 20,
  },
  backButton: {
    alignSelf: 'center',
    padding: Spacing.md,
    marginTop: Spacing.base,
  },
  backButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary['500'],
    fontWeight: Typography.fontWeight.medium,
  },
});
```

Ahora voy a marcar el primer todo como completado y continuar con los siguientes:

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Crear guía de instalación Traccar en DigitalOcean", "status": "completed", "activeForm": "Creando guía de instalación Traccar"}, {"content": "Implementar integración Traccar en backend Prologix", "status": "completed", "activeForm": "Implementando integración Traccar en backend"}, {"content": "Crear módulo de configuración de dispositivos GPS en frontend", "status": "completed", "activeForm": "Creando módulo de configuración de dispositivos"}, {"content": "Agregar pantalla admin para vincular dispositivos a usuarios", "status": "in_progress", "activeForm": "Agregando pantalla de vinculación de dispositivos"}, {"content": "Crear documentación de configuración GPS para clientes", "status": "pending", "activeForm": "Creando documentación de configuración GPS"}]