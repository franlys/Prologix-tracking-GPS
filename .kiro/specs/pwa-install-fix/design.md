# PWA Install Fix - Bugfix Design

## Overview

La PWA de Prologix GPS no cumple los criterios de instalabilidad de los navegadores modernos por dos causas raíz independientes:

1. **`app.config.js` tiene `web: {}`** vacío, lo que hace que Expo ignore la configuración PWA de `app.json` en tiempo de build. Aunque `+html.tsx` ya incluye los meta tags manualmente, la sección `web` vacía puede interferir con la generación del HTML base de Expo.

2. **No existe Service Worker registrado**. Chrome en Android y Safari en iOS requieren obligatoriamente un SW con un `fetch` event handler para considerar una web app como instalable. Sin él, el prompt de instalación nunca aparece.

La estrategia de fix es mínima y quirúrgica: (a) completar la sección `web` en `app.config.js` con los mismos valores de `app.json`, y (b) crear un Service Worker básico (`public/sw.js`) con un fetch handler network-first y registrarlo desde `+html.tsx`.

## Glossary

- **Bug_Condition (C)**: La condición que activa el bug — cuando el navegador evalúa la instalabilidad de la PWA y falla por ausencia de SW o metadatos incompletos
- **Property (P)**: El comportamiento deseado — el navegador presenta el prompt de instalación y la app se instala con el ícono y nombre correctos
- **Preservation**: El comportamiento existente que no debe cambiar — routing de Expo Router, comunicación con la API, caché del navegador, y despliegue en Vercel
- **`app.config.js`**: Archivo de configuración dinámica de Expo en `frontend/app.config.js` que sobreescribe `app.json` en tiempo de build
- **`+html.tsx`**: Template HTML raíz de Expo Router en `frontend/app/+html.tsx` que controla el `<head>` del documento
- **`sw.js`**: Service Worker que se servirá desde `frontend/public/sw.js` y se copiará a `dist/` en el build
- **`isBugCondition`**: Función conceptual que determina si una configuración de build activa el bug de no-instalabilidad

## Bug Details

### Bug Condition

El bug se manifiesta cuando el navegador intenta evaluar si la PWA cumple los criterios de instalabilidad. La evaluación falla porque: (a) `app.config.js` sobreescribe `app.json` con `web: {}` vacío, potencialmente afectando la generación de metadatos por Expo, y (b) no existe ningún Service Worker registrado, lo cual es un requisito no negociable para Chrome y Safari.

**Formal Specification:**
```
FUNCTION isBugCondition(buildConfig)
  INPUT: buildConfig — configuración activa de Expo en tiempo de build
  OUTPUT: boolean

  hasEmptyWebSection := buildConfig.expo.web IS_EMPTY_OBJECT
  hasNoServiceWorker := NOT fileExists('public/sw.js')
                        AND NOT swRegisteredIn('+html.tsx')

  RETURN hasEmptyWebSection OR hasNoServiceWorker
END FUNCTION
```

### Examples

- **Causa 1 activa**: `app.config.js` tiene `web: {}` → Expo puede omitir o generar incorrectamente el HTML base PWA → íconos no referenciados correctamente en el manifest link generado por Expo
- **Causa 2 activa**: No hay `sw.js` ni registro de SW → Chrome DevTools > Application > Manifest muestra "Page does not work offline" → el criterio de instalabilidad falla → no aparece el banner "Agregar a pantalla de inicio"
- **Ambas causas activas (estado actual)**: El usuario ve el ícono genérico del navegador al anclar, y nunca recibe el prompt de instalación automático
- **Edge case**: En Safari iOS, el usuario puede anclar manualmente desde el menú compartir, pero verá el ícono genérico si `apple-touch-icon` no resuelve correctamente

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- El routing de Expo Router (`expo-router`) debe continuar funcionando sin interrupciones en todas las rutas
- Las peticiones HTTP al backend NestJS (`https://prologix-tracking-gps-production.up.railway.app`) deben continuar autenticándose y respondiendo correctamente — el SW NO debe interceptar ni cachear peticiones de API
- El comportamiento de caché actual del navegador para assets estáticos debe mantenerse o mejorar, nunca degradarse
- El build y despliegue en Vercel debe continuar funcionando: `npm run build` → `expo export -p web` → `copy-public` → `dist/`
- La navegación entre pantallas dentro de la PWA instalada debe funcionar igual que en el navegador

**Scope:**
Todos los inputs que NO involucren la evaluación de instalabilidad PWA deben quedar completamente sin cambios. El Service Worker debe usar estrategia **network-first** y pasar todas las peticiones a la red sin modificarlas, actuando solo como proxy transparente para satisfacer el requisito del navegador.

## Hypothesized Root Cause

1. **`web: {}` vacío en `app.config.js`**: Expo usa `app.config.js` como fuente de verdad cuando existe, ignorando `app.json`. La sección `web: {}` vacía hace que Expo no propague los valores de `app.json` (themeColor, display, name, etc.) al proceso de build web. Aunque `+html.tsx` compensa manualmente con meta tags, la configuración de Expo para el bundler web queda incompleta.

2. **Ausencia total de Service Worker**: No existe ningún archivo `sw.js` en `public/` ni registro de SW en `+html.tsx` o `index.js`. Chrome requiere un SW con `fetch` handler activo. Sin él, la PWA no pasa el criterio de instalabilidad independientemente de cuán completo sea el `manifest.json`.

3. **Posible causa secundaria — `copy-public.js` no copia `sw.js`**: El script ya copia todo `public/` a `dist/`, por lo que si se agrega `sw.js` a `public/`, se copiará automáticamente. No requiere cambios.

4. **Posible causa secundaria — `vercel.json` rewrites**: La regla de rewrite actual excluye archivos con extensión conocida pero no excluye explícitamente `sw.js`. Se debe verificar que Vercel sirva `sw.js` desde la raíz sin redirigir a `index.html`.

## Correctness Properties

Property 1: Bug Condition - Build genera metadatos PWA completos y SW registrado

_For any_ build ejecutado con `app.config.js` activo donde `isBugCondition` retorna true (web vacío + sin SW), el sistema corregido SHALL producir: (a) un HTML con `<link rel="manifest">`, `<meta name="theme-color">`, y `<link rel="apple-touch-icon">` correctamente referenciados, y (b) un Service Worker registrado con fetch handler que hace que el navegador considere la PWA como instalable.

**Validates: Requirements 2.3, 2.4**

Property 2: Preservation - Comportamiento existente sin cambios

_For any_ interacción que NO sea la evaluación de instalabilidad PWA (navegación entre rutas, peticiones a la API, carga de assets, build en Vercel), el sistema corregido SHALL producir exactamente el mismo resultado que el sistema original, sin interceptar peticiones de API ni alterar el routing de Expo Router.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

Asumiendo que el análisis de causa raíz es correcto:

**Archivo 1**: `frontend/app.config.js`

**Cambio**: Reemplazar `web: {}` con la configuración completa copiada de `app.json`

**Detalle**:
```js
web: {
  favicon: "./assets/icon.png",
  bundler: "metro",
  output: "single",
  name: "Prologix GPS",
  shortName: "Prologix",
  description: "Sistema de rastreo GPS en tiempo real para vehículos",
  lang: "es",
  themeColor: "#1e3a8a",
  backgroundColor: "#1e3a8a",
  display: "standalone",
  orientation: "portrait",
  startUrl: "/",
  scope: "/"
},
```

---

**Archivo 2**: `frontend/public/sw.js` (nuevo archivo)

**Cambio**: Crear Service Worker mínimo con fetch handler network-first

**Detalle**:
```js
const CACHE_NAME = 'prologix-gps-v1';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: no intercepta peticiones de API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Pasar peticiones de API directamente a la red sin cachear
  if (url.hostname !== self.location.hostname) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
```

---

**Archivo 3**: `frontend/app/+html.tsx`

**Cambio**: Agregar registro del Service Worker antes del cierre de `</head>`

**Detalle**:
```tsx
<script dangerouslySetInnerHTML={{ __html: `
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/sw.js')
        .catch(function(err) { console.warn('SW registration failed:', err); });
    });
  }
`}} />
```

---

**Archivo 4**: `frontend/vercel.json`

**Cambio**: Agregar `sw.js` a las exclusiones del rewrite para que Vercel lo sirva directamente

**Detalle**: Actualizar el source del rewrite para excluir `sw.js`:
```json
"source": "/((?!manifest\\.json|sw\\.js|icon.*\\.png|favicon\\.png|splash-icon\\.png|adaptive-icon\\.png).*)"
```

## Testing Strategy

### Validation Approach

La estrategia sigue dos fases: primero confirmar el bug en el código sin corregir (exploratory), luego verificar que el fix funciona y no introduce regresiones (fix checking + preservation checking).

### Exploratory Bug Condition Checking

**Goal**: Confirmar las dos causas raíz ANTES de implementar el fix. Si la exploración refuta alguna hipótesis, se debe re-hipotizar.

**Test Plan**: Inspeccionar el build output actual y verificar los criterios de instalabilidad con Chrome DevTools.

**Test Cases**:
1. **Build output inspection**: Ejecutar `npm run build` y verificar que `dist/index.html` contiene `<link rel="manifest">` — confirma si `app.config.js` con `web: {}` afecta el output (fallará si Expo no genera el link)
2. **SW absence check**: Verificar que `dist/sw.js` no existe y que Chrome DevTools > Application > Service Workers muestra "No service workers detected" (fallará el criterio de instalabilidad)
3. **Lighthouse PWA audit**: Ejecutar Lighthouse en la URL de producción — esperamos ver "Does not register a service worker" y posiblemente "Web app manifest does not meet the installability requirements"
4. **Chrome install prompt**: Acceder desde Chrome Android a la URL de producción — confirmar que NO aparece el banner "Agregar a pantalla de inicio"

**Expected Counterexamples**:
- Chrome DevTools muestra "Page does not work offline" en la pestaña Application
- Lighthouse PWA score < 100 con fallo en "Installable" category
- Posibles causas confirmadas: `web: {}` vacío + ausencia de SW

### Fix Checking

**Goal**: Verificar que para todos los inputs donde `isBugCondition` es true, el sistema corregido produce el comportamiento esperado.

**Pseudocode:**
```
FOR ALL buildConfig WHERE isBugCondition(buildConfig) DO
  result := buildWithFix(buildConfig)
  ASSERT result.html CONTAINS '<link rel="manifest">'
  ASSERT result.html CONTAINS 'theme-color'
  ASSERT result.html CONTAINS 'serviceWorker.register'
  ASSERT fileExists(result.distDir + '/sw.js')
  ASSERT swHasFetchHandler(result.distDir + '/sw.js')
END FOR
```

### Preservation Checking

**Goal**: Verificar que para todos los inputs donde `isBugCondition` es false (interacciones normales), el sistema corregido produce el mismo resultado que el original.

**Pseudocode:**
```
FOR ALL request WHERE NOT isBugCondition(request) DO
  ASSERT originalHandler(request) = fixedHandler(request)
END FOR
```

**Testing Approach**: Se recomienda testing de integración manual y property-based testing para el SW porque:
- El SW debe ser transparente para peticiones de API (hostname diferente)
- El routing de Expo Router no debe verse afectado
- El comportamiento de caché debe ser igual o mejor

**Test Cases**:
1. **API pass-through**: Verificar que el SW no intercepta peticiones a `prologix-tracking-gps-production.up.railway.app` — observar en Network tab que las peticiones van directo a la red
2. **Routing preservation**: Navegar entre rutas de la app instalada y verificar que Expo Router funciona igual
3. **Build preservation**: Verificar que `npm run build` sigue produciendo `dist/` con todos los archivos existentes más `sw.js`
4. **Vercel rewrite preservation**: Verificar que las rutas de la SPA siguen redirigiendo a `index.html` y que `sw.js` se sirve directamente

### Unit Tests

- Verificar que `sw.js` contiene los tres event listeners: `install`, `activate`, `fetch`
- Verificar que el fetch handler excluye peticiones cross-origin (hostname check)
- Verificar que `app.config.js` tiene todos los campos requeridos en `web` (name, themeColor, display, startUrl)

### Property-Based Tests

- Para cualquier URL con hostname diferente al de la PWA, el SW debe retornar `undefined` (no interceptar) — verificable con mock de `fetch` en el contexto del SW
- Para cualquier URL del mismo hostname, el SW debe intentar `fetch` primero y solo usar caché como fallback
- Para cualquier configuración de build donde `web` tenga los campos requeridos, el HTML generado debe contener los meta tags correspondientes

### Integration Tests

- Build completo (`npm run build`) → verificar `dist/sw.js` existe y `dist/index.html` tiene el script de registro
- Lighthouse PWA audit post-fix → score 100 en categoría "Installable"
- Chrome DevTools Application tab → "Service Workers" muestra el SW activo, "Manifest" muestra íconos correctos
- Instalación real en Chrome Android → ícono de Prologix GPS aparece en pantalla de inicio
