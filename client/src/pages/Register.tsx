import React from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

interface RegisterFormInputs {
    name: string;
    email: string;
    password: string;
}

export default function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
        defaultValues: {
            name: 'wangzhuren',
            email: '1023545902@qq.com',
            password: '123456qq.',
        }
    });
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = React.useState('');

    const onSubmit = async (data: RegisterFormInputs) => {
        try {
            const response = await axios.post('http://localhost:3000/api/auth/register', data);
            login(response.data.token, response.data.user);
            navigate('/');
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-lg p-8 rounded-2xl shadow-2xl">
                <div>
                    <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
                        Create Account
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Join us and start logging your food adventures
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="sr-only">Full Name</label>
                            <input
                                id="name"
                                {...register('name', { required: true })}
                                type="text"
                                className={cn(
                                    "appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200",
                                    errors.name && "border-red-500 focus:ring-red-500"
                                )}
                                placeholder="Full Name"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <input
                                id="email"
                                {...register('email', { required: true })}
                                type="email"
                                className={cn(
                                    "appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200",
                                    errors.email && "border-red-500 focus:ring-red-500"
                                )}
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                {...register('password', { required: true })}
                                type="password"
                                className={cn(
                                    "appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200",
                                    errors.password && "border-red-500 focus:ring-red-500"
                                )}
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <div className="flex">
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transform transition duration-200 hover:scale-[1.02] shadow-lg"
                        >
                            Sign up
                        </button>
                    </div>
                    <div className="text-center">
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-200">
                            Already have an account? <span className="underline">Sign in</span>
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
