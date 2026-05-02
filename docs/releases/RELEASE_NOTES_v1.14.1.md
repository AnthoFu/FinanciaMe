# Publicación de FinanciaMe v1.14.1

**Fecha de Publicación:** 2 de mayo de 2026

¡Presentamos la versión `1.14.1` de **FinanciaMe**! En esta actualización nos enfocamos en tu privacidad, introduciendo una de las funciones más solicitadas: el Modo Incógnito para tus saldos. Ahora tienes el control total sobre qué información es visible mientras usas la aplicación en entornos públicos.

---

## ✨ Nuevas Funcionalidades y Cambios Clave

*   **1. Modo "Ocultar Saldos" (Modo Incógnito):**
    *   **Control Total:** Se ha añadido un nuevo icono de "ojo" en la barra superior de la pantalla principal. Con un solo toque, puedes ocultar o mostrar todos los montos de dinero en la aplicación.
    *   **Privacidad en Público:** Al activar esta función, tus saldos se mostrarán como asteriscos (`***`), permitiéndote registrar transacciones o revisar tus finanzas en lugares públicos sin revelar tu patrimonio.
    *   **Persistencia Inteligente:** La aplicación recordará tu preferencia de privacidad. Si ocultas los saldos, permanecerán ocultos la próxima vez que abras la app hasta que decidas volver a mostrarlos.

---

## 🛠️ Mejoras y Correcciones

*   **Integración UI Global:** La función de ocultar saldos se ha integrado de forma consistente en:
    *   Tarjetas de resumen del Home (Saldos totales y por moneda).
    *   Carrusel de billeteras en la pantalla de inicio.
    *   Lista detallada en la pestaña "Billeteras".
*   **Mapeo de Iconos:** Se optimizó el sistema de iconos (`IconSymbol`) para incluir soporte nativo a los nuevos símbolos de privacidad, reloj de actualización y alertas de sistema, mejorando la compatibilidad entre Android e iOS.
*   **Refactorización de Estado:** Implementación de `PrivacyStore` utilizando Zustand, asegurando un manejo de estado ligero, rápido y persistente para las configuraciones de privacidad.

---

## 📊 Estadísticas de la Versión

*   **Arquitectura de Privacidad:** Creación de un nuevo almacén de datos dedicado a la configuración de seguridad y privacidad.
*   **Consistencia Visual:** Actualización de múltiples componentes core (`SummaryCard`, `WalletsCarousel`, `WalletsScreen`) para respetar el estado de privacidad de forma reactiva.

---

## 📝 Notas de esta Versión

*   Tu seguridad financiera no solo se trata de números, sino también de discreción. Con el nuevo modo de ocultar saldos, FinanciaMe se adapta mejor a tu día a día, brindándote tranquilidad en cualquier lugar.

---

*Por el amor al código y la automatización ♥️*

**- El equipo de FinanciaMe (AnthoFu)**
