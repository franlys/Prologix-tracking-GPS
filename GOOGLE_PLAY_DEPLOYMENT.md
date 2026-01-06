# 📱 Guía de Despliegue a Google Play Store

Esta guía te llevará paso a paso para publicar **Prologix GPS** en Google Play Store.

## 📋 Pre-requisitos

- ✅ Cuenta de Google Play Console (ya la tienes)
- ✅ Cuenta de Expo/EAS CLI
- ✅ App configurada en `app.json`
- 💳 Tarjeta de crédito para pago único de $25 USD (registro de desarrollador)

---

## 🚀 Paso 1: Preparar el Proyecto para Producción

### 1.1 Actualizar información de la app

Verifica que `frontend/app.json` tenga la información correcta:

```json
{
  "expo": {
    "name": "Prologix GPS",
    "slug": "prologix-gps",
    "version": "1.0.0",
    "android": {
      "package": "com.prologix.gps",
      "versionCode": 1
    }
  }
}
```

### 1.2 Crear iconos y splash screen profesionales

**Iconos necesarios:**
- Icon: 1024x1024px (PNG sin transparencia)
- Adaptive Icon: 1024x1024px (con área segura de 108px de padding)
- Splash Screen: 1284x2778px

**Ubicación:**
```
frontend/
├── assets/
│   ├── icon.png (1024x1024)
│   ├── adaptive-icon.png (1024x1024)
│   └── splash-icon.png (1284x2778)
```

---

## 🔧 Paso 2: Configurar EAS Build

### 2.1 Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2.2 Login en EAS

```bash
cd frontend
eas login
```

Usa tu cuenta de Expo o crea una nueva.

### 2.3 Configurar el proyecto

```bash
eas build:configure
```

Esto creará un archivo `eas.json`:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🔑 Paso 3: Generar Keystore (Firma de la App)

### 3.1 Opción A: Dejar que EAS lo maneje (Recomendado)

EAS creará y manejará automáticamente tu keystore:

```bash
eas build --platform android --profile production
```

**Ventajas:**
- ✅ Automático y seguro
- ✅ Respaldo en la nube
- ✅ Fácil de usar

### 3.2 Opción B: Crear keystore manual

Si prefieres tener control total:

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore prologix-gps.keystore \
  -alias prologix-gps \
  -keyalg RSA -keysize 2048 -validity 10000
```

**Guarda estos datos de forma SEGURA:**
- Keystore password
- Key alias
- Key password

⚠️ **CRÍTICO**: Si pierdes el keystore, NO podrás actualizar la app nunca más.

---

## 📦 Paso 4: Construir el AAB (Android App Bundle)

### 4.1 Build de producción

```bash
cd frontend
eas build --platform android --profile production
```

Esto tardará entre 10-20 minutos. EAS te enviará un email cuando termine.

### 4.2 Descargar el AAB

Cuando el build termine:

1. Ve a https://expo.dev/accounts/[tu-username]/projects/prologix-gps/builds
2. Descarga el archivo `.aab`

---

## 🏪 Paso 5: Crear la App en Google Play Console

### 5.1 Crear nueva aplicación

1. Ve a https://play.google.com/console
2. Click en **"Crear aplicación"**
3. Completa:
   - **Nombre**: Prologix GPS
   - **Idioma predeterminado**: Español (República Dominicana)
   - **Tipo de app**: Aplicación
   - **Gratis o de pago**: Gratis
4. Acepta las políticas

### 5.2 Configurar ficha de Play Store

#### Detalles de la app

**Descripción corta** (80 caracteres):
```
Rastrea tus vehículos GPS en tiempo real con geofences y alertas inteligentes
```

**Descripción completa** (4000 caracteres):
```
🚗 Prologix GPS - Rastreo Vehicular Profesional

Controla tu flota de vehículos desde tu smartphone con la mejor app de rastreo GPS de República Dominicana.

✨ CARACTERÍSTICAS PRINCIPALES

📍 Rastreo en Tiempo Real
• Ubicación precisa de todos tus vehículos
• Actualización cada 10 segundos
• Historial de rutas completo
• Vista de mapa interactiva

🔔 Alertas Inteligentes
• Geofences (cercas virtuales)
• Exceso de velocidad
• Encendido/apagado del motor
• Batería baja del GPS
• Entrada/salida de zonas

🎯 Geofences Ilimitadas
• Crea zonas seguras personalizadas
• Alertas al entrar o salir
• Múltiples geofences por dispositivo
• Visualización en mapa

📊 Reportes Detallados
• Historial de rutas
• Estadísticas de uso
• Consumo de combustible
• Tiempo de conducción
• Paradas y estacionamientos

📱 Comandos SMS
• Control remoto del GPS
• Cortar/restaurar motor
• Configuración remota
• Compatible con múltiples modelos

👥 Compartir Acceso
• Comparte dispositivos con otros usuarios
• Control de permisos
• Gestión de equipo
• Ideal para empresas

🔐 Seguridad Total
• Autenticación de dos factores
• Cifrado de datos
• Privacidad garantizada
• Cumplimiento GDPR

💼 PLANES FLEXIBLES

• Plan Gratuito: 1 dispositivo
• Plan Básico: Hasta 3 dispositivos
• Plan Profesional: Hasta 10 dispositivos
• Plan Empresarial: 50+ dispositivos

📞 SOPORTE 24/7

Atención al cliente en español, soporte técnico profesional.

🌟 IDEAL PARA

• Dueños de vehículos
• Empresas de transporte
• Flotas comerciales
• Familias
• Negocios de delivery

Descarga ahora y obtén 7 días de prueba gratis del plan Premium.

---

Desarrollado con ❤️ en República Dominicana
```

#### Capturas de pantalla (Requeridas)

Necesitas al menos 2 capturas por tipo:

**Teléfono** (mínimo 2, máximo 8):
- 1080x1920px o 1080x2340px (PNG o JPEG)
- Muestra: Dashboard, Mapa, Geofences, Alertas

**Tablet de 7"** (opcional):
- 1024x600px

**Tablet de 10"** (opcional):
- 1920x1200px

**Sugerencias de capturas:**
1. Dashboard principal con dispositivos
2. Mapa con ubicación en tiempo real
3. Pantalla de geofences
4. Alertas y notificaciones
5. Perfil de usuario
6. Comandos SMS

#### Gráfico destacado (Feature Graphic)

- **Tamaño**: 1024x500px
- **Formato**: PNG o JPEG
- **Contenido**: Banner promocional con logo y slogan

#### Ícono de la aplicación

- **Tamaño**: 512x512px
- **Formato**: PNG de 32 bits
- **Requisito**: Sin transparencias, sin bordes redondeados

### 5.3 Categorización

- **Categoría**: Mapas y navegación
- **Tipo de contenido**: No contiene anuncios
- **Clasificación de contenido**: Todos (completar cuestionario)

### 5.4 Información de contacto

- **Correo electrónico**: soporte@prologix.com
- **Teléfono**: +1 809-XXX-XXXX
- **Sitio web**: https://prologix.com
- **Política de privacidad**: https://prologix.com/privacy

---

## 📤 Paso 6: Subir el AAB

### 6.1 Crear versión de producción

1. En Play Console, ve a **Producción**
2. Click en **"Crear nueva versión"**
3. Sube el archivo `.aab`

### 6.2 Notas de la versión

Agrega notas de versión en español:

```
🎉 Primera versión de Prologix GPS

✨ Características iniciales:
• Rastreo en tiempo real de dispositivos GPS
• Geofences y alertas personalizadas
• Historial de rutas completo
• Comandos SMS para control remoto
• Gestión de múltiples dispositivos
• Planes flexibles de suscripción

¡Gracias por elegir Prologix GPS!
```

### 6.3 Revisar y publicar

1. Revisa todos los detalles
2. Click en **"Revisar versión"**
3. Click en **"Iniciar lanzamiento a producción"**

---

## ⏳ Paso 7: Revisión de Google Play

### Tiempo de revisión
- **Normal**: 1-3 días hábiles
- **Primera app**: Puede tardar hasta 7 días

### Estado de la revisión

Puedes ver el estado en:
- Play Console → Dashboard
- Recibirás emails de actualización

### Posibles rechazos comunes

1. **Política de privacidad faltante**
   - Solución: Agregar URL de política de privacidad

2. **Permisos peligrosos sin justificación**
   - Solución: Explicar uso de ubicación en la descripción

3. **Capturas de pantalla incorrectas**
   - Solución: Cumplir requisitos de tamaño exactos

---

## 🎊 Paso 8: ¡App Publicada!

Una vez aprobada:

1. Aparecerá en Google Play Store en ~2-4 horas
2. Busca "Prologix GPS" en Play Store
3. Comparte el link: `https://play.google.com/store/apps/details?id=com.prologix.gps`

---

## 🔄 Paso 9: Actualizaciones Futuras

### 9.1 Incrementar versión

Edita `frontend/app.json`:

```json
{
  "version": "1.0.1",  // Cambiar de 1.0.0 a 1.0.1
  "android": {
    "versionCode": 2  // Incrementar siempre
  }
}
```

### 9.2 Build nueva versión

```bash
cd frontend
eas build --platform android --profile production
```

### 9.3 Subir actualización

1. Ve a **Producción** en Play Console
2. **Crear nueva versión**
3. Sube nuevo `.aab`
4. Agrega notas de versión
5. Publicar

---

## 📊 Paso 10: Monitoreo y Análisis

### Google Play Console ofrece:

- **Estadísticas de instalación**
- **Calificaciones y reseñas**
- **Informes de fallos**
- **Análisis de usuarios**
- **Pruebas A/B**

### Métricas importantes:

1. **Instalaciones diarias**
2. **Tasa de desinstalación**
3. **Calificación promedio**
4. **Comentarios de usuarios**
5. **Fallos y ANRs**

---

## 🛡️ Paso 11: Cumplimiento Legal

### Política de Privacidad (Requerida)

Debes tener una página web con:
- Qué datos recopilas (ubicación, email, etc.)
- Cómo usas los datos
- Con quién compartes datos
- Cómo protegen los datos
- Derechos del usuario

**URL sugerida**: `https://prologix.com/privacy`

### Términos de Servicio

**URL sugerida**: `https://prologix.com/terms`

---

## 💰 Costos Asociados

### Google Play Console
- **Registro de desarrollador**: $25 USD (pago único)

### EAS Build (Expo)
- **Plan Free**: 30 builds/mes (suficiente para empezar)
- **Plan Production**: $29/mes (builds ilimitados)
- **Plan Enterprise**: $99/mes (para equipos)

### Hosting Backend
- Railway, Render, o similar: $5-20/mes

---

## 🚨 Troubleshooting

### Build falla en EAS

```bash
# Limpiar caché
cd frontend
rm -rf node_modules
npm install

# Volver a intentar
eas build --platform android --profile production --clear-cache
```

### Error de firma

Si usas keystore manual, verifica:
```bash
eas credentials
```

### App rechazada por permisos

Justifica el uso de ubicación en:
- Descripción de la app
- Sección de permisos en Play Console

---

## 📞 Recursos Adicionales

- **Play Console**: https://play.google.com/console
- **EAS Docs**: https://docs.expo.dev/build/introduction/
- **Expo Dashboard**: https://expo.dev
- **Play Store Guidelines**: https://play.google.com/about/developer-content-policy/

---

## ✅ Checklist Final

Antes de publicar, verifica:

- [ ] `app.json` configurado correctamente
- [ ] Iconos y splash screen profesionales
- [ ] Build de producción exitoso (.aab descargado)
- [ ] Descripción completa y atractiva
- [ ] Mínimo 2 capturas de pantalla por tipo
- [ ] Gráfico destacado (1024x500px)
- [ ] Política de privacidad publicada
- [ ] Información de contacto correcta
- [ ] Clasificación de contenido completada
- [ ] Notas de versión agregadas
- [ ] Revisión final de la ficha de Play Store

---

**¡Buena suerte con el lanzamiento de Prologix GPS! 🚀**

*Generado por Claude Code - Prologix GPS System*
