# Notas de Lanzamiento - FinanciaMe v1.16.7 (Acumulado desde v1.16.0)

Esta entrega acumulada `v1.16.7` representa una de las mayores evoluciones en la **usabilidad (UX), velocidad de registro y pulido visual** de FinanciaMe. Hemos rediseñado por completo los formularios de operaciones, mejorado la arquitectura de pantallas y corregido detalles de contraste y renderizado en Android.

---

### 🚀 Novedades Principales

#### 1. Rediseño Completo de Formularios a Pantalla Completa
Se transformaron todos los modales de operaciones en vistas completas inmersivas (`presentationStyle="fullScreen"`):
*   **Monto Hero y Datos Primarios Arriba:** El monto de la operación y el concepto/descripción ahora se ubican en la parte superior para agilizar el registro diario de transacciones.
*   **Jerarquía de Entrada Optimizada:** Fecha con selectores rápidos (`Hoy`, `Ayer`, selector de calendario) y comisiones bancarias ubicadas justo después de la descripción.
*   **Billeteras en Tarjetas Horizontales:** Visualización clara de la billetera seleccionada junto con su saldo y divisa actual.
*   **Cuadrícula de Categorías (3 Columnas):** Ubicadas en la parte inferior de los formularios de gastos, presupuestos y gastos fijos, mostrando todos los iconos y nombres disponibles sin necesidad de scrolls horizontales tediosos.
*   **Formularios Actualizados:** Aplicado de manera consistente a `TransactionModal` (gastos/ingresos/edición), `TransferModal` (transferencias entre billeteras), `GoalModal` (metas de ahorro), `ContributionModal` (aportes a metas), `BudgetModal` (presupuestos), `FixedExpenseModal` (gastos fijos) y `WalletModal` (billeteras).

#### 2. Mejoras en la Conversión de Transferencias Multimoneda
*   **Lógica Inteligente de Conversión:** La tasa de cambio y el cálculo de conversión ahora solo se activan cuando la transferencia involucra una divisa extranjera (`USD`, `EUR`, `USDT`) y Bolívares (`VES`), omitiendo recuadros innecesarios en transferencias entre monedas internacionales o de la misma divisa.
*   **Rotulado y Transparencia:** Etiquetas explícitas para la *Tasa de Cambio (1 [Divisa] = ? VES)* y el *Monto a Recibir en [Billetera Destino]*.
*   **Eliminación de Elementos Confusos:** Removidos badges/botones decorativos que no ofrecían interacción.

#### 3. Reorganización de Recordatorios de Gastos Fijos
*   La configuración de notificaciones y recordatorios para gastos fijos fue reubicada desde la pestaña de gastos fijos al menú general de **Configuración / Ajustes**, logrando un flujo de navegación más limpio y centralizado.

---

### 🛠️ Correcciones y Mejoras Técnicas

*   **Solución al Bug de Barra de Navegación en Android (`v1.16.3`):** Se implementó `statusBarTranslucent` y `navigationBarTranslucent` junto con `SafeAreaView` para erradicar el fondo blanco no deseado que aparecía en la barra de navegación del sistema al abrir modales.
*   **Corrección en Métricas de Gastos (`v1.16.4`):** Resuelto el error que producía advertencias `rgba(NaN, NaN, 0, ...)` y fallos en el renderizado de gráficos y colores cuando el total acumulado era cero.
*   **Corrección de Contraste en Tema Oscuro (`v1.16.7`):** Solucionado el problema donde el texto en chips de moneda, frecuencias de pago y categorías seleccionadas desaparecía debido a concatenaciones de color inválidas con formato `rgb(...)`. Ahora las selecciones activas cuentan con fondo primario sólido y texto en blanco de alto contraste (`#FFFFFF`).
*   **Actualización de API DateTimePicker:** Migrado el uso de la propiedad obsoleta `onChange` a `onValueChange` y `onDismiss` con tipado `DateTimePickerChangeEvent`.
*   **Corrección de Sintaxis en OnboardingTutorial (`v1.16.2`):** Resuelto un problema de parsing y renderizado en el tutorial de bienvenida.
*   **Mantenimiento de Dependencias (`v1.16.1`):** Actualización de paquetes compatibles con Expo SDK y resolución de advertencias de dependencias en desuso.

---
*FinanciaMe: Tu control financiero, local y seguro.*
