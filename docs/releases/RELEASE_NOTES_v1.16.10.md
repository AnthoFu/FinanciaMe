# Notas de Lanzamiento - FinanciaMe v1.16.10 (Acumulado desde v1.16.7)

Esta versión `v1.16.10` consolida mejoras clave de **precisión matemática financiera**, **optimización de código nativo para Google Play** y **pulido de diseño en iconos y assets del sistema**.

---

### 🚀 Novedades y Mejoras Principales

#### 1. Precisión Numérica y Redondeo Financiero a 2 Decimales
* **Eliminación de Residuos de Punto Flotante:** Se corrigió el comportamiento clásico de JavaScript IEEE 754 donde saldos con decimales (por ejemplo `67.25`) podían mostrarse al editar como `67.249999999996`.
* **Inicialización Limpia en Modales:** Todos los formularios inicializan sus campos numéricos formateados con exactamente 2 decimales (`Number(parseFloat(val.toFixed(2))).toString()`):
  * `WalletModal`: Edición de saldos iniciales y actuales de billeteras.
  * `TransactionModal`: Monto principal y comisiones asociadas a gastos/ingresos.
  * `GoalModal`: Monto objetivo (`targetAmount`) de metas de ahorro.
  * `BudgetModal`: Límite presupuestario asignado.
  * `FixedExpenseModal`: Monto mensual o periódico de gastos fijos.
  * `ContributionModal`: Monto aportado hacia metas de ahorro.
  * `TransferModal`: Montos de origen, destino y comisiones entre cuentas.
* **Cálculos y Stores Centralizados:** Implementación de la función de redondeo `round2(n)` (`Math.round((n + Number.EPSILON) * 100) / 100`) en todas las mutaciones de saldo (`walletStore`), cálculo de progreso de metas (`SavingsGoalsContext`), consumo presupuestario (`useBudgetSpending`) y cobro automático de gastos fijos multimoneda (`useFixedExpensesHandler`).

#### 2. Icono Adaptable y Centrado Seguro en Android (`v1.16.9`)
* **Alineación en la Zona Segura (Safe Zone):** Se rediseñó el asset `adaptive-icon.png` (1024x1024) asegurando que el logotipo naranja de FinanciaMe se ubique estrictamente dentro del círculo central del 66% (área visible estándar de Android), evitando cualquier corte en los bordes en lanzadores como Pixel Launcher, Samsung One UI, Xiaomi HyperOS, etc.
* **Soporte para Iconos Monocromáticos:** Incorporación de `android-icon-monochrome.png` para compatibilidad completa con iconos temáticos y dinámicos (Material You) en Android 13+.
* **Sincronización de Assets Globales:** Actualización y unificación de assets en el repositorio general de diseño.

#### 3. Optimización DEX y Ofuscación R8 / ProGuard (`v1.16.8`)
* **Solución a Alertas de Google Play Console:** Configuración del plugin `expo-build-properties` con `enableProguardInReleaseBuilds: true` y `enableShrinkResourcesInReleaseBuilds: true`.
* **Reducción del Tamaño del Binario:** Optimización de código muerto (tree shaking / code shrinking nativo) y ofuscación de clases DEX en compilaciones de producción de Android, aumentando la puntuación de optimización requerida por Google Play.
* **Sincronización de Lockfile:** Asegurado el archivo `package-lock.json` para builds reproducibles con `npm ci` en EAS Build.

---

### 🛠️ Correcciones y Refactorizaciones Técnicas

* **Integración de `useTransactionHandler` en `all-transactions.tsx`:** La edición de movimientos desde la pantalla de historial completo ahora utiliza el gestor centralizado de transacciones, garantizando la actualización y reversión atómica de saldos en las billeteras involucradas.
* **Corrección de Tipados en Contextos:** 
  * `WalletsContextType` y `TransactionsContextType` actualizados para coincidir con las firmas asíncronas y síncronas de Zustand.
  * `ThemeContext.tsx` con exportación de tipos `AppTheme` y `ColorScheme` refinados.
  * `privacyStore.ts` con clave de migración `isBalancesHidden` debidamente tipada.
  * `IconSymbol.tsx` ampliado con mappings de iconos (`magnifyingglass`, `star.fill`, `arrow.down.left`, `arrow.up.right`).
* **Verificación de Compilación Exitosa:** Compilación completa probada con `npx tsc --noEmit` y `npx expo export` generando los bundles de Hermes (`.hbc`) para Android e iOS sin advertencias ni errores bloqueantes.

---
*FinanciaMe: Tu control financiero, local y seguro.*
