import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { cn } from '../lib/utils';

interface CreateEntryFormInputs {
    title: string;
    description: string;
    rating: number;
    location: string;
    date: string;
    imageUrl?: string;
}

export default function CreateEntry() {
    const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateEntryFormInputs>();
    const navigate = useNavigate();
    const [submitting, setSubmitting] = React.useState(false);

    const onSubmit = async (data: CreateEntryFormInputs) => {
        setSubmitting(true);
        try {
            // 拦截器会自动添加token并处理401
            await api.post('/api/entries', data);
            navigate('/');
        } catch (error) {
            console.error('Failed to create entry', error);
            // 如果是401，拦截器会处理，这里不需要alert
            // alert('Failed to create entry'); 
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Log a new food experience</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <input
                                {...register('title', { required: true })}
                                type="text"
                                className={cn(
                                    "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm",
                                    errors.title && "border-red-500"
                                )}
                                placeholder="What did you eat?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                {...register('description')}
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="How was it?"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rating (1-5)</label>
                            <input
                                {...register('rating', { required: true, min: 1, max: 5 })}
                                type="number"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <input
                                {...register('location')}
                                type="text"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Restaurant or place"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Date</label>
                            <input
                                {...register('date', { required: true })}
                                type="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Image</label>
                            <div className="mt-1 flex items-center space-x-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const formData = new FormData();
                                            formData.append('image', file);
                                            try {
                                                const res = await api.post('/api/upload', formData, {
                                                    headers: {
                                                        'Content-Type': 'multipart/form-data',
                                                    },
                                                });
                                                setValue('imageUrl', res.data.imageUrl);
                                            } catch (err) {
                                                console.error('Upload failed', err);
                                            }
                                        }
                                    }}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                />
                            </div>
                            <input type="hidden" {...register('imageUrl')} />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {submitting ? 'Saving...' : 'Save Entry'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
