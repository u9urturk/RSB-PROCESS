import { apiGet, apiPut, apiPost, apiDelete, apiPatch } from './httpClient';

export interface Role {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

export interface RoleListResponse {
    success: boolean;
    data: Role[];
    timestamp: string;
}

export const roleService = {
    getRoles: (): Promise<RoleListResponse> => apiGet('/roles'),
    createRole: (data: Partial<Role>) => apiPost('/roles', data),
    updateRole: (id: string, data: Partial<Role>) => apiPut(`/roles/${id}`, data),
    deleteRole: (id: string) => apiDelete(`/roles/${id}`),
    updateUserRole: (userId: string, oldRoleId: string, newRoleId: string) =>
        apiPatch(`/roles/${oldRoleId}/users/${userId}`, { newRoleId })
};
