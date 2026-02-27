# Publicación de FinanciaMe v1.10.19

**Fecha de Publicación:** 19 de febrero de 2026

¡Me complace anunciar la versión `1.10.19` de **FinanciaMe**! Esta actualización representa un salto cualitativo en la robustez y disponibilidad de la aplicación, centrándose en una experiencia de usuario fluida incluso en condiciones de conectividad limitada o nula. Hemos refactorizado completamente el núcleo de gestión de tasas de cambio e introducido mecanismos de actualización inteligente.

---

## ✨ Nuevas Funcionalidades

Esta versión introduce mejoras críticas en la arquitectura de datos y la interfaz de usuario:

*   **Gestión de Tasas de Cambio Centralizada (ExchangeRatesContext):**
    *   Implementación de un nuevo Contexto global que sincroniza las tasas de cambio en toda la aplicación, eliminando redundancias y mejorando el rendimiento.
*   **Estrategia SWR (Stale-While-Revalidate) para Offline:**
    *   **Carga Instantánea:** La aplicación ahora carga las tasas desde la caché local de forma inmediata al iniciar, permitiendo un uso instantáneo sin depender de la red.
    *   **Actualización en Segundo Plano:** Las tasas se actualizan silenciosamente si tienen más de una hora, sin bloquear la interfaz del usuario.
*   **Funcionalidad "Deslizar para Actualizar" (Pull to Refresh):**
    *   Se ha añadido soporte para refresco manual tanto en la pantalla de Inicio como en la de Métricas, permitiendo al usuario forzar la actualización de tasas y saldos financieros.
*   **Indicador Visual de Actualización:**
    *   Nuevo indicador en la tarjeta de resumen que muestra la fecha y hora de la última actualización exitosa.
    *   **Alertas de Datos Obsoletos:** Se ha integrado un icono de advertencia dinámico que notifica visualmente al usuario cuando las tasas tienen más de 24 horas de antigüedad.
*   **Guía de Build (EAS Guide):**
    *   Creación de una guía detallada (`BUILD_GUIDE.md`) para facilitar la generación de versiones de prueba (.APK) y producción (.AAB) mediante Expo Application Services.

---

## 🛠️ Mejoras y Correcciones

Esta versión fortalece la estabilidad y la resiliencia de la aplicación:

*   **Resiliencia a Fallos de Red:**
    *   Se han implementado mecanismos de timeout (10s) para evitar bloqueos por conexiones lentas.
    *   Manejo de errores mejorado que permite que la app siga funcionando con datos previos si la API no está disponible.
*   **Optimización de Carga:**
    *   La pantalla principal y las métricas ya no muestran estados de carga intrusivos si ya existen datos en caché, mejorando la percepción de velocidad.
*   **Consistencia de Datos:**
    *   Refactorización del hook `useExchangeRates` para garantizar que todos los cálculos (presupuestos, transferencias, métricas) utilicen exactamente la misma fuente de verdad sincronizada.

---

## 📊 Estadísticas de la Versión

*   **+10 archivos modificados** con enfoque en arquitectura y UI.
*   **Nueva funcionalidad clave:** Modo offline inteligente y sincronizado para tasas de cambio.
*   **Mejora en UX:** Reducción drástica de tiempos de espera al iniciar la aplicación.
*   **Documentación:** Guía de compilación completa añadida al repositorio.

---

## 🛠️ Stack Tecnológico

El stack se mantiene consistente, con una arquitectura de estado más robusta:

*   **Framework:** React Native con Expo (v54)
*   **Gestión de Estado:** React Context API (Optimizado para Tasas)
*   **Almacenamiento Local:** AsyncStorage (Caché de Tasas mejorada)
*   **Build System:** Expo EAS

---

## 📝 Notas de esta Versión

*   Esta actualización es vital para usuarios en entornos con conexión inestable, garantizando que sus saldos y métricas estén siempre disponibles.
*   Se recomienda especialmente probar:
    *   El inicio de la aplicación en "Modo Avión" para verificar la carga instantánea de la caché.
    *   El gesto de "Pull to Refresh" en la Home para actualizar tasas manualmente.
    *   El comportamiento del indicador visual de fecha/hora.

---

*Por el amor al código y la automatización ♥️*

**- El equipo de FinanciaMe (AnthoFu)**
