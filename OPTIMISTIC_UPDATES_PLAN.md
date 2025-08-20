# Plan de Implementación: Optimistic Updates para ByteBeasts

## Resumen Ejecutivo
Este documento detalla el análisis y plan de implementación para mejorar la experiencia de usuario en ByteBeasts mediante optimistic updates, eliminando los tiempos de espera de 5-10 segundos en las transacciones blockchain.

## 📊 Análisis del Sistema Actual

### Problema Identificado
- **Tiempo de espera**: 5-10 segundos por transacción en Starknet
- **UX bloqueada**: La UI espera confirmación blockchain antes de actualizar
- **Impacto**: Experiencia de juego lenta para 1000+ usuarios activos
- **Retención afectada**: 100-150 usuarios diarios de 1000 registrados

### Flujo Actual de Transacciones

#### 1. Feed Beast
```typescript
// Ubicación: client/src/dojo/hooks/useFeedBeast.tsx
// Flujo actual:
1. Usuario arrastra comida → Beast
2. Ejecuta transacción (línea 100)
3. ESPERA respuesta blockchain
4. Actualiza UI solo después de confirmación
5. Actualiza inventario y stats

// Problema: UI bloqueada durante 5-10 segundos
```

#### 2. Clean Beast
```typescript
// Ubicación: client/src/dojo/hooks/useCleanBeast.tsx
// Flujo actual:
1. Usuario click en nube
2. Ejecuta transacción (línea 98)
3. BLOQUEA interacción
4. Espera confirmación
5. Inicia animación de lluvia

// Problema: Sin feedback inmediato
```

#### 3. Sleep/Awake
```typescript
// Ubicación: client/src/dojo/hooks/useSleepAwake.tsx
// Flujo actual:
1. Usuario click en fogata
2. Ejecuta transacción (líneas 120/211)
3. ESPERA confirmación blockchain
4. Actualiza estado del beast

// Problema: Cambio de estado demorado
```

## 🎯 Solución Propuesta: Optimistic Updates

### ¿Por qué Optimistic Updates vs TanStack Query?

| Criterio | Optimistic Updates | TanStack Query |
|----------|-------------------|----------------|
| Breaking Changes | Mínimos | Significativos |
| Implementación | Incremental | Reescritura completa |
| Bundle Size | 0 KB adicional | +190 KB |
| Curva Aprendizaje | Baja | Alta |
| Infraestructura Existente | ✅ Ya parcialmente implementado | ❌ Desde cero |
| Escalabilidad | Suficiente para 10K usuarios | Overkill para caso actual |

### Arquitectura de la Solución

```typescript
// Nuevo flujo con optimistic updates:
1. Usuario ejecuta acción
2. UI actualiza INMEDIATAMENTE (optimistic)
3. Transacción ejecuta en background
4. Si éxito → mantener estado
5. Si fallo → rollback automático + toast error
```

## 📋 Plan de Implementación por Fases

### **Fase 1: Infraestructura Base** (2-3 horas)
**Objetivo**: Crear la base reutilizable para optimistic updates

#### Tareas:
1. **Crear hook wrapper `useOptimisticTransaction`**
   ```typescript
   // client/src/dojo/hooks/useOptimisticTransaction.tsx
   interface OptimisticConfig<T> {
     onOptimisticUpdate: () => T;
     onRollback: (originalState: T) => void;
     onSuccess?: (txHash: string) => void;
     skipWaitForConfirmation?: boolean;
   }
   ```

2. **Extender Zustand store con métodos de rollback**
   ```typescript
   // client/src/zustand/store.ts
   - saveStateSnapshot()
   - rollbackToSnapshot()
   - optimisticUpdateWithRollback()
   ```

3. **Crear utilities para manejo de estado**
   ```typescript
   // client/src/utils/optimisticHelpers.ts
   - calculateOptimisticStats()
   - validateOptimisticUpdate()
   ```

### **Fase 2: Optimistic Updates en Feed** (2-3 horas)
**Objetivo**: Implementar el caso más complejo primero

#### Tareas:
1. **Modificar `useFeedBeast.tsx`**
   - Aplicar update optimista a stats del beast inmediatamente
   - Mantener lógica existente de inventario
   - Implementar rollback en caso de fallo

2. **Actualizar `useFeedLogic.tsx`**
   - Remover delays artificiales
   - Mejorar feedback visual durante transacción
   - Añadir indicador sutil de "sincronizando"

3. **Testing scenarios**:
   - Feed exitoso
   - Feed con fallo de red
   - Feed con rechazo de contrato
   - Multiple feeds consecutivos

### **Fase 3: Optimistic Updates en Clean** (2 horas)
**Objetivo**: Aplicar patrón establecido a Clean

#### Tareas:
1. **Modificar `useCleanBeast.tsx`**
   - Update optimista de hygiene stat
   - Iniciar animación inmediatamente
   - Rollback si falla

2. **Actualizar `useCleanLogic.tsx`**
   - Remover bloqueo de interacción
   - Permitir múltiples cleans en cola
   - Sincronización con animación

### **Fase 4: Optimistic Updates en Sleep/Awake** (2 horas)
**Objetivo**: Completar todas las acciones principales

#### Tareas:
1. **Modificar `useSleepAwake.tsx`**
   - Update optimista de estado awake/sleep
   - Cambio visual inmediato
   - Manejo de estado de navegación

2. **Consideraciones especiales**:
   - Sleep bloquea navegación - mantener este comportamiento
   - Sincronizar animaciones con estado optimista

### **Fase 5: Polish y Edge Cases** (2-3 horas)
**Objetivo**: Refinamiento final y manejo de casos edge

#### Tareas:
1. **Indicadores visuales**
   - Icono sutil de "sincronizando" en esquina
   - Animación suave en cambios de stats
   - Feedback táctil/visual en acciones

2. **Manejo de errores mejorado**
   - Toast informativos sin ser intrusivos
   - Retry automático en fallos de red
   - Cola de transacciones pendientes

3. **Performance optimizations**
   - Debounce en updates frecuentes
   - Batch updates cuando sea posible
   - Limitar re-renders innecesarios

## 🔧 Implementación Técnica Detallada

### Hook Base: useOptimisticTransaction

```typescript
// client/src/dojo/hooks/useOptimisticTransaction.tsx
export function useOptimisticTransaction<T>() {
  const { executeTransaction } = useCavosTransaction();
  
  const executeOptimistic = async (
    calls: CavosTransactionCall[],
    config: OptimisticConfig<T>
  ) => {
    // 1. Capturar estado original
    const originalState = config.captureState();
    
    // 2. Aplicar update optimista
    const optimisticState = config.onOptimisticUpdate();
    
    // 3. Ejecutar transacción en background
    try {
      const txHash = await executeTransaction(calls);
      
      // 4. Confirmar éxito
      if (config.onSuccess) {
        config.onSuccess(txHash);
      }
      
      return { success: true, txHash };
    } catch (error) {
      // 5. Rollback en caso de fallo
      config.onRollback(originalState);
      
      return { success: false, error };
    }
  };
  
  return { executeOptimistic };
}
```

### Ejemplo: Feed con Optimistic Update

```typescript
// client/src/dojo/hooks/useFeedBeast.tsx (modificado)
const feedBeast = useCallback(async (foodId: number) => {
  // Validaciones existentes...
  
  // Capturar estado original
  const originalStats = store.realTimeStatus;
  const originalFoods = store.foods;
  
  // Aplicar updates optimistas inmediatamente
  store.updateStatusOptimistic({
    hunger: Math.min(100, (originalStats[0] || 0) + getFoodValue(foodId))
  });
  
  store.updateFoodAmount(player.player, foodId, -1);
  
  // Ejecutar transacción en background
  try {
    const txHash = await executeTransaction(calls);
    
    // Éxito - mantener estado optimista
    toast.success('Beast fed successfully!');
    
    // Sincronizar con blockchain después
    setTimeout(() => {
      fetchLatestStatus(true);
      silentRefetchFoods();
    }, 2000);
    
    return { success: true, txHash };
    
  } catch (error) {
    // Rollback completo
    store.setRealTimeStatus(originalStats);
    store.setFoods(originalFoods);
    
    toast.error('Failed to feed beast');
    return { success: false, error };
  }
}, [/* deps */]);
```

## 📈 Métricas de Éxito

### KPIs a Medir
1. **Tiempo de respuesta UI**: < 100ms (de 5-10s actual)
2. **Tasa de éxito de transacciones**: > 95%
3. **Satisfacción del usuario**: Reducir quejas de lentitud
4. **Retención diaria**: Incrementar de 10-15% a 20-25%
5. **Acciones por sesión**: Aumento esperado del 30%

### Monitoreo Post-Implementación
- Logs de rollbacks frecuentes
- Tiempo promedio de confirmación blockchain
- Tasa de reintentos
- Feedback de usuarios

## ⚠️ Consideraciones y Riesgos

### Riesgos Identificados
1. **Desincronización**: Estado local vs blockchain
   - **Mitigación**: Sync periódico cada 30s
   
2. **Rollbacks confusos**: Usuario ve cambio y luego revierte
   - **Mitigación**: Indicador visual sutil durante sync
   
3. **Acciones múltiples**: Conflictos entre updates optimistas
   - **Mitigación**: Cola de transacciones ordenada

### Edge Cases a Considerar
- Pérdida de conexión durante transacción
- Usuario cierra app antes de confirmación
- Múltiples pestañas abiertas
- Transacciones que dependen de estado previo

## 📊 Valores Exactos del Contrato para Optimistic Updates

### Constantes del Sistema (constants.cairo)
```cairo
// Valores máximos de stats
MAX_HUNGER: 100
MAX_ENERGY: 100
MAX_HAPPINESS: 100
MAX_HYGIENE: 100

// Valores de actualización por acción
XS_UPDATE_POINTS: 2  // Extra Small
S_UPDATE_POINTS: 4   // Small
M_UPDATE_POINTS: 6   // Medium
L_UPDATE_POINTS: 8   // Large
XL_UPDATE_POINTS: 10 // Extra Large
```

### 🍔 Feed Transaction
**Función del contrato**: `fn feed(food_id: u8)`

#### Incrementos de Stats:
Los valores dependen de si la comida es favorita del beast o no:

**Comida Normal**:
- `hunger`: +4
- `happiness`: +4
- `energy`: +2

**Comida Favorita**:
- `hunger`: +8
- `happiness`: +4
- `energy`: +2

#### Comidas Favoritas por Beast Type:
- **Light Beast (type 1)**: Cherry (3), Fish (10), Corn (15)
- **Magic Beast (type 2)**: Chicken (8), Apple (1), Cheese (7)
- **Shadow Beast (type 3)**: Beef (13), Blueberry (12), Potato (16)

#### Implementación Optimistic:
```typescript
// client/src/dojo/hooks/useFeedBeast.tsx
const applyOptimisticFeed = (foodId: number, beastType: number, currentStats: number[]) => {
  const isFavorite = BEAST_FAVORITE_FOODS[beastType]?.includes(foodId);
  
  const increments = isFavorite 
    ? { hunger: 8, happiness: 4, energy: 2 }
    : { hunger: 4, happiness: 4, energy: 2 };
  
  return {
    hunger: Math.min(100, (currentStats[0] || 0) + increments.hunger),
    happiness: Math.min(100, (currentStats[1] || 0) + increments.happiness),
    energy: Math.min(100, (currentStats[2] || 0) + increments.energy),
    hygiene: currentStats[3] // No change
  };
};
```

### 🧹 Clean Transaction
**Función del contrato**: `fn clean()`

#### Incrementos de Stats:
- `hygiene`: +10 (XL_UPDATE_POINTS)
- `happiness`: +2 (XS_UPDATE_POINTS)
- `hunger`: Sin cambio
- `energy`: Sin cambio

#### Implementación Optimistic:
```typescript
// client/src/dojo/hooks/useCleanBeast.tsx
const applyOptimisticClean = (currentStats: number[]) => {
  return {
    hunger: currentStats[0],     // No change
    happiness: Math.min(100, (currentStats[1] || 0) + 2),
    energy: currentStats[2],      // No change
    hygiene: Math.min(100, (currentStats[3] || 0) + 10)
  };
};
```

### 😴 Sleep/Awake Transaction
**Función del contrato**: `fn sleep()` / `fn awake()`

#### Cambios de Estado:
- Solo cambia el flag `is_awake` (boolean)
- No modifica stats directamente
- Los stats se recalculan basados en tiempo mientras duerme/despierto

#### Implementación Optimistic:
```typescript
// client/src/dojo/hooks/useSleepAwake.tsx
const applyOptimisticSleepAwake = (currentIsAwake: boolean) => {
  // Solo togglea el estado awake
  return {
    isAwake: !currentIsAwake
  };
};
```

### 🎮 Play Transaction
**Función del contrato**: `fn play()`

#### Cambios de Stats:
- `happiness`: +10 (XL_UPDATE_POINTS)
- `energy`: -8 (L_UPDATE_POINTS) con validación de no negativos
- `hunger`: -4 (S_UPDATE_POINTS) con validación de no negativos

#### Implementación Optimistic:
```typescript
// client/src/dojo/hooks/usePlayBeast.tsx
const applyOptimisticPlay = (currentStats: number[]) => {
  return {
    hunger: Math.max(0, (currentStats[0] || 0) - 4),
    happiness: Math.min(100, (currentStats[1] || 0) + 10),
    energy: Math.max(0, (currentStats[2] || 0) - 8),
    hygiene: currentStats[3] // No change
  };
};
```

### 🤚 Pet Transaction
**Función del contrato**: `fn pet()`

#### Cambios de Stats:
- `energy`: +4 (S_UPDATE_POINTS)
- `happiness`: +4 (S_UPDATE_POINTS)
- `hunger`: Sin cambio
- `hygiene`: Sin cambio

#### Implementación Optimistic:
```typescript
// client/src/dojo/hooks/usePetBeast.tsx
const applyOptimisticPet = (currentStats: number[]) => {
  return {
    hunger: currentStats[0],     // No change
    happiness: Math.min(100, (currentStats[1] || 0) + 4),
    energy: Math.min(100, (currentStats[2] || 0) + 4),
    hygiene: currentStats[3]     // No change
  };
};
```

### 📝 Mapeo de Stats en Store
El store de Zustand maneja los stats en un array `realTimeStatus`:
- `realTimeStatus[0]`: hunger (0-100)
- `realTimeStatus[1]`: happiness (0-100)
- `realTimeStatus[2]`: energy (0-100)
- `realTimeStatus[3]`: hygiene (0-100)
- `realTimeStatus[4]`: is_awake (boolean como 0/1)

### ⚠️ Consideraciones Importantes

1. **Validación de Límites**: Todos los stats deben estar entre 0-100
2. **Beast Type**: Necesario para calcular bonuses de comida favorita
3. **Estado Alive**: Solo aplicar updates si `is_alive = true`
4. **Sincronización**: Después de aplicar optimistic update, sincronizar con blockchain

## 🚀 Timeline Estimado

| Fase | Duración | Dependencias |
|------|----------|-------------|
| Fase 1: Infraestructura | 2-3 horas | Ninguna |
| Fase 2: Feed | 2-3 horas | Fase 1 |
| Fase 3: Clean | 2 horas | Fase 1 |
| Fase 4: Sleep | 2 horas | Fase 1 |
| Fase 5: Polish | 2-3 horas | Fases 2-4 |
| **Total** | **10-13 horas** | |

## 📝 Checklist de Implementación

### Pre-implementación
- [ ] Backup del código actual
- [ ] Ambiente de testing preparado
- [ ] Métricas baseline capturadas

### Durante implementación
- [ ] Fase 1: Infraestructura base
  - [ ] useOptimisticTransaction creado
  - [ ] Store methods añadidos
  - [ ] Helpers utilities
- [ ] Fase 2: Feed optimistic
  - [ ] Stats update inmediato
  - [ ] Rollback funcional
  - [ ] Tests pasando
- [ ] Fase 3: Clean optimistic
  - [ ] Hygiene update inmediato
  - [ ] Animación sincronizada
- [ ] Fase 4: Sleep optimistic
  - [ ] Estado cambia inmediato
  - [ ] Navegación correcta
- [ ] Fase 5: Polish
  - [ ] Indicadores visuales
  - [ ] Error handling robusto
  - [ ] Performance verificado

### Post-implementación
- [ ] Testing con usuarios beta
- [ ] Monitoreo de métricas
- [ ] Documentación actualizada
- [ ] CLAUDE.md actualizado

## 🔄 Mantenimiento Futuro

### Próximos Pasos
1. Evaluar implementación después de 2 semanas
2. Ajustar timeouts según métricas reales
3. Considerar cache más agresivo si es necesario
4. Explorar WebSockets para updates real-time

### Posibles Mejoras
- Sistema de retry más inteligente
- Predicción de latencia por hora del día
- Modo offline con sync posterior
- Compresión de estado para localStorage

---

*Documento creado: 2025-08-18*
*Última actualización: 2025-08-18*
*Autor: ByteBeasts Team*
*Para uso con Claude Code en futuras sesiones*