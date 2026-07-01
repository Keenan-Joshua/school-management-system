import { useState, useEffect } from 'react';
import api from '../../services/api';

function Holidays() {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchHolidays = async () => {
        try {
            const res = await api.get('/holidays');
            setHolidays(res.data);
        } catch (err) {
            setError('Failed to load holidays.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHolidays(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await api.post('/holidays', { date, description });
            setMessage('Holiday added successfully.');
            setDate('');
            setDescription('');
            fetchHolidays();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add holiday.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this holiday?')) return;
        try {
            await api.delete(`/holidays/${id}`);
            fetchHolidays();
        } catch (err) {
            setError('Failed to remove holiday.');
        }
    };

    if (loading) return <p className="p-8 text-gray-500">Loading holidays...</p>;

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Holiday & Non-School Day Management</h2>

            <p className="text-sm text-gray-500 mb-4">
                Weekends are automatically excluded from attendance tracking. Use this page to mark additional non-school days such as public holidays and school breaks.
            </p>

            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">{error}</div>
            )}
            {message && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded text-sm mb-4">{message}</div>
            )}

            <form onSubmit={handleAdd} className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        required
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        placeholder="e.g. Labour Day, Mid-term break"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm"
                >
                    Add Holiday
                </button>
            </form>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Description</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {holidays.length === 0 ? (
                        <tr>
                            <td colSpan="3" className="px-4 py-6 text-center text-gray-400">
                                No holidays recorded yet.
                            </td>
                        </tr>
                    ) : (
                        holidays.map(h => (
                            <tr key={h.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                    {new Date(h.date).toLocaleDateString('en-KE', {
                                        year: 'numeric', month: 'long', day: 'numeric',
                                    })}
                                </td>
                                <td className="px-4 py-3">{h.description}</td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleDelete(h.id)}
                                        className="text-red-500 hover:underline"
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Holidays;