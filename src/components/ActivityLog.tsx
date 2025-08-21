import React, { useEffect, JSX } from 'react';
import { useActivity } from '@/context/provider/ActivityProvider';
import { useAuth } from '@/context/provider/AuthProvider';
import { LogOut, User, Info, KeyRound } from 'lucide-react';

const ActivityLog: React.FC = () => {
    const { activities, loading, error, hasMore, loadActivities } = useActivity();
    const { user } = useAuth();

    // Basit cursor tabanlı akış: ilk istek cursorsuz, sonrakiler son id ile
    useEffect(() => {
        if (user?.userId) {
            loadActivities(user.userId, { limit: 10 });
        }
    }, [user?.userId, loadActivities]);

    // Scroll ile yeni veri çekme: cursor olarak son id kullanılır
    useEffect(() => {
        const handleScroll = () => {
            if (loading || !hasMore || !activities.length) return;
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const fullHeight = document.body.offsetHeight;
            if (scrollY + viewportHeight >= fullHeight - 100) {
                const lastId = activities[activities.length - 1]?.id;
                if (user?.userId && lastId) {
                    loadActivities(user.userId, { limit: 5, cursor: lastId });
                }
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [user?.userId, loadActivities, loading, hasMore, activities]);

    const actionMap: Record<string, { label: string; icon: JSX.Element }> = {
        SESSION_REVOKE: { label: 'Oturum Kapatıldı', icon: <LogOut size={18} className="text-orange-500" /> },
        LOGIN: { label: 'Giriş Yapıldı', icon: <KeyRound size={18} className="text-green-500" /> },
        LOGOUT: { label: 'Çıkış Yapıldı', icon: <LogOut size={18} className="text-gray-500" /> },
        PROFILE_UPDATE: { label: 'Profil Güncellendi', icon: <User size={18} className="text-blue-500" /> },
        DEFAULT: { label: 'Diğer İşlem', icon: <Info size={18} className="text-gray-400" /> },
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-2 py-4 sm:p-6 max-w-[100%] mx-auto w-full">
            <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-700 flex items-center gap-2">
                <Info size={20} className="text-orange-400 shrink-0" />
                <span className="truncate">Kullanıcı Aktivite Kaydı</span>
            </h3>
            {loading && <div className="text-xs text-gray-400">Yükleniyor...</div>}
            {!loading && !activities.length && <div className="text-xs text-gray-500">Hiç aktivite bulunamadı.</div>}
            <ul
                className="flex flex-col gap-3 w-full"
                style={{ minHeight: 200 }}
            >
                {activities.map(activity => {
                    const actionInfo = actionMap[activity.action] || actionMap.DEFAULT;
                    return (
                        <li
                            key={activity.id}
                            className="border border-gray-200 rounded-xl p-3 sm:p-4 flex flex-col gap-2 bg-gradient-to-br from-orange-50 to-white shadow-sm transition hover:shadow-md active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {actionInfo.icon}
                                <span className="font-semibold text-gray-800 text-sm sm:text-base">{actionInfo.label}</span>
                                <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">{new Date(activity.createdAt).toLocaleString('tr-TR')}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Oturum ID:</span>
                                    <span className="ml-1 text-gray-700 break-all">{activity.context?.sessionId || '-'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Kullanıcı ID:</span>
                                    <span className="ml-1 text-gray-700 break-all">{activity.userId}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">IP Adresi:</span>
                                    <span className="ml-1 text-gray-700 break-all">{activity.ip || '-'}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-medium text-gray-600">Tarayıcı/İstemci:</span>
                                    <span className="ml-1 text-gray-700 break-all">{activity.userAgent || '-'}</span>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ActivityLog;