import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import type { FoodEntry } from '../types';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Star } from 'lucide-react';

export default function Dashboard() {
    const { token, user } = useAuth();
    const [entries, setEntries] = useState<FoodEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const response = await axios.get('http://localhost:3000/api/entries', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setEntries(response.data);
            } catch (error) {
                console.error('Failed to fetch entries', error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchEntries();
        }
    }, [token]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name}</h1>
                    <Link
                        to="/create-entry"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Log Food
                    </Link>
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
                                <div key={entry.id} className="bg-white overflow-hidden shadow rounded-lg">
                                    {entry.imageUrl && (
                                        <img className="h-48 w-full object-cover" src={entry.imageUrl} alt={entry.title} />
                                    )}
                                    <div className="px-4 py-5 sm:p-6">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">{entry.title}</h3>
                                            <div className="flex items-center bg-yellow-100 px-2 py-1 rounded-full">
                                                <Star className="h-4 w-4 text-yellow-500 mr-1" fill="currentColor" />
                                                <span className="text-sm font-medium text-yellow-800">{entry.rating}</span>
                                            </div>
                                        </div>
                                        {entry.description && (
                                            <p className="mt-2 text-sm text-gray-500 line-clamp-2">{entry.description}</p>
                                        )}
                                        <div className="mt-4 flex items-center text-sm text-gray-500">
                                            {entry.location && (
                                                <div className="flex items-center mr-4">
                                                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                                    {entry.location}
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-400">
                                                {new Date(entry.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
