import React, { useEffect, useState } from "react";
import { User, Shield, ArrowLeft, Smartphone, Key } from "lucide-react";
import { useNotification } from "../context/provider/NotificationProvider";
import { useAuth } from "../context/provider/AuthProvider";
import { AnimatePresence, motion } from "framer-motion";
import { SafeQRCode } from "../components/SafeQRCode";
import type { RegisterRequest, LoginRequest, RecoveryLoginRequest, RegisterData } from "../context/provider/AuthProvider";
import { useLoginState } from "../customHook/useLoginState";
import { useNavigate } from "react-router-dom";

// Types for component state


// Custom hook for login state management (Single Responsibility)


// Base props for all auth steps (Interface Segregation)
interface BaseStepProps {
    loading: boolean;
    onBack?: () => void;
}

// Username Step Component (Single Responsibility)
const UsernameStep: React.FC<BaseStepProps & {
    onSubmit: (username: string) => Promise<void>;
}> = ({ onSubmit, loading }) => {
    const [username, setUsername] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            await onSubmit(username.trim());
        }
    };

    return (
        <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="flex-1"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kullanıcı Adı
                    </label>
                    <div className="relative">
                        <div className="absolute  inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                            placeholder="kullanici_adi"
                            required
                            autoComplete="username"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition shadow-md disabled:opacity-70"
                    disabled={loading || !username.trim()}
                >
                    {loading ? 'İşleniyor...' : 'Devam Et'}
                </button>
            </form>
        </motion.div>
    );
};

// QR Code Step Component (Enhanced for Horizontal Layout)
const QrCodeStep: React.FC<BaseStepProps & {
    registrationData: RegisterData;
    onContinue: () => void;
}> = ({ registrationData, onContinue, loading }) => {
    const [copiedRecovery, setCopiedRecovery] = useState(false);
    const [copiedSecret, setCopiedSecret] = useState(false);

    const copyToClipboard = async (text: string, type: 'recovery' | 'secret') => {
        try {
            await navigator.clipboard.writeText(text);
            if (type === 'recovery') {
                setCopiedRecovery(true);
                setTimeout(() => setCopiedRecovery(false), 2000);
            } else {
                setCopiedSecret(true);
                setTimeout(() => setCopiedSecret(false), 2000);
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="flex-1"
        >
            <div className="space-y-6">
                {/* Header - Mobile First */}
                <div className="text-center lg:text-left">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Google Authenticator Kurulumu</h3>
                    <p className="text-sm text-gray-600">
                        Aşağıdaki QR kodu Google Authenticator uygulamasına taratın veya manuel olarak girişi yapın
                    </p>
                </div>

                {/* Main Content - Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* QR Code Section */}
                    <div className="flex flex-col items-center lg:items-start space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mx-auto lg:mx-0">
                            <SafeQRCode qrCode={registrationData.qrCode} />
                        </div>
                        
                        {/* QR Code Instructions - Desktop Only */}
                        <div className="hidden lg:block text-center lg:text-left">
                            <p className="text-xs text-gray-500 max-w-xs">
                                Google Authenticator uygulamasını açın ve "+" butonuna tıklayarak QR kodu taratın.
                            </p>
                        </div>
                    </div>

                    {/* Information Section */}
                    <div className="space-y-4">
                        {/* Manuel Kurulum Bölümü */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Smartphone className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm text-blue-700 font-medium mb-2">
                                        Manuel Kurulum:
                                    </p>
                                    <p className="text-xs text-blue-600 mb-2">
                                        QR kod çalışmıyorsa bu anahtarı manuel olarak girin:
                                    </p>
                                    <div className="bg-white p-2 rounded border border-blue-200 font-mono text-xs text-blue-800 break-all">
                                        {registrationData.secret}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(registrationData.secret, 'secret')}
                                        className="mt-2 text-xs font-medium text-blue-700 hover:text-blue-800 underline"
                                    >
                                        {copiedSecret ? '✓ Kopyalandı!' : 'Gizli Anahtarı Kopyala'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Kurtarma Kodu Bölümü */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <Key className="h-5 w-5 text-yellow-400" />
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm text-yellow-700 font-medium mb-1">
                                        Kurtarma Kodunuz:
                                    </p>
                                    <div className="bg-white p-2 rounded border border-yellow-200 font-mono text-sm text-yellow-800 mb-2">
                                        {registrationData.recoveryCode}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(registrationData.recoveryCode, 'recovery')}
                                        className="text-xs font-medium text-yellow-700 hover:text-yellow-800 underline"
                                    >
                                        {copiedRecovery ? '✓ Kopyalandı!' : 'Kurtarma Kodunu Kopyala'}
                                    </button>
                                    <p className="text-xs text-yellow-600 mt-2">
                                        Bu kodu güvenli bir yere kaydedin. Telefon kaybında gerekecek.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Instructions - Mobile Only */}
                <div className="lg:hidden text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <p>Google Authenticator uygulamasını açın ve "+" butonuna tıklayarak yukarıdaki QR kodu taratın.</p>
                </div>

                {/* Continue Button */}
                <button
                    onClick={onContinue}
                    className="w-full p-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:from-green-600 hover:to-teal-600 transition shadow-md disabled:opacity-70 font-medium"
                    disabled={loading}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            İşleniyor...
                        </div>
                    ) : (
                        'QR Kodu Taradım, Devam Et'
                    )}
                </button>
            </div>
        </motion.div>
    );
};

// Verification Step Component (Single Responsibility)
const VerificationStep: React.FC<BaseStepProps & {
    username: string;
    isRecoveryMode: boolean;
    onToggleRecoveryMode: () => void;
    onVerify: (code: string) => Promise<void>;
}> = ({ username, isRecoveryMode, onToggleRecoveryMode, onVerify, loading }) => {
    const [code, setCode] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            await onVerify(code.trim());
        }
    };

    const handleCodeChange = (value: string) => {
        // Only allow digits and limit length
        const cleanValue = value.replace(/\D/g, '');
        const maxLength = isRecoveryMode ? 8 : 6;
        setCode(cleanValue.slice(0, maxLength));
    };

    const isValidLength = code.length === (isRecoveryMode ? 8 : 6);

    return (
        <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="flex-1"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {isRecoveryMode ? 'Kurtarma Kodu ile Giriş' : 'OTP Kodu ile Giriş'}
                    </h3>
                    <p className="text-sm text-gray-600">
                        {username} kullanıcısı için doğrulama kodunu girin
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {isRecoveryMode ? 'Kurtarma Kodu' : '6 Haneli OTP Kodu'}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            {isRecoveryMode ? (
                                <Shield className="h-5 w-5 text-gray-400" />
                            ) : (
                                <Smartphone className="h-5 w-5 text-gray-400" />
                            )}
                        </div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            className="block w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
                            placeholder={isRecoveryMode ? "12345678" : "123456"}
                            required
                            autoComplete="one-time-code"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-center">
                    <button
                        type="button"
                        onClick={onToggleRecoveryMode}
                        className="text-sm font-medium text-orange-600 hover:text-orange-800 underline"
                    >
                        {isRecoveryMode ? 'OTP Kodu Kullan' : 'Kurtarma Kodu Kullan'}
                    </button>
                </div>

                <button
                    type="submit"
                    className="w-full p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition shadow-md disabled:opacity-70"
                    disabled={loading || !isValidLength}
                >
                    {loading ? 'Doğrulanıyor...' : 'Doğrula'}
                </button>
            </form>
        </motion.div>
    );
};

// Main Login Component (Enhanced Container)
const Login: React.FC = () => {
    const loginState = useLoginState();
    const navigate = useNavigate();
    const {
        register,
        login,
        loginWithRecovery,
        isLoading,
        error,
        registrationData,
        clearError,
        clearRegistrationData,
        clearNewRecoveryCode,
        isAuthenticated,
        user
    } = useAuth();
    const { showNotification } = useNotification();


    useEffect(() => {
        if (isAuthenticated && user) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    // Handle username submission
    const handleUsernameSubmit = async (username: string) => {
        try {
            clearError();
            loginState.setUsername(username);

            const registerRequest: RegisterRequest = { username };
            const data = await register(registerRequest);

            loginState.updateStep('qr');
            showNotification('success', data.message);
        } catch (error: any) {
            // Check if user already exists (should go to verification)
            if (error.message.includes('already exists') || error.message.includes('User exists')) {
                loginState.updateStep('verification');
                showNotification('info', 'Merhaba ! . Lütfen OTP kodunu girin.');
            } else {
                showNotification('error', error.message || 'Bir hata oluştu');
            }
        }
    };

    // Continue after QR code step
    const continueAfterQr = () => {
        clearRegistrationData();
        loginState.updateStep('verification');
    };

    // Handle verification
    const handleVerification = async (code: string) => {
        try {
            clearError();

            if (loginState.isRecoveryMode) {
                const recoveryRequest: RecoveryLoginRequest = {
                    username: loginState.username,
                    recoveryCode: code
                };

                const newCode = await loginWithRecovery(recoveryRequest);
                showNotification('success', `Giriş başarılı! Yeni kurtarma kodunuz: ${newCode}`);

                // Clear the new recovery code after showing
                setTimeout(() => clearNewRecoveryCode(), 5000);
            } else {
                const loginRequest: LoginRequest = {
                    username: loginState.username,
                    token: code
                };

                await login(loginRequest);
                showNotification('success', 'Giriş başarılı!');
            }
        } catch (error: any) {
            showNotification('error', error.message || 'Doğrulama başarısız');
        }
    };

    // Show error notifications
    React.useEffect(() => {
        if (error) {
            showNotification('error', error);
        }
    }, [error, showNotification]);

    // Get current step title and description
    const getStepInfo = () => {
        switch (loginState.step) {
            case 'username':
                return {
                    title: 'Hesabınıza Giriş Yapın',
                    description: 'Kullanıcı adınızla devam edin'
                };
            case 'qr':
                return {
                    title: 'Google Authenticator Kurulumu',
                    description: 'Hesabınızı güvence altına alın'
                };
            case 'verification':
                return {
                    title: 'Doğrulama Kodunu Girin',
                    description: loginState.isRecoveryMode ? 'Kurtarma kodunuzu girin' : 'Google Authenticator\'daki kodu girin'
                };
            default:
                return { title: '', description: '' };
        }
    };

    const stepInfo = getStepInfo();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-500 to-red-600 px-4 py-8">
            {/* Responsive Container */}
            <div className="w-auto max-w-md h-auto lg:max-w-4xl space-y-8 bg-white p-6 lg:p-8 rounded-xl shadow-lg">
                {/* Header */}
                <div className="text-center">
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900">
                        {stepInfo.title}
                    </h2>
                    <p className="mt-2 text-sm lg:text-base text-gray-600">
                        {stepInfo.description}
                    </p>
                </div>

                {/* Steps Container */}
                <div >
                    <AnimatePresence mode="wait">
                        {loginState.step === 'username' && (
                            <UsernameStep
                                onSubmit={handleUsernameSubmit}
                                loading={isLoading}
                            />
                        )}

                        {loginState.step === 'qr' && registrationData && (
                            <QrCodeStep
                                registrationData={registrationData}
                                onContinue={continueAfterQr}
                                loading={isLoading}
                                onBack={loginState.goBack}
                            />
                        )}

                        {loginState.step === 'verification' && (
                            <VerificationStep
                                username={loginState.username}
                                isRecoveryMode={loginState.isRecoveryMode}
                                onToggleRecoveryMode={loginState.toggleRecoveryMode}
                                onVerify={handleVerification}
                                loading={isLoading}
                                onBack={loginState.goBack}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Back Button */}
                {loginState.step !== 'username' && (
                    <button
                        onClick={loginState.goBack}
                        className="flex items-center justify-center w-full p-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        disabled={isLoading}
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Geri
                    </button>
                )}
            </div>
        </div>
    );
};

export default Login;