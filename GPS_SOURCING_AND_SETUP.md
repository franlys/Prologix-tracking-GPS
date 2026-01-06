# 📡 Guía de Compra y Configuración de GPS

Para que todo funcione ("Plataforma Prologix" + "Ruhavik"), necesitas comprar los equipos correctos y configurarlos antes de instalarlos.

---

## 1. 🧬 Datos Técnicos Necesarios (Integración)

Para vincular un GPS a tu plataforma, necesitas tener a mano estos 3 datos de cada dispositivo:

1.  **IMEI (Identidad):** Es el número de serie único (15 dígitos). Viene pegado en la caja y en el dispositivo.
    *   *Uso:* Es lo único que necesitas para registrarlo en el Panel de Ruhavik/Prologix.
2.  **Modelo / Protocolo:** Saber exactamente qué compraste (Ej: "Concox GT06N" o "Sinotrack ST-901").
    *   *Uso:* Ruhavik necesita saber el modelo para entender el "idioma" del GPS.
3.  **Tarjeta SIM (Chip):** El GPS necesita internet.
    *   *Opción A (Recomendada):* **SIMs M2M Multi-carrier** (funcionan en Claro/Altice automáticamente). Se compran por lote.
    *   *Opción B (Local):* Comprar Chips prepago Claro/Altice en RD y ponerles paquetigos de data.

---

## 2. ⚙️ La Configuración (El "Secreto")

Los GPS vienen "tontos" de fábrica. Tienes que enviarles comandos SMS para decirles **a dónde enviar la ubicación**.

**Si usas Ruhavik, la configuración típica es:**

1.  **APN:** Configurar el internet de Claro/Altice.
    *   *Comando:* `APN,internet.ideasclaro.com.do#` (Ejemplo)
2.  **Servidor (IP y Puerto):** Decirle que envíe a Ruhavik.
    *   **IP:** `193.193.165.166` (Esta es la IP general de Ruhavik, *verifica en su web según el modelo*).
    *   **Puerto:** Depende del modelo (Ej: GT06 usa puerto `20281`).
    *   *Comando:* `SERVER,0,193.193.165.166,20281,0#`

**¡OJO!** Tú o tus instaladores deben hacer esto UNA VEZ antes de cerrar el carro.

---

## 3. 📦 ¿Dónde comprar al por mayor? (Sourcing)

Para márgenes reales, olvida Amazon o tiendas locales pequeñas. Ve a la fuente.

### 🇨🇳 Alibaba (Para pedidos de 10 - 50+ unidades)
Es la mejor opción para negocio serio. Hablas directo con la fábrica.

*   **Proveedor Recomendado:** **Jimi IoT (Concox)** - Tienda Oficial.
    *   *Busca:* "Jimi IoT Official Store" en Alibaba.
    *   *Modelo:* **GT06N** (2G - Barato y fiable) o **JM-VL03** (4G - Futuro seguro).
    *   *Precio estimado:* $20 - $35 USD/unidad (depende cantidad).
    *   *Envío:* Pide envío por **DHL/FedEx** a RD (Llega en 5-7 días).
    *   *Aduanas:* Recuerda que en RD paquetes de >$200 USD pagan impuestos. Puedes pedir facturas divididas o envíos separados.

### 🛒 AliExpress (Para empezar con 5 - 10 unidades)
Más fácil para pruebas rápidas.

*   **Proveedor Recomendado:** **SinoTrack Official Store**.
    *   *Modelo:* **ST-901** (Muy barato, ~$12 USD).
    *   *Ojo:* Son más "básicos" que los Concox, pero para empezar funcionan.

### 🏢 Distribuidores en Miami (Intermedio)
Si no quieres esperar a China, compra en Miami.
*   Busca distribuidores de "Rastreo GPS Mayorista Miami".
*   Sube el precio un poco ($5-$10 más), pero llegan rápido a tu courier.

---

## 📝 Tu Lista de Compras para Arrancar

1.  **Hardware:** 10 unidades de **Concox GT06N** (Alibaba/AliExpress).
2.  **Conectividad:** 10 Tarjetas SIM (Claro/Altice) con data.
3.  **Herramientas:**
    *   Cinta eléctrica de calidad.
    *   Relés (normalmente vienen con el GPS, pero ten repuestos).
    *   Multímetro (para el instalador).

---

## 💡 Tip Pro: "Pre-Configuración"
No dejes que el instalador pierda tiempo configurando en la calle.
1.  Tú recibes los 10 GPS en tu oficina.
2.  Les pones el SIM.
3.  Los conectas a una batería de 12V en tu escritorio.
4.  Les envías los SMS de configuración y verificas que salgan en Ruhavik **ANTES** de entregarlos al instalador.
5.  Le das al instalador el equipo listo: *"Solo instala positivo, negativo y corte. Ya está funcionando"*.
