# 📱 Guía del Cliente - Configuración de Dispositivo GPS

**Prologix GPS Tracking System**
**Versión:** 1.3.0
**Fecha:** 2 de Enero 2026

---

## 🎯 Bienvenido a Prologix

Esta guía te ayudará a configurar tu dispositivo GPS para que puedas rastrear tu vehículo en tiempo real desde la app Prologix.

---

## 📋 Antes de Comenzar

### Lo que necesitas:

1. ✅ **Tu dispositivo GPS** (instalado en el vehículo)
2. ✅ **Tarjeta SIM** con plan de datos (mínimo 100MB/mes)
3. ✅ **Número de teléfono** del GPS (la SIM que tiene el dispositivo)
4. ✅ **IMEI del dispositivo GPS** (número de 15 dígitos)
5. ✅ **Tu cuenta Prologix** (creada por tu instalador o administrador)

### ¿Dónde encuentro el IMEI?

El IMEI es un número único de 15 dígitos que identifica tu GPS:

- **En la caja del dispositivo** (etiqueta)
- **En el propio GPS** (grabado en la carcasa)
- **Enviando SMS:** Envía `IMEI#` al número del GPS y te responderá con el IMEI

---

## 🔧 Configuración Paso a Paso

### Opción A: Configuración Automática (Recomendada)

Si tu instalador o administrador tiene acceso al panel Prologix, pueden configurar tu GPS automáticamente:

1. **Contacta a tu instalador**
2. Proporciona el **IMEI** y **número de teléfono del GPS**
3. El instalador usará el **Panel de Configuración GPS** en Prologix
4. Recibirás confirmación cuando esté listo

**Ventajas:**
- No necesitas enviar SMS manualmente
- Configuración profesional garantizada
- Soporte técnico incluido

---

### Opción B: Configuración Manual (Avanzada)

Si prefieres configurar el GPS tú mismo, sigue estos pasos:

#### Paso 1: Identificar tu modelo de GPS

Los modelos más comunes son:

| Modelo | Imagen | Protocolo |
|--------|--------|-----------|
| **Concox GT06N** | 🚗 Popular en RD | GT06 |
| **Coban TK103** | 📍 Económico | TK103 |
| **Teltonika FMB120** | 🏆 Profesional | Teltonika |
| **H02 Genérico** | 💡 Básico | H02 |

#### Paso 2: Configurar APN del Operador

**¿Qué es el APN?**
Es la configuración que permite al GPS conectarse a internet móvil.

**Para Claro (República Dominicana):**
```
Enviar SMS al GPS:
APN,claro.com.do,claro,claro#
```

**Para Altice:**
```
APN,internet.identi.com.do,,#
```

**Para Viva:**
```
APN,internet.viva.com.do,,#
```

**Respuesta esperada:**
El GPS debe responder: `APN OK` o similar.

#### Paso 3: Configurar Servidor Prologix

**Importante:** Solicita estos datos a tu administrador:
- **IP del Servidor:** (ejemplo: `164.92.XXX.XXX`)
- **Puerto:** (ejemplo: `5023` para GT06)

**Enviar SMS:**
```
SERVER,1,IP_SERVIDOR,PUERTO,0#
```

**Ejemplo con GT06N:**
```
SERVER,1,164.92.123.45,5023,0#
```

**Respuesta esperada:**
`SERVER OK`

#### Paso 4: Configurar Intervalo de Envío

Esto define cada cuánto tiempo el GPS envía su ubicación.

**Recomendado: cada 30 segundos**
```
TIMER,30#
```

**Para ahorro de batería: cada 60 segundos**
```
TIMER,60#
```

**Respuesta esperada:**
`TIMER OK`

#### Paso 5: Reiniciar el GPS

Aplica todos los cambios reiniciando el dispositivo:

```
RESET#
```

**Respuesta esperada:**
`RESET OK`

---

## ✅ Verificar que Funciona

### En el Panel Prologix (Admin/Instalador)

1. Inicia sesión en el panel web o app
2. Ve a **"Configuración de Dispositivos"**
3. Selecciona **"Verificar Conexión"**
4. Ingresa el IMEI del GPS

**Deberías ver:**
- ✅ Estado: **Conectado**
- ✅ Última conexión: **Hace menos de 1 minuto**
- ✅ Ubicación: **Coordenadas actuales**

### Comandos de Prueba

**Ver ubicación actual:**
```
WHERE#
```

**Respuesta esperada:**
El GPS enviará un SMS con coordenadas GPS y enlace a Google Maps.

**Ver estado del GPS:**
```
STATUS#
```

**Respuesta esperada:**
Información sobre batería, señal GPS, y conexión.

---

## 📱 Usar la App Prologix

Una vez configurado el GPS, podrás:

### 1. Ver Ubicación en Tiempo Real

- Abre la app Prologix
- Ve a **"Mapa"**
- Verás un marcador con tu vehículo
- Actualización automática cada 30-60 segundos

### 2. Ver Historial de Rutas

- Selecciona tu dispositivo
- Toca **"Historial"**
- Selecciona fecha y hora
- Verás la ruta completa del vehículo

### 3. Recibir Notificaciones

Según tu plan, puedes configurar:

- 🚨 **Alertas de velocidad** (>100 km/h)
- 📍 **Alertas de zona** (Geofences)
- 🔋 **Alertas de batería baja**
- ⏰ **Alertas de inactividad**

---

## 🆘 Solución de Problemas

### Problema 1: GPS no responde a SMS

**Posibles causas:**
- SIM sin saldo o sin datos
- Número de teléfono incorrecto
- GPS apagado o sin batería

**Solución:**
1. Verifica que la SIM tenga saldo y plan de datos activo
2. Envía un SMS simple primero para verificar conexión
3. Verifica que el GPS tenga luz LED encendida

---

### Problema 2: GPS responde pero no aparece en Prologix

**Posibles causas:**
- Servidor no configurado correctamente
- IMEI no registrado en Prologix
- Puerto incorrecto

**Solución:**
1. Contacta a tu instalador para verificar que el IMEI esté registrado
2. Verifica la configuración del servidor con el comando:
   ```
   PARAM#
   ```
3. Confirma que el APN esté correcto para tu operador

---

### Problema 3: Ubicación incorrecta o no actualiza

**Posibles causas:**
- GPS sin señal satelital
- Antena GPS desconectada
- Intervalo de envío muy largo

**Solución:**
1. Verifica que el GPS esté instalado con buena vista al cielo (no bajo metal)
2. Espera 2-3 minutos para que el GPS obtenga señal satelital
3. Reduce el intervalo de envío:
   ```
   TIMER,30#
   ```

---

### Problema 4: Batería se agota rápido

**Posibles causas:**
- Intervalo de envío muy corto
- GPS sin conexión a batería del vehículo

**Solución:**
1. Aumenta el intervalo de envío:
   ```
   TIMER,120#
   ```
2. Verifica que el GPS esté conectado a la batería del vehículo (cable rojo/negro)
3. Activa modo de ahorro de energía si tu GPS lo soporta

---

## 🔐 Comandos Útiles por Modelo

### Concox GT06N

```
IMEI#           - Ver IMEI
WHERE#          - Ubicación actual
STATUS#         - Estado del GPS
TIMER,30#       - Intervalo 30 seg
RESET#          - Reiniciar
FACTORY#        - Resetear a fábrica
```

### Coban TK103

```
check123456#    - Estado del GPS
adminip123456 IP PUERTO# - Configurar servidor
t030s000n123456# - Intervalo 30 seg
begin123456     - Iniciar rastreo
```

### Teltonika FMB120

**Nota:** Teltonika usa configuración vía software, no SMS.
Contacta a tu instalador para configuración profesional.

---

## 💡 Consejos Importantes

### Para Mejor Rendimiento:

1. ✅ **Instalación profesional**
   Contrata un instalador certificado para conexión correcta a batería

2. ✅ **Antena GPS con vista al cielo**
   No instales bajo superficies metálicas

3. ✅ **SIM con datos ilimitados**
   Planes de 500MB-1GB/mes son suficientes (uso ~50MB/mes)

4. ✅ **Verifica señal periódicamente**
   Usa el comando `STATUS#` mensualmente

5. ✅ **Mantén actualizada la app Prologix**
   Actualizaciones incluyen mejoras de rastreo

---

## 📞 Soporte Técnico

### ¿Necesitas Ayuda?

**Opción 1: Contacta a tu Instalador**
Tu instalador Prologix puede ayudarte con:
- Configuración del GPS
- Problemas de conexión
- Instalación física

**Opción 2: Soporte Prologix**
Email: soporte@prologix.com.do
WhatsApp: +1 (XXX) XXX-XXXX
Horario: Lun-Vie 9:00 AM - 6:00 PM

**Opción 3: Centro de Ayuda Web**
https://prologix.com.do/ayuda

---

## 📊 Planes y Suscripciones

Según tu plan Prologix, tienes acceso a:

### Plan Básico ($3.99/mes)
- ✅ 1 dispositivo GPS
- ✅ Rastreo en tiempo real
- ✅ Historial 30 días
- ✅ App móvil

### Plan Familiar ($7.99/mes)
- ✅ 3 dispositivos GPS
- ✅ Rastreo en tiempo real
- ✅ Historial 90 días
- ✅ Alertas básicas
- ✅ App móvil

### Plan Profesional ($14.99/mes)
- ✅ 7 dispositivos GPS
- ✅ Rastreo en tiempo real
- ✅ Historial 180 días
- ✅ Alertas avanzadas
- ✅ Geofences ilimitados
- ✅ Reportes automáticos
- ✅ API access

### Plan Empresarial ($39.99/mes)
- ✅ 20 dispositivos GPS
- ✅ Todo lo del Plan Profesional
- ✅ Historial 365 días
- ✅ Soporte prioritario 24/7
- ✅ Dashboard personalizado
- ✅ Integraciones empresariales

---

## 🎓 Preguntas Frecuentes (FAQ)

**P: ¿Necesito pagar por el servidor GPS-Trace o Ruhavik?**
R: No. Tu suscripción Prologix incluye todo el servicio de rastreo.

**P: ¿Puedo usar mi GPS con otras aplicaciones?**
R: Sí, pero Prologix ofrece la mejor experiencia integrada y soporte local.

**P: ¿Qué pasa si cambio de vehículo?**
R: Solo mueve el GPS al nuevo vehículo. No necesitas reconfigurar nada.

**P: ¿Funciona el GPS fuera de República Dominicana?**
R: Sí, siempre que la SIM tenga roaming de datos activado.

**P: ¿Cuánto consume de datos el GPS?**
R: Aproximadamente 30-50 MB por mes con intervalo de 30 segundos.

**P: ¿Puedo pausar mi suscripción?**
R: Sí, contacta a soporte para pausar temporalmente tu cuenta.

---

## ✅ Checklist Final

Antes de terminar, verifica que:

- [ ] GPS instalado físicamente en el vehículo
- [ ] SIM con datos activa insertada en el GPS
- [ ] APN configurado para tu operador
- [ ] Servidor Prologix configurado
- [ ] IMEI registrado en tu cuenta Prologix
- [ ] GPS responde a comandos SMS
- [ ] Dispositivo aparece como "Conectado" en la app
- [ ] Ubicación se actualiza en tiempo real
- [ ] Probaste el historial de rutas

---

**¡Felicidades! Tu GPS está configurado y listo para usar. 🎉**

---

**Documento:** GUIA_CLIENTE_CONFIGURACION_GPS.md
**Versión:** 1.0
**Última actualización:** 2 de Enero 2026
**Soporte:** soporte@prologix.com.do
