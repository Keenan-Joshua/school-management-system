import { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

function Attendance() {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'administrator';
    const isTeacher = user?.role === 'teacher';
    const isParent = user?.role === 'parent';

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
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState('');
    const [parentAttendance, setParentAttendance] = useState([]);

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
                } else if (isParent) {
                    const res = await api.get('/parents/my-children');
                    setChildren(res.data);
                    if (res.data.length > 0) setSelectedChild(res.data[0].id);
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load data.');
            }
        };
        loadClasses();
    }, [isAdmin, isTeacher, isParent]);

    useEffect(() => {
        if (!isParent || !selectedChild) return;

        const loadParentAttendance = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get(`/attendance/parent/${selectedChild}`);
                setParentAttendance(res.data);
            } catch (err) {
                setError('Failed to load attendance.');
            } finally {
                setLoading(false);
            }
        };
        loadParentAttendance();
    }, [isParent, selectedChild]);

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

                if (res.data.nonSchoolDay) {
                    setStudents([]);
                    setError(res.data.nonSchoolDay);
                    setAlreadySubmitted(false);
                    return;
                }

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
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Attendance Tracking</h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                {isAdmin && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            value={selectedClass}
                            onChange={e => setSelectedClass(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

                {!isParent && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                )}
                {isParent && children.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Child</label>
                        <select
                            value={selectedChild}
                            onChange={e => setSelectedChild(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            {children.map(c => (
                                <option key={c.id} value={c.id}>{c.full_name} — {c.class_name}</option>
                            ))}
                        </select>
                    </div>
                )}
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

            {isParent ? (
                loading ? (
                    <Spinner message="Loading attendance..." />
                ) : children.length === 0 ? (
                    <p className="text-gray-400 text-sm">No children linked to your account yet. Contact the school administrator.</p>
                ) : (
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Date</th>
                                <th className="px-4 py-3 text-left">Class</th>
                                <th className="px-4 py-3 text-left">Status</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {parentAttendance.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-4 py-6 text-center text-gray-400">
                                        No attendance records found.
                                    </td>
                                </tr>
                            ) : (
                                parentAttendance.map((record, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">{new Date(record.date).toLocaleDateString()}</td>
                                        <td className="px-4 py-3">{record.class_name}</td>
                                        <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${statusColor(record.status)}`}>
                          {record.status}
                        </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>
                )
            ) : loading ? (
                <Spinner message="Loading attendance..." />
            ) : students.length === 0 ? (
                <p className="text-gray-400 text-sm">
                    {error ? '' : selectedClass ? 'No students found in this class.' : 'Select a class to begin.'}
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
                                className="bg-emerald-600 text-white px-5 py-2 rounded hover:bg-emerald-700 text-sm disabled:opacity-50"
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