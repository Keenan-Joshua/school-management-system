import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import AnnouncementForm from './AnnouncementForm';
import ConfirmModal from '../../components/ConfirmModal';
import Spinner from '../../components/Spinner';
import { useLocation } from 'react-router-dom';

function Announcements() {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'administrator';
    const location = useLocation();
    const highlightId = location.state?.highlightId;
    const highlightRef = useRef(null);

    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
    const [announcementToDelete, setAnnouncementToDelete] = useState(null);
    const [error, setError] = useState('');

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get('/announcements');
            setAnnouncements(res.data);
        } catch (err) {
            setError('Failed to load announcements.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    useEffect(() => {
        if (highlightId && highlightRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [highlightId, announcements]);

    const confirmDelete = async () => {
        try {
            await api.delete(`/announcements/${announcementToDelete}`);
            setAnnouncementToDelete(null);
            fetchAnnouncements();
        } catch (err) {
            alert(err.response?.data?.message || 'Delete failed.');
            setAnnouncementToDelete(null);
        }
    };

    const handleEdit = (announcement) => {
        setSelectedAnnouncement(announcement);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setSelectedAnnouncement(null);
        setShowForm(false);
        fetchAnnouncements();
    };

    const audienceBadge = (audience) => {
        if (audience === 'all') return 'bg-blue-100 text-blue-700';
        if (audience === 'teachers') return 'bg-green-100 text-green-700';
        if (audience === 'parents') return 'bg-purple-100 text-purple-700';
        return 'bg-gray-100 text-gray-700';
    };

    if (loading) return <Spinner message="Loading announcements..." />;

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">School Announcements</h2>
                {isAdmin && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 text-sm"
                    >
                        + New Announcement
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">{error}</div>
            )}

            {showForm && (
                <AnnouncementForm
                    announcement={selectedAnnouncement}
                    onClose={handleFormClose}
                />
            )}

            {announcements.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
                    No announcements yet.
                </div>
            ) : (
                <div className="space-y-4">
                    {announcements.map(a => (
                        <div
                            key={a.id}
                            ref={a.id === highlightId ? highlightRef : null}
                            className="bg-white rounded-lg shadow p-5 transition-all duration-500"
                            style={a.id === highlightId ? {
                                border: '1.5px solid #059669',
                                boxShadow: '0 0 0 3px rgba(5, 150, 105, 0.15)',
                            } : {}}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-semibold text-gray-800">{a.title}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${audienceBadge(a.audience)}`}>
                      {a.audience}
                    </span>
                                    </div>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{a.body}</p>
                                    <p className="text-xs text-gray-400 mt-3">
                                        Posted by {a.posted_by_name} &mdash;{' '}
                                        {new Date(a.created_at).toLocaleDateString('en-KE', {
                                            year: 'numeric', month: 'long', day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <div className="flex gap-3 ml-4 text-sm">
                                        <button
                                            onClick={() => handleEdit(a)}
                                            className="text-emerald-600 hover:underline"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => setAnnouncementToDelete(a.id)}
                                            className="text-red-500 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            {announcementToDelete && (
                <ConfirmModal
                    title="Delete Announcement"
                    message="Are you sure you want to delete this announcement? This cannot be undone."
                    confirmLabel="Delete"
                    onConfirm={confirmDelete}
                    onCancel={() => setAnnouncementToDelete(null)}
                />
            )}
        </div>
    );
}

export default Announcements;