import { useState, useEffect } from 'react';
import api from '../../services/api';
import BackButton from '../../components/BackButton';

function Attendance() {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'administrator';
    const isTeacher = user?.role === 'teacher';

    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [students, setStudents] = useState([]);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    // Load classes for admin, or assigned class for teacher
    useEffect(() => {
        const loadClasses = async () => {
            try {
                if (isAdmin) {
                    const res = await api.get('/teachers/classes');
                    setClasses(res.data);
                } else if (isTeacher) {
                    const res = await api.get('/attendance/teacher-class');
                    setSelectedClass(res.data.id);
                    setClasses([res.data]);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load class.');
            }
        };
        loadClasses();
    }, [isAdmin, isTeacher]);

    // Load students when class or date changes
    useEffect(() => {
        if (!selectedClass || !selectedDate) return;

        const loadStudents = async () => {
            setLoading(true);
            setMessage('');
            setError('');
            try {
                const res = await api.get('/attendance/class', {
                    params: { class_id: selectedClass, date: selectedDate },
                });
                // Default unrecorded students to 'present'
                const withDefaults = res.data.students.map(s => ({
                    ...s,
                    status: s.status || 'present',
                }));
                setStudents(withDefaults);
                setAlreadySubmitted(res.data.alreadySubmitted);
            } catch (err) {
                setError('Failed to load students.');
            } finally {
                setLoading(false);
            }
        };

        loadStudents();
    }, [selectedClass, selectedDate]);

    const handleStatusChange = (student_id, status) => {
        setStudents(prev =>
            prev.map(s => s.id === student_id ? { ...s, status } : s)
        );
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setMessage('');
        setError('');

        try {
            const records = students.map(s => ({
                student_id: s.id,
                status: s.status,
            }));

            await api.post('/attendance/submit', {
                class_id: selectedClass,
                date: selectedDate,
                records,
            });

            setMessage(alreadySubmitted
                ? 'Attendance updated successfully.'
                : 'Attendance submitted successfully.'
            );
            setAlreadySubmitted(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const statusColor = (status) => {
        if (status === 'present') return 'bg-green-100 text-green-700';
        if (status === 'absent') return 'bg-red-100 text-red-700';
        if (status === 'late') return 'bg-yellow-100 text-yellow-700';
        return '';
    };

    return (
        <div className="p-8">
            <BackButton />
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Attendance Tracking</h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                {isAdmin && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            value={selectedClass}
                            onChange={e => setSelectedClass(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a class</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                )}

                {isTeacher && classes.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <p className="border border-gray-200 bg-gray-50 rounded px-3 py-2 text-sm text-gray-700">
                            {classes[0].name}
                        </p>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

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

            {alreadySubmitted && (
                <div className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-4 py-2 rounded text-sm mb-4">
                    Attendance has already been submitted for this date. You can still make changes and resubmit.
                </div>
            )}

            {/* Attendance Table */}
            {loading ? (
                <p className="text-gray-500 text-sm">Loading students...</p>
            ) : students.length === 0 ? (
                <p className="text-gray-400 text-sm">
                    {selectedClass ? 'No students found in this class.' : 'Select a class to begin.'}
                </p>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white rounded-lg shadow mb-4">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Adm. No.</th>
                                <th className="px-4 py-3 text-left">Full Name</th>
                                <th className="px-4 py-3 text-left">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{student.admission_number}</td>
                                    <td className="px-4 py-3 font-medium">{student.full_name}</td>
                                    <td className="px-4 py-3">
                                        {isTeacher ? (
                                            <div className="flex gap-2">
                                                {['present', 'absent', 'late'].map(s => (
                                                    <button
                                                        key={s}
                                                        onClick={() => handleStatusChange(student.id, s)}
                                                        className={`px-3 py-1 rounded text-xs font-medium capitalize border transition
                                ${student.status === s
                                                            ? statusColor(s) + ' border-transparent'
                                                            : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColor(student.status)}`}>
                          {student.status}
                        </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {isTeacher && (
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                {students.length} students — {students.filter(s => s.status === 'present').length} present,{' '}
                                {students.filter(s => s.status === 'absent').length} absent,{' '}
                                {students.filter(s => s.status === 'late').length} late
                            </p>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : alreadySubmitted ? 'Update Attendance' : 'Submit Attendance'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Attendance;