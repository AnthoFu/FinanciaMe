# FinanciaMe - Tu Asistente de Finanzas Personales

<p align="center">
    <img src="./assets/images/AnthoFu-Icon.png" alt="Logo AnthoFu" width="150" height="150" />
</p>

---

- Autor: [AnthoFu🦊](https://github.com/AnthoFu)

FinanciaMe es una aplicación móvil de finanzas personales, diseñada especialmente para jóvenes independientes en Venezuela. El objetivo principal de la app es facilitar la gestión de dinero en un entorno con dos monedas (Bolívares y Dólares), proporcionando claridad sobre el valor real del saldo del usuario en todo momento.

## Idea Principal

La aplicación ayuda a los usuarios a registrar sus ingresos y gastos diarios, manteniendo un saldo actualizado en Bolívares (Bs.). De forma simultánea, utiliza la tasa de cambio oficial del Banco Central de Venezuela (BCV) para mostrar el equivalente de ese saldo en Dólares (USD), permitiendo una mejor planificación y toma de decisiones financieras.

## Funcionalidades Implementadas

- **Tasa de Cambio Automática:** La aplicación obtiene la última tasa de cambio del BCV al iniciar y la actualiza si hay conexión a internet.
- **Funcionamiento Offline:** Si no hay conexión, la app utiliza la última tasa guardada. El saldo y el historial de transacciones también se almacenan localmente, garantizando acceso ininterrumpido.
- **Visualización en Dos Monedas:** El saldo principal se muestra de forma prominente en Bolívares y su equivalente en Dólares, calculado en tiempo real.
- **Gestión de Transacciones:**
  - Interfaz simple con botones `+ Ingreso` y `- Gasto`.
  - Una ventana modal permite registrar el monto y la descripción de cada movimiento.
- **Historial de Movimientos:** Todas las transacciones se listan en la pantalla principal, mostrando descripción, fecha y monto, para un seguimiento claro.
- **Persistencia de Datos:** Toda la información del usuario (saldo, transacciones, última tasa) se guarda de forma segura en el almacenamiento local del dispositivo.
- **Pestaña de Gastos Fijos:** Se ha añadido una sección dedicada para la futura implementación de la gestión de gastos recurrentes.

## Stack de Tecnología

- **Framework:** React Native con Expo
- **Lenguaje:** TypeScript
- **Navegación:** Expo Router (navegación basada en archivos)
- **Almacenamiento Local:** AsyncStorage

## Cómo Empezar

Sigue estos pasos para ejecutar el proyecto en tu entorno de desarrollo local.

1.  **Instalar Dependencias:**
    Navega a la carpeta `FinanciaMe` y ejecuta el siguiente comando para instalar todos los paquetes necesarios.
    ```bash
    npm install
    ```

2.  **Iniciar la Aplicación:**
    Una vez instaladas las dependencias, ejecuta este comando para iniciar el servidor de desarrollo de Expo.
    ```bash
    npm start
    ```

3.  **Probar en tu Dispositivo:**
    Escanea el código QR que aparece en la terminal con la aplicación **Expo Go** en tu teléfono (iOS o Android). También puedes ejecutarlo en un emulador de Android o simulador de iOS si los tienes configurados.