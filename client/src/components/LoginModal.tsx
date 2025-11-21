import { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Link } from "@heroui/react";

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

    const handleSubmit = async () => {
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
        <Modal isOpen={isOpen} onClose={onClose} placement="center">
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">需要登录</ModalHeader>
                        <ModalBody>
                            <p className="text-sm text-gray-600 mb-4">
                                请登录以继续您的操作
                            </p>
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
                                    {error}
                                </div>
                            )}
                            <div className="flex flex-col gap-4">
                                <Input
                                    label="邮箱"
                                    placeholder="your@email.com"
                                    type="email"
                                    value={email}
                                    onValueChange={setEmail}
                                    variant="bordered"
                                />
                                <Input
                                    label="密码"
                                    placeholder="••••••••"
                                    type="password"
                                    value={password}
                                    onValueChange={setPassword}
                                    variant="bordered"
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter className="flex flex-col">
                            <Button color="primary" onPress={handleSubmit} isLoading={loading} className="w-full">
                                登录
                            </Button>
                            <div className="text-center mt-2">
                                <p className="text-sm text-gray-600">
                                    还没有账号？{' '}
                                    <Link href="/register" size="sm" onPress={() => onClose()}>
                                        立即注册
                                    </Link>
                                </p>
                            </div>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
