import axios from 'axios';

export interface UserActivity {
    id: string;
    userId: string;
    action: string;
    context: Record<string, any>;
    ip: string | null;
    userAgent: string | null;
    createdAt: string;
}

export interface UserActivityResponse {
    success: boolean;
    data: UserActivity[];
    timestamp: string;
}

export interface FetchUserActivitiesParams {
    userId: string;
    cursor?: string;
    limit?: number;
}

export async function fetchUserActivities({ userId, cursor, limit = 20 }: FetchUserActivitiesParams): Promise<UserActivityResponse> {
    const params: Record<string, any> = {};
    if (cursor) params.cursor = cursor;
    if (limit) params.limit = limit;
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    const response = await axios.get<UserActivityResponse>(`${baseUrl}/api/v1/user-activity/${userId}`, { params });
    return response.data;
}
