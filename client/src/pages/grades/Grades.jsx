import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import TaskForm from './TaskForm';
import ScoreSheet from './ScoreSheet';
import ReportCard from './ReportCard';
import SubjectManager from './SubjectManager';
import Spinner from '../../components/Spinner';
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';
import ConfirmModal from '../../components/ConfirmModal';

function Grades() {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'administrator';
    const isTeacher = user?.role === 'teacher';
    const isParent = user?.role === 'parent';

    const { toast, showToast, hideToast } = useToast();

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teacherAssignments, setTeacherAssignments] = useState([]);
    const [children, setChildren] = useState([]);

    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedTerm, setSelectedTerm] = useState('Term 1');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedChild, setSelectedChild] = useState('');

    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    const [showTaskForm, setShowTaskForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [scoringTask, setScoringTask] = useState(null);
    const [taskToDelete, setTaskToDelete] = useState(null);
    const [viewReportCard, setViewReportCard] = useState(null);

    const fetchTasks = useCallback( async () => {
        if (!selectedClass || !selectedSubject || !selectedTerm || !selectedYear) return;
        setLoading(true);
        try {
            const res = await api.get('/grades/tasks', {
                params: {
                    class_id: selectedClass,
                    subject_id: selectedSubject,
                    term: selectedTerm,
                    year: selectedYear,
                },
            });
            setTasks(res.data);
        } catch (err) {
            showToast('Failed to load tasks.', 'error');
        } finally {
            setLoading(false);
        }
    }, [selectedClass, selectedSubject, selectedTerm, selectedYear, showToast]);

    useEffect(() => {
        const loadInitial = async () => {
            try {
                const subjectRes = await api.get('/grades/subjects');
                setSubjects(subjectRes.data);

                if (isAdmin) {
                    const classRes = await api.get('/teachers/classes');
                    setClasses(classRes.data);
                } else if (isTeacher) {
                    const assignmentRes = await api.get('/teacher-subjects/mine');
                    setTeacherAssignments(assignmentRes.data);
                } else if (isParent) {
                    const childRes = await api.get('/parents/my-children');
                    setChildren(childRes.data);
                    if (childRes.data.length > 0) setSelectedChild(childRes.data[0].id);
                }
            } catch (err) {
                showToast('Failed to load initial data.', 'error');
            } finally {
                setInitialLoading(false);
            }
        };
        loadInitial();
    }, [isAdmin, isTeacher, isParent, showToast]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleDeleteTask = async () => {
        try {
            await api.delete(`/grades/tasks/${taskToDelete}`);
            setTaskToDelete(null);
            showToast('Task deleted successfully.');
            fetchTasks();
        } catch (err) {
            showToast('Failed to delete task.', 'error');
            setTaskToDelete(null);
        }
    };

    if (initialLoading) return <Spinner message="Loading grades module..." />;

    return (
        <div className="p-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6">Grades & Report Cards</h2>

            {/* Admin subject manager */}
            {isAdmin && (
                <SubjectManager
                    subjects={subjects}
                    onUpdate={() => api.get('/grades/subjects').then(r => setSubjects(r.data))}
                />
            )}

            {/* Parent view */}
            {isParent ? (
                <div>
                    {children.length === 0 ? (
                        <p className="text-gray-400 text-sm">No children linked to your account yet.</p>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-4 mb-6">
                                {children.length > 1 && (
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                                    <select
                                        value={selectedTerm}
                                        onChange={e => setSelectedTerm(e.target.value)}
                                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                                        min="2020" max="2099"
                                        className="border border-gray-300 rounded px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => setViewReportCard(children.find(c => c.id === parseInt(selectedChild)))}
                                className="bg-emerald-600 text-white px-5 py-2 rounded hover:bg-emerald-700 text-sm"
                            >
                                View Report Card
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <>
                    {/* Filters */}
                    <div className="flex flex-wrap gap-4 mb-6 mt-4">
                        {isTeacher ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class & Subject</label>
                                <select
                                    value={selectedClass && selectedSubject ? `${selectedClass}-${selectedSubject}` : ''}
                                    onChange={e => {
                                        const [class_id, subject_id] = e.target.value.split('-');
                                        setSelectedClass(class_id);
                                        setSelectedSubject(subject_id);
                                    }}
                                    className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    <option value="">Select class & subject</option>
                                    {teacherAssignments.map(a => (
                                        <option key={a.id} value={`${a.class_id}-${a.subject_id}`}>
                                            {a.class_name} — {a.subject_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                    <select
                                        value={selectedClass}
                                        onChange={e => setSelectedClass(e.target.value)}
                                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                                        value={selectedSubject}
                                        onChange={e => setSelectedSubject(e.target.value)}
                                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="">Select subject</option>
                                        {subjects.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                            <select
                                value={selectedTerm}
                                onChange={e => setSelectedTerm(e.target.value)}
                                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                                min="2020" max="2099"
                                className="border border-gray-300 rounded px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Tasks section */}
                    {selectedClass && selectedSubject ? (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-semibold text-gray-700">
                                    Tasks — {selectedTerm} {selectedYear}
                                </h3>
                                {isTeacher && (
                                    <button
                                        onClick={() => { setEditingTask(null); setShowTaskForm(true); }}
                                        className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm"
                                    >
                                        + Create Task
                                    </button>
                                )}
                            </div>

                            {loading ? (
                                <Spinner message="Loading tasks..." />
                            ) : tasks.length === 0 ? (
                                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
                                    No tasks created yet for this combination.
                                    {isTeacher && ' Click "Create Task" to add one.'}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {tasks.map(task => (
                                        <div key={task.id} className="bg-white rounded-lg shadow p-4">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-800">{task.title}</p>
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {task.competencies.map(c => (
                                                            <span
                                                                key={c.id}
                                                                className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full"
                                                            >
                                {c.name}
                              </span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 ml-4 text-sm flex-shrink-0">
                                                    <button
                                                        onClick={() => setScoringTask(task)}
                                                        className="text-emerald-600 hover:underline"
                                                    >
                                                        {isTeacher ? 'Enter Scores' : 'View Scores'}
                                                    </button>
                                                    {isTeacher && (
                                                        <>
                                                            <button
                                                                onClick={() => { setEditingTask(task); setShowTaskForm(true); }}
                                                                className="text-blue-500 hover:underline"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setTaskToDelete(task.id)}
                                                                className="text-red-500 hover:underline"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* View report card for a student in this class */}
                            {isAdmin && (
                                <div className="mt-6 bg-white rounded-lg shadow p-4">
                                    <p className="text-sm font-medium text-gray-700 mb-3">View Student Report Card</p>
                                    <div className="flex gap-3 flex-wrap">
                                        <select
                                            onChange={e => {
                                                if (e.target.value) setViewReportCard({ id: e.target.value, from: 'admin' });
                                            }}
                                            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        >
                                            <option value="">Select a student</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-400 text-sm mt-4">Select a class and subject to view tasks.</p>
                    )}
                </>
            )}

            {/* Modals */}
            {showTaskForm && (
                <TaskForm
                    task={editingTask}
                    classId={selectedClass}
                    subjectId={selectedSubject}
                    term={selectedTerm}
                    year={selectedYear}
                    onClose={(msg) => {
                        setShowTaskForm(false);
                        setEditingTask(null);
                        if (msg) showToast(msg);
                        fetchTasks();
                    }}
                />
            )}

            {scoringTask && (
                <ScoreSheet
                    task={scoringTask}
                    readOnly={!isTeacher}
                    onClose={(msg) => {
                        setScoringTask(null);
                        if (msg) showToast(msg);
                    }}
                />
            )}

            {viewReportCard && (
                <ReportCard
                    student={viewReportCard}
                    term={selectedTerm}
                    year={selectedYear}
                    onClose={() => setViewReportCard(null)}
                />
            )}

            {taskToDelete && (
                <ConfirmModal
                    title="Delete Task"
                    message="Are you sure you want to delete this task? All associated scores will also be permanently deleted."
                    confirmLabel="Delete"
                    onConfirm={handleDeleteTask}
                    onCancel={() => setTaskToDelete(null)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}

export default Grades;