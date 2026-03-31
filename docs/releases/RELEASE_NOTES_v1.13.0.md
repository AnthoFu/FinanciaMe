# Publicación de FinanciaMe v1.13.0

**Fecha de Publicación:** 27 de marzo de 2026

¡Nos complace anunciar la versión `1.13.0` de **FinanciaMe**! Esta actualización se enfoca en la precisión de tus saldos y en una interfaz más intuitiva para el día a día. Se introduce la funcionalidad de comisiones opcionales para un control total de tus gastos bancarios y se renueva la iconografía de las acciones principales.

---

## ✨ Nuevas Funcionalidades y Cambios Clave

Esta versión introduce mejoras significativas en el registro de movimientos y la claridad visual:

*   **1. Control de Comisiones Bancarias (v1.13.0):**
    *   **Registro Exacto:** Ahora puedes añadir un campo opcional de **comisión** tanto en tus gastos como en tus transferencias entre billeteras.
    *   **Impacto en Saldo:** La comisión se deduce automáticamente del saldo de la billetera de origen, permitiendo que tus cuentas en la app coincidan al centavo con tus estados de cuenta bancarios (ideal para registrar el IGTF o comisiones de pago móvil).
    *   **Visualización Detallada:** En la lista de movimientos recientes, ahora podrás ver el monto total (monto + comisión) y un pequeño detalle del monto específico de la comisión si existe.

*   **2. Iconografía más Clara e Intuitiva (v1.12.12 - v1.12.13):**
    *   **Nuevos Iconos en Billeteras:** Hemos reemplazado las antiguas flechas en el carrusel de billeteras por iconos de **plus (+)** para ingresos y **minus (-)** para egresos, eliminando cualquier ambigüedad al registrar movimientos rápidos.
    *   **Icono de Tutorial:** Se ha añadido el icono correspondiente al botón de "Ver tutorial" en el menú de ajustes para mantener la coherencia visual con el resto de las opciones de configuración.

---

## 🛠️ Mejoras y Correcciones

*   **Rediseño de Formularios (v1.12.11):** Se han optimizado los layouts de los formularios para que sean más compactos y modernos. Además, se integraron selectores de fecha nativos del sistema para una entrada de datos más fluida.
*   **Lógica de Recordatorios (v1.12.10):** Se ha corregido y mejorado la lógica de avisos para los gastos fijos, permitiendo ahora configurar notificaciones que te avisen el mismo día del vencimiento del pago.
*   **Consistencia de Iconos:** Se han mapeado nuevos símbolos SF y Material Icons para asegurar que todos los elementos visuales se muestren correctamente en todas las plataformas.

---

## 📊 Estadísticas de la Versión

*   **Refactorización del Store:** Se actualizó la lógica central en `walletStore` y `transactionStore` para soportar el nuevo cálculo de saldos con comisiones.
*   **Actualización de Modelos:** La interfaz `Transaction` ahora soporta de forma nativa el campo opcional `commission`.
*   **Surgical Updates:** Se actualizaron quirúrgicamente los contextos y hooks relacionados (`useTransactionHandler`) para mantener la integridad de los saldos en todas las operaciones.

---

## 📝 Notas de esta Versión

*   Con esta actualización, FinanciaMe se vuelve una herramienta mucho más robusta para el usuario avanzado que busca precisión total en sus finanzas. Disfruta de la nueva claridad visual y el control total de tus comisiones bancarias.

---

*Por el amor al código y la automatización ♥️*

**- El equipo de FinanciaMe (AnthoFu)**
