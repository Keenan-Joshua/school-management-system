import { useState, useEffect } from 'react';
import api from '../../services/api';
import QuickUserForm from '../../components/QuickUserForm';
import ConfirmModal from '../../components/ConfirmModal';

function ParentLinker({ studentId, guardianName, guardianContact }) {
    const [links, setLinks] = useState([]);
    const [parents, setParents] = useState([]);
    const [selectedParent, setSelectedParent] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [createAccountFor, setCreateAccountFor] = useState(null);
    const [linkToRemove, setLinkToRemove] = useState(null);

    const fetchData = async () => {
        try {
            const [linkRes, parentRes] = await Promise.all([
                api.get(`/parents/student/${studentId}`),
                api.get('/parents/all'),
            ]);
            setLinks(linkRes.data);
            setParents(parentRes.data);
        } catch (err) {
            setError('Failed to load guardian links.');
        }
    };

    useEffect(() => { fetchData(); }, [studentId]);

    const handleLink = async () => {
        if (!selectedParent) return;
        setError('');
        setMessage('');
        try {
            await api.post('/parents/link', {
                parent_user_id: selectedParent,
                student_id: studentId,
            });
            setMessage('Guardian linked successfully.');
            setSelectedParent('');
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to link guardian.');
        }
    };

    const confirmUnlink = async () => {
        try {
            await api.delete(`/parents/link/${linkToRemove}`);
            setLinkToRemove(null);
            fetchData();
        } catch (err) {
            setError('Failed to unlink guardian.');
            setLinkToRemove(null);
        }
    };

    return (
        <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Linked Guardians</h4>

            {error && <p className="text-red-600 text-xs mb-2">{error}</p>}
            {message && <p className="text-green-600 text-xs mb-2">{message}</p>}

            {links.length === 0 ? (
                <p className="text-gray-400 text-xs mb-3">No guardians linked yet.</p>
            ) : (
                <ul className="mb-3 space-y-1">
                    {links.map(link => (
                        <li key={link.id} className="flex justify-between items-center text-sm bg-gray-50 px-3 py-1.5 rounded">
                            <span>{link.full_name} ({link.email})</span>
                            <button
                                type="button"
                                onClick={() => setLinkToRemove(link.id)}
                                className="text-red-500 hover:underline text-xs"
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Create parent account from guardian details */}
            <div className="flex justify-between items-center mb-2">
        <span className="text-xs text-gray-500">
          Link an existing parent account, or create one from guardian details:
        </span>
                <button
                    type="button"
                    onClick={() => setCreateAccountFor({
                        full_name: guardianName,
                        phone: guardianContact,
                    })}
                    className="text-xs text-emerald-600 hover:underline ml-2 whitespace-nowrap"
                >
                    + Create Parent Account
                </button>
            </div>

            {/* Link existing parent dropdown */}
            <div className="flex gap-2">
                <select
                    value={selectedParent}
                    onChange={e => setSelectedParent(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                    <option value="">Select a parent account to link...</option>
                    {parents.map(p => (
                        <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={handleLink}
                    className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm hover:bg-emerald-700"
                >
                    Link
                </button>
            </div>

            {/* Quick user form modal */}
            {createAccountFor && (
                <QuickUserForm
                    prefill={{
                        full_name: createAccountFor.full_name,
                        phone: createAccountFor.phone,
                        role: 'parent',
                    }}
                    onClose={() => {
                        setCreateAccountFor(null);
                        fetchData();
                    }}
                />
            )}
            {linkToRemove && (
                <ConfirmModal
                    title="Remove Guardian"
                    message="Are you sure you want to remove this guardian link? They will no longer be able to view this student's records."
                    confirmLabel="Remove"
                    onConfirm={confirmUnlink}
                    onCancel={() => setLinkToRemove(null)}
                />
            )}
        </div>
    );
}

export default ParentLinker;