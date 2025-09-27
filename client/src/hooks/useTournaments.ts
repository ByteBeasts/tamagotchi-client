import { useState, useEffect, useCallback } from 'react';
import { tournamentsService } from '../services/api/tournaments.service';
import { Tournament, TournamentStatus } from '../types/api.types';

interface UseTournamentsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
}

export function useTournaments(options?: UseTournamentsOptions) {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [activeTournaments, setActiveTournaments] = useState<Tournament[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const { autoRefresh = false, refreshInterval = 300000 } = options || {};

    const fetchTournaments = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await tournamentsService.getAll();
            setTournaments(data);

            const active = data.filter(
                (tournament) =>
                    tournament.status === TournamentStatus.ACTIVE &&
                    tournament.isActive === true
            );
            setActiveTournaments(active);
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch tournaments');
            setError(error);
            console.error('Error fetching tournaments:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTournaments();

        if (autoRefresh && refreshInterval > 0) {
            const interval = setInterval(fetchTournaments, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [fetchTournaments, autoRefresh, refreshInterval]);

    const getTournamentsByType = useCallback(
        (type: string) => {
            return activeTournaments.filter(
                (tournament) => tournament.config?.tournamentType === type
            );
        },
        [activeTournaments]
    );

    return {
        tournaments,
        activeTournaments,
        isLoading,
        error,
        refetch: fetchTournaments,
        getTournamentsByType,
    };
}