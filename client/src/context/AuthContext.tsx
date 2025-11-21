import React, { createContext, useState, useRef } from 'react';
import type { AxiosRequestConfig } from 'axios';

interface User {
    id: number;
    email: string;
    name: string;
}

// 待重试的请求类型
interface PendingRequest {
    config: AxiosRequestConfig;
    resolve: (value: unknown) => void;
    reject: (reason?: unknown) => void;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    // 登录对话框相关
    showLoginModal: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    // 请求队列相关
    addPendingRequest: (request: PendingRequest) => void;
    retryPendingRequests: () => void;
    clearPendingRequests: () => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [showLoginModal, setShowLoginModal] = useState(false);

    // 使用ref存储待重试的请求队列，避免重新渲染
    const pendingRequestsRef = useRef<PendingRequest[]>([]);

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        clearPendingRequests();
    };

    // 打开登录对话框
    const openLoginModal = () => {
        setShowLoginModal(true);
    };

    // 关闭登录对话框
    const closeLoginModal = () => {
        setShowLoginModal(false);
    };

    // 添加待重试的请求到队列
    const addPendingRequest = (request: PendingRequest) => {
        pendingRequestsRef.current.push(request);
    };

    // 重试所有待处理的请求
    const retryPendingRequests = () => {
        // 导入axios实例会导致循环依赖，所以在这里动态导入
        import('../lib/api').then((module) => {
            const api = module.default;
            const requests = [...pendingRequestsRef.current];
            pendingRequestsRef.current = [];

            requests.forEach(({ config, resolve, reject }) => {
                api.request(config)
                    .then(resolve)
                    .catch(reject);
            });
        });
    };

    // 清空待处理的请求
    const clearPendingRequests = () => {
        pendingRequestsRef.current.forEach(({ reject }) => {
            reject(new Error('请求已取消'));
        });
        pendingRequestsRef.current = [];
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                logout,
                isAuthenticated: !!token,
                showLoginModal,
                openLoginModal,
                closeLoginModal,
                addPendingRequest,
                retryPendingRequests,
                clearPendingRequests,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


