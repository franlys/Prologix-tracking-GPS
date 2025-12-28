# 📱 INSTRUCCIONES PARA GEMINI - Frontend Prologix GPS

**Proyecto**: Prologix Tracking GPS
**Tu rol**: Frontend (React Native / Expo)
**Backend**: Ya completado y funcionando
**Base URL Backend**: `http://localhost:3000`

---

## 🎯 OBJETIVO

Crear una app móvil que muestre dispositivos GPS en tiempo real consumiendo el backend de Prologix.

---

## ✅ BACKEND YA FUNCIONANDO

El backend está 100% operativo con estos endpoints:

### Autenticación

```
POST /auth/register
Body: { email, password, name }
Response: { accessToken, user }

POST /auth/login
Body: { email, password }
Response: { accessToken, user }

GET /auth/me
Headers: Authorization: Bearer {token}
Response: { id, email, name, role, subscriptionPlan, gpsTraceUserId, isActive, createdAt }

POST /auth/refresh
Headers: Authorization: Bearer {token}
Response: { accessToken, user }
```

### Dispositivos GPS

```
GET /devices
Headers: Authorization: Bearer {token}
Response: [{ id, name, imei, type, status }]

GET /devices/:id/live
Headers: Authorization: Bearer {token}
Response: { lat, lng, speed, course, altitude, timestamp, address }

GET /devices/:id/history?startDate=...&endDate=...
Headers: Authorization: Bearer {token}
Response: [{ lat, lng, speed, timestamp, altitude, course }]
Nota: Requiere plan PLUS o superior
```

---

## 📋 TU CHECKLIST (Frontend)

### FASE 1: Autenticación ✨

- [ ] Pantalla de Login
  - [ ] Input email
  - [ ] Input password
  - [ ] Botón "Iniciar Sesión"
  - [ ] Llamar POST /auth/login
  - [ ] Guardar token en SecureStore / AsyncStorage
  - [ ] Navegar a Home si login exitoso

- [ ] Pantalla de Registro (opcional para MVP)
  - [ ] Input email, password, nombre
  - [ ] Llamar POST /auth/register
  - [ ] Guardar token
  - [ ] Navegar a Home

- [ ] Sistema de Token
  - [ ] Guardar JWT en SecureStore
  - [ ] Interceptor HTTP para agregar Authorization header
  - [ ] Auto-refresh cuando el token esté próximo a expirar
  - [ ] Logout (borrar token y volver a login)

### FASE 2: Lista de Dispositivos 📱

- [ ] Pantalla Home / Devices
  - [ ] Al cargar, llamar GET /auth/me para obtener perfil
  - [ ] Mostrar nombre del usuario y plan
  - [ ] Llamar GET /devices
  - [ ] Mostrar lista de dispositivos (FlatList)
  - [ ] Cada item muestra: nombre, IMEI, estado
  - [ ] Pull-to-refresh para recargar lista
  - [ ] Al tocar un dispositivo, navegar a Mapa

### FASE 3: Mapa en Tiempo Real 🗺️

- [ ] Pantalla de Mapa
  - [ ] Integrar Google Maps (react-native-maps)
  - [ ] Al cargar, llamar GET /devices/:id/live
  - [ ] Mostrar marker en lat/lng
  - [ ] Mostrar info: velocidad, altitud, timestamp
  - [ ] Centrar mapa en la ubicación

- [ ] Auto-actualización
  - [ ] Polling cada 10-15 segundos
  - [ ] Actualizar marker sin hacer scroll/zoom
  - [ ] Mostrar indicador de "actualizando..."
  - [ ] Detener polling al salir de la pantalla

### FASE 4: Historial (Plan PLUS) 📊

- [ ] Validación de Plan
  - [ ] Verificar subscriptionPlan del usuario
  - [ ] Si es BASIC, mostrar paywall
  - [ ] Si es PLUS o PRO, permitir acceso

- [ ] Pantalla de Historial
  - [ ] Selector de fecha inicio/fin
  - [ ] Botón "Ver Historial"
  - [ ] Llamar GET /devices/:id/history
  - [ ] Dibujar polyline en mapa con la ruta
  - [ ] Mostrar estadísticas: km recorridos, velocidad promedio

### FASE 5: Manejo de Errores 🛡️

- [ ] Error 401 (Unauthorized)
  - [ ] Intentar refresh token automáticamente
  - [ ] Si falla, redirigir a login

- [ ] Error 403 (Forbidden - Plan insuficiente)
  - [ ] Mostrar modal de upgrade de plan
  - [ ] "Esta función requiere plan PLUS"

- [ ] Error 404 (GPS-Trace user no configurado)
  - [ ] Mostrar mensaje: "Contacta soporte para activar GPS"

- [ ] Error 500/503 (Servidor/GPS-Trace caído)
  - [ ] Mostrar mensaje de error temporal
  - [ ] Botón de reintentar

---

## 🛠️ STACK RECOMENDADO

### Core
- **React Native** con **Expo** (más rápido para MVP)
- **TypeScript** (recomendado)

### Navegación
- **React Navigation** (Stack + Tab Navigator)

### Estado
- **Context API** + **useReducer** (suficiente para MVP)
- O **Zustand** (más ligero que Redux)

### HTTP Client
- **Axios** con interceptors para JWT

### Mapas
- **react-native-maps** (Google Maps)

### Storage
- **expo-secure-store** para JWT
- **AsyncStorage** para datos no sensibles

### UI
- **React Native Paper** (Material Design)
- O **NativeBase** (componentes pre-hechos)

---

## 📐 ESTRUCTURA SUGERIDA

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios instance con interceptors
│   │   ├── auth.ts            # Endpoints de autenticación
│   │   └── devices.ts         # Endpoints de dispositivos
│   ├── components/
│   │   ├── DeviceCard.tsx     # Card de dispositivo
│   │   ├── Map.tsx            # Componente de mapa
│   │   └── Paywall.tsx        # Modal de upgrade plan
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DevicesScreen.tsx
│   │   ├── MapScreen.tsx
│   │   └── HistoryScreen.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── context/
│   │   ├── AuthContext.tsx    # Contexto de autenticación
│   │   └── UserContext.tsx    # Contexto de usuario
│   ├── utils/
│   │   ├── storage.ts         # SecureStore helpers
│   │   └── constants.ts       # API_URL, etc.
│   └── App.tsx
└── package.json
```

---

## 🔌 EJEMPLO: Configurar Axios con JWT

```typescript
// src/api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://localhost:3000'; // Cambiar en producción

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado, intentar refresh
      try {
        const refreshResponse = await apiClient.post('/auth/refresh');
        const newToken = refreshResponse.data.accessToken;
        await SecureStore.setItemAsync('jwt_token', newToken);

        // Reintentar request original
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(error.config);
      } catch (refreshError) {
        // Refresh falló, logout
        await SecureStore.deleteItemAsync('jwt_token');
        // Navegar a login
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

---

## 🔌 EJEMPLO: Login

```typescript
// src/api/auth.ts
import { apiClient } from './client';
import * as SecureStore from 'expo-secure-store';

export const login = async (email: string, password: string) => {
  const response = await apiClient.post('/auth/login', { email, password });
  const { accessToken, user } = response.data;

  // Guardar token
  await SecureStore.setItemAsync('jwt_token', accessToken);

  return user;
};

export const getProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};

export const logout = async () => {
  await SecureStore.deleteItemAsync('jwt_token');
};
```

---

## 🔌 EJEMPLO: Pantalla de Login

```typescript
// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { login } from '../api/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const user = await login(email, password);
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('Error', 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? "Cargando..." : "Iniciar Sesión"}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
```

---

## 🔌 EJEMPLO: Mapa con Auto-refresh

```typescript
// src/screens/MapScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { getDeviceLivePosition } from '../api/devices';

export default function MapScreen({ route }) {
  const { deviceId } = route.params;
  const [position, setPosition] = useState(null);
  const intervalRef = useRef(null);

  const fetchPosition = async () => {
    try {
      const data = await getDeviceLivePosition(deviceId);
      setPosition(data);
    } catch (error) {
      console.error('Error fetching position:', error);
    }
  };

  useEffect(() => {
    fetchPosition(); // Cargar inmediatamente

    // Polling cada 10 segundos
    intervalRef.current = setInterval(fetchPosition, 10000);

    // Cleanup al desmontar
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [deviceId]);

  if (!position) {
    return <Text>Cargando...</Text>;
  }

  return (
    <MapView
      style={{ flex: 1 }}
      region={{
        latitude: position.lat,
        longitude: position.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker
        coordinate={{
          latitude: position.lat,
          longitude: position.lng,
        }}
        title="GPS Actual"
        description={`Velocidad: ${position.speed} km/h`}
      />
    </MapView>
  );
}
```

---

## 🛡️ VALIDACIÓN DE PLANES

```typescript
// src/utils/planValidation.ts
export const canAccessFeature = (userPlan: string, requiredPlan: string) => {
  const planHierarchy = {
    'BASIC': 0,
    'PLUS': 1,
    'PRO': 2,
  };

  return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
};

// Uso en componente
const user = await getProfile();

if (!canAccessFeature(user.subscriptionPlan, 'PLUS')) {
  // Mostrar paywall
  Alert.alert('Plan requerido', 'Esta función requiere plan PLUS o superior');
  return;
}

// Continuar con la función
```

---

## 🎨 UI/UX RECOMENDACIONES

### Colores Sugeridos
```typescript
const colors = {
  primary: '#2196F3',      // Azul
  secondary: '#4CAF50',    // Verde
  danger: '#F44336',       // Rojo
  warning: '#FF9800',      // Naranja
  background: '#F5F5F5',   // Gris claro
  text: '#212121',         // Negro
};
```

### Pantalla de Login
- Logo de Prologix arriba
- Campos centrados
- Botón destacado
- Link a "¿Olvidaste tu contraseña?" (futuro)

### Lista de Dispositivos
- Cards con sombra
- Icono de GPS
- Badge de estado (activo/inactivo)
- Swipe para acciones (futuro)

### Mapa
- Marker personalizado (ícono de carro/GPS)
- Bottom sheet con info del dispositivo
- Botón de centrar mapa
- Indicador de última actualización

---

## ⚠️ IMPORTANTE: Errores Comunes a Evitar

1. **NO guardar el token en AsyncStorage sin encriptar**
   - Usar `expo-secure-store` siempre

2. **NO hacer polling muy frecuente**
   - 10-15 segundos es suficiente
   - Demasiado frecuente gasta batería

3. **NO olvidar limpiar intervals**
   - Usar `useEffect` cleanup
   - Detener polling al salir de pantalla

4. **NO ignorar errores 403**
   - Validar plan ANTES de llamar endpoint
   - Mostrar paywall amigable

5. **NO hacer requests sin loading state**
   - Mostrar spinner/skeleton mientras carga

---

## 📱 TESTING

### Usuario de Prueba (Ya creado en backend)

```
Email: franlys@prologix.com
Password: password123
Plan: BASIC
```

### Flujo de Testing

1. **Login**
   - Probar con credenciales correctas
   - Probar con credenciales incorrectas
   - Verificar que guarda token

2. **Lista de Dispositivos**
   - Verificar que muestra dispositivos (si hay)
   - Si no hay, mostrar estado vacío

3. **Mapa en Tiempo Real**
   - Verificar que muestra ubicación
   - Verificar que actualiza cada 10s
   - Probar salir y volver (debe detener polling)

4. **Historial**
   - Con plan BASIC: debe mostrar paywall
   - Actualizar plan a PLUS en BD y probar

---

## 🚀 PRÓXIMOS PASOS (Después del MVP)

### Fase 3: Monetización
- Integración con Stripe
- In-App Purchase (iOS/Android)
- Planes en RD$ (Pesos Dominicanos)
- Paywall completo con precios

### Fase 4: Características Avanzadas
- Notificaciones push
- Geofencing (alertas de zona)
- Alertas de velocidad
- Compartir ubicación
- Modo offline

---

## 📞 COMUNICACIÓN CON BACKEND

**Backend URL Desarrollo:** `http://localhost:3000`
**Backend URL Producción:** (pendiente de definir)

**Estado Backend:** ✅ 100% Funcional

**Endpoints Listos:**
- ✅ Autenticación completa
- ✅ Perfil de usuario
- ✅ Refresh token
- ✅ Dispositivos GPS
- ✅ Ubicación en tiempo real
- ✅ Historial (con validación de plan)

---

## ✅ CRITERIO DE ÉXITO DEL MVP

El MVP se considera exitoso cuando:

1. ✅ Usuario puede hacer login
2. ✅ Ve lista de sus dispositivos GPS
3. ✅ Toca un dispositivo y ve mapa en tiempo real
4. ✅ Marker se actualiza automáticamente cada 10-15s
5. ✅ Usuario BASIC NO puede ver historial (paywall)
6. ✅ Usuario PLUS SÍ puede ver historial

**Cuando logres esto → MVP COMPLETO** 🎉

---

## 📚 RECURSOS

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Axios](https://axios-http.com/)

---

**Owner:** Franlys González Tejeda
**Backend:** Claude (Completado ✅)
**Frontend:** Gemini (Tu turno 🎯)
**Fecha:** 27 de Diciembre, 2025

---

¡Éxito con el frontend! El backend está sólido y listo para recibir tus requests. 🚀
