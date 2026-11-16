# DoneWell — Gestión de Tareas y Categorías

Aplicación móvil híbrida para la gestión personal de tareas y categorías, construida con **Ionic 8**, **Angular 17** y **Apache Cordova (Android 14)**. Incluye almacenamiento local persistente entre sesiones, diseño visual *Dark Premium (Midnight Violet)* y control dinámico de funcionalidades mediante **Firebase Remote Config**.

---

## Funcionalidades Implementadas

- **Gestión de Tareas (CRUD):**
  - Creación de tareas desde modal (`IonModal`) con asignación opcional de categoría.
  - Cambio rápido de estado (completada / pendiente) con ordenamiento visual en el listado.
  - Eliminación individual con cuadro de confirmación (`AlertController`).
- **Gestión de Categorías Personalizadas (CRUD):**
  - Creación, edición y eliminación de categorías mediante modal dedicado.
  - Selector visual de **24 íconos Ionicons** y **6 colores semánticos** con acento lateral de `4px`.
  - Desvinculación segura de tareas asociadas cuando se elimina una categoría, sin perder tareas existentes.
- **Filtro Horizontal Deslizable por Categoría:**
  - Barra horizontal (*slider*) con chips para filtrar por `Todas`, `Sin categoría` o cualquier categoría creada, mostrando contadores actualizados en tiempo real.
- **Almacenamiento Local Persistente:**
  - Persistencia offline de tareas y categorías entre sesiones mediante `@ionic/storage-angular` encapsulado en `StorageService`.
- **Estadísticas y Feature Flag con Firebase Remote Config (`enable_stats`):**
  - Pestaña **Estadísticas** con tarjeta de progreso general (porcentaje global, total, hechas y pendientes) y desglose de avance por categoría.
  - Visibilidad controlada de forma remota por el parámetro booleano `enable_stats` en Firebase Remote Config (`cordova-plugin-firebasex-config`).
  - Sincronización al iniciar la aplicación, al reanudar desde segundo plano (`platform.resume`) y mediante botón manual en la barra superior; si `enable_stats` pasa a `false` mientras se visualizan estadísticas, redirige automáticamente a la pestaña de Tareas (`/tabs/tab1`).
- **Identidad Visual (*Dark Premium — Midnight Violet*):**
  - Interfaz construida 100% con componentes nativos de Ionic (`@ionic/angular/standalone`), tokens CSS globales en `src/theme/variables.scss`, soporte de áreas seguras (`safe-area-inset-*`), superficies *glassmorphism* con *fallback* `@supports not` y objetivos táctiles mínimos de `44px`.

---

## Arquitectura del Proyecto

```text
src/app/
├── core/
│   ├── constants/       # Claves de almacenamiento, Remote Config y catálogo de íconos/colores
│   ├── models/          # Entidades POO (BaseEntity, TaskItem, CategoryItem) y contratos TS
│   └── services/        # Servicios transversales (StorageService, RemoteConfigService)
├── features/
│   ├── tasks/           # Vista de tareas, modal de creación, filtro horizontal y TasksService
│   ├── categories/      # Vista de categorías, formulario modal y CategoriesService
│   └── stats/           # Vista de estadísticas de progreso general y por categoría
└── tabs/                # Barra de navegación inferior reactiva al flag enable_stats
```

---

## Requisitos y Versiones del Entorno

| Herramienta / Tecnología | Versión recomendada |
| :--- | :--- |
| **Node.js** | `v20.x` (`>= 20.5.0`) |
| **Angular** | `17.3.x` |
| **Ionic Angular (`@ionic/angular`)** | `8.0.x` |
| **Cordova CLI** | `13.x` |
| **Cordova Android (`cordova-android`)** | `14.0.0` |
| **Java JDK** | `11+` (compatible con Android Studio JBR) |
| **Android SDK** | Plataforma `android-35` (API 35) y Build-Tools `35.0.0` |
| **Gradle** | `8.x` |

---

## Instalación y Ejecución en Navegador Web

```bash
# 1. Instalar dependencias del proyecto
npm install

# 2. Iniciar servidor local de desarrollo en el navegador
ionic serve
```

*(También puedes usar `npm start` para levantar el servidor de Angular directamente).*

---

## Calidad de Código y Pruebas Unitarias

```bash
# Validar reglas de ESLint en TypeScript y plantillas HTML
npm run lint

# Ejecutar pruebas unitarias con Jasmine + Karma en ChromeHeadless
ng test --watch=false --browsers=ChromeHeadless

# Compilar bundle web de producción
npm run build
```

---

## Configuración de Firebase Remote Config (`google-services.json`)

Por buenas prácticas de seguridad, el archivo real `google-services.json` está excluido del control de versiones en `.gitignore` para evitar exponer claves de proyecto en el repositorio público. En la raíz se incluye [`google-services.example.json`](google-services.example.json) como referencia de estructura.

Para habilitar Firebase Remote Config en tu copia local:

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/) y agrega una aplicación **Android** con el *package name* exacto definido en [`config.xml`](config.xml):
   ```text
   com.donewell.app
   ```
2. Descarga el archivo `google-services.json` generado por Firebase y guárdalo en la raíz del proyecto (`done-well/google-services.json`, junto a `config.xml`).
3. En **Firebase Console → Ejecución (Run) → Remote Config**, crea y publica el siguiente parámetro:
   - **Nombre del parámetro:** `enable_stats`
   - **Tipo de datos:** `Boolean`
   - **Valor predeterminado:** `true` (muestra la pestaña *Estadísticas*) o `false` (la oculta en vivo sin recompilar el APK al publicar cambios).

> **Modo Web / Offline:** Cuando la app corre en navegador estándar o sin plugin nativo disponible, `RemoteConfigService` mantiene de forma segura el valor predeterminado definido en `src/app/core/constants/remote-config.constants.ts`.

---

## Compilación Android y Generación del APK

Asegúrate de tener configuradas tus variables de entorno `JAVA_HOME`, `ANDROID_HOME` y `Gradle` en el `PATH` antes de compilar para Android.

```bash
# 1. (Si acabas de clonar el repo) Agregar la plataforma Android
ionic cordova platform add android@14.0.0

# 2. Verificar que JDK, Android SDK y Gradle cumplan los requisitos
ionic cordova requirements android

# 3. Sincronizar recursos y archivos nativos (incluye google-services.json)
ionic cordova prepare android

# 4. Compilar y generar el APK de Android
ionic cordova build android

# 5. Ejecutar directamente en un dispositivo Android conectado por USB
ionic cordova run android --device
```

### Ubicación del APK generado
Al finalizar `ionic cordova build android`, el archivo instalable queda generado en:

```text
platforms/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Entregables y Descarga del APK

- **Aplicación Android compilada (APK):** Descarga e instala directamente la versión compilada desde la sección de [**Releases en GitHub**](https://github.com/JaRodriguez97/done-well/releases).
- **Evidencias funcionales:** Incluyen el flujo completo de creación/completado/eliminación de tareas, CRUD de categorías personalizadas, filtrado horizontal por categoría, persistencia offline tras reiniciar la app y activación/desactivación en vivo de la pestaña *Estadísticas* mediante el *feature flag* `enable_stats` en Firebase Remote Config.
