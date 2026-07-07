import { useState, useEffect } from 'react';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

const levelColor = (level) => {
    if (!level) return 'text-gray-400';
    if (level.startsWith('EE')) return 'text-emerald-600 font-semibold';
    if (level.startsWith('ME')) return 'text-blue-600 font-semibold';
    if (level.startsWith('AE')) return 'text-amber-600 font-semibold';
    if (level.startsWith('BE')) return 'text-red-600 font-semibold';
    return 'text-gray-400';
};

function ScoreSheet({ task, readOnly, onClose }) {
    const [data, setData] = useState(null);
    const [scores, setScores] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get(`/grades/tasks/${task.id}/scores`)
            .then(res => {
                setData(res.data);
                // Initialise local scores state from existing scores
                const initial = {};
                res.data.students.forEach(student => {
                    initial[student.id] = {};
                    res.data.competencies.forEach(comp => {
                        initial[student.id][comp.id] = student.scores[comp.id]?.score ?? '';
                    });
                });
                setScores(initial);
            })
            .catch(() => setError('Failed to load score sheet.'))
            .finally(() => setLoading(false));
    }, [task.id]);

    const handleScoreChange = (studentId, competencyId, value) => {
        // Allow clearing the field
        if (value === '') {
            setScores(prev => ({
                ...prev,
                [studentId]: { ...prev[studentId], [competencyId]: '' },
            }));
            return;
        }

        // Only allow numeric input; clamp to [0, 100]
        const num = Number(value);
        if (!Number.isFinite(num)) return; // ignore non-numeric

        const clamped = Math.max(0, Math.min(100, num));

        setScores(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [competencyId]: clamped },
        }));
    };

    const getPreview = (value) => {
        const num = parseFloat(value);
        if (isNaN(num) || value === '') return null;
        if (num < 0 || num > 100) return null;
        return getLevelFromScore(num);
    };

    const getLevelFromScore = (score) => {
        if (score >= 90) return 'EE1';
        if (score >= 75) return 'EE2';
        if (score >= 58) return 'ME1';
        if (score >= 41) return 'ME2';
        if (score >= 31) return 'AE1';
        if (score >= 21) return 'AE2';
        if (score >= 11) return 'BE1';
        return 'BE2';
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setError('');

        const entries = [];
        Object.entries(scores).forEach(([student_id, competencyScores]) => {
            Object.entries(competencyScores).forEach(([competency_id, score]) => {
                if (score !== '' && score !== null) {
                    const num = parseFloat(score);
                    if (!isNaN(num) && num >= 0 && num <= 100) {
                        entries.push({ student_id: parseInt(student_id), competency_id: parseInt(competency_id), score: num });
                    }
                }
            });
        });

        if (entries.length === 0) {
            setError('Please enter at least one score.');
            setSubmitting(false);
            return;
        }

        try {
            await api.post(`/grades/tasks/${task.id}/scores`, { scores: entries });
            onClose('Scores submitted successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 overflow-y-auto max-h-screen">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {task.subject_name} · {task.class_name}
                        </p>
                    </div>
                    <button
                        onClick={() => onClose()}
                        className="text-gray-400 hover:text-gray-600 text-sm border border-gray-200 rounded px-3 py-1"
                    >
                        Close
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 px-4 py-2 rounded text-sm mb-4">{error}</div>
                )}

                {loading ? (
                    <Spinner message="Loading score sheet..." />
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm border-collapse">
                                <thead>
                                <tr className="bg-gray-50">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-200 min-w-[180px]">
                                        Student
                                    </th>
                                    {data.competencies.map(comp => (
                                        <th
                                            key={comp.id}
                                            className="px-3 py-3 text-left text-xs font-semibold text-gray-600 uppercase border border-gray-200 min-w-[160px]"
                                        >
                                            {comp.name}
                                        </th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {data.students.map(student => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 border border-gray-200">
                                            <p className="font-medium text-gray-800">{student.full_name}</p>
                                            <p className="text-xs text-gray-400">{student.admission_number}</p>
                                        </td>
                                        {data.competencies.map(comp => {
                                            const currentScore = scores[student.id]?.[comp.id] ?? '';
                                            const preview = getPreview(currentScore);
                                            return (
                                                <td key={comp.id} className="px-3 py-2 border border-gray-200">
                                                    {readOnly ? (
                                                        <div>
                                <span className="text-gray-700">
                                  {student.scores[comp.id]?.score ?? '—'}
                                </span>
                                                            {student.scores[comp.id]?.performance_level && (
                                                                <span className={`ml-2 text-xs ${levelColor(student.scores[comp.id].performance_level)}`}>
                                    {student.scores[comp.id].performance_level}
                                  </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                value={currentScore}
                                                                onChange={e => handleScoreChange(student.id, comp.id, e.target.value)}
                                                                placeholder="0-100"
                                                                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                                            />
                                                            {preview && (
                                                                <span className={`text-xs ${levelColor(preview)}`}>
                                    {preview}
                                  </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-xs text-gray-400">
                                Scores are entered as percentages (0-100). Performance level is calculated automatically.
                            </p>
                            {!readOnly && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="bg-emerald-600 text-white px-5 py-2 rounded hover:bg-emerald-700 text-sm disabled:opacity-50"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Scores'}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default ScoreSheet;