# Publicación de FinanciaMe v1.12.2

**Fecha de Publicación:** 14 de marzo de 2026

¡Nos complace anunciar la versión `1.12.2` de **FinanciaMe**! Esta es una actualización mayor enfocada en mejorar drásticamente la experiencia de usuario y la visualización de datos. Se introduce una de las funcionalidades más solicitadas —un historial completo de movimientos— y se moderniza por completo la forma en que interactúas con las listas principales de la aplicación.

---

## ✨ Nuevas Funcionalidades y Cambios Clave

Esta versión introduce dos grandes cambios que transforman la usabilidad de la app:

*   **1. Pantalla de Historial de Movimientos (v1.12.2):**
    *   Se ha añadido una nueva pantalla "Historial de Movimientos", accesible a través de un botón **"Ver todo"** en la pantalla de inicio, permitiendo por primera vez explorar todas las transacciones sin límite.
    *   **Agrupación por Fecha:** Para facilitar la lectura, todas las transacciones en esta nueva pantalla se agrupan automáticamente por día.
    *   **Funcionalidad Completa:** La nueva pantalla permite **editar y eliminar** cualquier movimiento directamente desde la lista, haciendo la gestión mucho más rápida y centralizada.

*   **2. Modernización de Acciones en Listas (v1.12.0 - v1.12.1):**
    *   **Adiós al Gesto de Deslizar:** Se ha eliminado el antiguo gesto de "deslizar para accionar" en las listas, que resultaba poco intuitivo, y se ha reemplazado por un botón de **menú de tres puntos** más estándar y reconocible.
    *   **Menú Contextual Moderno:** Se ha mejorado ese menú de tres puntos, reemplazando la alerta nativa por un **menú contextual moderno** y menos intrusivo. Esta mejora se aplica a las listas de Billeteras, Gastos Fijos y Movimientos Recientes.

---

## 🛠️ Mejoras y Correcciones

*   **Consistencia de UI:** Se ha refactorizado el componente `TransactionItem` para reutilizarlo en la nueva pantalla de historial, asegurando que la apariencia (incluyendo los colores para ingresos/egresos) sea consistente en toda la aplicación.
*   **Corrección de Navegación:** Se solucionó un error que impedía navegar a la nueva pantalla de historial ("Screen does not exist") debido a una ruta incorrecta.
*   **Corrección de Visibilidad:** Se arregló un error visual que hacía desaparecer o moverse de lugar el nuevo menú de tres puntos en varias listas.
*   **Corrección de Crash:** Se solucionó un crash crítico de la aplicación provocado por un fallo en la importación de estilos al reutilizar componentes.

---

## 📊 Estadísticas de la Versión

*   **+1 nueva pantalla principal** y **+7 archivos modificados** para un rediseño funcional y de experiencia de usuario.
*   **Nueva dependencia añadida:** `react-native-popup-menu` para los menús contextuales.
*   **Refactorización importante:** El componente `TransactionItem` ahora es modular y reutilizable, mejorando la mantenibilidad del código.

---

## 📝 Notas de esta Versión

*   Esta versión marca un antes y un después en la usabilidad de la app. Explora tu nuevo **Historial de Movimientos** y disfruta de los nuevos menús contextuales, más rápidos y elegantes.

---

*Por el amor al código y la automatización ♥️*

**- El equipo de FinanciaMe (AnthoFu)**
