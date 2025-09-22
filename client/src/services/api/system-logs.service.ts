import { apiClient } from './config';
import type { SystemLog, CreateSystemLogDto } from '@/types/api.types';

export const systemLogsService = {
    // Create new log
    async create(logData: CreateSystemLogDto): Promise<SystemLog> {
        const { data } = await apiClient.post<SystemLog>('/system-logs', logData);
        return data;
    }
};