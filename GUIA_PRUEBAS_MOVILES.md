# 📱 Guía de Pruebas en Móviles - Prologix GPS

**Fecha:** 2 de Enero 2026
**Versión:** 1.3.0
**Plataformas:** iOS (iPhone/iPad) y Android

---

## 🎨 Diseño General del Sistema

### Arquitectura Visual

El sistema Prologix GPS tiene **3 interfaces principales** según el rol del usuario:

#### 1. **Panel de Usuario (USER)** 🚗
**Color Principal:** Azul (#3b82f6)

**Pantallas:**
- **Dashboard** - Vista general con dispositivos y accesos rápidos
- **Mapa** - Rastreo en tiempo real con Leaflet maps
- **Dispositivos** - Lista de GPS asignados
- **Configuración** - Ajustes de cuenta y suscripción

**Navegación:** Tabs en la parte inferior (móvil) o lateral (web)

---

#### 2. **Panel de Instalador (INSTALLER)** 🔧
**Color Principal:** Púrpura (#7c3aed)

**Pantallas:**
- **Dashboard** - Estadísticas de clientes y comisiones
- **Mis Clientes** - Lista de clientes asignados
- **Comisiones** - Historial de comisiones ganadas

**Navegación:** Menú simple, enfocado en métricas

---

#### 3. **Panel de Administrador (ADMIN)** ⚙️
**Color Principal:** Multi-color según función

**Pantallas Nuevas (Creadas hoy):**

##### a) **Dashboard Admin** (NEW ✨)
- **Ruta:** `/(admin)/dashboard`
- **Diseño:** Grid de acciones rápidas con gradientes
- **Funcionalidad:** Hub central con acceso a todas las funciones admin

**6 Acciones Principales:**
```
┌──────────────────┬──────────────────┐
│  📱 Configurar   │  🔗 Vincular     │
│     GPS          │   Dispositivo    │
│  (Verde)         │  (Azul)          │
├──────────────────┼──────────────────┤
│  🔧 Instaladores │  👥 Usuarios     │
│                  │                  │
│  (Púrpura)       │  (Naranja)       │
├──────────────────┼──────────────────┤
│  💰 Comisiones   │  🗺️ Todos       │
│                  │   los GPS        │
│  (Rosa)          │  (Cyan)          │
└──────────────────┴──────────────────┘
```

##### b) **Wizard de Configuración GPS** (NEW ✨)
- **Ruta:** `/(admin)/device-setup`
- **Diseño:** Wizard de 3 pasos con indicador de progreso
- **Color:** Gradiente verde (#10b981 → #059669)

**Paso 1: Información del Dispositivo**
```
┌─────────────────────────────────────┐
│ 📱 Paso 1: Información              │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Nombre del Vehículo             │ │
│ │ [Toyota Corolla 2020]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ IMEI (15 dígitos)               │ │
│ │ [123456789012345]               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Modelo del GPS:                     │
│ ┌─────────────────────────────────┐ │
│ │ ✓ Concox GT06N                  │ │
│ │   SMS + GPRS | Puerto: 5023     │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │   Coban TK103                   │ │
│ │   Económico | Puerto: 5013      │ │
│ └─────────────────────────────────┘ │
│                                     │
│        [Siguiente →]                │
└─────────────────────────────────────┘
```

**Paso 2: Comandos SMS**
```
┌─────────────────────────────────────┐
│ 📨 Paso 2: Enviar Comandos SMS      │
│                                     │
│ 1. Configurar APN          [Copiar] │
│ ┌─────────────────────────────────┐ │
│ │ APN,claro.com.do,claro,claro#   │ │
│ └─────────────────────────────────┘ │
│ 💡 Cambiar según operador           │
│                                     │
│ 2. Configurar Servidor     [Copiar] │
│ ┌─────────────────────────────────┐ │
│ │ SERVER,1,164.92.XXX,5023,0#     │ │
│ └─────────────────────────────────┘ │
│ 💡 Dirección del servidor Traccar   │
│                                     │
│ 3. Intervalo de Envío      [Copiar] │
│ ┌─────────────────────────────────┐ │
│ │ TIMER,30#                       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 4. Reiniciar GPS           [Copiar] │
│ ┌─────────────────────────────────┐ │
│ │ RESET#                          │ │
│ └─────────────────────────────────┘ │
│                                     │
│  [← Atrás]     [Siguiente →]       │
└─────────────────────────────────────┘
```

**Paso 3: Verificación**
```
┌─────────────────────────────────────┐
│ ✅ Paso 3: Verificar Conexión       │
│                                     │
│ Dispositivo: Toyota Corolla 2020    │
│ IMEI: 123456789012345               │
│ Modelo: Concox GT06N                │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │         ✅ ¡Conectado!          │ │
│ │                                 │ │
│ │ El GPS está enviando datos      │ │
│ │ correctamente.                  │ │
│ │                                 │ │
│ │ Última posición: hace 30 seg    │ │
│ └─────────────────────────────────┘ │
│                                     │
│    [Verificar Conexión]             │
│    [Finalizar Configuración]        │
└─────────────────────────────────────┘
```

##### c) **Vinculación de Dispositivos** (NEW ✨)
- **Ruta:** `/(admin)/link-device`
- **Diseño:** Selector dual con búsqueda
- **Color:** Gradiente verde (#10b981 → #059669)

```
┌─────────────────────────────────────┐
│ 🔗 Vincular Dispositivo             │
│                                     │
│ 1. Seleccionar Cliente              │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Buscar por nombre o email    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 👤 María González                   │
│    maria@example.com                │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ 2. Seleccionar Dispositivo GPS      │
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Buscar por nombre o IMEI     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 🚗 Toyota Corolla 2020              │
│    IMEI: 123456789012345            │
│    [Online]                         │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ Resumen:                            │
│ 📱 GPS: Toyota Corolla 2020         │
│ 👤 Cliente: María González          │
│                                     │
│      [Vincular Dispositivo]         │
└─────────────────────────────────────┘
```

---

### Sistema de Diseño (Theme)

**Colores Principales:**
```typescript
Colors = {
  primary: {
    '500': '#3b82f6',  // Azul principal
    '600': '#2563eb',
  },
  success: {
    '500': '#10b981',  // Verde (GPS, éxito)
  },
  warning: {
    '500': '#f59e0b',  // Naranja (alertas)
  },
  error: {
    '500': '#ef4444',  // Rojo (errores)
  },
  secondary: {
    '500': '#7c3aed',  // Púrpura (instaladores)
  }
}
```

**Componentes UI Reutilizables:**
- `<Card>` - Tarjetas con variantes: elevated, outlined
- `<Button>` - Botones con gradientes y estados de carga
- `<Badge>` - Etiquetas de estado
- `<CompassLoader>` - Animación de carga personalizada

**Espaciado Consistente:**
```typescript
Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
}
```

---

## 📲 Pruebas en Móviles - Pasos Detallados

### Opción 1: Probar en tu Propio Móvil (Recomendado para Testing)

Esta es la forma MÁS RÁPIDA para probar el sistema.

#### Para Android:

**Paso 1: Instalar Expo Go**
```
1. Abre Google Play Store en tu Android
2. Busca "Expo Go"
3. Instala la app oficial de Expo
```

**Paso 2: Preparar el Proyecto**
```bash
# En tu computadora, navega al proyecto
cd c:\Users\elmae\Prologix-tracking-GPS\frontend

# Instala dependencias si no lo has hecho
npm install

# Inicia el servidor de desarrollo
npx expo start
```

**Paso 3: Escanear QR**
```
1. El comando anterior mostrará un código QR en la terminal
2. Abre Expo Go en tu Android
3. Toca "Scan QR Code"
4. Escanea el QR de la terminal
5. La app se cargará en tu móvil
```

**Requisito:** Tu móvil y computadora deben estar en la **misma red WiFi**.

---

#### Para iPhone/iPad (iOS):

**Paso 1: Instalar Expo Go**
```
1. Abre App Store en tu iPhone
2. Busca "Expo Go"
3. Instala la app oficial de Expo
```

**Paso 2: Preparar el Proyecto**
```bash
# Igual que Android
cd c:\Users\elmae\Prologix-tracking-GPS\frontend
npm install
npx expo start
```

**Paso 3: Escanear QR**
```
1. Abre la app Cámara nativa de iOS
2. Apunta al código QR de la terminal
3. Toca la notificación que aparece
4. Se abrirá en Expo Go automáticamente
```

**Requisito:** Misma red WiFi.

---

### Opción 2: Probar la Versión Web (Ya Desplegada)

**URL:** https://prologix-tracking-gps-frontend.vercel.app/

**Desde Móvil:**
```
1. Abre el navegador en tu móvil (Chrome, Safari)
2. Visita la URL
3. Funciona como una PWA (Progressive Web App)
```

**Ventajas:**
- No requiere instalación
- Disponible inmediatamente
- Funciona en cualquier dispositivo

**Limitaciones:**
- Algunas funciones nativas pueden no funcionar
- Sin acceso a ciertas APIs del dispositivo

---

### Opción 3: Build para Testing (TestFlight/APK)

Para pruebas más profesionales con testers externos.

#### Android APK:

**Paso 1: Configurar EAS Build**
```bash
cd frontend

# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure
```

**Paso 2: Crear APK de Preview**
```bash
# Build APK para testing
eas build --platform android --profile preview

# Espera 10-15 minutos
# Recibirás un link para descargar el APK
```

**Paso 3: Instalar en Android**
```
1. Descarga el APK desde el link
2. Habilita "Instalar apps de fuentes desconocidas"
3. Instala el APK
4. Abre la app
```

---

#### iOS TestFlight:

**Requisitos:**
- Cuenta de Apple Developer ($99/año)
- Dispositivo iOS para testing

**Paso 1: Configurar**
```bash
cd frontend

# Build para iOS
eas build --platform ios --profile preview
```

**Paso 2: Subir a App Store Connect**
```bash
# EAS se encarga de esto automáticamente
# Recibirás un email cuando esté listo
```

**Paso 3: Invitar Testers**
```
1. Ve a App Store Connect
2. TestFlight → Testers
3. Invita testers por email
4. Ellos reciben invitación
5. Descargan TestFlight
6. Instalan tu app
```

---

## 🧪 Flujo de Pruebas Recomendado

### Prueba 1: Login y Navegación Basada en Roles

**Objetivo:** Verificar que cada rol ve su interfaz correcta

**Pasos:**

1. **Como ADMIN:**
   ```
   Email: franlysgonzaleztejeda@gmail.com
   Password: Progreso070901*

   ✓ Debe redirigir a /(admin)/dashboard
   ✓ Debe ver grid de 6 acciones
   ✓ Debe poder navegar a cada pantalla
   ```

2. **Como USER normal:**
   ```
   Email: [crear usuario de prueba]
   Password: [tu password]

   ✓ Debe redirigir a /(tabs)/dashboard
   ✓ Debe ver sus dispositivos GPS
   ✓ Debe poder ver mapa
   ```

3. **Como INSTALLER:**
   ```
   Email: [crear instalador de prueba]
   Password: [tu password]

   ✓ Debe redirigir a /(installer)/dashboard
   ✓ Debe ver sus clientes
   ✓ Debe ver comisiones
   ```

---

### Prueba 2: Configurar GPS (Wizard)

**Objetivo:** Probar flujo completo de configuración GPS

**Pasos:**

1. Login como ADMIN
2. Dashboard → Tap "📱 Configurar GPS"
3. **Paso 1:**
   - Ingresar nombre: "Vehículo de Prueba"
   - Ingresar IMEI: "123456789012345"
   - Seleccionar modelo: "Concox GT06N"
   - Tap "Siguiente →"

4. **Paso 2:**
   - Verificar que se generaron 4 comandos SMS
   - Tap "📋 Copiar" en cada comando
   - Verificar que se copió al portapapeles
   - Tap "Siguiente →"

5. **Paso 3:**
   - Ver resumen del dispositivo
   - Tap "Verificar Conexión"
   - Ver estado (simulado por ahora)
   - Tap "Finalizar Configuración"

**Resultado Esperado:**
- Wizard debe ser fluido
- Navegación entre pasos debe funcionar
- Botones de copiar deben funcionar
- Diseño responsive en móvil

---

### Prueba 3: Vincular Dispositivo a Usuario

**Objetivo:** Probar asignación de GPS a cliente

**Pasos:**

1. Login como ADMIN
2. Dashboard → Tap "🔗 Vincular Dispositivo"
3. **Seleccionar Usuario:**
   - Tap en campo de búsqueda
   - Escribir nombre o email
   - Ver filtrado en tiempo real
   - Tap en un usuario

4. **Seleccionar GPS:**
   - Tap en campo de búsqueda
   - Escribir nombre o IMEI
   - Ver dispositivos disponibles
   - Tap en un GPS

5. **Vincular:**
   - Ver resumen
   - Tap "Vincular Dispositivo"
   - Ver mensaje de éxito

**Resultado Esperado:**
- Búsqueda debe funcionar en tiempo real
- UI debe mostrar badges de estado
- Vinculación debe ser instantánea
- Usuario debe ver el GPS en su cuenta

---

### Prueba 4: Responsive Design

**Objetivo:** Verificar que la UI se adapta a diferentes tamaños

**Dispositivos a Probar:**

1. **Móvil Pequeño (iPhone SE, < 375px)**
   - Grid debe pasar a 1 columna
   - Texto debe ser legible
   - Botones deben tener buen tamaño de tap

2. **Móvil Estándar (iPhone 12, ~390px)**
   - Grid debe ser 2 columnas
   - Espaciado cómodo
   - Navegación fluida

3. **Tablet (iPad, ~768px)**
   - Grid debe ser 2-3 columnas
   - Uso eficiente del espacio
   - Sidebar visible si aplica

4. **Web Desktop (> 1024px)**
   - Grid completo 2-3 columnas
   - Navegación lateral
   - Máximo aprovechamiento de espacio

---

## 📊 Checklist de Pruebas

### Funcionalidad:
- [ ] Login funciona con credenciales correctas
- [ ] Login muestra error con credenciales incorrectas
- [ ] Navegación basada en rol funciona
- [ ] Dashboard admin muestra 6 acciones
- [ ] Wizard GPS permite completar 3 pasos
- [ ] Comandos SMS se generan correctamente
- [ ] Botón copiar funciona
- [ ] Vinculación muestra usuarios disponibles
- [ ] Vinculación muestra dispositivos disponibles
- [ ] Búsqueda filtra en tiempo real

### UI/UX:
- [ ] Gradientes se ven correctamente
- [ ] Iconos se muestran (emojis)
- [ ] Espaciado es consistente
- [ ] Colores son correctos
- [ ] Transiciones son suaves
- [ ] Loading states funcionan
- [ ] Mensajes de error son claros
- [ ] Mensajes de éxito son visibles

### Performance:
- [ ] App carga en < 3 segundos
- [ ] Navegación es instantánea
- [ ] Imágenes cargan rápido
- [ ] No hay lag al escribir
- [ ] Scroll es fluido
- [ ] Animaciones a 60fps

### Responsive:
- [ ] Se ve bien en móvil pequeño
- [ ] Se ve bien en móvil estándar
- [ ] Se ve bien en tablet
- [ ] Se ve bien en web desktop
- [ ] Grid se adapta correctamente
- [ ] Texto es legible en todos los tamaños

---

## 🐛 Problemas Comunes y Soluciones

### Problema 1: "No se puede conectar a Metro bundler"

**Causa:** Firewall o red diferente

**Solución:**
```bash
# Opción 1: Usar tunnel
npx expo start --tunnel

# Opción 2: Especificar IP manualmente
npx expo start --host [tu_ip_local]

# Opción 3: Abrir firewall
# Windows: Permitir puerto 8081 en firewall
```

---

### Problema 2: "Module not found"

**Causa:** Dependencias no instaladas

**Solución:**
```bash
cd frontend
rm -rf node_modules
npm install
npx expo start --clear
```

---

### Problema 3: "White screen" en móvil

**Causa:** Error de JavaScript no capturado

**Solución:**
```bash
# Ver errores en la terminal
# O shake el dispositivo → "Show Dev Menu" → "Debug Remote JS"

# Verificar que todas las importaciones estén correctas
# Verificar que no haya errores de sintaxis
```

---

### Problema 4: API no responde

**Causa:** Backend no accesible desde móvil

**Solución:**
```javascript
// Verificar EXPO_PUBLIC_API_URL en .env
// Debe ser IP pública o dominio, NO localhost

// Correcto:
EXPO_PUBLIC_API_URL=https://prologix-tracking-gps-production.up.railway.app

// Incorrecto en móvil:
EXPO_PUBLIC_API_URL=http://localhost:3000
```

---

## 🎯 Próximos Pasos Después de Probar

Una vez hayas probado en móvil y todo funcione:

### Paso 1: Crear Build de Producción

**Android:**
```bash
eas build --platform android --profile production
```

**iOS:**
```bash
eas build --platform ios --profile production
```

### Paso 2: Publicar en Stores

Sigue la guía: [STORE_DEPLOYMENT_GUIDE.md](STORE_DEPLOYMENT_GUIDE.md)

### Paso 3: Distribuir a Testers Beta

**Android:**
- Google Play Console → Internal Testing
- Agrega emails de testers
- Comparte link de descarga

**iOS:**
- TestFlight
- Invita testers
- Recibe feedback

---

## 📞 Soporte

Si encuentras problemas durante las pruebas:

1. **Revisa los logs:**
   ```bash
   # Terminal donde corre expo
   # Ver errores en rojo
   ```

2. **Dev Menu en dispositivo:**
   ```
   - Android: Shake el dispositivo
   - iOS: Shake o Cmd+D en simulador
   ```

3. **Verifica variables de entorno:**
   ```bash
   cat frontend/.env
   # Debe tener EXPO_PUBLIC_API_URL configurado
   ```

---

## ✅ Resumen

**Para Probar Rápido (Hoy Mismo):**
```bash
1. cd frontend
2. npm install
3. npx expo start
4. Escanear QR con Expo Go
5. Probar en tu móvil
```

**Para Distribución (Después):**
```bash
1. eas build --platform android --profile preview
2. Descargar APK
3. Instalar en dispositivos de prueba
4. Recopilar feedback
```

---

**¡El sistema está listo para probar en móviles Android e iOS!** 🚀

---

**Documento:** GUIA_PRUEBAS_MOVILES.md
**Versión:** 1.0
**Fecha:** 2 de Enero 2026
**Autor:** Claude Sonnet 4.5 via Claude Code
