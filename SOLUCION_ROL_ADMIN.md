# Solución: Restaurar Rol de Admin

## Problema
Tu usuario tiene rol ADMIN en la base de datos, pero el AsyncStorage del navegador tiene datos antiguos cuando eras USER.

## Solución Rápida (Desde el Navegador)

1. Abre https://prologix-tracking-gps-frontend.vercel.app
2. Abre las DevTools del navegador (F12)
3. Ve a la pestaña "Console"
4. Ejecuta este código:

```javascript
// Limpiar AsyncStorage
localStorage.clear();
sessionStorage.clear();
// Recargar página
window.location.reload();
```

5. Ahora inicia sesión nuevamente con:
   - Email: franlysgonzaleztejeda@gmail.com
   - Password: Progreso070901*

6. Deberías ver el panel de administrador correctamente

## Solución Alternativa (Desde la App)

1. Ve a la pestaña "Perfil" (Profile)
2. Haz clic en "Cerrar Sesión"
3. Vuelve a iniciar sesión

## Verificación

Después de iniciar sesión, deberías:
- Ver "Instaladores" en lugar del dashboard normal
- Tener acceso al panel de admin
- Ver el botón "Crear Nuevo Instalador"

## Prevención Futura

Para evitar este problema en el futuro, voy a implementar:
1. Validación del token en cada carga de página
2. Refresh del usuario desde el backend si hay inconsistencia
3. Mejor manejo de cambios de rol sin requerir logout
