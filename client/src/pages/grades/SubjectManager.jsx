import { useState } from 'react';
import api from '../../services/api';

function SubjectManager({ subjects, onUpdate }) {
    const [newSubject, setNewSubject] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleAdd = async () => {
        if (!newSubject.trim()) return;
        setError('');
        setMessage('');
        try {
            await api.post('/grades/subjects', { name: newSubject.trim() });
            setNewSubject('');
            setMessage('Subject added.');
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add subject.');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this subject? This will also delete all associated grades.')) return;
        try {
            await api.delete(`/grades/subjects/${id}`);
            setMessage('Subject deleted.');
            onUpdate();
        } catch (err) {
            setError('Failed to delete subject.');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-md font-semibold text-gray-700 mb-3">Manage Subjects</h3>

            {message && <p className="text-green-600 text-sm mb-2">{message}</p>}
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={newSubject}
                    onChange={e => setNewSubject(e.target.value)}
                    placeholder="New subject name"
                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                    Add
                </button>
            </div>

            <div className="flex flex-wrap gap-2">
                {subjects.map(s => (
                    <span
                        key={s.id}
                        className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                    >
            {s.name}
                        <button
                            onClick={() => handleDelete(s.id)}
                            className="text-red-400 hover:text-red-600 ml-1 font-bold"
                        >
              ×
            </button>
          </span>
                ))}
            </div>
        </div>
    );
}

export default SubjectManager;