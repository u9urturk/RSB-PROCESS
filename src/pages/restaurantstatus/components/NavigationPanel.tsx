import InfoBalloon from "../../../components/InfoBalloon";
import React from "react";

interface NavButton {
    key: string;
    icon: React.ReactElement;
    label: string;
    info: string;
}

interface NavigationPanelProps {
    buttons: NavButton[];
    isEmpty: boolean;
    isOccupied: boolean;
    table: any;
    balloonStep: number;
    setBalloonStep: (step: number) => void;
    handleOrderClick: () => void;
    setShowOrderPanel: (show: boolean) => void;
    setShowPaymentPanel: (show: boolean) => void;
    handleClean: () => void;
    handleTransfer: () => void;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({
    buttons,
    isEmpty,
    isOccupied,
    table,
    balloonStep,
    setBalloonStep,
    handleOrderClick,
    setShowOrderPanel,
    setShowPaymentPanel,
    handleClean,
    handleTransfer

}) => (
    <nav
        className="z-50 w-full overflow-hidden rounded-lg sm:rounded-xl p-1 backdrop-blur-md border border-white/20"
        style={{
            background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)",
            boxShadow: "0 8px 32px rgba(99, 102, 241, 0.08)",
        }}
    >
        <div className="flex justify-center items-center  w-full gap-3 sm:gap-3">
            {buttons.map((btn, idx) => {
                const isDisabled =
                    (btn.key === "order" && !isEmpty) ||
                    (btn.key === "update" && table.status === "available") ||
                    (btn.key === "pay" && !isOccupied) ||
                    (btn.key === "clean" && table.cleanStatus === true) ||
                    (btn.key === "transfer" && !isOccupied);

                const handleClick =
                    btn.key === "order"
                        ? handleOrderClick
                        : btn.key === "update"
                            ? () => setShowOrderPanel(true)
                            : btn.key === "pay"
                                ? () => setShowPaymentPanel(true)
                                : btn.key === "clean"
                                    ? handleClean
                                    : btn.key === "transfer"
                                        ? handleTransfer
                                        : undefined;

                return (
                    <div
                        key={btn.key}
                        className="flex-1 flex flex-col items-center relative min-w-0"
                    >
                        <button
                            className={`w-full flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg sm:rounded-xl min-h-[3rem] sm:min-h-[4rem] group relative overflow-hidden ${isDisabled
                                ? "bg-gray-100/50 text-gray-400 cursor-not-allowed opacity-60"
                                : "bg-white/80 backdrop-blur-md text-gray-700 hover:text-white shadow-lg border border-white/20"
                                }`}
                            aria-label={btn.label}
                            disabled={isDisabled}
                            onClick={handleClick}
                            style={{
                                background: isDisabled
                                    ? "rgba(156, 163, 175, 0.3)"
                                    : `linear-gradient(135deg, rgba(${btn.key === "order"
                                        ? "59, 130, 246"
                                        : btn.key === "update"
                                            ? "16, 185, 129"
                                            : btn.key === "pay"
                                                ? "251, 146, 60"
                                                : btn.key === "clean"
                                                    ? "139, 69, 19"
                                                    : "147, 51, 234"
                                    }, 0.8) 0%, rgba(${btn.key === "order"
                                        ? "147, 51, 234"
                                        : btn.key === "update"
                                            ? "5, 150, 105"
                                            : btn.key === "pay"
                                                ? "239, 68, 68"
                                                : btn.key === "clean"
                                                    ? "92, 51, 23"
                                                    : "59, 130, 246"
                                    }, 0.8) 100%)`,
                            }}
                        >
                            {!isDisabled && (
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-20" />
                            )}

                            <div
                                className={`p-1 sm:p-2 rounded-md sm:rounded-lg mb-1 sm:mb-2 ${isDisabled ? "bg-gray-400/50" : "bg-white/20"
                                    }`}
                            >
                                <div className="w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">
                                    {btn.icon}
                                </div>
                            </div>
                            <span className="text-xs font-semibold text-center leading-tight">
                                {btn.label}
                            </span>
                        </button>
                        <InfoBalloon show={balloonStep === idx + 1} text={btn.info} onClose={() => setBalloonStep(balloonStep + 1)} />
                    </div>
                );
            })}
        </div>
    </nav>
);

export default NavigationPanel;
