import { useEffect, useState } from 'react'
import { useNavigation } from '../context/provider/NavigationProvider';
import Select from '../components/Select';

interface Order {
    id: string;
    name: string;
    payment: string;
    location: string;
    status: string;
    contact: string;
}

const orders: Order[] = [
    { id: "#45671", name: "Joe Martin", payment: "Online", location: "132, My Street BG", status: "Teslim Edildi", contact: "821 456 269" },
    { id: "#45672", name: "Peterson", payment: "Online", location: "8, My Street, Lagos", status: "Teslim Edildi", contact: "821 456 264" },
    { id: "#45673", name: "Shaleena", payment: "Kapıda Ödeme", location: "33 3rd Ave, NY", status: "Yolda", contact: "821 456 267" },
    { id: "#45674", name: "Patrik", payment: "Online", location: "400 Broom St, NY", status: "İptal Edildi", contact: "821 456 265" },
    { id: "#45675", name: "Angeline", payment: "Kapıda Ödeme", location: "25 U Square, NY", status: "Yolda", contact: "821 456 266" },
    { id: "#45676", name: "Denvar", payment: "Online", location: "28 U Square, NY", status: "Teslim Edildi", contact: "821 456 261" },
    { id: "#45676", name: "Jamison", payment: "Online", location: "22 Seal Street, NY", status: "Teslim Edildi", contact: "821 456 261" }, { id: "#45671", name: "Joe Martin", payment: "Online", location: "132, My Street BG", status: "Teslim Edildi", contact: "821 456 269" },
    { id: "#45672", name: "Peterson", payment: "Online", location: "8, My Street, Lagos", status: "Teslim Edildi", contact: "821 456 264" },
    { id: "#45673", name: "Shaleena", payment: "Kapıda Ödeme", location: "33 3rd Ave, NY", status: "Yolda", contact: "821 456 267" },
    { id: "#45674", name: "Patrik", payment: "Online", location: "400 Broom St, NY", status: "İptal Edildi", contact: "821 456 265" },
    { id: "#45675", name: "Angeline", payment: "Kapıda Ödeme", location: "25 U Square, NY", status: "Yolda", contact: "821 456 266" },
    { id: "#45676", name: "Denvar", payment: "Online", location: "28 U Square, NY", status: "Teslim Edildi", contact: "821 456 261" },
    { id: "#45676", name: "Jamison", payment: "Online", location: "22 Seal Street, NY", status: "Teslim Edildi", contact: "821 456 261" }, { id: "#45671", name: "Joe Martin", payment: "Online", location: "132, My Street BG", status: "Teslim Edildi", contact: "821 456 269" },
    { id: "#45672", name: "Peterson", payment: "Online", location: "8, My Street, Lagos", status: "Teslim Edildi", contact: "821 456 264" },
    { id: "#45673", name: "Shaleena", payment: "Kapıda Ödeme", location: "33 3rd Ave, NY", status: "Yolda", contact: "821 456 267" },
    { id: "#45674", name: "Patrik", payment: "Online", location: "400 Broom St, NY", status: "İptal Edildi", contact: "821 456 265" },
    { id: "#45675", name: "Angeline", payment: "Kapıda Ödeme", location: "25 U Square, NY", status: "Yolda", contact: "821 456 266" },
    { id: "#45676", name: "Denvar", payment: "Online", location: "28 U Square, NY", status: "Teslim Edildi", contact: "821 456 261" },
    { id: "#45676", name: "Jamison", payment: "Online", location: "22 Seal Street, NY", status: "Teslim Edildi", contact: "821 456 261" }, { id: "#45671", name: "Joe Martin", payment: "Online", location: "132, My Street BG", status: "Teslim Edildi", contact: "821 456 269" },
    { id: "#45672", name: "Peterson", payment: "Online", location: "8, My Street, Lagos", status: "Teslim Edildi", contact: "821 456 264" },
    { id: "#45673", name: "Shaleena", payment: "Kapıda Ödeme", location: "33 3rd Ave, NY", status: "Yolda", contact: "821 456 267" },
    { id: "#45674", name: "Patrik", payment: "Online", location: "400 Broom St, NY", status: "İptal Edildi", contact: "821 456 265" },
    { id: "#45675", name: "Angeline", payment: "Kapıda Ödeme", location: "25 U Square, NY", status: "Yolda", contact: "821 456 266" },
    { id: "#45676", name: "Denvar", payment: "Online", location: "28 U Square, NY", status: "Teslim Edildi", contact: "821 456 261" },
    { id: "#45676", name: "Jamison", payment: "Online", location: "22 Seal Street, NY", status: "Teslim Edildi", contact: "821 456 261" },
];

export default function OnlineOrders() {

    const { setActivePath } = useNavigation();
    
         useEffect(() => {
          setActivePath('/dashboard/onlineorders')
         }, [])

    const [search, setSearch] = useState<string>("");

    
    return (
        <div className="p-4 bg-white shadow rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Ara"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="p-2 border rounded w-1/3"
                />
                <div className="flex gap-2">
                   <Select options={["Bugün","Dün","Bu Hafta"]}></Select>
                    <Select options={["2025"]}></Select>
                </div>
            </div>
            <table className="w-full  text-left">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border-b-1 shadow-2xl border-gray-400 p-2">Sipariş No</th>
                        <th className="border-b-1 shadow-2xl border-gray-400 p-2">Müşteri Adı</th>
                        <th className="border-b-1 shadow-2xl border-gray-400 p-2">Ödeme</th>
                        <th className="border-b-1 shadow-2xl border-gray-400 p-2">Konum</th>
                        <th className="border-b-1 shadow-2xl border-gray-400 p-2">Durum</th>
                        <th className="border-b-1 shadow-2xl border-gray-400 p-2">İletişim</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.filter(order => order.name.toLowerCase().includes(search.toLowerCase())).map((order, index) => (
                        <tr key={index} className=" hover:scale-95  transition-transform cursor-pointer">
                            <td className="border-b py-3 border-gray-400 shadow-2xl p-2">{order.id}</td>
                            <td className="border-b py-3 border-gray-400 shadow-2xl p-2">{order.name}</td>
                            <td className="border-b py-3 border-gray-400 shadow-2xl p-2">{order.payment}</td>
                            <td className="border-b py-3 border-gray-400 shadow-2xl p-2">{order.location}</td>
                            <td className={`border-b py-3 border-gray-400 shadow-2xl p-2 ${order.status === "İptal Edildi" ? "text-red-500" : order.status === "Yolda" ? "text-blue-500" : "text-green-500"}`}>{order.status}</td>
                            <td className="border-b py-3 border-gray-400 shadow-2xl p-2">{order.contact}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
