import { useState } from 'react';
import api from '../../services/api';
import ConfirmModal from "../../components/ConfirmModal";
import Toast from '../../components/Toast';
import useToast from '../../hooks/useToast';

function SubjectManager({ subjects, onUpdate }) {
    const [newSubject, setNewSubject] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [subjectToDelete, setSubjectToDelete] = useState(null);
    const { toast, showToast, hideToast } = useToast();

    const handleAdd = async () => {
        if (!newSubject.trim()) return;
        setError('');
        setMessage('');
        try {
            await api.post('/grades/subjects', { name: newSubject.trim() });
            setNewSubject('');
            showToast('Subject added.', 'success');
            onUpdate();
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to add subject.', 'error');
        }
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/grades/subjects/${subjectToDelete}`);
            setSubjectToDelete(null);
            showToast('Subject deleted.', 'success');
            onUpdate();
        } catch (err) {
            showToast('Failed to delete subject.', 'error');
            setSubjectToDelete(null);
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
                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                    onClick={handleAdd}
                    className="bg-emerald-600 text-white px-3 py-1 rounded text-sm hover:bg-emerald-700"
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
                            onClick={() => setSubjectToDelete(s.id)}
                            className="text-red-400 hover:text-red-600 ml-1 font-bold"
                        >
              ×
            </button>
          </span>
                ))}
            </div>
            {subjectToDelete && (
                <ConfirmModal
                    title="Delete Subject"
                    message="Are you sure you want to delete this subject? All associated grades will also be permanently deleted."
                    confirmLabel="Delete"
                    onConfirm={confirmDelete}
                    onCancel={() => setSubjectToDelete(null)}
                />
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
        </div>
    );
}

export default SubjectManager;