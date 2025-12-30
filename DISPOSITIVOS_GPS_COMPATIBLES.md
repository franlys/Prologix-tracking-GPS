# 📡 Dispositivos GPS Compatibles con Prologix

**Fecha:** 30 de Diciembre 2025
**Actualizado:** Diciembre 2025

---

## 🎯 Resumen

Este documento te ayudará a escoger, comprar y configurar dispositivos GPS para tu sistema Prologix GPS Tracking.

---

## 🌐 Compatibilidad con Traccar

Nuestro sistema usa **Traccar** como plataforma de tracking GPS. Traccar soporta **más de 200 protocolos** de diferentes fabricantes de GPS.

### Ventajas de usar Traccar:
- ✅ Compatible con cientos de dispositivos GPS
- ✅ Código abierto y bien documentado
- ✅ Actualizaciones constantes
- ✅ Comunidad activa
- ✅ Protocolos populares: Osmand, GT06, H02, TK103, etc.

**Consulta la lista completa:** https://www.traccar.org/devices/

---

## 📱 Dispositivos Recomendados

### 1. 🏆 Mejor Opción General: **Concox GT06N**

**Precio:** $15 - $25 USD en AliExpress/Amazon

**Características:**
- GPS + LBS (localización por celular)
- Batería de respaldo
- Corte de motor remoto
- Alertas de vibración
- Geofencing
- Protocolo: GT06

**Dónde comprar:**
- AliExpress: Busca "Concox GT06N GPS Tracker"
- Amazon: "GT06N Vehicle GPS Tracker"

**Ventajas:**
- ✅ Muy económico
- ✅ Fácil de instalar
- ✅ Compatible 100% con Traccar
- ✅ Envío de posiciones cada 10-60 segundos

---

### 2. 💎 Opción Premium: **Teltonika FMB120**

**Precio:** $45 - $70 USD

**Características:**
- GPS de alta precisión
- Acelerómetro integrado
- Bluetooth 4.0
- Batería de respaldo
- 2 entradas digitales
- 2 salidas digitales
- Protocolo: Teltonika

**Dónde comprar:**
- Distribuidor oficial Teltonika
- Amazon: "Teltonika FMB120"

**Ventajas:**
- ✅ Calidad profesional
- ✅ Muy confiable
- ✅ Configuración avanzada
- ✅ Perfecto para flotas empresariales

---

### 3. 💰 Opción Económica: **TK103 / TK102**

**Precio:** $8 - $15 USD

**Características:**
- GPS básico
- Corte de motor
- Alertas SMS
- Protocolo: TK103

**Dónde comprar:**
- AliExpress: "TK103 GPS Tracker"
- eBay: "TK102 GPS Tracker"

**Ventajas:**
- ✅ Muy barato
- ✅ Fácil configuración
- ✅ Ideal para empezar

**Desventajas:**
- ⚠️ Menos preciso
- ⚠️ No tiene batería de respaldo
- ⚠️ Plástico de baja calidad

---

### 4. 📲 Opción App: **OsmAnd (Smartphone)**

**Precio:** GRATIS (solo necesitas un smartphone viejo)

**Características:**
- Usa el GPS del teléfono
- App OsmAnd Tracker
- Protocolo: Osmand

**Cómo usarlo:**
1. Descargar "OsmAnd Tracker" del Play Store
2. Configurar servidor Traccar
3. Dejar teléfono conectado en el vehículo

**Ventajas:**
- ✅ Gratis
- ✅ GPS muy preciso
- ✅ Ideal para pruebas

**Desventajas:**
- ⚠️ Consume batería
- ⚠️ Necesita plan de datos móviles
- ⚠️ No profesional

---

## 🛒 Dónde Comprar

### Internacional (Envío a RD)

1. **AliExpress** ⭐ Recomendado
   - Precios más bajos
   - Envío gratis (15-30 días)
   - Muchas opciones
   - https://es.aliexpress.com
   - Busca: "GPS Tracker Vehicle Concox"

2. **Amazon**
   - Envío más rápido
   - Mejor soporte
   - Más caro
   - https://amazon.com
   - Busca: "GT06N GPS Tracker"

3. **eBay**
   - Precios variables
   - Opciones usadas
   - https://ebay.com

### Local (República Dominicana)

1. **Mercado Libre RD**
   - https://mercadolibre.com.do
   - Busca: "GPS Vehicular"
   - Precio: RD$1,500 - RD$5,000

2. **Tiendas de Electrónica**
   - La Sirena Electrónica
   - Multicentro La Sirena
   - Plaza Lama

---

## ⚙️ Configuración Básica

### Paso 1: Insertar SIM Card

Necesitas una tarjeta SIM con plan de datos móviles.

**Planes recomendados en RD:**
- Claro: Plan de datos mínimo (500MB/mes)
- Altice: Plan básico
- Viva: Plan económico

**Costo:** RD$200 - RD$500/mes

### Paso 2: Configurar APN

Envía SMS al GPS con el APN de tu operadora:

**Claro RD:**
```
APN,internet.ideasclaro.com.do#
```

**Altice/Orange RD:**
```
APN,internet.orange.com.do#
```

**Viva RD:**
```
APN,internet.viva.com.do#
```

### Paso 3: Configurar Servidor Traccar

Envía SMS con la IP y puerto de tu servidor Traccar:

```
SERVER,1,tu-servidor-traccar.com,5023,0#
```

**Nota:** El puerto depende del protocolo de tu GPS:
- GT06: Puerto 5023
- TK103: Puerto 5002
- Osmand: Puerto 5055
- Teltonika: Puerto 5027

### Paso 4: Configurar Intervalo de Envío

```
TIMER,30#
```

Esto envía posición cada 30 segundos.

**Recomendaciones:**
- Vehículos en movimiento: 10-30 segundos
- Vehículos estacionados: 60-300 segundos
- Para ahorrar datos: 60-120 segundos

---

## 🔧 Instalación Física

### Herramientas Necesarias:
- Destornillador
- Cinta aislante
- Bridas plásticas
- Multímetro (opcional)

### Conexiones Básicas:

**Dispositivo de 3 cables:**
```
🔴 Cable ROJO    → Positivo 12V (batería o fusibles)
⚫ Cable NEGRO   → Negativo/Tierra (chasis del vehículo)
🟡 Cable AMARILLO → ACC (encendido/contacto)
```

**Opcional - Corte de motor:**
```
🟢 Cable VERDE   → Relay de combustible o arranque
```

### Ubicaciones Recomendadas:

1. **Debajo del tablero**
   - ✅ Fácil acceso a cables
   - ✅ Protegido
   - ⚠️ Señal GPS puede ser débil

2. **Detrás del estéreo**
   - ✅ Oculto
   - ✅ Buena señal GPS
   - ⚠️ Más difícil de instalar

3. **Bajo el asiento**
   - ✅ Muy oculto
   - ⚠️ Necesita antena GPS externa

**IMPORTANTE:** Asegúrate de que el GPS tenga vista al cielo para mejor señal.

---

## 📊 Protocolos Traccar Más Comunes

| Protocolo | Puerto | Dispositivos Compatibles |
|-----------|--------|-------------------------|
| GT06 | 5023 | Concox, Jimi, Coban |
| TK103 | 5002 | Xexun, Coban TK103 |
| H02 | 5013 | Dispositivos H02 |
| Osmand | 5055 | Smartphones con OsmAnd |
| Teltonika | 5027 | Teltonika FMB, FMM |
| GPS103 | 5001 | TK102, TK103 clones |

**Consulta todos los puertos:** https://www.traccar.org/protocols/

---

## 🔗 Vincular Dispositivo al Sistema

### Paso 1: Obtener IMEI del GPS

El IMEI es el identificador único del dispositivo.

**Cómo encontrarlo:**
1. Está impreso en la etiqueta del dispositivo
2. Envía SMS `IMEI#` al GPS
3. Son 15 dígitos: `123456789012345`

### Paso 2: Agregar a Traccar

Una vez que tu servidor Traccar esté configurado:

1. Login a Traccar web interface
2. Ir a **Dispositivos** → **Agregar**
3. Ingresar:
   - **Nombre:** "Vehículo Toyota 2020"
   - **Identificador:** IMEI del GPS (15 dígitos)
   - **Grupo:** (opcional)
4. Guardar

### Paso 3: Vincular Cliente al Dispositivo (Backend)

Desde tu panel admin de Prologix:

```bash
PATCH /admin/users/{userId}/gps-trace
{
  "gpsTraceUserId": "id-del-dispositivo-en-traccar"
}
```

O si usas Traccar directamente, usa el endpoint de migración:

```bash
POST /admin/migration/user/{userId}
```

---

## 💡 Tips y Recomendaciones

### Para Instaladores

1. **Prueba antes de instalar**
   - Conecta el GPS a una fuente de 12V
   - Verifica que encienda el LED
   - Espera a que obtenga señal GPS (LED parpadea)
   - Confirma que envía datos a Traccar

2. **Oculta bien el dispositivo**
   - Evita lugares obvios
   - Usa bridas para fijar cables
   - Protege de humedad y calor

3. **Documenta todo**
   - Toma foto del IMEI
   - Anota el número de SIM
   - Guarda configuración enviada por SMS

### Para Clientes

1. **Plan de datos adecuado**
   - Mínimo 100MB/mes
   - Recomendado 500MB/mes
   - Evita que se suspenda por falta de pago

2. **Revisa el GPS regularmente**
   - Verifica que esté enviando posiciones
   - Revisa saldo de la SIM
   - Actualiza configuración si es necesario

### Ahorro de Datos

**Consumo típico:**
- Envío cada 30seg: ~150MB/mes
- Envío cada 60seg: ~75MB/mes
- Envío cada 300seg: ~15MB/mes

**Configuración inteligente:**
```
# Cuando está en movimiento: cada 30seg
TIMER,30#

# Cuando está detenido: cada 5min
# (algunos GPS lo hacen automáticamente)
```

---

## 🆘 Solución de Problemas

### GPS no envía datos

1. ✅ Verifica que tenga señal celular (LED GSM encendido)
2. ✅ Verifica que tenga señal GPS (LED GPS parpadeando)
3. ✅ Revisa saldo de la SIM
4. ✅ Confirma configuración de servidor y puerto
5. ✅ Verifica que el puerto en Traccar esté abierto

### GPS envía datos incorrectos

1. ✅ Espera 5-10 minutos para "fix" GPS inicial
2. ✅ Asegúrate de que tenga vista al cielo
3. ✅ Aleja de interferencias metálicas
4. ✅ Reinicia el dispositivo

### Consumo de datos muy alto

1. ✅ Aumenta intervalo de envío (TIMER)
2. ✅ Desactiva funciones no esenciales
3. ✅ Verifica que no esté enviando datos duplicados

---

## 📦 Kit de Instalador Recomendado

Para comenzar como instalador profesional:

**Dispositivos:**
- 10x GPS Trackers Concox GT06N: $200 USD
- 10x SIM Cards con plan básico: RD$2,000/mes

**Herramientas:**
- Destornillador set: RD$500
- Multímetro digital: RD$800
- Bridas plásticas (100 unidades): RD$200
- Cinta aislante: RD$100
- Cortacables: RD$400

**Total inversión inicial:** ~$250 USD + RD$4,000

---

## 🌐 Recursos Adicionales

### Documentación Oficial
- Traccar Docs: https://www.traccar.org/documentation/
- Traccar Devices: https://www.traccar.org/devices/
- Traccar Forum: https://www.traccar.org/forums/

### Tutoriales en YouTube
- "How to Install GPS Tracker in Car"
- "Traccar Server Setup Tutorial"
- "GT06N GPS Configuration"

### Comunidades
- Traccar Forum: https://www.traccar.org/forums/
- Reddit r/GPS
- Grupos de Facebook de GPS Tracking

---

## ❓ Preguntas Frecuentes

### ¿Puedo usar cualquier GPS con Traccar?

No. El GPS debe soportar uno de los 200+ protocolos de Traccar. Antes de comprar, verifica en https://www.traccar.org/devices/

### ¿Cuánto cuesta mantener un GPS?

**Costos mensuales:**
- Plan de datos SIM: RD$200 - RD$500
- Total: ~$5 USD/mes por dispositivo

### ¿Necesito servidor propio de Traccar?

No inicialmente. Puedes:
1. Usar Traccar Cloud (de pago)
2. Usar GPS-Trace (lo que usas ahora)
3. Instalar Traccar en un VPS ($5-10/mes)

### ¿Cuánto dura la batería de respaldo?

Típicamente 2-6 horas dependiendo del modelo y uso.

### ¿El GPS funciona sin Internet?

El GPS **recibe** señal satelital sin Internet, pero **necesita Internet (datos móviles)** para enviar las posiciones a tu servidor.

---

## 📞 Soporte

Si tienes dudas sobre qué GPS comprar o cómo configurarlo:

1. Revisa la documentación de Traccar
2. Consulta el foro de Traccar
3. Contacta al proveedor del GPS
4. Lee el manual del dispositivo

---

**Documentación relacionada:**
- [SISTEMA_INSTALADORES_Y_COMISIONES.md](SISTEMA_INSTALADORES_Y_COMISIONES.md)
- [TRACCAR_SETUP_GUIDE.md](TRACCAR_SETUP_GUIDE.md)

---

**Última actualización:** 30 de Diciembre 2025
