import { useState, useEffect } from 'react';
import api from '../../services/api';

function ClassAssignment() {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchData = async () => {
        try {
            const [classRes, teacherRes] = await Promise.all([
                api.get('/teachers/classes'),
                api.get('/teachers'),
            ]);
            setClasses(classRes.data);
            setTeachers(teacherRes.data);
        } catch (err) {
            console.error('Failed to fetch data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleAssign = async (class_id, teacher_id) => {
        setSaving(class_id);
        setMessage('');
        setError('');

        try {
            const res = await api.put(`/teachers/classes/${class_id}/assign`, { teacher_id });
            setMessage(res.data.message);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Assignment failed.');
        } finally {
            setSaving(null);
        }
    };

    if (loading) return <p className="text-gray-500 text-sm">Loading classes...</p>;

    return (
        <div className="mt-10">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Class Teacher Assignment</h3>

            {message && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded text-sm mb-4">
                    {message}
                </div>
            )}
            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 text-left">Class</th>
                        <th className="px-4 py-3 text-left">Current Class Teacher</th>
                        <th className="px-4 py-3 text-left">Assign Teacher</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {classes.map(cls => (
                        <tr key={cls.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{cls.name}</td>
                            <td className="px-4 py-3 text-gray-500">
                                {cls.teacher_name || '— Unassigned'}
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <select
                                        value={cls.teacher_id || ''}
                                        onChange={e => handleAssign(cls.id, e.target.value)}
                                        disabled={saving === cls.id}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">— Unassign —</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>
                                                {t.full_name}
                                            </option>
                                        ))}
                                    </select>
                                    {saving === cls.id && (
                                        <span className="text-xs text-gray-400">Saving...</span>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ClassAssignment;