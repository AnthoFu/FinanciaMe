# Publicación de FinanciaMe v1.14.0

**Fecha de Publicación:** 16 de abril de 2026

¡Nos complace anunciar la versión `1.14.0` de **FinanciaMe**! Esta actualización marca un hito importante al convertir la aplicación en una herramienta verdaderamente multi-moneda con la integración completa del **Euro (EUR)**. Ahora podrás gestionar tus finanzas en Bolívares, Dólares, USDT y Euros, todo con tasas oficiales sincronizadas en tiempo real.

---

## ✨ Nuevas Funcionalidades y Cambios Clave

Esta versión expande las capacidades de gestión de divisas de la aplicación:

*   **1. Soporte Completo para Euros (BCV):**
    *   **Integración de API:** Hemos conectado FinanciaMe con los endpoints oficiales de `dolarapi.com` para obtener la tasa del Euro del Banco Central de Venezuela (BCV) de forma automática.
    *   **Billeteras en EUR:** Ahora puedes crear y gestionar billeteras denominadas en Euros. El sistema permite registrar ingresos, egresos y transferencias manteniendo saldos exactos.
    *   **Nueva Tarjeta en el Home:** Se ha añadido una 5ta tarjeta azul al carrusel principal dedicada al resumen de tus activos en Euros, incluyendo su conversión equivalente a Dólares.

*   **2. Integración Transversal del Euro:**
    *   **Presupuestos y Metas:** Ahora puedes establecer metas de ahorro o presupuestos mensuales en Euros. El sistema calculará automáticamente tu progreso basándose en los movimientos de cualquier billetera.
    *   **Gastos Fijos:** Registra tus suscripciones o pagos recurrentes en Euros. Al procesar el pago, la app calculará el costo exacto según la moneda de la billetera que utilices.

---

## 🛠️ Mejoras y Correcciones

*   **Optimización de la Interfaz de Tasas:** Debido al aumento de información, hemos redistribuido las tasas de cambio (BCV, EUR, USDT y PROM) a lo largo de los "footers" de las tarjetas del carrusel. Esto mejora drásticamente la legibilidad en pantallas pequeñas.
*   **Blindaje de Cálculos (Stability Fix):** Se implementó una lógica de "Cálculo Seguro" (`safeFormat`) que protege a la aplicación contra valores inesperados de la API o errores de redondeo, eliminando fallos visuales (errores de `toFixed`) y asegurando que siempre veas números coherentes.
*   **Paginación Actualizada:** El indicador de puntos debajo del carrusel de resumen ahora soporta las 5 categorías de moneda de forma fluida.

---

## 📊 Estadísticas de la Versión

*   **Actualización de Modelos:** El tipo `Currency` se expandió para incluir `EUR` de forma nativa en toda la arquitectura.
*   **Refactorización de Contextos:** Se actualizaron `ExchangeRatesContext` y `useFinancialSummary` para procesar la nueva divisa en los cálculos de patrimonio total.
*   **Lógica de Conversión:** Se mejoraron los hooks `useBudgetSpending` y `useFixedExpensesHandler` para soportar conversiones multi-puente (ej. de USDT a EUR) de forma transparente.

---

## 📝 Notas de esta Versión

*   Con esta actualización, FinanciaMe se vuelve una herramienta mucho más robusta para el usuario avanzado que busca precisión total en sus finanzas. Disfruta de la nueva claridad visual y el control total de tus ahorros en Euros.

---

*Por el amor al código y la automatización ♥️*

**- El equipo de FinanciaMe (AnthoFu)**
