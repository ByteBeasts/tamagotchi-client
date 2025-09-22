import { apiClient } from './config';
import type { Tournament } from '../../types/api.types';

export const tournamentsService = {
    // Get all tournaments
    async getAll(): Promise<Tournament[]> {
        const { data } = await apiClient.get<Tournament[]>('/tournaments');
        return data;
    }
};