import { Info, Utensils, X } from "lucide-react";
import React from "react";

interface TableModalHeaderProps {
    table?: any;
    onClose?: () => void;
    onHint?: () => void;
}

const TableModalHeader: React.FC<TableModalHeaderProps> = ({ table, onClose, onHint }) => {
    return (
        <div
            className="relative overflow-hidden rounded-t-xl sm:rounded-t-2xl p-3 sm:p-6 "
            style={{
                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
        >
            <div

                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"
            />
            <div

                className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"
            />

            <div className="relative z-10 flex justify-between items-center">
                <div>
                    <h2 className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3"
                    >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full">
                            <Utensils size={18} className="sm:w-6 sm:h-6" />
                        </div>
                        Masa {table.number}
                    </h2>
                    <p

                        className="text-white/80 text-xs sm:text-sm mt-1 hidden sm:block"
                    >
                        Masa Yönetim Paneli
                    </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                    <div

                        onClick={onHint}
                        className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20"
                        aria-label="İpucu Göster"
                    >
                        <div>
                            <Info size={14} className="text-white sm:w-[18px] sm:h-[18px]" />
                        </div>
                    </div>
                    <button

                        onClick={onClose}
                        className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20"
                        aria-label="Kapat"
                    >
                        <div
                        >
                            <X size={14} className="text-white sm:w-[18px] sm:h-[18px]" />
                        </div>
                    </button>
                </div>
            </div>
        </div>

    );
};

export default TableModalHeader;