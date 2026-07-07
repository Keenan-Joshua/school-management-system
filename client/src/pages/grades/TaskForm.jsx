import { useState, useEffect } from 'react';
import api from '../../services/api';

function TaskForm({ task, classId, subjectId, term, year, onClose }) {
    const [title, setTitle] = useState(task?.title || '');
    const [competencies, setCompetencies] = useState([]);
    const [selectedCompetencies, setSelectedCompetencies] = useState(
        task?.competencies?.map(c => c.id) || []
    );
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/grades/competencies').then(res => setCompetencies(res.data));
    }, []);

    const toggleCompetency = (id) => {
        setSelectedCompetencies(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (selectedCompetencies.length === 0) {
            setError('Please select at least one competency.');
            return;
        }

        setLoading(true);
        try {
            if (task) {
                await api.put(`/grades/tasks/${task.id}`, {
                    title,
                    competency_ids: selectedCompetencies,
                });
                onClose('Task updated successfully.');
            } else {
                await api.post('/grades/tasks', {
                    title,
                    subject_id: subjectId,
                    class_id: classId,
                    term,
                    year,
                    competency_ids: selectedCompetencies,
                });
                onClose('Task created successfully.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {task ? 'Edit Task' : 'Create New Task'}
                </h3>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">{error}</div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            placeholder="e.g. Water Cycle Investigation"
                            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Competencies Assessed
                            <span className="text-gray-400 font-normal ml-1">(select all that apply)</span>
                        </label>
                        <div className="space-y-2">
                            {competencies.map(c => (
                                <label key={c.id} className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectedCompetencies.includes(c.id)}
                                        onChange={() => toggleCompetency(c.id)}
                                        className="w-4 h-4 accent-emerald-600"
                                    />
                                    <span className="text-sm text-gray-700">{c.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

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
                            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TaskForm;