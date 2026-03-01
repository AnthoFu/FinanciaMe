# Publicación de FinanciaMe v1.11.1

**Fecha de Publicación:** 27 de febrero de 2026

¡Me complace anunciar la versión `1.11.1` de **FinanciaMe**! Esta actualización consolida la estabilidad del sistema tras los grandes cambios en la gestión de divisas y presupuestos. Nos hemos enfocado en simplificar la experiencia del usuario unificando la moneda nacional y corrigiendo errores críticos en la planificación financiera, además de formalizar el proceso técnico de construcción de la aplicación.

---

## ✨ Nuevas Funcionalidades y Cambios Clave

Esta versión introduce una simplificación necesaria en la gestión de divisas y documentación para el desarrollo:

*   **Unificación Monetaria (Consolidación VES):**
    *   Se han refactorizado todas las referencias a las monedas de Bolívares (`ves` y `vef`), unificándolas bajo el estándar único `ves`. Esto elimina confusiones en los reportes y garantiza coherencia en los cálculos históricos.
*   **Guía de Construcción (Build Documentation):**
    *   Se ha integrado documentación técnica exhaustiva sobre el flujo de trabajo para generar las versiones finales (*builds*) de la aplicación, facilitando la continuidad del desarrollo.
*   **Mejora en Tasas (Feedback Visual):**
    *   Consolidación definitiva de la visualización de la fecha de la tasa de cambio en las tarjetas de resumen, permitiendo al usuario saber exactamente qué tan reciente es la información que está viendo.

---

## 🛠️ Mejoras y Correcciones

Esta versión soluciona errores de lógica que afectaban la usabilidad en la gestión de presupuestos:

*   **Corrección en Creación de Presupuestos:**
    *   **Estabilidad en la Selección:** Se implementó `React.useMemo` para solucionar un error persistente que impedía cambiar correctamente entre opciones durante el proceso de creación de presupuestos.
*   **Optimización de Estado:**
    *   Mejora en la reactividad de los componentes financieros para evitar re-renderizados innecesarios tras la unificación de divisas.

---

## 📊 Estadísticas de la Versión

*   **+5 archivos modificados** centrados en la estandarización de divisas.
*   **Consolidación de código:** Eliminación de redundancias en el manejo de tipos de cambio antiguos.
*   **Documentación:** Manual de construcción técnica añadido al repositorio.

---

## 🛠️ Stack Tecnológico

El stack se mantiene robusto, con optimizaciones en la memorización de componentes:

*   **Framework:** React Native con Expo (v54)
*   **Gestión de Estado:** React Context API & React Hooks (useMemo optimizado)
*   **Estándar de Divisas:** ISO 4217 unificado (VES)
*   **Build System:** Expo EAS & Documentation Suite

---

## 📝 Notas de esta Versión

*   Se recomienda a los usuarios verificar sus presupuestos existentes, ya que la unificación a `VES` garantiza que todos los cálculos de conversión sean consistentes de ahora en adelante.
*   El equipo de desarrollo ahora cuenta con un manual estandarizado para la creación de APKs de prueba, lo que acelerará el ciclo de feedback en futuras actualizaciones.

---

*Por el amor al código y la automatización ♥️*

**- El equipo de FinanciaMe (AnthoFu)**
