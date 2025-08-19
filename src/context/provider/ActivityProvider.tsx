import React, { createContext, useContext, useState, useCallback } from 'react';
import type { UserActivity } from '@/api/activityService';
import { fetchUserActivities } from '@/api/activityService';

interface ActivityState {
    activities: UserActivity[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    cursor: string | null;
}

interface ActivityContextType extends ActivityState {
    loadActivities: (userId: string, opts?: { limit?: number; cursor?: string | null }) => Promise<void>;
    clearActivities: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activities, setActivities] = useState<UserActivity[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);

    const loadActivities = useCallback(
        async (userId: string, opts?: { limit?: number; cursor?: string | null }) => {
            if (loading || !hasMore) return;
            setLoading(true);
            setError(null);
            try {
                const params = {
                    userId,
                    cursor: opts?.cursor ?? undefined,
                    limit: opts?.limit ?? 20,
                };
                const res = await fetchUserActivities(params);
                setActivities(prev => {
                    const existingIds = new Set(prev.map(a => a.id));
                    const newActivities = res.data.filter(a => !existingIds.has(a.id));
                    return [...prev, ...newActivities];
                });
                setHasMore(res.data.length === (opts?.limit ?? 20));
            } catch (err: any) {
                setError(err?.message || 'Aktivite kaydı alınamadı');
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const clearActivities = useCallback(() => {
        setActivities([]);
        setHasMore(true);
        setError(null);
    }, []);

    const value: ActivityContextType = {
        activities,
        loading,
        error,
        hasMore,
        cursor: null, // cursor state kaldırıldı
        loadActivities,
        clearActivities,
    };

    return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
};

export const useActivity = (): ActivityContextType => {
    const ctx = useContext(ActivityContext);
    if (!ctx) throw new Error('useActivity must be used within an ActivityProvider');
    return ctx;
};