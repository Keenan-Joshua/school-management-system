import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import DashboardSkeleton from '../../components/DashboardSkeleton';

function AnnouncementPromptForm({ cls, onSent, onCancel }) {
    const today = new Date().toLocaleDateString('en-KE', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const isAll = cls.id === 'all';
    const [title, setTitle] = useState(
        isAll
            ? 'Attendance Reminder — All Classes'
            : `Attendance Reminder — ${cls.name}`
    );
    const [body, setBody] = useState(
        isAll
            ? `This is a reminder to all class teachers who have not yet recorded attendance for today, ${today}. Please ensure this is completed as soon as possible.`
            : `This is a reminder to record attendance for ${cls.name} for today, ${today}. Please ensure this is completed as soon as possible.`
    );
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            await api.post('/announcements', {
                title,
                body,
                audience: 'teachers',
            });
            onSent(cls.id);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to post announcement.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm">{error}</div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea
                    value={body}
                    onChange={e => setBody(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            <p className="text-xs text-gray-400">
                This announcement will be posted to <strong>Teachers</strong> only.
            </p>

            <div className="flex justify-end gap-3">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                >
                    {loading ? 'Posting...' : 'Post Reminder'}
                </button>
            </div>
        </div>
    );
}

function AdminDashboard() {
    const [missingAttendance, setMissingAttendance] = useState([]);
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [promptClass, setPromptClass] = useState(null);
    const [postingAnnouncement, setPostingAnnouncement] = useState(false);
    const [announcementSent, setAnnouncementSent] = useState({});
    const [todayIsNonSchoolDay, setTodayIsNonSchoolDay] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [attRes, holRes, annRes] = await Promise.all([
                    api.get('/attendance/missing-today'),
                    api.get('/holidays/upcoming'),
                    api.get('/announcements'),
                ]);
                setMissingAttendance(attRes.data.missing || []);
                setTodayIsNonSchoolDay(attRes.data.nonSchoolDay || null);
                setUpcomingHolidays(holRes.data);
                setAnnouncements(annRes.data.slice(0, 5));
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Classes missing attendance */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Attendance — Today</h3>
                    <p className="text-xs text-gray-400 mb-4">Classes that have not yet recorded attendance</p>

                    {todayIsNonSchoolDay ? (
                        <p className="text-sm text-gray-400 italic">{todayIsNonSchoolDay}</p>
                    ) : missingAttendance.length === 0 ? (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm">
                            <span>✓</span> All classes have submitted attendance today
                        </div>
                    ) : (
                        <>
                            {missingAttendance.length > 0 && (
                                <div className="flex justify-end mb-3">
                                    <button
                                        onClick={() => setPromptClass({ id: 'all', name: 'all missing classes' })}
                                        className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700"
                                    >
                                        Remind All
                                    </button>
                                </div>
                            )}
                            <ul className="space-y-2">
                                {missingAttendance.map(cls => (
                                    <li key={cls.id} className="flex justify-between items-center text-sm">
                                        <span className="text-gray-700">{cls.name}</span>
                                        {announcementSent[cls.id] ? (
                                            <span className="text-xs text-emerald-600">Reminder sent</span>
                                        ) : (
                                            <button
                                                onClick={() => setPromptClass(cls)}
                                                className="text-xs text-amber-600 hover:underline"
                                            >
                                                Remind teacher →
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                {/* Upcoming holidays */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Upcoming Holidays</h3>
                    <p className="text-xs text-gray-400 mb-4">Non-school days in the next period</p>
                    {upcomingHolidays.length === 0 ? (
                        <p className="text-sm text-gray-400">No upcoming holidays recorded.</p>
                    ) : (
                        <ul className="space-y-2">
                            {upcomingHolidays.map(h => (
                                <li
                                    key={h.id}
                                    onClick={() => navigate('/holidays')}
                                    className="flex justify-between items-center text-sm cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 transition"
                                >
                                    <span className="text-gray-700">{h.description}</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(h.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recent announcements */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Recent Announcements</h3>
                    <p className="text-xs text-gray-400 mb-4">Latest notices posted to the school</p>
                    {announcements.length === 0 ? (
                        <p className="text-sm text-gray-400">No announcements yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {announcements.map(a => (
                                <li
                                    key={a.id}
                                    onClick={() => navigate('/announcements', { state: { highlightId: a.id } })}
                                    className="border-b border-gray-100 pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 transition"
                                >
                                    <p className="text-sm font-medium text-gray-700">{a.title}</p>
                                    <p className="text-xs text-gray-400 capitalize">
                                        {a.audience} · {new Date(a.created_at).toLocaleDateString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            {promptClass && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Remind Class Teacher
                        </h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Post an announcement reminding the class teacher of{' '}
                            <strong>{promptClass.name}</strong> to record today's attendance.
                        </p>

                        <AnnouncementPromptForm
                            cls={promptClass}
                            onSent={(classId) => {
                                if (classId === 'all') {
                                    const allMarked = {};
                                    missingAttendance.forEach(c => { allMarked[c.id] = true; });
                                    setAnnouncementSent(allMarked);
                                } else {
                                    setAnnouncementSent(prev => ({ ...prev, [classId]: true }));
                                }
                                setPromptClass(null);
                            }}
                            onCancel={() => setPromptClass(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

function TeacherDashboard() {
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [attRes, assignRes, annRes, holRes] = await Promise.all([
                    api.get('/attendance/my-status-today'),
                    api.get('/teacher-subjects/mine'),
                    api.get('/announcements'),
                    api.get('/holidays/upcoming'),
                ]);
                setAttendanceStatus(attRes.data);
                setAssignments(assignRes.data);
                setAnnouncements(annRes.data.slice(0, 5));
                setUpcomingHolidays(holRes.data);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return <DashboardSkeleton />;

    return (
        <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Attendance status */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Attendance — Today</h3>
                    <p className="text-xs text-gray-400 mb-4">Your class attendance status for today</p>
                    {!attendanceStatus?.assigned ? (
                        <p className="text-sm text-gray-400">No class assigned to you yet.</p>
                    ) : attendanceStatus.nonSchoolDay ? (
                        <p className="text-sm text-gray-400 italic">{attendanceStatus.nonSchoolDay}</p>
                    ) : attendanceStatus.submitted ? (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm">
                            <span>✓</span> Attendance submitted for {attendanceStatus.class_name}
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm text-amber-600 mb-3">
                                ⚠ Attendance not yet submitted for {attendanceStatus.class_name}
                            </p>
                            <Link
                                to="/attendance"
                                className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700"
                            >
                                Record attendance now →
                            </Link>
                        </div>
                    )}
                </div>

                {/* Subject assignments */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Your Assignments</h3>
                    <p className="text-xs text-gray-400 mb-4">Classes and subjects you teach</p>
                    {assignments.length === 0 ? (
                        <p className="text-sm text-gray-400">No subject assignments yet.</p>
                    ) : (
                        <ul className="space-y-2">
                            {assignments.map(a => (
                                <li key={a.id} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700">{a.subject_name}</span>
                                    <span className="text-xs text-gray-400">{a.class_name}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Upcoming holidays */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Upcoming Holidays</h3>
                    <p className="text-xs text-gray-400 mb-4">Non-school days in the next period</p>
                    {upcomingHolidays.length === 0 ? (
                        <p className="text-sm text-gray-400">No upcoming holidays recorded.</p>
                    ) : (
                        <ul className="space-y-2">
                            {upcomingHolidays.map(h => (
                                <li
                                    key={h.id}
                                    className="flex justify-between items-center text-sm px-2 py-1"
                                >
                                    <span className="text-gray-700">{h.description}</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(h.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Recent announcements */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">Recent Announcements</h3>
                    <p className="text-xs text-gray-400 mb-4">Notices directed at teachers or all staff</p>
                    {announcements.length === 0 ? (
                        <p className="text-sm text-gray-400">No announcements yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {announcements.map(a => (
                                <li
                                    key={a.id}
                                    onClick={() => navigate('/announcements', { state: { highlightId: a.id } })}
                                    className="border-b border-gray-100 pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 transition"
                                >
                                    <p className="text-sm font-medium text-gray-700">{a.title}</p>
                                    <p className="text-xs text-gray-400 capitalize">
                                        {a.audience} · {new Date(a.created_at).toLocaleDateString()}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}

function ParentDashboard() {
    const [children, setChildren] = useState([]);
    const [selectedChild, setSelectedChild] = useState(null);
    const [recentAttendance, setRecentAttendance] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [upcomingHolidays, setUpcomingHolidays] = useState([]);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [childRes, annRes, holRes] = await Promise.all([
                    api.get('/parents/my-children'),
                    api.get('/announcements'),
                    api.get('/holidays/upcoming'),
                ]);
                setChildren(childRes.data);
                setAnnouncements(annRes.data.slice(0, 5));
                setUpcomingHolidays(holRes.data);
                if (childRes.data.length > 0) setSelectedChild(childRes.data[0]);
            } catch (err) {
                console.error('Dashboard load error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        if (!selectedChild) return;
        api.get(`/attendance/parent/${selectedChild.id}`)
            .then(res => setRecentAttendance(res.data.slice(0, 5)))
            .catch(() => setRecentAttendance([]));
    }, [selectedChild]);

    if (loading) return <DashboardSkeleton />;

    const statusColor = (status) => {
        if (status === 'present') return 'text-emerald-600';
        if (status === 'absent') return 'text-red-600';
        if (status === 'late') return 'text-amber-600';
        return 'text-gray-400';
    };

    return (
        <div className="p-8">
            {children.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <p className="text-gray-500 text-sm">No children linked to your account yet. Contact the school administrator.</p>
                </div>
            ) : (
                <>
                    {/* Child selector */}
                    {children.length > 1 && (
                        <div className="mb-6 flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700">Viewing:</label>
                            <select
                                value={selectedChild?.id}
                                onChange={e => setSelectedChild(children.find(c => c.id === parseInt(e.target.value)))}
                                className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                {children.map(c => (
                                    <option key={c.id} value={c.id}>{c.full_name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Recent attendance */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">
                                Recent Attendance
                            </h3>
                            <p className="text-xs text-gray-400 mb-4">
                                {selectedChild?.full_name} · {selectedChild?.class_name}
                            </p>
                            {recentAttendance.length === 0 ? (
                                <p className="text-sm text-gray-400">No attendance records found.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {recentAttendance.map((r, idx) => (
                                        <li key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        {new Date(r.date).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                                            <span className={`capitalize font-medium text-xs ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <Link to="/attendance" className="text-xs text-emerald-600 hover:underline mt-3 block">
                                View full history →
                            </Link>
                        </div>

                        {/* Report card link */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Report Card</h3>
                            <p className="text-xs text-gray-400 mb-4">
                                View {selectedChild?.full_name}'s academic results
                            </p>
                            <Link
                                to="/grades"
                                className="inline-block text-sm bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                            >
                                View report card →
                            </Link>
                        </div>

                        {/* Recent announcements */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Recent Announcements</h3>
                            <p className="text-xs text-gray-400 mb-4">Notices from the school</p>
                            {announcements.length === 0 ? (
                                <p className="text-sm text-gray-400">No announcements yet.</p>
                            ) : (
                                <ul className="space-y-3">
                                    {announcements.map(a => (
                                        <li
                                            key={a.id}
                                            onClick={() => navigate('/announcements', { state: { highlightId: a.id } })}
                                            className="border-b border-gray-100 pb-2 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 -mx-2 transition"
                                        >
                                            <p className="text-sm font-medium text-gray-700">{a.title}</p>
                                            <p className="text-xs text-gray-400 capitalize">
                                                {a.audience} · {new Date(a.created_at).toLocaleDateString()}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {/* Upcoming Holidays */}
                        <div className="bg-white rounded-xl border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 mb-1">Upcoming Holidays</h3>
                            <p className="text-xs text-gray-400 mb-4">Non-school days in the next period</p>
                            {upcomingHolidays.length === 0 ? (
                                <p className="text-sm text-gray-400">No upcoming holidays recorded.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {upcomingHolidays.map(h => (
                                        <li
                                            key={h.id}
                                            className="flex justify-between items-center text-sm px-2 py-1"
                                        >
                                            <span className="text-gray-700">{h.description}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(h.date).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function Dashboard() {
    const user = JSON.parse(localStorage.getItem('user'));

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div>
            <div className="px-8 pt-8 pb-2">
                <h2 className="text-xl font-semibold text-gray-800">
                    {greeting()}, {user?.full_name.split(' ')[0]}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                    Here is what needs your attention today.
                </p>
            </div>

            {user?.role === 'administrator' && <AdminDashboard />}
            {user?.role === 'teacher' && <TeacherDashboard />}
            {user?.role === 'parent' && <ParentDashboard />}
        </div>
    );
}

export default Dashboard;