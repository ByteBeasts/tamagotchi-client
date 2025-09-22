# 📚 Guía de Integración API - ByteBeast Backend

## 🔧 Configuración Inicial del Cliente

### Instalación de Dependencias
```bash
# Axios para peticiones HTTP
npm install axios
# O si prefieres fetch nativo, no necesitas instalar nada adicional

# Para manejo de tipos (opcional pero recomendado)
npm install -D @types/node
```

### Configuración Base del Cliente API

```typescript
// src/services/api/config.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiConfig = {
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

// Cliente Axios (opción recomendada)
import axios from 'axios';

export const apiClient = axios.create(apiConfig);

// Interceptor para manejo de errores global
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);
```

## 📋 Tipos TypeScript

```typescript
// src/types/api.types.ts

// User Types
export interface User {
  address: string;
  worldCoinAddress?: string | null;
  totalCoins: number;
  totalGems: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  address: string;
  worldCoinAddress?: string;
  totalCoins?: number;
  totalGems?: number;
}

export interface UpdateUserDto {
  worldCoinAddress?: string;
  totalCoins?: number;
  totalGems?: number;
}

// Tournament Types
export enum TournamentStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
  CANCELLED = 'CANCELLED'
}

export interface Tournament {
  id: string;
  name: string;
  description?: string | null;
  status: TournamentStatus;
  startDate: string;
  endDate: string;
  config?: any;
  prizes: any;
  entryFee?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTournamentDto {
  name: string;
  description?: string;
  status?: TournamentStatus;
  startDate: string;
  endDate: string;
  config?: any;
  prizes: any;
  entryFee?: number;
  isActive?: boolean;
}

export interface UpdateTournamentDto extends Partial<CreateTournamentDto> {}

// System Log Types
export interface SystemLog {
  logId: string;
  userAddress?: string | null;
  action: string;
  entityType?: string | null;
  description: string;
  metadata?: any;
  createdAt: string;
}

export interface CreateSystemLogDto {
  userAddress?: string;
  action: string;
  entityType?: string;
  description: string;
  metadata?: any;
}
```

## 🔌 Servicios API

### User Service

```typescript
// src/services/api/users.service.ts
import { apiClient } from './config';
import type { User, CreateUserDto, UpdateUserDto } from '@/types/api.types';

export const usersService = {
  // Obtener todos los usuarios
  async getAll(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  },

  // Obtener usuario por dirección
  async getByAddress(address: string): Promise<User> {
    const { data } = await apiClient.get<User>(`/users/${address}`);
    return data;
  },

  // Crear nuevo usuario
  async create(userData: CreateUserDto): Promise<User> {
    const { data } = await apiClient.post<User>('/users', userData);
    return data;
  },

  // Actualizar usuario
  async update(address: string, userData: UpdateUserDto): Promise<User> {
    const { data } = await apiClient.put<User>(`/users/${address}`, userData);
    return data;
  },

  // Eliminar usuario
  async delete(address: string): Promise<void> {
    await apiClient.delete(`/users/${address}`);
  }
};
```

### Tournament Service

```typescript
// src/services/api/tournaments.service.ts
import { apiClient } from './config';
import type { Tournament, CreateTournamentDto, UpdateTournamentDto } from '@/types/api.types';

export const tournamentsService = {
  // Obtener todos los torneos
  async getAll(): Promise<Tournament[]> {
    const { data } = await apiClient.get<Tournament[]>('/tournaments');
    return data;
  },

  // Obtener torneo por ID
  async getById(id: string): Promise<Tournament> {
    const { data } = await apiClient.get<Tournament>(`/tournaments/${id}`);
    return data;
  },

  // Crear nuevo torneo
  async create(tournamentData: CreateTournamentDto): Promise<Tournament> {
    const { data } = await apiClient.post<Tournament>('/tournaments', tournamentData);
    return data;
  },

  // Actualizar torneo
  async update(id: string, tournamentData: UpdateTournamentDto): Promise<Tournament> {
    const { data } = await apiClient.put<Tournament>(`/tournaments/${id}`, tournamentData);
    return data;
  },

  // Eliminar torneo
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tournaments/${id}`);
  }
};
```

### System Logs Service

```typescript
// src/services/api/system-logs.service.ts
import { apiClient } from './config';
import type { SystemLog, CreateSystemLogDto } from '@/types/api.types';

export const systemLogsService = {
  // Obtener todos los logs
  async getAll(): Promise<SystemLog[]> {
    const { data } = await apiClient.get<SystemLog[]>('/system-logs');
    return data;
  },

  // Obtener log por ID
  async getById(logId: string): Promise<SystemLog> {
    const { data } = await apiClient.get<SystemLog>(`/system-logs/${logId}`);
    return data;
  },

  // Crear nuevo log
  async create(logData: CreateSystemLogDto): Promise<SystemLog> {
    const { data } = await apiClient.post<SystemLog>('/system-logs', logData);
    return data;
  },

  // Eliminar log
  async delete(logId: string): Promise<void> {
    await apiClient.delete(`/system-logs/${logId}`);
  }
};
```

## 🎯 Hooks React Personalizados

### useUser Hook

```typescript
// src/hooks/useUser.ts
import { useState, useEffect } from 'react';
import { usersService } from '@/services/api/users.service';
import type { User } from '@/types/api.types';

export const useUser = (address: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const data = await usersService.getByAddress(address);
        setUser(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchUser();
    }
  }, [address]);

  const updateUser = async (updates: Partial<User>) => {
    try {
      const updated = await usersService.update(address, updates);
      setUser(updated);
      return updated;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return { user, loading, error, updateUser };
};
```

### useTournaments Hook

```typescript
// src/hooks/useTournaments.ts
import { useState, useEffect } from 'react';
import { tournamentsService } from '@/services/api/tournaments.service';
import type { Tournament, TournamentStatus } from '@/types/api.types';

export const useTournaments = (filterStatus?: TournamentStatus) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const data = await tournamentsService.getAll();

        // Filtrar por estado si se proporciona
        const filtered = filterStatus
          ? data.filter(t => t.status === filterStatus)
          : data;

        setTournaments(filtered);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [filterStatus]);

  return { tournaments, loading, error };
};
```

## 🔐 Manejo de Errores

```typescript
// src/utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: any
  ) {
    super(message);
  }
}

export const handleApiError = (error: any): string => {
  if (error.response) {
    // Error de respuesta del servidor
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return data.message || 'Datos inválidos';
      case 404:
        return 'Recurso no encontrado';
      case 409:
        return 'El recurso ya existe';
      case 500:
        return 'Error del servidor';
      default:
        return data.message || 'Error desconocido';
    }
  } else if (error.request) {
    // No hubo respuesta del servidor
    return 'No se pudo conectar con el servidor';
  } else {
    // Error de configuración
    return error.message || 'Error de configuración';
  }
};
```

## 📝 Variables de Entorno

Crear archivo `.env` en la raíz del proyecto Vite:

```env
# .env
VITE_API_URL=http://localhost:3000
```

## 🚀 Resumen de Endpoints

### Users
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/users` | Listar todos los usuarios |
| GET | `/users/:address` | Obtener usuario por dirección |
| POST | `/users` | Crear nuevo usuario |
| PUT | `/users/:address` | Actualizar usuario |
| DELETE | `/users/:address` | Eliminar usuario |

### Tournaments
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/tournaments` | Listar todos los torneos |
| GET | `/tournaments/:id` | Obtener torneo por ID |
| POST | `/tournaments` | Crear nuevo torneo |
| PUT | `/tournaments/:id` | Actualizar torneo |
| DELETE | `/tournaments/:id` | Eliminar torneo |

### System Logs
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/system-logs` | Listar todos los logs |
| GET | `/system-logs/:logId` | Obtener log por ID |
| POST | `/system-logs` | Crear nuevo log |
| DELETE | `/system-logs/:logId` | Eliminar log |

## 📊 Estructura de Datos JSON

### Ejemplo de Config para Tournament
```json
{
  "config": {
    "maxParticipants": 100,
    "minLevel": 5,
    "gameMode": "battle-royale",
    "rules": [
      "No cheating",
      "Fair play only",
      "Must have ByteBeast NFT"
    ],
    "requirements": {
      "minCoins": 500,
      "minGems": 10
    }
  }
}
```

### Ejemplo de Prizes para Tournament
```json
{
  "prizes": {
    "first": {
      "amount": 1000,
      "title": "Champion",
      "description": "Gold trophy + 1000 coins",
      "nftReward": "legendary_beast"
    },
    "second": {
      "amount": 500,
      "title": "Runner-up",
      "description": "Silver trophy + 500 coins"
    },
    "third": {
      "amount": 250,
      "title": "Bronze",
      "description": "Bronze trophy + 250 coins"
    }
  }
}
```

### Ejemplo de Metadata para SystemLog
```json
{
  "metadata": {
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "transactionHash": "0x123...",
    "previousValue": 100,
    "newValue": 200,
    "changeReason": "Tournament reward"
  }
}
```

## 🛠️ Tips para el Desarrollo

1. **Paginación**: Aunque no está implementada aún en el backend, prepara tu código para manejarla:
```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

2. **Cache de Datos**: Usa React Query o SWR para cachear respuestas:
```bash
npm install @tanstack/react-query
```

3. **Validación**: Valida los datos antes de enviarlos:
```typescript
const validateAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};
```

4. **Websockets**: Para actualizaciones en tiempo real, considera Socket.io:
```typescript
// Preparación para futuras actualizaciones en tiempo real
import { io } from 'socket.io-client';

const socket = io(API_BASE_URL);

socket.on('tournament:update', (tournament) => {
  // Actualizar estado del torneo
});
```

5. **Testing**: Usa MSW para mockear las respuestas del API:
```bash
npm install -D msw
```

Esta guía proporciona todo lo necesario para integrar el API de ByteBeast en tu aplicación Vite + React. Recuerda siempre manejar los errores apropiadamente y considerar estados de carga para mejorar la UX.