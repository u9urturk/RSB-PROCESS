
import { io, Socket } from 'socket.io-client';

export interface RealtimeServiceOptions {
    baseUrl: string; // e.g. https://api.example.com
    path?: string;   // default /ws
    enabled?: boolean;
    debug?: boolean;
    getCurrentSessionId?: () => string | undefined;
    onCurrentSessionRevoked?: (payload: { sessionId: string; reason?: string }) => void;
    onOtherSessionRevoked?: (payload: { sessionId: string; reason?: string }) => void;
    onAuthError?: (msg?: string) => void;
}

export class RealtimeService {
    private socket: Socket | null = null;
    private opts: RealtimeServiceOptions;
    private listeners: Record<string, Function[]> = {};


    constructor(opts: RealtimeServiceOptions) {

        const env: any = (typeof import.meta !== 'undefined' && (import.meta as any).env) || (typeof window !== 'undefined' ? (window as any) : {});
        const envBase = env?.VITE_REALTIME_WS_BASE || env?.VITE_API_BASE_URL || opts.baseUrl;
        const envPath = '/ws';
        const envEnabled = env?.VITE_FEATURE_REALTIME_LOGOUT;
        const envDebug = env?.VITE_DEBUG_REALTIME;

        this.opts = {
            baseUrl: opts.baseUrl || envBase || '',
            path: opts.path !== undefined ? opts.path : envPath,
            enabled: typeof opts.enabled === 'boolean' ? opts.enabled : (envEnabled !== 'false'),
            debug: typeof opts.debug === 'boolean' ? opts.debug : (envDebug === 'true'),
            getCurrentSessionId: opts.getCurrentSessionId,
            onCurrentSessionRevoked: opts.onCurrentSessionRevoked,
            onOtherSessionRevoked: opts.onOtherSessionRevoked,
            onAuthError: opts.onAuthError
        };
    }

    connect() {

        let base = this.opts.baseUrl;
        let path = this.opts.path || '/ws';
        if (base.endsWith('/')) base = base.slice(0, -1);
        this.socket = io(base, {
            path,
            withCredentials: true,
            transports: ['websocket'],
        });
        this.socket.on('connect', () => {
            console.log('[RT] connected:', this.socket?.id);
        });
        this.socket.on('connect_error', (err: any) => {
            console.error('[RT] error:', err);
        });
        this.socket.on('disconnect', (reason: string) => {
            console.log('[RT] disconnected:', reason);
        });

        this.socket.on('session_revoked', (payload: { sessionId: string; reason?: string }) => {
            const currentSessionId = this.opts.getCurrentSessionId?.();
            if (payload.sessionId && currentSessionId && payload.sessionId === currentSessionId) {
                this.opts.onCurrentSessionRevoked?.(payload);
            } else {
                this.opts.onOtherSessionRevoked?.(payload);
            }
        });

        this.socket.on('auth_error', (msg?: string) => {
            this.opts.onAuthError?.(msg);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(evt: string, cb: Function) {
        (this.listeners[evt] ||= []).push(cb);
    }
    off(evt: string, cb: Function) {
        this.listeners[evt] = (this.listeners[evt] || []).filter(f => f !== cb);
    }


}

export const realtimeServiceRegistry: { instance?: RealtimeService } = {};
