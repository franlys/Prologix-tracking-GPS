# 💼 Manual Operativo: Modelo de Negocio Prologix

Este documento define las reglas del juego: cómo vendes, cómo cobras y cómo pagas.

---

## 1. 🔄 El Flujo del Dinero (The Cash Flow)

Tú eres el "Banco Central" de Prologix. Todo el dinero de los clientes entra a ti primero.

### Paso A: Tú vs. Ruhavik (Costos Operativos)
*   **Tu Rol:** Eres un "Partner" mayorista.
*   **Tu Acción:** Pagas una factura mensual a GPS-Trace (Ruhavik) basada en el total de dispositivos activos.
*   **Mecanismo:** Tarjeta de crédito en el *Partner Panel*.
*   **Costo:** ~$0.20 - $0.50 EUR por dispositivo (variable según volumen).

### Paso B: Cliente vs. Tú (Ingresos Brutos)
*   **Rol del Cliente:** Usuario final de "Prologix App" (no saben qué es Ruhavik).
*   **Acción:** El cliente paga suscripción mensual, trimestral o anual.
*   **Mecanismo:**
    *   **Automatizado:** Pasarela de pago en la App (Stripe/PayPal).
    *   **Manual:** Transferencia Bancaria / Efectivo (tú activas la cuenta manualmente en Admin Panel).
*   **Precio:** ~$8.00 USD (Plan Estándar).

### Paso C: Instalador vs. Tú (Comisiones)
*   **Rol del Instalador:** Tu fuerza de ventas externa.
*   **Acción:** Instalan el GPS y "venden" la suscripción al cliente.
*   **Mecanismo:** El sistema registra quién hizo la instalación.
*   **Pago:** Tú pagas al instalador (semanal o mensualmente) sus comisiones acumuladas.

---

## 2. 🤝 Sistema de Incentivos para Instaladores

Para que el negocio crezca solo, los instaladores deben ganar dinero **sin trabajar extra**.

### El Modelo "Gana-Gana"
No solo les pagues por instalar (mano de obra). págales por **ACTIVAR** clientes recurrentes.

| Concepto | Monto Sugerido | Cuándo se paga |
| :--- | :--- | :--- |
| **Mano de Obra** | $20 - $30 USD | Inmediato (Paga el cliente al instalar) |
| **Comisión Venta GPS** | $10 USD | Inmediato (Si el instalador vendió tu equipo) |
| **Bono "Alta Nueva"** | **$5 - $10 USD** | **Fin de mes (Pagas TÚ)** |
| **Residual (Opcional)** | $0.50 USD/mes | Mensual (Mientras el cliente siga activo) |

---

## 3. 🛠️ Flujo de Trabajo: ¿Cómo registra el Instalador al Cliente?

*Actualmente (MVP Manual):*
El sistema no tiene todavía un "Código de Referido" automático, así que usamos este proceso simple:

1.  **Instalación Física:** El instalador coloca el GPS en el vehículo.
2.  **Reporte por WhatsApp:** El instalador te envía al grupo de "Admin":
    *   Foto del IMEI del GPS.
    *   Correo/Teléfono del Cliente.
    *   Foto del GPS instalado (Evidencia).
3.  **Activación Admin:**
    *   Tú entras al Admin Panel.
    *   Creas el usuario con ese correo.
    *   Asignas manualmente al instalador en la ficha del cliente (Opción "Vincular Instalador").
    *   Marcas la comisión como "Pendiente".

*Futuro (Automatizado):*
Implementaremos que el cliente ponga un "Código de Instalador" al registrarse, y todo esto será automático.

---

## 4. 📱 Lo que ofrecemos al Cliente (La Oferta Irresistible)

No vendemos "un GPS". Vendemos **Tranquilidad**.

**Paquete "Prologix Starter":**
*   📱 **App Móvil Premium:** (La de Ruhavik, pero con tu logo si pagas Branding, o tal cual por ahora).
*   🔔 **Alertas WhatsApp:** "Tu carro se encendió a las 3:00 AM" (Esto vale oro).
*   📍 **Ubicación Exacta:** Google Maps en la App.
*   🛡️ **Soporte Local:** "Si te roban el carro, llámanos y apagamos el motor".

---

## 5. ✅ Tus Siguientes Pasos (Modo Jefe)

1.  **Configurar Pasarela de Pagos:** Asegura que Stripe esté conectado.
2.  **Reclutar 3 Instaladores:**
    *   Talleres de música (Car Audio).
    *   Electricistas automotrices.
    *   Mecánicos independientes.
3.  **Crear Grupo de WhatsApp:** "Instaladores Prologix" para recibir los IMEIs y clientes al instante.
