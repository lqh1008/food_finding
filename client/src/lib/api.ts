import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
    baseURL: API_URL,
});

// 用于标记是否正在显示登录框（避免重复弹出）
let isShowingLoginModal = false;
// 用于标记是否正在刷新token
let isRefreshing = false;
// 存储等待token刷新的请求
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

/**
 * 请求拦截器
 * 自动从localStorage获取token并添加到请求头
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * 响应拦截器
 * 处理401未授权错误，尝试刷新token，失败则触发登录对话框
 */
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // 如果是401错误且不是登录或刷新请求本身
        if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/api/auth/login') && !originalRequest.url?.includes('/api/auth/refresh-token')) {

            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}/api/auth/refresh-token`, { refreshToken });
                    const { accessToken, refreshToken: newRefreshToken } = response.data;

                    localStorage.setItem('token', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    api.defaults.headers.common['Authorization'] = 'Bearer ' + accessToken;
                    originalRequest.headers['Authorization'] = 'Bearer ' + accessToken;

                    // 通知AuthContext更新状态
                    window.dispatchEvent(new CustomEvent('tokens-updated', {
                        detail: { accessToken, refreshToken: newRefreshToken }
                    }));

                    processQueue(null, accessToken);
                    isRefreshing = false;

                    return api(originalRequest);
                } catch (refreshError) {
                    processQueue(refreshError, null);
                    isRefreshing = false;
                    // 刷新失败，清除token并显示登录框
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    // 继续执行下面的显示登录框逻辑
                }
            } else {
                isRefreshing = false;
            }

            // 避免重复显示登录框
            if (!isShowingLoginModal) {
                isShowingLoginModal = true;

                // 使用自定义事件来通知应用显示登录框
                window.dispatchEvent(new CustomEvent('show-login-modal'));

                // 返回一个Promise，等待用户登录
                return new Promise((resolve, reject) => {
                    // 将请求加入队列
                    const handleLoginSuccess = () => {
                        isShowingLoginModal = false;
                        window.removeEventListener('login-success', handleLoginSuccess);
                        window.removeEventListener('login-cancelled', handleLoginCancelled);

                        // 重试原始请求
                        const token = localStorage.getItem('token');
                        if (token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            api.request(originalRequest).then(resolve).catch(reject);
                        } else {
                            reject(new Error('登录失败'));
                        }
                    };

                    const handleLoginCancelled = () => {
                        isShowingLoginModal = false;
                        window.removeEventListener('login-success', handleLoginSuccess);
                        window.removeEventListener('login-cancelled', handleLoginCancelled);
                        reject(new Error('用户取消登录'));
                    };

                    // 监听登录成功和取消事件
                    window.addEventListener('login-success', handleLoginSuccess);
                    window.addEventListener('login-cancelled', handleLoginCancelled);
                });
            } else {
                // 如果已经在显示登录框，将请求加入等待队列
                return new Promise((resolve, reject) => {
                    const handleLoginSuccess = () => {
                        window.removeEventListener('login-success', handleLoginSuccess);
                        window.removeEventListener('login-cancelled', handleLoginCancelled);

                        const token = localStorage.getItem('token');
                        if (token) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            api.request(originalRequest).then(resolve).catch(reject);
                        } else {
                            reject(new Error('登录失败'));
                        }
                    };

                    const handleLoginCancelled = () => {
                        window.removeEventListener('login-success', handleLoginSuccess);
                        window.removeEventListener('login-cancelled', handleLoginCancelled);
                        reject(new Error('用户取消登录'));
                    };

                    window.addEventListener('login-success', handleLoginSuccess);
                    window.addEventListener('login-cancelled', handleLoginCancelled);
                });
            }
        }

        // 其他错误直接抛出
        return Promise.reject(error);
    }
);

export default api;

