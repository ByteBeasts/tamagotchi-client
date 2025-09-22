import { apiClient } from './config';
import type { User, CreateUserDto, UpdateUserDto } from '../../types/api.types';

export const usersService = {
    // Create new user
    async create(userData: CreateUserDto): Promise<User> {
        const { data } = await apiClient.post<User>('/users', userData);
        return data;
    },

    // Update user
    async update(address: string, userData: UpdateUserDto): Promise<User> {
        const { data } = await apiClient.put<User>(`/users/${address}`, userData);
        return data;
    }
};