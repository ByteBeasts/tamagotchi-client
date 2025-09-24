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

// Response types for API calls
export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
}

// Tournament Config type example
export interface TournamentConfig {
    maxParticipants?: number;
    minLevel?: number;
    gameMode?: string;
    rules?: string[];
    requirements?: {
        minCoins?: number;
        minGems?: number;
    };
}

// Tournament Prizes type example
export interface TournamentPrizes {
    first?: {
        amount: number;
        title: string;
        description: string;
        nftReward?: string;
    };
    second?: {
        amount: number;
        title: string;
        description: string;
        nftReward?: string;
    };
    third?: {
        amount: number;
        title: string;
        description: string;
        nftReward?: string;
    };
}

// System Log Metadata type example
export interface SystemLogMetadata {
    ipAddress?: string;
    userAgent?: string;
    timestamp?: string;
    transactionHash?: string;
    previousValue?: any;
    newValue?: any;
    changeReason?: string;
}