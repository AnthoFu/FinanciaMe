# Instrucciones de Compilación (Build)

Este documento describe los pasos para compilar los diferentes tipos de artefactos de la aplicación para Android utilizando Expo Application Services (EAS).

## Requisitos Previos

Antes de poder compilar la aplicación, asegúrate de tener todo lo necesario instalado y configurado.

1.  **Instalar dependencias del proyecto:**
    Si es la primera vez que trabajas en el proyecto o si las dependencias han cambiado, ejecuta:
    ```bash
    npm install
    ```

2.  **Instalar EAS CLI:**
    Si no tienes la línea de comandos de EAS instalada globalmente, instálala con:
    ```bash
    npm install -g eas-cli
    ```

3.  **Iniciar sesión en tu cuenta de Expo:**
    Asegúrate de haber iniciado sesión en tu cuenta de Expo para poder crear y gestionar las compilaciones.
    ```bash
    eas login
    ```

---

## Tipos de Compilación

A continuación se detallan los comandos para cada tipo de compilación. Las compilaciones se realizan en los servidores de EAS y, una vez finalizadas, podrás descargar el artefacto desde la página de detalles de la compilación.

### 1. Build de Producción (.aab)

Este comando genera un **Android App Bundle (.aab)**, que es el formato requerido para subir tu aplicación a la Google Play Store.

```bash
eas build -p android --profile production
```

-   **Perfil:** `production`
-   **Plataforma:** `android`
-   **Resultado:** Un archivo `.aab` firmado para producción.

### 2. Build de Preview/Testing (.apk)

Este comando genera un archivo **APK (.apk)** que puedes instalar directamente en un dispositivo para pruebas internas o para compartir con un equipo de QA.

El perfil `preview` por defecto genera un `.aab`. Para forzar la creación de un `.apk`, se puede añadir una configuración en `eas.json` o especificarlo en el comando. Sin embargo, el método más común para obtener un APK para testing es usar el perfil `preview`.

```bash
eas build -p android --profile preview
```

Una vez finalizada la compilación, desde el enlace que te proporciona EAS podrás descargar tanto el `.aab` como un `.apk` instalable.

### 3. Build de Desarrollo (.apk)

Este comando genera un **cliente de desarrollo (.apk)**. Este cliente te permite cargar tu proyecto directamente desde tu máquina local (usando `expo start`) sin necesidad de usar la app de Expo Go, lo cual es útil cuando tu proyecto incluye código nativo personalizado.

Tu perfil `development` ya está configurado para generar un `.apk`.

```bash
eas build -p android --profile development
```

-   **Perfil:** `development`
-   **Plataforma:** `android`
-   **Resultado:** Un archivo `.apk` que funciona como cliente de desarrollo.
