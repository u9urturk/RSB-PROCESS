import { useEffect, useState } from 'react';
import { FaUserShield } from 'react-icons/fa';
import { MdOutlineAdminPanelSettings } from 'react-icons/md';
import Card from '../components/Card';
import Select from '../components/Select';
import InfoBalloon from '../components/InfoBalloon';
import PageTransition from '../components/PageTransition';
import Modal from '@/components/Modal';

import { profileService } from '@/api/profileService';
import { roleService } from '@/api/roleService';
import { useNavigation } from '@/context/provider/NavigationProvider';

export type RoleListItem = {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
};



export type UserListItem = {
    id: string,
    username: string,
    name: string | null,
    surname: string | null,
    email: string | null,
    avatarUrl: string | null,
    createdAt: string,
    updatedAt: string,
    roles: string[],
    loading: boolean;

}


export default function UserManagementPage() {

    const [users, setUsers] = useState<UserListItem[]>([]);
    const [roles, setRoles] = useState<RoleListItem[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
    const [roleChangeLoading, setRoleChangeLoading] = useState<boolean>(false);
    const [roleFilter, setRoleFilter] = useState<string>('ROLLER');
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const { setActivePath } = useNavigation();



    useEffect(() => {
        setActivePath('/dashboard/users');

    }, [setActivePath]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setUsers(prev => prev.map(u => ({ ...u, loading: true })));
                const fetchedUsers = await profileService.getUserWithRoles();
                const userArray = Array.isArray(fetchedUsers) ? fetchedUsers : [fetchedUsers];
                setUsers(userArray.map((u: any) => ({ ...u, loading: false })));
            } catch (e: any) {
                console.error('Error fetching users:', e);
            }
        };

        const fetchRoles = async () => {
            try {
                const response = await roleService.getRoles();
                if (response && Array.isArray(response)) {
                    setRoles(response);
                }

            } catch (e: any) {
                console.error('Error fetching roles:', e);
            }
        };

        fetchUsers();
        fetchRoles();
    }, []);


    const handleSelectUser = (user: UserListItem) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    // console.log('Selected User:', selectedUser);
    // console.log('Roles:', roles);

    const handleRoleChange = async (userId: string, newRole: string) => {

        if (!selectedUser) return <InfoBalloon show={true} text="Kullanıcı seçilmedi." className="bg-white shadow p-4 rounded animate-fade-in" />;
        const oldRoleId = roles.find(role => role.name === selectedUser.roles[0])?.id;
        if (!oldRoleId) return <InfoBalloon show={true} text="Eski rol bulunamadı." className="bg-white shadow p-4 rounded animate-fade-in" />;
        if (newRole === selectedUser.roles[0]) return <InfoBalloon show={true} text="Seçilen rol mevcut.Lütfen yeni bir rol seçin." className="bg-white shadow p-4 rounded animate-fade-in" />;
        const newRoleId = roles.find(role => role.name === newRole)?.id;
        if (!newRoleId) return <InfoBalloon show={true} text="Yeni rol bulunamadı." className="bg-white shadow p-4 rounded animate-fade-in" />;
        setRoleChangeLoading(true);
        console.log('Role changed:', userId, oldRoleId, newRoleId);

        await roleService.updateUserRole(userId, oldRoleId, newRoleId)
        setTimeout(() => {
            setUsers((prev) =>
                prev.map((u) =>
                    u.id === userId ? { ...u, roles: [newRole, ...u.roles.filter(r => r !== newRole)] } : u
                )
            );
            setSelectedUser((prev) =>
                prev ? { ...prev, roles: [newRole, ...prev.roles.filter(r => r !== newRole)] } : prev
            );
            setRoleChangeLoading(false);
        }, 600);
    };


    const filteredUsers = roleFilter === 'ROLLER' ? users : users.filter(u => u.roles[0] === roleFilter);

    return (
        <PageTransition>
            <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-full mx-auto">
                    <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 animate-fade-in">
                        <MdOutlineAdminPanelSettings size={28} className="text-blue-600" />
                        Kullanıcı Yönetimi
                    </h1>
                    <div className="mb-4 flex gap-4 items-center">
                        <span className="font-semibold">Rol Filtresi:</span>
                        <Select
                            options={roles.map(role => ({ value: role.id, label: role.name }))}
                            defaultValue={roleFilter}
                            onChange={val => setRoleFilter(val as string)}
                            placeholder="Rol seç"
                        />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        {users.some(u => u.loading) ? (
                            <div className="col-span-3 flex items-center justify-center h-32 animate-pulse">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <InfoBalloon show={true} text="Seçilen role ait kullanıcı bulunamadı." className="bg-white shadow p-4 rounded animate-fade-in col-span-3" />
                        ) : (
                            filteredUsers.map((user) => (
                                <div key={user.id} onClick={() => handleSelectUser(user)} style={{ cursor: 'pointer' }}>
                                    <Card
                                        value={user.name ?? ''}
                                        title={user.email ?? ''}
                                        icon={<FaUserShield className="text-blue-500" />}
                                        type="str"
                                        className='w-64 h-48'
                                    />
                                    <div className="mt-2 flex gap-2">
                                        <span className={`px-2 py-1 rounded text-xs ${user.roles[0] === 'admin' ? 'bg-blue-100 text-blue-700' : user.roles[0] === 'manager' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{user.roles[0]}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
                {/* Modal */}
                {modalOpen && selectedUser && (
                    <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                        <div className="p-6 space-y-4 w-[350px] animate-fade-in">
                            <div className="flex items-center gap-3">
                                <FaUserShield className="text-blue-500" />
                                <div>
                                    <div className="font-medium text-lg">{selectedUser.name ?? ''}</div>
                                    <div className="text-xs text-gray-500">{selectedUser.email ?? ''}</div>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                <span className={`px-2 py-1 rounded text-xs ${selectedUser.roles[0] === 'ADMIN' ? 'bg-blue-100 text-blue-700' : selectedUser.roles[0] === 'MANAGER' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{selectedUser.roles[0]}</span>
                            </div>
                            <div className="text-xs text-gray-400">Katılım: {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                            <div className="flex gap-2 items-center mt-2">
                                <Select
                                    options={roles.map(role => ({ value: role.id, label: role.name }))}
                                    defaultValue={selectedUser.roles[0]}
                                    onChange={(val) => handleRoleChange(selectedUser.id, val as string)}
                                    placeholder="Rol seç"
                                />

                            </div>
                            {roleChangeLoading && (
                                <div className="flex items-center gap-2 mt-2 animate-pulse">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                    <span className="text-xs text-blue-500">Rol güncelleniyor...</span>
                                </div>
                            )}
                        </div>
                    </Modal>
                )}
            </div>
        </PageTransition>
    );
}
