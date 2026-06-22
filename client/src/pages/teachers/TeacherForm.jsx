import { useState, useEffect } from 'react';
import api from '../../services/api';

function TeacherForm({ teacher, onClose }) {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        gender: '',
        date_joined: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (teacher) {
            setFormData({
                full_name: teacher.full_name,
                email: teacher.email,
                phone: teacher.phone,
                gender: teacher.gender,
                date_joined: teacher.date_joined?.split('T')[0],
            });
        }
    }, [teacher]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (teacher) {
                await api.put(`/teachers/${teacher.id}`, formData);
            } else {
                await api.post('/teachers', formData);
            }
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 overflow-y-auto max-h-screen">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {teacher ? 'Edit Teacher' : 'Add New Teacher'}
                </h3>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { label: 'Full Name', name: 'full_name', type: 'text' },
                        { label: 'Email', name: 'email', type: 'email' },
                        { label: 'Phone Number', name: 'phone', type: 'text' },
                        { label: 'Date Joined', name: 'date_joined', type: 'date' },
                    ].map(field => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    ))}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Gender
                        </label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : teacher ? 'Update Teacher' : 'Add Teacher'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TeacherForm;