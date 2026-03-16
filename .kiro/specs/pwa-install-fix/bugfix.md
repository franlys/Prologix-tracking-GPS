# Bugfix Requirements Document

## Introduction

La PWA de Prologix GPS no se instala correctamente en dispositivos móviles al intentar anclarla a la pantalla de inicio. Los usuarios ven un ícono genérico del navegador en lugar del logo de la app, y el proceso de instalación como app web no se completa de forma confiable. Esto impacta directamente la experiencia de los clientes que usan el sistema de rastreo GPS, ya que no pueden acceder a la app de forma nativa desde sus teléfonos.

El problema tiene dos causas raíz identificadas:
1. El `app.config.js` sobreescribe `app.json` en tiempo de build y tiene la sección `web: {}` vacía, lo que hace que Expo no genere correctamente los metadatos PWA (incluyendo referencias a íconos).
2. No existe un Service Worker registrado, lo cual es un requisito obligatorio para que los navegadores móviles (especialmente Chrome en Android) presenten el prompt de instalación de PWA.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN el usuario intenta anclar la PWA a la pantalla de inicio desde un navegador móvil THEN el sistema muestra un ícono genérico del navegador en lugar del logo de Prologix GPS

1.2 WHEN el usuario accede a la PWA desde Chrome en Android THEN el sistema no presenta el banner/prompt de instalación de app web ("Agregar a pantalla de inicio")

1.3 WHEN el build de Expo se ejecuta con `app.config.js` activo THEN el sistema genera el HTML sin los metadatos PWA correctos (apple-touch-icon, theme-color, manifest link) porque `web: {}` está vacío en `app.config.js`

1.4 WHEN el navegador evalúa si la PWA es instalable THEN el sistema falla los criterios de instalabilidad por ausencia de Service Worker registrado

### Expected Behavior (Correct)

2.1 WHEN el usuario ancla la PWA a la pantalla de inicio THEN el sistema SHALL mostrar el logo correcto de Prologix GPS (ícono de 192x192 o 512x512) como ícono de la app

2.2 WHEN el usuario accede a la PWA desde Chrome en Android o Safari en iOS THEN el sistema SHALL presentar la opción de instalación/anclado con el nombre "Prologix GPS" y el ícono correcto

2.3 WHEN el build de Expo se ejecuta THEN el sistema SHALL generar el HTML con los metadatos PWA completos: link al manifest, apple-touch-icon, theme-color y viewport correctos

2.4 WHEN el navegador evalúa la instalabilidad de la PWA THEN el sistema SHALL cumplir todos los criterios: manifest válido con íconos, Service Worker registrado con fetch handler, y servicio sobre HTTPS

2.5 WHEN la app se instala y se abre desde la pantalla de inicio THEN el sistema SHALL abrirse en modo standalone (sin barra de navegador) con el splash screen correcto

### Unchanged Behavior (Regression Prevention)

3.1 WHEN el usuario accede a la PWA desde un navegador de escritorio THEN el sistema SHALL CONTINUE TO funcionar correctamente con todas las funcionalidades de rastreo GPS

3.2 WHEN el usuario navega entre pantallas dentro de la PWA THEN el sistema SHALL CONTINUE TO manejar el routing de Expo Router sin interrupciones

3.3 WHEN la PWA hace peticiones al backend NestJS THEN el sistema SHALL CONTINUE TO autenticar y comunicarse correctamente con la API

3.4 WHEN el usuario accede a la PWA sin conexión o con conexión intermitente THEN el sistema SHALL CONTINUE TO mostrar la interfaz cargada previamente (comportamiento actual del caché del navegador)

3.5 WHEN el build se despliega en Vercel THEN el sistema SHALL CONTINUE TO servir correctamente el `manifest.json` y los archivos de íconos desde el directorio `dist/`
