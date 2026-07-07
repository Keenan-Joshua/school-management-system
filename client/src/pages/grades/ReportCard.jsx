import { useRef, useEffect, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../../services/api';
import Spinner from '../../components/Spinner';

const levelColor = (level) => {
    if (!level) return '#6b7280';
    if (level.startsWith('EE')) return '#059669';
    if (level.startsWith('ME')) return '#2563eb';
    if (level.startsWith('AE')) return '#d97706';
    return '#dc2626';
};

const descriptorLabel = (level) => {
    if (!level) return '—';
    if (level.startsWith('EE')) return 'Exceeding Expectations';
    if (level.startsWith('ME')) return 'Meeting Expectations';
    if (level.startsWith('AE')) return 'Approaching Expectations';
    return 'Below Expectations';
};

function ReportCard({ student, term, year, onClose }) {
    const printRef = useRef();
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        const endpoint = user?.role === 'parent'
            ? `/grades/parent/report-card/${student.id}`
            : `/grades/report-card/${student.id}`;

        api.get(endpoint, { params: { term, year } })
            .then(res => setReportData(res.data))
            .catch(() => setError('Failed to load report card.'))
            .finally(() => setLoading(false));
    }, [student, term, year]);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Report Card - ${student.full_name} - ${term} ${year}`,
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 overflow-y-auto max-h-screen">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Report Card</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="bg-emerald-600 text-white px-4 py-1.5 rounded text-sm hover:bg-emerald-700"
                        >
                            Print / Download
                        </button>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 px-3 py-1.5 border rounded text-sm"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {loading ? (
                    <Spinner message="Loading report card..." />
                ) : error ? (
                    <p className="text-red-500 text-sm">{error}</p>
                ) : (
                    <div ref={printRef} style={{ padding: '24px', fontFamily: 'Times New Roman, serif' }}>

                        {/* Header */}
                        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
                            <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px' }}>
                                Zawadi School
                            </h1>
                            <h2 style={{ fontSize: '15px', margin: '0 0 4px', fontWeight: 'normal' }}>
                                Learner Progress Report
                            </h2>
                            <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>
                                {reportData.term} — {reportData.year}
                            </p>
                        </div>

                        {/* Student Info */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 1fr',
                            gap: '6px', marginBottom: '20px',
                            fontSize: '13px', borderBottom: '1px solid #ccc', paddingBottom: '10px'
                        }}>
                            <p><strong>Name:</strong> {reportData.student.full_name}</p>
                            <p><strong>Admission No.:</strong> {reportData.student.admission_number}</p>
                            <p><strong>Class:</strong> {reportData.student.class_name}</p>
                            <p><strong>Gender:</strong> <span style={{ textTransform: 'capitalize' }}>{reportData.student.gender}</span></p>
                        </div>

                        {/* Section 1 — Learning Areas */}
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                            Section 1: Performance by Learning Area
                        </h3>

                        {reportData.learningAreas.length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>
                                No assessment data available for this term.
                            </p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                                <thead>
                                <tr style={{ background: '#f3f4f6' }}>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Learning Area</th>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Average Score</th>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Level</th>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Performance</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.learningAreas.map(area => (
                                    <tr key={area.subject_id}>
                                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{area.subject_name}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{area.average_score}%</td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', color: levelColor(area.level), fontWeight: 'bold' }}>
                                            {area.level}
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px', color: levelColor(area.level) }}>
                                            {descriptorLabel(area.level)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}

                        {/* Section 2 — Core Competencies */}
                        <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                            Section 2: Core Competency Development
                        </h3>

                        {reportData.competencies.length === 0 ? (
                            <p style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>
                                No competency data available for this term.
                            </p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', marginBottom: '20px' }}>
                                <thead>
                                <tr style={{ background: '#f3f4f6' }}>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Competency</th>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Average Score</th>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>Level</th>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'left' }}>Performance</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.competencies.map(comp => (
                                    <tr key={comp.competency_id}>
                                        <td style={{ border: '1px solid #ccc', padding: '8px' }}>{comp.competency_name}</td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center' }}>{comp.average_score}%</td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px', textAlign: 'center', color: levelColor(comp.level), fontWeight: 'bold' }}>
                                            {comp.level}
                                        </td>
                                        <td style={{ border: '1px solid #ccc', padding: '8px', color: levelColor(comp.level) }}>
                                            {descriptorLabel(comp.level)}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}

                        {/* Grade Key */}
                        <div style={{ fontSize: '11px', color: '#555', borderTop: '1px solid #ccc', paddingTop: '8px', marginBottom: '20px' }}>
                            <strong>Performance Level Key:</strong>&nbsp;
                            EE1 (90-100%) · EE2 (75-89%) · ME1 (58-74%) · ME2 (41-57%) · AE1 (31-40%) · AE2 (21-30%) · BE1 (11-20%) · BE2 (1-10%)
                        </div>

                        {/* Signatures */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '30px', fontSize: '13px' }}>
                            <div>
                                <div style={{ borderTop: '1px solid #000', paddingTop: '4px' }}>Class Teacher's Signature</div>
                            </div>
                            <div>
                                <div style={{ borderTop: '1px solid #000', paddingTop: '4px' }}>Principal's Signature</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReportCard;