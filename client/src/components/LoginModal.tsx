import React, { useState } from 'react';
import { X } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

/**
 * 登录对话框组件
 * 用于在API调用返回401时弹出，允许用户登录后继续操作
 */
export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 如果未打开，不渲染
    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/api/auth/login', {
                email,
                password,
            });

            const { token, user } = response.data;
            login(token, user);

            // 清空表单
            setEmail('');
            setPassword('');

            // 通知父组件登录成功
            onLoginSuccess();
            onClose();
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                setError(axiosError.response?.data?.message || '登录失败，请检查您的凭据');
            } else {
                setError('登录失败，请稍后重试');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* 遮罩层 */}
            <div
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />

            {/* 对话框 */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    {/* 关闭按钮 */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {/* 标题 */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        需要登录
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                        请登录以继续您的操作
                    </p>

                    {/* 登录表单 */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="modal-email" className="block text-sm font-medium text-gray-700">
                                邮箱
                            </label>
                            <input
                                id="modal-email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700">
                                密码
                            </label>
                            <input
                                id="modal-password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? '登录中...' : '登录'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
