# 🚀 Guía de Publicación en Tiendas (Play Store y App Store)

Esta guía detalla paso a paso cómo llevar tu aplicación **Prologix GPS** a las tiendas oficiales de Android y Apple.

---


## 📋 Requisitos Previos y Costos

Antes de comenzar, necesitas las cuentas de desarrollador.

| Tienda | Requisito | Costo |
| :--- | :--- | :--- |
| **Google Play (Android)** | cuenta de Google Play Console | **$25 USD** (Pago único) |
| **App Store (iOS)** | Apple Developer Program | **$99 USD** / año |

---

## 🤖 Parte 1: Google Play Store (Android)

### Paso 1: Crear Cuenta de Desarrollador
1. Ve a [Google Play Console](https://play.google.com/console).
2. Regístrate pagando los $25 USD.
3. Completa la verificación de identidad (puede tardar 1-2 días).

### Paso 2: Crear la Aplicación en la Consola
1. En Play Console, haz clic en **"Crear aplicación"**.
2. **Nombre**: Prologix GPS.
3. **Idioma**: Español (o el principal).
4. **Tipo**: App.
5. **Costo**: Gratis.
6. Acepta las políticas y crea la app.

### Paso 3: Configurar la Ficha de la Tienda
En el menú izquierdo, ve a **"Presencia en Google Play store" > "Ficha de Play Store principal"**.
- **APP Icon**: 512x512 px (PNG).
- **Gráfico de funciones**: 1024x500 px.
- **Capturas de pantalla**: Teléfono (min 2), Tablet 7" y 10".
- **Descripción**: Breve y completa de la app.

### Paso 4: Configuración de EAS en tu proyecto (Ya configurado)
Ya tienes un archivo `eas.json` configurado para producción.
Tu `package` en `app.json` es `com.prologix.gps`. **Asegúrate de que este ID sea único y definitivo**.

### Paso 5: Generar el Build (AAB)
Ejecuta en tu terminal dentro de la carpeta `frontend`:

```bash
eas build --platform android --profile production
```

- EAS te pedirá loguearte en tu cuenta de Expo si no lo estás.
- Te preguntará si quieres generar nuevas credenciales (Keystore). Responde **YES** (EAS las guardará por ti).
- Espera a que termine. Al finalizar, te dará un link para descargar un archivo formato **.aab** (Android App Bundle).

### Paso 6: Subir a Play Console
1. En Play Console, ve a **"Pruebas y versiones" > "Producción"** (o "Pruebas internas" si quieres probar primero).
2. Haz clic en **"Crear nueva versión"**.
3. Te pedirá una "Clave de firma de aplicación". Elige **"Usar la clave generada por Google"** (recomendado).
4. Sube el archivo **.aab** que descargaste de EAS.
5. Pon un nombre a la versión (ej. "1.0.0 Lanzamiento inicial").

### Paso 7: Cuestionarios y Privacidad
Play Store requiere completar varias secciones antes de publicar (están en el Dashboard principal):
- **Política de privacidad**: Debes tener una URL (puedes usar un Google Doc o una página simple por ahora).
- **Acceso a apps**: Si tienes login (sí), debes dar credenciales de prueba (`demo@prologix.com` / `123456`).
- **Clasificación de contenido**: Cuestionario sobre violencia, etc.
- **Audiencia objetivo**: +18 años generalmente simplifica las cosas.
- **Seguridad de los datos**: Pregunta qué datos recolectas (Ubicación, Info personal). **Importante**: Debes declarar que recolectas ubicación para la funcionalidad principal.

### Paso 8: Revisión y Lanzamiento
Una vez todo esté en verde en el Dashboard, ve a **"Revisión y lanzamiento"**.
- Envía a revisión.
- Google tarda entre 2 a 5 días en revisar la primera versión.

---

## 🍎 Parte 2: Apple App Store (iOS)

> **Nota**: Necesitas una Mac para subir la app (Transporter app) o configurar EAS Submit (automático).

### Paso 1: Enrolarse en Apple Developer
1. Ve a [Apple Developer](https://developer.apple.com/).
2. Inicia sesión con tu Apple ID.
3. Enrólate en el programa ($99 USD). Necesitas tener habilitada la autenticación de dos factores.

### Paso 2: Preparar App Store Connect
1. Entra a [App Store Connect](https://appstoreconnect.apple.com/).
2. Ve a **"Mis Apps"** > **"+"** > **"Nueva App"**.
3. **Plataformas**: iOS.
4. **Nombre**: Prologix GPS.
5. **Idioma**: Español.
6. **Bundle ID**: Debe coincidir con `app.json` (`com.prologix.gps`). Si no aparece, debes crearlo primero en el portal de Developer > Certificates, Identifiers & Profiles.
7. **SKU**: Un identificador único (ej. `prologix_gps_01`).

### Paso 3: Generar el Build (IPA)
En tu terminal:

```bash
eas build --platform ios --profile production
```

- EAS te pedirá acceso a tu cuenta de Apple (Apple ID y contraseña/App Specific Password).
- Te pedirá configurar los certificados y provision profile. Deja que EAS lo haga automáticamente (**YES** a todo).
- Al terminar, te dará un link para descargar el archivo **.ipa**.

### Paso 4: Subir el Build a Apple
Tienes dos opciones:

**Opción A: Usar EAS Submit (Automático - Recomendado)**
```bash
eas submit -p ios --latest
```
Esto tomará el último build y lo subirá a App Store Connect automáticamente.

**Opción B: Usar Transporter (Requiere Mac)**
1. Descarga la app "Transporter" de la Mac App Store.
2. Logueate con tu Apple ID.
3. Arrastra el archivo **.ipa** a la ventana.
4. Dale a "Entregar".

### Paso 5: TestFlight y Ficha
1. En App Store Connect, ve a pestaña **TestFlight**.
2. Verás tu build "Procesando". Espera unos minutos.
3. Una vez listo, añádete como tester interno para probarla en tu iPhone.
4. Ve a la pestaña **App Store**.
5. Llena toda la info:
   - Capturas de pantalla (iPhone 6.5" y 5.5").
   - Descripción, palabras clave, URL de soporte.
   - **Privacidad de la App**: Define qué datos usas (Ubicación, Contacto).

### Paso 6: Revisión
1. En "Versión", selecciona el build que subiste.
2. Haz clic en **"Enviar para revisión"**.
3. Apple revisa en 24-48 horas.
   - **OJO**: Apple es estricta. Asegúrate de que el login funcione y proporciona una cuenta de prueba en la sección "Información para revisión de apps".
   - Si tu app usa ubicación en segundo plano, debes justificarlo muy bien en la descripción del `info.plist` (En `app.json` -> `ios.infoPlist` -> `NSLocationAlwaysUsageDescription`).

---

## 🛠️ Comandos Resumidos

Desde la carpeta `frontend`:

```bash
# 1. Login en Expo
npx expo login

# 2. Build para Android (Play Store)
eas build --platform android --profile production

# 3. Build para iOS (App Store)
eas build --platform ios --profile production

# 4. Subir automáticamente a App Store (después del build)
eas submit -p ios
```

## ⚠️ Checklist Importante

- [ ] **Versiones**: Recuerda subir la versión en `app.json` (`version` y `versionCode`/`buildNumber`) cada vez que hagas un nuevo build para subir a la tienda.
- [ ] **Permisos**: Revisa que los textos de permisos en `app.json` sean explicativos ("Prologix necesita tu ubicación para mostrarte en el mapa...").
- [ ] **Credenciales de prueba**: Crea un usuario `demo` / `demo123` para que los revisores de Apple y Google puedan entrar a la app. **Si no pueden entrar, rechazarán la app**.
