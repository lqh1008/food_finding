import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Input, Textarea, Button, Card, CardBody, CardHeader } from "@heroui/react";

interface CreateEntryInputs {
    title: string;
    description: string;
    imageUrl: string;
    location: string;
    date: string;
    rating: number;
}

export default function CreateEntry() {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateEntryInputs>();
    const navigate = useNavigate();
    const { } = useAuth();
    const [error, setError] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const onSubmit = async (data: CreateEntryInputs) => {
        setLoading(true);
        try {
            await api.post('/api/entries', {
                ...data,
                rating: Number(data.rating),
            });
            navigate('/');
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response?: { data?: { message?: string } } };
                setError(axiosError.response?.data?.message || 'Failed to create entry');
            } else {
                setError('Failed to create entry');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <Card className="w-full">
                    <CardHeader className="flex gap-3 justify-center pb-0">
                        <div className="flex flex-col">
                            <h2 className="text-2xl font-bold text-gray-900">Log Food</h2>
                            <p className="text-small text-default-500">Record your culinary journey</p>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <Input
                                label="Title"
                                placeholder="What did you eat?"
                                variant="bordered"
                                isInvalid={!!errors.title}
                                errorMessage={errors.title && "Title is required"}
                                {...register('title', { required: true })}
                            />

                            <Textarea
                                label="Description"
                                placeholder="How was it?"
                                variant="bordered"
                                {...register('description')}
                            />

                            <Input
                                label="Image URL"
                                placeholder="https://example.com/food.jpg"
                                variant="bordered"
                                {...register('imageUrl')}
                            />

                            <Input
                                label="Location"
                                placeholder="Restaurant or place"
                                variant="bordered"
                                {...register('location')}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Date"
                                    type="date"
                                    variant="bordered"
                                    isInvalid={!!errors.date}
                                    errorMessage={errors.date && "Date is required"}
                                    {...register('date', { required: true })}
                                />

                                <Input
                                    label="Rating (1-5)"
                                    type="number"
                                    min="1"
                                    max="5"
                                    variant="bordered"
                                    isInvalid={!!errors.rating}
                                    errorMessage={errors.rating && "Rating is required"}
                                    {...register('rating', { required: true, min: 1, max: 5 })}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                color="primary"
                                isLoading={loading}
                                className="w-full"
                            >
                                Save Entry
                            </Button>
                        </form>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
}
