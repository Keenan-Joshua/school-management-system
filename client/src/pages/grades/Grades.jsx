import { useState, useEffect } from 'react';
import api from '../../services/api';
import SubjectManager from './SubjectManager';
import ReportCard from './ReportCard';

function Grades() {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'administrator';
    const isTeacher = user?.role === 'teacher';

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('Term 1');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [viewReportCard, setViewReportCard] = useState(null);

    useEffect(() => {
        const loadInitial = async () => {
            try {
                const subjectRes = await api.get('/grades/subjects');
                setSubjects(subjectRes.data);

                if (isAdmin) {
                    const classRes = await api.get('/teachers/classes');
                    setClasses(classRes.data);
                } else if (isTeacher) {
                    const classRes = await api.get('/attendance/teacher-class');
                    setSelectedClass(classRes.data.id);
                    setClasses([classRes.data]);
                }
            } catch (err) {
                setError('Failed to load initial data.');
            }
        };
        loadInitial();
    }, [isAdmin, isTeacher]);

    useEffect(() => {
        if (!selectedClass || !selectedSubject || !selectedTerm || !selectedYear) return;

        const loadGrades = async () => {
            setLoading(true);
            setMessage('');
            setError('');
            try {
                const res = await api.get('/grades/class', {
                    params: {
                        class_id: selectedClass,
                        subject_id: selectedSubject,
                        term: selectedTerm,
                        year: selectedYear,
                    },
                });
                setStudents(res.data);
            } catch (err) {
                setError('Failed to load grades.');
            } finally {
                setLoading(false);
            }
        };
        loadGrades();
    }, [selectedClass, selectedSubject, selectedTerm, selectedYear]);

    const handleScoreChange = (student_id, field, value) => {
        setStudents(prev =>
            prev.map(s => s.id === student_id ? { ...s, [field]: value } : s)
        );
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setMessage('');
        setError('');
        try {
            await api.post('/grades/submit', {
                class_id: selectedClass,
                subject_id: selectedSubject,
                term: selectedTerm,
                year: selectedYear,
                records: students.map(s => ({
                    student_id: s.id,
                    cat1_score: s.cat1_score,
                    cat2_score: s.cat2_score,
                    exam_score: s.exam_score,
                })),
            });
            setMessage('Grades submitted successfully.');
            // Reload to show calculated averages and grades
            const res = await api.get('/grades/class', {
                params: {
                    class_id: selectedClass,
                    subject_id: selectedSubject,
                    term: selectedTerm,
                    year: selectedYear,
                },
            });
            setStudents(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    const gradeColor = (grade) => {
        if (grade === 'EE') return 'text-green-600 font-bold';
        if (grade === 'ME') return 'text-blue-600 font-bold';
        if (grade === 'AE') return 'text-yellow-600 font-bold';
        if (grade === 'BE') return 'text-red-600 font-bold';
        return 'text-gray-400';
    };

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Grades and Report Cards</h2>

            {isAdmin && (
                <SubjectManager
                    subjects={subjects}
                    onUpdate={() => api.get('/grades/subjects').then(r => setSubjects(r.data))}
                />
            )}

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6 mt-6">
                {isAdmin && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                        <select
                            value={selectedClass}
                            onChange={e => setSelectedClass(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select class</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select
                        value={selectedSubject}
                        onChange={e => setSelectedSubject(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select subject</option>
                        {subjects.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                    <select
                        value={selectedTerm}
                        onChange={e => setSelectedTerm(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>Term 1</option>
                        <option>Term 2</option>
                        <option>Term 3</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                        type="number"
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        min="2020"
                        max="2099"
                        className="border border-gray-300 rounded px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {message && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded text-sm mb-4">{message}</div>
            )}
            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">{error}</div>
            )}

            {/* Grades Table */}
            {loading ? (
                <p className="text-gray-500 text-sm">Loading grades...</p>
            ) : students.length === 0 ? (
                <p className="text-gray-400 text-sm">
                    {selectedClass && selectedSubject ? 'No students found.' : 'Select a class and subject to begin.'}
                </p>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white rounded-lg shadow mb-4">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 text-left">Adm. No.</th>
                                <th className="px-4 py-3 text-left">Full Name</th>
                                <th className="px-4 py-3 text-left">CAT 1</th>
                                <th className="px-4 py-3 text-left">CAT 2</th>
                                <th className="px-4 py-3 text-left">Exam</th>
                                <th className="px-4 py-3 text-left">Average</th>
                                <th className="px-4 py-3 text-left">Grade</th>
                                <th className="px-4 py-3 text-left">Report Card</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {students.map(student => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{student.admission_number}</td>
                                    <td className="px-4 py-3 font-medium">{student.full_name}</td>
                                    {['cat1_score', 'cat2_score', 'exam_score'].map(field => (
                                        <td key={field} className="px-4 py-2">
                                            {isTeacher ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={student[field]}
                                                    onChange={e => handleScoreChange(student.id, field, e.target.value)}
                                                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <span>{student[field] !== '' ? student[field] : '—'}</span>
                                            )}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3">
                                        {student.average !== '' ? student.average : '—'}
                                    </td>
                                    <td className={`px-4 py-3 ${gradeColor(student.grade)}`}>
                                        {student.grade || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setViewReportCard(student)}
                                            className="text-blue-600 hover:underline text-xs"
                                        >
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {isTeacher && (
                        <div className="flex justify-end">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
                            >
                                {submitting ? 'Submitting...' : 'Submit Grades'}
                            </button>
                        </div>
                    )}
                </>
            )}

            {viewReportCard && (
                <ReportCard
                    student={viewReportCard}
                    term={selectedTerm}
                    year={selectedYear}
                    onClose={() => setViewReportCard(null)}
                />
            )}
        </div>
    );
}

export default Grades;