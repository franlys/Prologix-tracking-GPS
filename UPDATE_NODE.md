# 🔄 ACTUALIZAR NODE.JS A v20+

El frontend requiere Node.js v20+ para funcionar correctamente.

---

## ✅ OPCIÓN 1: Descargar desde el sitio oficial (Más fácil)

### Pasos:

1. **Descargar Node.js v20 LTS:**

   Ve a: https://nodejs.org/

   Descarga: **"20.x.x LTS (Recommended for Most Users)"**

2. **Instalar:**

   - Ejecuta el instalador descargado
   - Click "Next" en todo
   - Marca la opción "Automatically install necessary tools"
   - Espera a que termine (5-10 min)

3. **Verificar instalación:**

   Abre una **NUEVA terminal PowerShell** y ejecuta:

   ```powershell
   node --version
   ```

   Deberías ver: `v20.x.x`

4. **Volver a intentar:**

   ```bash
   cd C:\Users\elmae\Prologix-tracking-GPS\frontend
   npx expo start
   ```

---

## ✅ OPCIÓN 2: Usar NVM (Node Version Manager)

Si quieres mantener múltiples versiones de Node:

### 1. Desinstalar Node actual (Opcional)

Control Panel → Uninstall → Node.js

### 2. Instalar NVM para Windows

Descarga: https://github.com/coreybutler/nvm-windows/releases

Descarga: `nvm-setup.exe` (última versión)

### 3. Instalar Node v20

```powershell
nvm install 20
nvm use 20
node --version  # Debería mostrar v20.x.x
```

### 4. Reintentar Expo

```bash
cd C:\Users\elmae\Prologix-tracking-GPS\frontend
npx expo start
```

---

## 🐛 SI SIGUE FALLANDO DESPUÉS DE ACTUALIZAR

### Limpiar caché de npm y node_modules:

```bash
cd C:\Users\elmae\Prologix-tracking-GPS\frontend

# Borrar node_modules
Remove-Item -Recurse -Force node_modules

# Limpiar caché de npm
npm cache clean --force

# Reinstalar
npm install --legacy-peer-deps

# Intentar nuevamente
npx expo start
```

---

## ✅ VERIFICACIÓN FINAL

Una vez tengas Node v20 instalado:

```powershell
node --version    # v20.x.x
npm --version     # 10.x.x
npx expo start    # Debería funcionar sin errores
```

---

**Nota:** Después de actualizar Node, Railway y Expo también usarán Node v20+ automáticamente, así que no habrá más warnings de `EBADENGINE`.
