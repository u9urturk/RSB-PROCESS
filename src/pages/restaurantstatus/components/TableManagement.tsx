import { useState } from "react";
import { Users } from "lucide-react";
import { TableData } from "../../../types";
import TableModal from "../modals/TableModal";
import FilterBar, { FilterState } from "./table/FilterBar";
import { useTableTransfer } from "./table/useTableTransfer";
import TableSummaryCard from "./table/TableSummaryCard";


interface TableManagementProps {
    tables: TableData[];
}

const TableManagement = ({ tables: externalTables }: TableManagementProps) => {
    const [filters, setFilters] = useState<FilterState>({ occupied: null, reserved: false, cleanStatus: null });
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentTableId, setCurrentTableId] = useState<string | null>(null);
    const { transferMode, showTransferBalloon, startTransfer, handleTableClick, cancelTransfer } = useTableTransfer(externalTables);

    const openModal = (id: string) => {
        setCurrentTableId(id);
        setIsModalOpen(true);
    };
    const closeModal = () => setIsModalOpen(false);

    // Hem dışarıdan gelen filtrelenmiş tabloyu hem de kendi filtrelerini uygula
    const filteredTables = (externalTables || []).filter((table: TableData) => {
        return (
            (filters.occupied === null || (filters.occupied === true && table.status === "occupied") || (filters.occupied === false && table.status !== "occupied")) &&
            (filters.reserved === false || (filters.reserved === true && table.status === "reserved")) &&
            (filters.cleanStatus === null || table.cleanStatus === filters.cleanStatus)
        );
    });


    return (
        <div className="max-w-7xl mx-auto">
            <FilterBar filters={filters} setFilters={setFilters} />

            {/* Aktarım modunda görünecek uyarı ve iptal butonu */}
            {transferMode && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-4 sm:p-6 mb-6 shadow-lg animate-in slide-in-from-top duration-300">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <Users size={20} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Aktarım Modu</h3>
                                <p className="text-blue-100 text-sm">Siparişi aktarmak için boş ve temiz bir masa seçin</p>
                            </div>
                        </div>
                        <button
                            className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105"
                            onClick={cancelTransfer}
                        >
                            İptal Et
                        </button>
                    </div>
                </div>
            )}

            {/* Masalar Grid */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <Users size={24} className="text-orange-500" />
                        Masa Durumu
                    </h2>
                    <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                        {filteredTables.length} masa gösteriliyor
                    </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {filteredTables.map(table => (
                        <div
                            key={table.id}
                            className={`
                                relative transition-all duration-200 ease-out
                                ${transferMode && table.status === "available" && table.cleanStatus === true
                                    ? "ring-2 ring-blue-400 ring-opacity-60 rounded-2xl"
                                    : ""
                                }
                            `}
                            onClick={() => handleTableClick(table, openModal)}
                        >
                            <TableSummaryCard table={table} transferMode={transferMode} />
                            
                            {/* Aktarım modunda bilgi balonu */}
                            {transferMode && table.status === "available" && table.cleanStatus === true && showTransferBalloon && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50">
                                    <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg">
                                        Aktarım için tıklayın
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Boş durum */}
                {filteredTables.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Masa bulunamadı</h3>
                        <p className="text-gray-500">Seçili filtrelere uygun masa bulunmuyor</p>
                    </div>
                )}
            </div>
            
            {/* Modal */}
            {currentTableId && (
                <TableModal
                    tableId={currentTableId}
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onStartTransfer={(table) => startTransfer(table, closeModal)}
                />
            )}
        </div>
    );
};

export default TableManagement;

