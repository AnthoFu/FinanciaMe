# Publicación de FinanciaMe v1.11.6

**Fecha de Publicación:** 1 de marzo de 2026

¡Nos complace anunciar la versión `1.11.6` de **FinanciaMe**! Esta actualización se enfoca en mejorar la personalización y la experiencia de usuario, introduciendo un nuevo menú de configuración, la esperada funcionalidad de selección de tema y la corrección de errores visuales y de estabilidad.

---

## ✨ Nuevas Funcionalidades y Cambios Clave

Esta versión reestructura la configuración y añade una de las funcionalidades más solicitadas:

*   **Menú de Configuración Centralizado:**
    *   Se ha refactorizado la antigua pantalla de "Categorías" en un nuevo menú de "Configuración" más escalable. Esto permite un acceso más intuitivo a las opciones de la aplicación.
*   **Personalización de Tema (Claro, Oscuro, Sistema):**
    *   **Selección de Apariencia:** Se ha añadido una nueva sección en "Configuración" que permite al usuario elegir entre los temas "Claro", "Oscuro" o usar la configuración "Predeterminada" del sistema.
    *   **Contexto de Tema Personalizado (`ThemeContext`):** Para soportar esta funcionalidad, se implementó un nuevo `ThemeContext` que gestiona y persiste la selección del usuario, asegurando una experiencia coherente en toda la aplicación.

---

## 🛠️ Mejoras y Correcciones

Esta versión soluciona varios errores visuales y de funcionamiento que afectaban la usabilidad:

*   **Corrección de Navegación (Android):**
    *   Se ha solucionado un error que provocaba la desaparición de los botones de navegación del sistema Android al entrar en la pantalla de "Categorías".
*   **Corrección de Tema en Modo Claro:**
    *   Se resolvió un problema visual donde los iconos y el texto de la barra de pestañas inferior se volvían invisibles en modo claro.
*   **Corrección de Crash en Categorías:**
    *   Se solucionó un error crítico que causaba el cierre inesperado de la aplicación en la pantalla de "Gestión de categorías" debido a un componente faltante.
*   **Mejora de UI en Categorías:**
    *   Se ha añadido un margen inferior a la lista de categorías para evitar que el último elemento quede pegado a la barra de navegación, mejorando la legibilidad y la interacción.
*   **Iconografía Añadida:**
    *   Se agregó el icono correspondiente a la nueva sección "Apariencia" en el menú de configuración.

---

## 📊 Estadísticas de la Versión

*   **+14 archivos modificados** con un fuerte enfoque en la personalización y la corrección de la interfaz de usuario.
*   **Nueva funcionalidad clave:** Sistema de temas seleccionables por el usuario.
*   **Refactorización importante:** Creación de un `ThemeContext` para una gestión de estado de apariencia más robusta y desacoplada.

---

## 🛠️ Stack Tecnológico

El stack se ha fortalecido con una mejor gestión del estado de la UI:

*   **Framework:** React Native con Expo (v54)
*   **Gestión de Estado:** React Context API (con la adición de `ThemeContext`)
*   **Almacenamiento Local:** AsyncStorage (para persistir la preferencia de tema)
*   **Navegación:** Expo Router

---

## 📝 Notas de esta Versión

*   Se recomienda a los usuarios explorar el nuevo menú de **Configuración** y probar la nueva funcionalidad de personalización de tema para ajustar la aplicación a sus preferencias visuales.
*   Las correcciones de errores mejoran significativamente la estabilidad y la experiencia de usuario en los modos claro y oscuro.

---

*Por el amor al código y la automatización ♥️*

**- El equipo de FinanciaMe (AnthoFu)**
