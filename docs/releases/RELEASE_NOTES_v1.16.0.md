# Notas de Lanzamiento - FinanciaMe v1.16.0

En esta versión `1.16.0`, nos enfocamos en la **experiencia de usuario (UX)** y en la **coherencia visual**. Hemos eliminado los últimos vestigios de la interfaz nativa del sistema para ofrecer una aplicación 100% personalizada, moderna y fluida.

### 🚀 Novedades y Mejoras

#### 1. Sistema de Notificaciones Globales (Toasts)
Hemos implementado un motor de notificaciones propio que reemplaza las interrupciones bruscas del sistema:
*   **Avisos No Intrusivos:** Los mensajes de éxito, error e información ahora fluyen de manera natural en la interfaz.
*   **Inteligencia de Capas:** Los avisos de validación ahora aparecen automáticamente en la parte superior cuando tienes un formulario abierto, evitando que el teclado o tus manos los tapen.
*   **Soporte Estático:** Algunas notificaciones críticas ahora permiten el cierre manual (✕) para asegurar que leas la información importante.

#### 2. Modernización de Diálogos de Confirmación
Adiós a los cuadros blancos genéricos. Ahora, cada vez que vayas a realizar una acción importante (como borrar un movimiento):
*   **Diseño Tematizado:** Los modales de confirmación ahora respetan perfectamente tu tema (Oscuro o Claro).
*   **Iconografía Dinámica:** Identifica visualmente la acción con iconos de alta calidad (papeleras, info, tarjetas).
*   **Interacción Pulida:** Botones más grandes, centrados y con feedback visual claro.

#### 3. Rediseño de Configuración de Recordatorios
Hemos optimizado la gestión de Gastos Fijos:
*   **Selector Horizontal:** Se eliminó la alerta nativa para elegir la hora de los recordatorios, reemplazándola por un carrusel de horas integrado directamente en el modal de configuración.

### 🛠️ Correcciones y Ajustes
*   **Mapeo de Iconos Android:** Corregido un problema donde algunos iconos críticos no se renderizaban correctamente en dispositivos Android.
*   **Consistencia de Validaciones:** Migradas todas las validaciones de Billeteras, Metas y Presupuestos al nuevo sistema de notificaciones.
*   **Optimización de Capas:** Ajustada la elevación (zIndex) y el uso de Modales nativos para asegurar que los avisos siempre tengan prioridad visual sobre cualquier formulario.

---
*FinanciaMe: Tu control financiero, local y seguro.*
