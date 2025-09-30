import React, { useEffect, useState } from 'react';
import { FaRegRectangleList, FaUserClock } from 'react-icons/fa6';
import { BsBank } from 'react-icons/bs';
import { MdOutlineRestaurantMenu } from 'react-icons/md';
import OrderSummary from '../components/OrderSummary';
import TopSellingItems from '../components/TopSellingItems';
import CustomerMap from '../components/CustomerMap';
import TotalRevenueChart from '../components/TotalRevenueChart';
import OverviewChart from '../components/OverviewChart';
import { useNavigation } from '../context/provider/NavigationProvider';
import {
    DashboardCard,
    TopSellingItem,
    CustomerMapData,
    DashboardOverviewData,
    DashboardRevenueData
} from '../types';

const dashboardCards: DashboardCard[] = [
    { title: "Toplam Sipariş", value: 42, type: "str", icon: <FaRegRectangleList size={20} /> },
    { title: "Toplam Kazanç", value: 3200, type: "price", icon: <BsBank size={20} /> },
    { title: "Ortalama Süre", value: 25, type: "str", icon: <FaUserClock size={20} /> },
    { title: "Aktif Menü", value: 68, type: "str", icon: <MdOutlineRestaurantMenu size={20} /> },
];

const topSellingItems: TopSellingItem[] = [
    { id: "1", name: "Tavuk Döner", count: 142, percentage: 23 },
    { id: "2", name: "Lahmacun", count: 124, percentage: 20 },
    { id: "3", name: "Adana Kebap", count: 98, percentage: 16 },
    { id: "4", name: "Pide", count: 86, percentage: 14 },
    { id: "5", name: "Künefe", count: 74, percentage: 12 },
];

const customerLocations: CustomerMapData[] = [
    {
        id: "1",
        name: "Ahmet Yılmaz",
        location: { lat: 41.0082, lng: 28.9784 },
        address: "Kadıköy, İstanbul",
        orderStatus: "preparing",
        orderTime: "10 dakika önce",
        deliveryTime: "30 dakika içinde"
    },
    // ... diğer müşteri konumları
];

const overviewData: DashboardOverviewData[] = [
    { name: "Nakit", value: 30, color: "#10B981" },
    { name: "Kart", value: 55, color: "#3B82F6" },
    { name: "Online", value: 15, color: "#F97316" },
];

const revenueData: DashboardRevenueData[] = [
    { name: "Pzt", revenue: 1200, orders: 45, date: "2023-07-10" },
    { name: "Sal", revenue: 1800, orders: 52, date: "2023-07-11" },
    { name: "Çar", revenue: 1400, orders: 48, date: "2023-07-12" },
    { name: "Per", revenue: 2200, orders: 60, date: "2023-07-13" },
    { name: "Cum", revenue: 2800, orders: 75, date: "2023-07-14" },
    { name: "Cmt", revenue: 3200, orders: 82, date: "2023-07-15" },
    { name: "Paz", revenue: 2600, orders: 68, date: "2023-07-16" },
];

const Dashboard: React.FC = () => {
    const { setActivePath } = useNavigation();
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        setActivePath('/dashboard');

        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, [setActivePath]);

    if (isLoading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
                {/* Loading Hero */}
                <div className='bg-gradient-to-br from-orange-500 to-red-600 p-6 sm:p-8 rounded-b-3xl shadow-2xl'>
                    <div className='max-w-7xl mx-auto'>
                        <div className='animate-pulse'>
                            <div className='h-8 bg-white/20 rounded-lg w-1/3 mb-2'></div>
                            <div className='h-4 bg-white/20 rounded-lg w-1/2'></div>
                        </div>
                    </div>
                </div>

                {/* Loading Content */}
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                    <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8'>
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className='bg-white rounded-2xl p-4 sm:p-6 shadow-lg animate-pulse'>
                                <div className='flex items-center justify-between mb-3'>
                                    <div className='w-10 h-10 bg-gray-200 rounded-xl'></div>
                                    <div className='text-right'>
                                        <div className='h-3 bg-gray-200 rounded w-16 mb-2'></div>
                                        <div className='h-6 bg-gray-200 rounded w-12'></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            {/* Hero Section */}
            <div className='bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 sm:p-8 rounded-b-3xl shadow-2xl'>
                <div className='max-w-7xl mx-auto'>
                    <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                        <div className='animate-fade-in'>
                            <h1 className='text-2xl sm:text-3xl font-bold mb-2'>
                                Hoş Geldiniz! 👋
                            </h1>
                            <p className='text-orange-100 text-sm sm:text-base'>
                                Restoran yönetim panelinize genel bakış
                            </p>
                        </div>
                        <div className='bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 animate-slide-in'>
                            <div className='text-right'>
                                <div className='text-xs sm:text-sm text-orange-100 mb-1'>Bugün</div>
                                <div className='text-lg sm:text-xl font-semibold'>
                                    {new Date().toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Stat Cards */}
                <div className='compact grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8'>
                    {dashboardCards.map((card, index) => (
                        <div
                            key={index}
                            className='group'
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className='bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 animate-fade-in'>
                                <div className='flex items-center justify-between mb-3'>
                                    <div className='p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white group-hover:scale-110 transition-transform duration-300'>
                                        {card.icon}
                                    </div>
                                    <div className='text-right'>
                                        <div className='text-xs sm:text-sm text-gray-500 mb-1'>
                                            {card.title}
                                        </div>
                                        <div className='text-lg sm:text-2xl font-bold text-gray-800'>
                                            {card.type === 'price' ? `₺${card.value.toLocaleString()}` : card.value}
                                        </div>
                                    </div>
                                </div>
                                <div className='h-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300'></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
                    {[overviewData, OrderSummary, topSellingItems].map((_, idx) => (
                        <div key={idx} className="lg:col-span-1">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full"></div>
                                    {/* Başlıklar dinamik olarak burada yer almalı */}
                                    {idx === 0 && 'Ödeme Dağılımı'}
                                    {idx === 1 && 'Sipariş Özeti'}
                                    {idx === 2 && 'En Çok Satılanlar'}
                                </h3>
                                <div className="flex-grow">
                                    {idx === 0 && <OverviewChart data={overviewData} />}
                                    {idx === 1 && <OrderSummary />}
                                    {idx === 2 && <TopSellingItems items={topSellingItems} />}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}
                <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8'>
                    <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                            <div className='w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full'></div>
                            Müşteri Konumları
                        </h3>
                        <CustomerMap data={customerLocations} />
                    </div>

                    <div className='bg-white rounded-2xl p-6 shadow-lg border border-gray-100'>
                        <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2'>
                            <div className='w-2 h-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-full'></div>
                            Haftalık Gelir
                        </h3>
                        <TotalRevenueChart data={revenueData} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
