import { useState, useEffect } from 'react';
import api from '../../services/api';

function AnnouncementForm({ announcement, onClose, currentUser }) {
    const isTeacher = currentUser?.role === 'teacher';
    const [classes, setClasses] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        body: '',
        audience: isTeacher ? 'parents' : 'all',
        class_id: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isTeacher) {
            api.get('/teachers/my-classes')
                .then(({ data }) => setClasses(data))
                .catch(() => setClasses([]));
        }
    }, [isTeacher]);

    useEffect(() => {
        if (announcement) {
            setFormData({
                title: announcement.title,
                body: announcement.body,
                audience: announcement.audience,
                class_id: announcement.class_id ?? ''
            });
        }
    }, [announcement]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const payload = { ...formData };
            // Enforce class when teacher posts to parents
            if (isTeacher) {
                payload.audience = 'parents';
                if (!payload.class_id) throw new Error('Please select a class.');
            }

            if (announcement) {
                await api.put(`/announcements/${announcement.id}`, payload);
                onClose('Announcement updated successfully.');
            } else {
                await api.post('/announcements', payload);
                onClose('Announcement posted successfully.');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {announcement ? 'Edit Announcement' : 'New Announcement'}
                </h3>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Announcement title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                        <textarea
                            name="body"
                            value={formData.body}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            placeholder="Write your announcement here..."
                        />
                    </div>

                    {!isTeacher && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                            <select
                                name="audience"
                                value={formData.audience}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="all">Everyone</option>
                                <option value="teachers">Teachers Only</option>
                                <option value="parents">Parents Only</option>
                            </select>
                        </div>
                    )}

                    {isTeacher && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <select name="class_id" value={formData.class_id} onChange={handleChange} required className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="">Select class</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => onClose()}
                            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : announcement ? 'Update' : 'Post Announcement'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AnnouncementForm;