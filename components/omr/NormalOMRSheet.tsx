'use client';

import React from 'react';

export interface NormalOMRSheetProps {
    institutionName?: string;
    address?: string;
    questionCount?: number;
    columnsCount?: 2 | 3 | 4;
    titleSize?: number;
    addressSize?: number;
}

// Bengali numbers helper
const toBengaliNumber = (num: number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num
        .toString()
        .split('')
        .map((digit) => bengaliDigits[parseInt(digit, 10)])
        .join('');
};

export default function NormalOMRSheet({
    institutionName = 'Md Tanvir Ahamed Shanto',
    address = 'কলাপাড়া, পটুয়াখালী',
    questionCount = 30,
    columnsCount = 3,
    titleSize = 14,
    addressSize = 14,
}: NormalOMRSheetProps) {
    // Calculate grid layout
    const numColumns = columnsCount;
    const questionsPerColumn = Math.ceil(questionCount / numColumns);

    const columns = Array.from({ length: numColumns }, (_, colIndex) => {
        const start = colIndex * questionsPerColumn + 1;
        const end = Math.min((colIndex + 1) * questionsPerColumn, questionCount);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    });

    return (
        <div className="print:p-0 print:m-0 print:w-[210mm] print:overflow-hidden flex justify-center" style={{ backgroundColor: '#ffffff', padding: '20px', userSelect: 'none', width: 'fit-content', margin: '0 auto', fontSize: '14px', color: '#000000', overflowX: 'auto', WebkitPrintColorAdjust: 'exact', colorAdjust: 'exact' }}>
            <div id="omr-printable-area" className="print:w-full print:max-w-[210mm]" style={{ backgroundColor: '#ffffff', padding: '16px 8px', width: '100%', maxWidth: '210mm', margin: '0 auto', position: 'relative' }}>
                {/* Top Left Marker */}
                <div style={{ position: 'absolute', top: '20px', left: '20px', width: '40px', height: '40px', backgroundColor: '#000000' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', backgroundColor: '#ffffff' }}></div>
                </div>
                {/* Top Right Marker */}
                <div style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px', backgroundColor: '#000000' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', backgroundColor: '#ffffff' }}></div>
                    <div style={{ position: 'absolute', bottom: '0', left: '0', width: '16px', height: '16px', backgroundColor: '#000000' }}></div>
                </div>
                {/* Bottom Left Marker */}
                <div style={{ position: 'absolute', bottom: '20px', left: '20px', width: '40px', height: '40px', backgroundColor: '#000000' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', backgroundColor: '#ffffff' }}></div>
                </div>
                {/* Bottom Right Marker */}
                <div style={{ position: 'absolute', bottom: '20px', right: '20px', width: '40px', height: '40px', backgroundColor: '#000000' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', backgroundColor: '#ffffff' }}></div>
                    <div style={{ position: 'absolute', top: '0', right: '0', width: '16px', height: '16px', backgroundColor: '#000000' }}></div>
                </div>

                <div style={{ maxWidth: '493px', margin: '0 auto' }}>
                    <div style={{ paddingTop: '40px', textAlign: 'center', width: '100%' }}>
                        <h1 style={{ textAlign: 'center', fontWeight: 'bold', fontSize: `${titleSize}px`, margin: 0, padding: 0 }}>
                            {institutionName}
                        </h1>
                        <p style={{ textAlign: 'center', fontSize: `${addressSize}px`, color: '#4b5563', margin: 0, padding: 0 }}>{address}</p>
                    </div>

                    <div style={{ borderBottom: '1px solid #9ca3af', marginTop: '12px', marginLeft: '20px', marginRight: '20px' }}></div>
                    <div style={{ borderBottom: '1px solid #9ca3af', marginTop: '4px', marginBottom: '4px', marginLeft: '56px', marginRight: '56px' }}></div>

                    <div style={{ marginTop: '8px', marginBottom: '16px', padding: '8px 0', fontSize: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                <span style={{ marginRight: '4px' }}>নাম:</span>
                                <div style={{ flex: 1, borderBottom: '1px dashed #9ca3af', height: '20px' }}></div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
                                    <span style={{ marginRight: '4px' }}>শ্রেণি:</span>
                                    <div style={{ flex: 1, borderBottom: '1px dashed #9ca3af', height: '20px' }}></div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
                                    <span style={{ marginRight: '4px' }}>সেকশন:</span>
                                    <div style={{ flex: 1, borderBottom: '1px dashed #9ca3af', height: '20px' }}></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
                                    <span style={{ marginRight: '4px' }}>বিষয়:</span>
                                    <div style={{ flex: 1, borderBottom: '1px dashed #9ca3af', height: '20px' }}></div>
                                </div>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
                                    <span style={{ marginRight: '4px' }}>পত্র:</span>
                                    <div style={{ flex: 1, borderBottom: '1px dashed #9ca3af', height: '20px' }}></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex' }}>
                                <div style={{ flex: 1, display: 'flex', alignItems: 'baseline' }}>
                                    <span style={{ marginRight: '4px' }}>রোল:</span>
                                    <div style={{ flex: 1, borderBottom: '1px dashed #9ca3af', height: '20px' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ width: '100%', maxWidth: '190mm', minWidth: '483px', margin: '0 auto', border: '5px solid #000000', boxSizing: 'border-box', position: 'relative' }}>
                    {/* Top Inside Bounding Box Timing Marks */}
                    <div style={{ padding: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #000000', height: '24px' }}>
                        <div style={{ width: '24px', height: '20px', backgroundColor: '#000000', marginLeft: '2px' }}></div>
                        <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
                            {Array.from({ length: columnsCount }).map((_, i) => (
                                <div key={`tm-${i}`} style={{ display: 'flex', margin: '0 16px' }}>
                                    <div style={{ height: '20px', width: '24px', backgroundColor: '#000000', marginRight: '16px' }}></div>
                                    <div style={{ height: '20px', width: '24px', backgroundColor: '#000000' }}></div>
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginRight: '2px' }}>
                            <div style={{ height: '20px', width: '24px', backgroundColor: '#000000' }}></div>
                            <div style={{ height: '20px', width: '24px', backgroundColor: '#000000' }}></div>
                            <div style={{ height: '20px', width: '24px', backgroundColor: '#000000' }}></div>
                        </div>
                    </div>

                    {/* Bottom Inside Bounding Box Timing Marks */}
                    <div style={{ position: 'absolute', bottom: '0', left: '0', width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #000000', height: '24px' }}>
                        <div style={{ width: '24px', height: '20px', backgroundColor: '#000000', marginLeft: '2px' }}></div>
                        <div style={{ display: 'flex', flex: 1, justifyContent: 'center' }}>
                            {Array.from({ length: columnsCount }).map((_, i) => (
                                <div key={`btm-${i}`} style={{ display: 'flex', margin: '0 16px' }}>
                                    <div style={{ height: '20px', width: '24px', backgroundColor: '#000000', marginRight: '16px' }}></div>
                                    <div style={{ height: '20px', width: '24px', backgroundColor: '#000000' }}></div>
                                </div>
                            ))}
                        </div>
                        <div style={{ width: '24px', height: '20px', backgroundColor: '#000000', marginRight: '2px' }}></div>
                    </div>

                    {/* OMR Grid Using Standard HTML Tables for Perfect PDF Alignment */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 16px 40px 16px' }}>
                        {/* Left Timing Track */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {Array.from({ length: Math.ceil(questionCount / columnsCount) }).map((_, i) => (
                                <div key={`ltm-${i}`} style={{ height: '28px', display: 'flex', alignItems: 'center' }}>
                                    <div style={{ height: '10px', width: '16px', backgroundColor: '#000000' }}></div>
                                </div>
                            ))}
                        </div>

                        {/* Questions Columns */}
                        <div style={{ display: 'flex', flex: 1, justifyContent: 'space-evenly', margin: '0 16px' }}>
                            {columns.map((columnQuestions, colIdx) => (
                                <table key={`col-${colIdx}`} style={{ borderCollapse: 'collapse', width: '140px' }}>
                                    <tbody>
                                        {columnQuestions.map((qNum) => (
                                            <tr key={`q-${qNum}`} style={{ height: '28px' }}>
                                                <td style={{ width: '30px', textAlign: 'right', paddingRight: '8px', verticalAlign: 'middle' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{toBengaliNumber(qNum)}</span>
                                                </td>
                                                <td style={{ verticalAlign: 'middle' }}>
                                                    <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                                        <tbody>
                                                            <tr>
                                                                {['ক', 'খ', 'গ', 'ঘ'].map((opt, optIdx) => (
                                                                    <td key={`opt-${qNum}-${optIdx}`} style={{ textAlign: 'center' }}>
                                                                        <div style={{
                                                                            height: '22px',
                                                                            width: '22px',
                                                                            borderRadius: '50%',
                                                                            border: '1.5px solid #374151',
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center',
                                                                            fontSize: '13px',
                                                                            lineHeight: '1',
                                                                            boxSizing: 'border-box'
                                                                        }}>
                                                                            {opt}
                                                                        </div>
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ))}
                        </div>

                        {/* Right Timing Track */}
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {Array.from({ length: Math.ceil(questionCount / columnsCount) }).map((_, i) => (
                                <div key={`rtm-${i}`} style={{ height: '28px', display: 'flex', alignItems: 'center' }}>
                                    <div style={{ height: '10px', width: '16px', backgroundColor: '#000000' }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
