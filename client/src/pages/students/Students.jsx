import { useState, useEffect } from 'react';
import api from '../../services/api';
import StudentForm from './StudentForm';
import ConfirmModal from '../../components/ConfirmModal';
import Spinner from '../../components/Spinner';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';


function Students() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [search, setSearch] = useState('');
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'administrator';
    const [studentToDelete, setStudentToDelete] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students');
            setStudents(res.data);
        } catch (err) {
            console.error('Failed to fetch students:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        api.get('/students/classes').then(res => setClasses(res.data));
    }, []);

    const confirmDelete = async () => {
        try {
            await api.delete(`/students/${studentToDelete}`);
            setStudentToDelete(null);
            fetchStudents();
            showToast('Student deleted successfully.');
        } catch (err) {
            showToast(err.response?.data?.message || 'Delete failed.', 'error');
            setStudentToDelete(null);
        }
    };

    const handleEdit = (student) => {
        setSelectedStudent(student);
        setShowForm(true);
    };

    const handleFormClose = (message) => {
        setSelectedStudent(null);
        setShowForm(false);
        if (message) showToast(message);
        fetchStudents();
    };

    const filtered = students.filter(s => {
        const matchesSearch =
            s.full_name.toLowerCase().includes(search.toLowerCase()) ||
            s.admission_number.toLowerCase().includes(search.toLowerCase());
        const matchesClass = selectedClass === '' || s.class_id === parseInt(selectedClass);
        return matchesSearch && matchesClass;
    });

    if (loading) return <Spinner message="Loading students..." />;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Student Registration</h2>
                {isAdmin && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm"
                    >
                        + Add Student
                    </button>
                )}
            </div>

            <div className="flex gap-3 mb-4">
                <input
                    type="text"
                    placeholder="Search by name or admission number..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <select
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="">All Classes</option>
                    {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            {showForm && (
                <StudentForm
                    student={selectedStudent}
                    onClose={handleFormClose}
                />
            )}

            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                        <th className="px-4 py-3 text-left">Adm. No.</th>
                        <th className="px-4 py-3 text-left">Full Name</th>
                        <th className="px-4 py-3 text-left">Class</th>
                        <th className="px-4 py-3 text-left">Gender</th>
                        <th className="px-4 py-3 text-left">Guardian</th>
                        <th className="px-4 py-3 text-left">Contact</th>
                        {isAdmin && <th className="px-4 py-3 text-left">Actions</th>}
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                        <tr>
                            <td colSpan="7" className="px-4 py-6 text-center text-gray-400">
                                No students found.
                            </td>
                        </tr>
                    ) : (
                        filtered.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">{student.admission_number}</td>
                                <td className="px-4 py-3 font-medium">{student.full_name}</td>
                                <td className="px-4 py-3">{student.class_name || '—'}</td>
                                <td className="px-4 py-3 capitalize">{student.gender}</td>
                                <td className="px-4 py-3">{student.guardian_name}</td>
                                <td className="px-4 py-3">{student.guardian_contact}</td>
                                {isAdmin && (
                                    <td className="px-4 py-3 flex gap-2">
                                        <button
                                            onClick={() => handleEdit(student)}
                                            className="text-emerald-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setStudentToDelete(student.id)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
            {studentToDelete && (
                <ConfirmModal
                    title="Delete Student"
                    message="Are you sure you want to delete this student? This will also remove their attendance, grades, and guardian links."
                    confirmLabel="Delete"
                    onConfirm={confirmDelete}
                    onCancel={() => setStudentToDelete(null)}
                />
            )}
        </div>
    );
}

export default Students;