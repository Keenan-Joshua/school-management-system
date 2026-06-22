import { useState, useEffect } from 'react';
import api from '../../services/api';

function SubjectAssignment() {
    const [assignments, setAssignments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ teacher_id: '', subject_id: '', class_id: '' });
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const fetchData = async () => {
        try {
            const [assignRes, teacherRes, subjectRes, classRes] = await Promise.all([
                api.get('/teacher-subjects'),
                api.get('/teachers'),
                api.get('/grades/subjects'),
                api.get('/teachers/classes'),
            ]);
            setAssignments(assignRes.data);
            setTeachers(teacherRes.data);
            setSubjects(subjectRes.data);
            setClasses(classRes.data);
        } catch (err) {
            setError('Failed to load assignment data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAssign = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await api.post('/teacher-subjects', formData);
            setMessage('Subject assigned successfully.');
            setFormData({ teacher_id: '', subject_id: '', class_id: '' });
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Assignment failed.');
        }
    };

    const handleReassign = async (id, teacher_id) => {
        setError('');
        setMessage('');
        try {
            await api.put(`/teacher-subjects/${id}`, { teacher_id });
            setMessage('Assignment updated successfully.');
            fetchData();
        } catch (err) {
            setError('Failed to update assignment.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this subject assignment?')) return;
        try {
            await api.delete(`/teacher-subjects/${id}`);
            fetchData();
        } catch (err) {
            setError('Failed to remove assignment.');
        }
    };

    if (loading) return <p className="text-gray-500 text-sm">Loading assignments...</p>;

    return (
        <div className="mt-10">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Subject-Class Teacher Assignment</h3>

            {message && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded text-sm mb-4">{message}</div>
            )}
            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">{error}</div>
            )}

            <form onSubmit={handleAssign} className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-3 items-end">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select
                        name="class_id"
                        value={formData.class_id}
                        onChange={handleChange}
                        required
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select class</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                        name="subject_id"
                        value={formData.subject_id}
                        onChange={handleChange}
                        required
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select subject</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                    <select
                        name="teacher_id"
                        value={formData.teacher_id}
                        onChange={handleChange}
                        required
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select teacher</option>
                        {teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.full_name}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                >
                    Assign
                </button>
            </form>

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 text-left">Class</th>
                        <th className="px-4 py-3 text-left">Subject</th>
                        <th className="px-4 py-3 text-left">Teacher</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {assignments.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-4 py-6 text-center text-gray-400">
                                No subject assignments yet.
                            </td>
                        </tr>
                    ) : (
                        assignments.map(a => (
                            <tr key={a.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">{a.class_name}</td>
                                <td className="px-4 py-3">{a.subject_name}</td>
                                <td className="px-4 py-3">
                                    <select
                                        value={a.teacher_id}
                                        onChange={e => handleReassign(a.id, e.target.value)}
                                        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.full_name}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleDelete(a.id)}
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

export default SubjectAssignment;