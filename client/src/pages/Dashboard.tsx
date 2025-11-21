import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import type { FoodEntry } from '../types';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Star } from 'lucide-react';
import { Card, CardBody, CardFooter, Image, Button, Chip } from "@heroui/react";

export default function Dashboard() {
    const { token, user } = useAuth();
    const [entries, setEntries] = useState<FoodEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                // 即使没有token也尝试请求，拦截器会处理401
                const response = await api.get('/api/entries');
                setEntries(response.data);
            } catch (error) {
                console.error('Failed to fetch entries', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEntries();
    }, [token]); // token变化时重新获取

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {user ? `Welcome, ${user.name}` : 'Food Finding'}
                    </h1>
                    <div className="flex items-center space-x-4">
                        {!user && (
                            <Button
                                onPress={() => window.dispatchEvent(new CustomEvent('show-login-modal'))}
                                variant="bordered"
                                color="primary"
                            >
                                Login
                            </Button>
                        )}
                        <Button
                            as={Link}
                            to="/create-entry"
                            color="primary"
                            startContent={<Plus className="h-5 w-5" />}
                        >
                            Log Food
                        </Button>
                    </div>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {entries.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No food logs yet. Start by adding one!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {entries.map((entry) => (
                                <Card key={entry.id} className="py-4" shadow="sm">
                                    <CardBody className="overflow-visible py-2">
                                        {entry.imageUrl && (
                                            <Image
                                                alt={entry.title}
                                                className="object-cover rounded-xl"
                                                src={entry.imageUrl}
                                                width={400}
                                                height={200}
                                            />
                                        )}
                                        <div className="pt-4 flex justify-between items-start">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">{entry.title}</h3>
                                            <Chip
                                                startContent={<Star className="h-3 w-3" fill="currentColor" />}
                                                variant="flat"
                                                color="warning"
                                                size="sm"
                                            >
                                                {entry.rating}
                                            </Chip>
                                        </div>
                                        {entry.description && (
                                            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{entry.description}</p>
                                        )}
                                    </CardBody>
                                    <CardFooter className="pb-0 pt-2 px-4 flex-col items-start">
                                        <div className="flex items-center text-sm text-gray-500 w-full justify-between">
                                            {entry.location && (
                                                <div className="flex items-center">
                                                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                    {entry.location}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-400">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
