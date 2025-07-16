import React, { useState } from "react";
import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/provider/NotificationProvider";
import { AnimatePresence, motion } from "framer-motion";
import { useLogin } from "../customHook/useLogin";
import { LoginFormData } from "../types";
import { DEV_CONFIG } from "../config/dev";

interface OtpStepProps {
    phone: string;
    loading: boolean;
    onBack: () => void;
    onVerify: (otp: string) => Promise<void>;
}

const OtpStep: React.FC<OtpStepProps> = ({ phone, loading, onBack, onVerify }) => {
    const [otp, setOtp] = useState<string>('');
    const { showNotification } = useNotification();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) {
            showNotification('error', 'OTP 6 haneli olmalıdır');
            return;
        }
        await onVerify(otp);
    };

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="flex-1"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {phone} numarasına gönderilen kodu giriniz
                    </label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-orange-200 outline-none"
                        placeholder="6 haneli kod"
                        maxLength={6}
                        required
                    />
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="flex-1 p-2 border rounded hover:bg-gray-50"
                        disabled={loading}
                    >
                        Geri
                    </button>
                    <button
                        type="submit"
                        className="flex-1 p-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                        disabled={loading || otp.length !== 6}
                    >
                        {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

const Login: React.FC = () => {
    // 🔧 DEV MODE: Auth bypass for development
    const DEV_MODE_AUTH_BYPASS = DEV_CONFIG.AUTH_BYPASS;
    
    const [formData, setFormData] = useState<LoginFormData>({ phone: '' });
    const [showOtp, setShowOtp] = useState<boolean>(false);
    const { login, verifyOtp, loading } = useLogin();
    const { showNotification } = useNotification();
    const navigate = useNavigate();

    // Dev mode'da direkt dashboard'a git
    React.useEffect(() => {
        if (DEV_MODE_AUTH_BYPASS) {
            navigate('/dashboard');
        }
    }, [navigate]);

    // Dev mode'da login form'unu gösterme
    if (DEV_MODE_AUTH_BYPASS) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600">
                <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                    <p className="mt-4">Geliştirme modunda dashboard'a yönlendiriliyor...</p>
                </div>
            </div>
        );
    }

    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(formData.phone);
            setShowOtp(true);
            showNotification('success', 'OTP kodu gönderildi!');
        } catch (error: any) {
            console.error('Login error:', error);
            showNotification('error', error.message || 'Giriş yapılırken bir hata oluştu');
        }
    };

    const handleOtpVerify = async (otp: string) => {
        try {
            await verifyOtp(otp);
            showNotification('success', 'Giriş başarılı!');
            navigate('/dashboard');
        } catch (error: any) {
            console.error('OTP verification error:', error);
            showNotification('error', error.message || 'OTP doğrulama hatası');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        Giriş Yap
                    </h2>
                </div>
                <AnimatePresence mode="wait">
                    {!showOtp ? (
                        <motion.div
                            initial={{ x: -300, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 300, opacity: 0 }}
                            className="flex-1"
                        >
                            <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefon Numarası
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                                            className="block w-full pl-10 p-2 border rounded focus:ring-2 focus:ring-orange-200 outline-none"
                                            placeholder="5XX XXX XX XX"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full p-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                                    disabled={loading || formData.phone.length !== 10}
                                >
                                    {loading ? 'Gönderiliyor...' : 'Kod Gönder'}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <OtpStep
                            phone={formData.phone}
                            loading={loading}
                            onBack={() => setShowOtp(false)}
                            onVerify={handleOtpVerify}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Login;
