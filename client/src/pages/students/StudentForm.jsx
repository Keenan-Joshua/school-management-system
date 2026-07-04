import { useState, useEffect } from 'react';
import api from '../../services/api';
import ParentLinker from './ParentLinker';

function StudentForm({ student, onClose }) {
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({
        admission_number: '',
        full_name: '',
        date_of_birth: '',
        gender: '',
        class_id: '',
        guardian_name: '',
        guardian_contact: '',
        enrollment_date: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/students/classes').then(res => setClasses(res.data));
        if (student) {
            setFormData({
                admission_number: student.admission_number,
                full_name: student.full_name,
                date_of_birth: student.date_of_birth?.split('T')[0],
                gender: student.gender,
                class_id: student.class_id || '',
                guardian_name: student.guardian_name,
                guardian_contact: student.guardian_contact,
                enrollment_date: student.enrollment_date?.split('T')[0],
            });
        }
    }, [student]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (student) {
                await api.put(`/students/${student.id}`, formData);
            } else {
                await api.post('/students', formData);
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
                    {student ? 'Edit Student' : 'Register New Student'}
                </h3>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { label: 'Admission Number', name: 'admission_number', type: 'text' },
                        { label: 'Full Name', name: 'full_name', type: 'text' },
                        { label: 'Date of Birth', name: 'date_of_birth', type: 'date' },
                        { label: 'Guardian Name', name: 'guardian_name', type: 'text' },
                        { label: 'Guardian Contact', name: 'guardian_contact', type: 'text' },
                        { label: 'Enrollment Date', name: 'enrollment_date', type: 'date' },
                    ].map(field => (
                        <div key={field.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={formData[field.name]}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    ))}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            name="class_id"
                            value={formData.class_id}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="">Select class</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
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
                            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : student ? 'Update Student' : 'Register Student'}
                        </button>
                    </div>
                </form>
                {student && (
                    <ParentLinker
                        studentId={student.id}
                        guardianName={student.guardian_name}
                        guardianContact={student.guardian_contact}
                    />
                )}
            </div>
        </div>
    );
}

export default StudentForm;