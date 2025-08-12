# Análisis Detallado de la Pantalla de Alimentación (Feed Screen)

## 📊 Arquitectura de Componentes

La pantalla de alimentación está estructurada en capas bien definidas:

### 1. FeedScreen.tsx (Componente Principal)
- **Rol**: Orquestador principal que maneja el estado global y coordina la interacción entre componentes
- **Responsabilidades**:
  - Renderiza estados condicionales (loading, sin beast, sin comida)
  - Integra todos los sub-componentes
  - Gestiona el contexto de música
  - Maneja referencias para el portal de drag & drop

### 2. Componentes UI Principales

#### Beast.tsx (`components/beasts.tsx:20-93`)
- Representa visualmente al beast del jugador
- Actúa como zona de drop para la comida
- Estados visuales: normal, isDragging (indicador de objetivo), isFeeding (animación)
- Animaciones con Framer Motion (escala, rotación suave al alimentar)

#### FoodCarousel.tsx (`components/FoodCarousel.tsx:10-123`)
- Carrusel horizontal con react-slick
- Controles de navegación (flechas izquierda/derecha)
- Estado deshabilitado durante transacciones
- Overlay visual cuando está bloqueado

#### FoodItem.tsx (`components/FoodItem.tsx:4-94`)
- Items individuales de comida arrastrables
- Badge contador mostrando cantidad disponible
- Estados visuales para drag & drop
- Animaciones de entrada y hover

#### DragPortal.tsx
- Renderiza el item arrastrado fuera del DOM normal
- Sigue el cursor durante el arrastre
- z-index elevado para visibilidad

## 🔄 Flujo de Datos y Estado

### Hooks Personalizados

#### useFeedLogic.tsx (`components/hooks/useFeedLogic.tsx:39-304`)
- **Hub central** de lógica de alimentación
- Integra múltiples hooks:
  - `useFoodInventory`: Obtiene inventario del blockchain
  - `useFeedBeast`: Ejecuta transacciones de alimentación
  - `useRealTimeStatus`: Actualiza estado del beast
  - `useUpdateBeast`: Sincroniza con contrato
- Maneja el ciclo completo de drag & drop
- Implementa **actualizaciones optimistas** en el store

#### useFoodInventory.tsx (`dojo/hooks/useFoodInventory.tsx:96-218`)
- Consulta GraphQL a Torii para obtener inventario
- Sincroniza con Zustand store
- Convierte datos del contrato a formato UI
- Funciones de refetch normal y silencioso

#### useFeedBeast.tsx (`dojo/hooks/useFeedBeast.tsx:38-200`)
- Ejecuta transacciones blockchain vía Cavos SDK
- Validaciones pre-transacción
- Manejo de estados de error
- Toast notifications

## 🏪 Integración con Zustand Store

El store (`zustand/store.ts`) mantiene:

```typescript
// Estado de comidas
foods: Food[]  // Array de objetos con player, id, amount

// Estado de transacción
feedTransaction: {
  isFeeding: boolean
  feedingFoodId: number | null
  transactionHash: string | null
  error: string | null
}

// Acciones
setFoods()            // Actualiza inventario completo
updateFoodAmount()    // Actualización optimista individual
setFeedTransaction()  // Estado de transacción
```

## 🎮 Flujo de Alimentación del Usuario

### 1. Carga Inicial
- FeedScreen monta y llama `useFeedLogic`
- `useFoodInventory` consulta blockchain vía GraphQL
- Datos se almacenan en Zustand store
- UI renderiza carrusel con items disponibles

### 2. Inicio del Arrastre
- Usuario presiona FoodItem
- `handleDragStart` valida disponibilidad y permisos
- Estado `dragState.isDragging = true`
- Beast muestra indicador de objetivo amarillo

### 3. Durante el Arrastre
- `handleDrag` actualiza posición del portal
- Item renderizado sigue el cursor
- Carrusel se bloquea para evitar interferencias

### 4. Soltar Item
- `handleDragEnd` calcula distancia al beast
- Si está dentro del `DROP_TOLERANCE` (zona válida):

### 5. Transacción Exitosa
```
a) Actualización optimista inmediata en store
b) Ejecuta transacción blockchain (Cavos SDK)
c) Toast de éxito con color temático
d) Secuencia post-alimentación (1.5s delay):
   - updateBeast() → Actualiza contrato
   - fetchLatestStatus() → Obtiene nuevo estado
   - silentRefetch() → Actualiza inventario sin loading
```

### 6. Manejo de Errores
- Revierte actualización optimista
- Toast de error descriptivo
- Resetea estados de transacción

## 🔗 Integración Blockchain (Dojo/Starknet)

### Flujo de Datos
```
UI → useFeedLogic → useFeedBeast → useCavosTransaction → Cavos SDK → Starknet Contract
                 ↓
         useFoodInventory → GraphQL → Torii Indexer → Blockchain State
```

### Contrato de Alimentación
- Endpoint: `game.feed(foodId)`
- Valida propiedad del item
- Decrementa cantidad de comida
- Actualiza stats del beast
- Emite eventos para indexación

## 🎨 Estados Visuales y UX

### Estados del Carrusel
- **Normal**: Navegable, items arrastrables
- **isFeeding**: Bloqueado con overlay y spinner
- **Sin comida**: Mensaje informativo

### Estados del Beast
- **Normal**: Animación idle
- **isDragging**: Escala aumentada + indicador objetivo
- **isFeeding**: Vibración sutil + brillo aumentado

### Feedback Visual
- Toasts temáticos según tipo de comida
- Animaciones spring en todas las interacciones
- Partículas mágicas de fondo
- Transiciones suaves entre estados

## 🔧 Configuración y Constantes

### Constantes Importantes (`constants/feed.constants.ts`)
- `DROP_TOLERANCE`: Radio de zona válida para soltar comida
- `BEAST_DROP_ZONE_ID`: ID del elemento HTML objetivo
- `FOOD_UI_CONFIG`: Colores y configuración visual por tipo de comida
- `SLIDER_SETTINGS`: Configuración del carrusel react-slick
- `FOOD_ASSETS`: Mapeo de IDs a assets de comida

## 🐛 Consideraciones y Edge Cases

### Prevención de Estados Inconsistentes
1. **Doble alimentación**: Bloqueado por flag `isFeeding`
2. **Arrastre sin comida**: Validado en `handleDragStart`
3. **Transacción fallida**: Reversión automática de cambios optimistas
4. **Sin beast activo**: UI muestra estado especial con CTA

### Optimizaciones de Performance
1. **Silent refetch**: Actualiza datos sin mostrar loading
2. **Actualizaciones optimistas**: UI responde inmediatamente
3. **Debounce en drag**: Evita actualizaciones excesivas
4. **Memoización**: Hooks usan `useMemo` y `useCallback`

## 📝 Notas de Mantenimiento

### Para agregar nueva comida:
1. Añadir asset en `assets/foods/`
2. Actualizar `FOOD_ASSETS` con ID, nombre e imagen
3. Agregar color en `FOOD_UI_CONFIG.FOOD_COLORS`
4. El sistema automáticamente la incluirá si existe en blockchain

### Para modificar animaciones:
- Beast animations: `components/beasts.tsx` líneas 28-48
- Food item animations: `components/FoodItem.tsx` líneas 47-67
- Carousel transitions: `components/FoodCarousel.tsx` líneas 42-47

### Debugging común:
- Verificar `cavosWallet` está autenticado
- Confirmar `hasLiveBeast()` retorna true
- Revisar logs de `useFeedLogic` para flujo de transacción
- GraphQL errors aparecen en consola con prefijo "GraphQL Error:"