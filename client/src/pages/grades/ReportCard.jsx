import { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../../services/api';

function ReportCard({ student, term, year, onClose }) {
    const printRef = useRef();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));
                const endpoint = user?.role === 'parent'
                    ? `/grades/parent/report-card/${student.id}`
                    : `/grades/report-card/${student.id}`;

                const res = await api.get(endpoint, {
                    params: { term, year },
                });
                setReportData(res.data);
            } catch (err) {
                setError('Failed to load report card.');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [student, term, year]);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Report Card - ${student.full_name} - ${term} ${year}`,
    });

    const gradeColor = (grade) => {
        if (grade === 'EE') return '#16a34a';
        if (grade === 'ME') return '#2563eb';
        if (grade === 'AE') return '#d97706';
        if (grade === 'BE') return '#dc2626';
        return '#6b7280';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 overflow-y-auto max-h-screen">

                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Report Card</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-emerald-600 text-white px-4 py-1 rounded text-sm hover:bg-emerald-700"
                        >
                            Print / Download
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 px-3 py-1 border rounded text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {[...Array(6)].map((_, i) => (
      <div key={i} style={{
        height: '14px',
        background: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s infinite',
        borderRadius: '6px',
        width: `${[90, 70, 85, 60, 80, 75][i]}%`,
      }} />
    ))}
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  </div>
                ) : error ? (
                    <p className="text-red-500 text-sm">{error}</p>
                ) : (
                    <div ref={printRef} style={{ padding: '24px', fontFamily: 'Times New Roman, serif' }}>

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                                School Management System
                            </h1>
                            <h2 style={{ fontSize: '16px', margin: '4px 0' }}>Student Report Card</h2>
                            <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
                                {term} — {year}
                            </p>
                        </div>

                        {/* Student Info */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '8px',
                            marginBottom: '20px',
                            fontSize: '13px',
                            borderTop: '2px solid #000',
                            borderBottom: '1px solid #ccc',
                            padding: '10px 0',
                        }}>
                            <p><strong>Name:</strong> {reportData.student.full_name}</p>
                            <p><strong>Admission No.:</strong> {reportData.student.admission_number}</p>
                            <p><strong>Class:</strong> {reportData.student.class_name}</p>
                            <p><strong>Gender:</strong> {reportData.student.gender}</p>
                        </div>

                        {/* Grades Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead>
                            <tr style={{ backgroundColor: '#f3f4f6' }}>
                                <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Subject</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>CAT 1</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>CAT 2</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Exam</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Average</th>
                                <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Grade</th>
                            </tr>
                            </thead>
                            <tbody>
                            {reportData.grades.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '16px', color: '#999' }}>
                                        No grades recorded for this term.
                                    </td>
                                </tr>
                            ) : (
                                reportData.grades.map(g => (
                                    <tr key={g.id}>
                                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{g.subject_name}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{g.cat1_score ?? '—'}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{g.cat2_score ?? '—'}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{g.exam_score ?? '—'}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{g.average ?? '—'}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', color: gradeColor(g.grade), fontWeight: 'bold' }}>
                                            {g.grade || '—'}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>

                        {/* Grade Key */}
                        <div style={{ marginTop: '20px', fontSize: '12px', color: '#555' }}>
                            <strong>Grade Key:</strong> EE = Exceeds Expectation (80-100) &nbsp;|&nbsp;
                            ME = Meets Expectation (60-79) &nbsp;|&nbsp;
                            AE = Approaching Expectation (40-59) &nbsp;|&nbsp;
                            BE = Below Expectation (0-39)
                        </div>

                        {/* Signature Lines */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px',
                            marginTop: '40px',
                            fontSize: '13px'
                        }}>
                            <div>
                                <div style={{ borderTop: '1px solid #000', paddingTop: '4px' }}>
                                    Class Teacher's Signature
                                </div>
                            </div>
                            <div>
                                <div style={{ borderTop: '1px solid #000', paddingTop: '4px' }}>
                                    Principal's Signature
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportCard;