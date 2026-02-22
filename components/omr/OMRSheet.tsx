'use client';

import React from 'react';

export type OMRColor =
    | 'red'
    | 'gray'
    | 'blue'
    | 'green'
    | 'purple'
    | 'orange'
    | 'cyan'
    | 'pink'
    | 'yellow'
    | 'lime';

export type HeaderSize = 'Small' | 'Big';
export type InfoType = 'Digital' | 'Manual';

export interface OMRSheetProps {
    color?: OMRColor;
    questionCount?: 40 | 60 | 80 | 100;
    headerSize?: HeaderSize;
    infoType?: InfoType;
    institutionName?: string;
    address?: string;
    titleSize?: number;
    addressSize?: number;
}

const colorMaps: Record<OMRColor, any> = {
    red: { text600: '#e11d48', text500: '#f43f5e', border: '#f43f5e', bg50: '#fff1f2', bg300: '#fda4af', bgSolid: '#f43f5e' },
    gray: { text600: '#4b5563', text500: '#6b7280', border: '#6b7280', bg50: '#f9fafb', bg300: '#e5e7eb', bgSolid: '#6b7280' },
    blue: { text600: '#2563eb', text500: '#3b82f6', border: '#3b82f6', bg50: '#eff6ff', bg300: '#93c5fd', bgSolid: '#3b82f6' },
    green: { text600: '#16a34a', text500: '#22c55e', border: '#22c55e', bg50: '#f0fdf4', bg300: '#86efac', bgSolid: '#22c55e' },
    purple: { text600: '#9333ea', text500: '#a855f7', border: '#a855f7', bg50: '#faf5ff', bg300: '#d8b4fe', bgSolid: '#a855f7' },
    orange: { text600: '#ea580c', text500: '#f97316', border: '#f97316', bg50: '#fff7ed', bg300: '#fdba74', bgSolid: '#f97316' },
    cyan: { text600: '#0891b2', text500: '#06b6d4', border: '#06b6d4', bg50: '#ecfeff', bg300: '#67e8f9', bgSolid: '#06b6d4' },
    pink: { text600: '#db2777', text500: '#ec4899', border: '#ec4899', bg50: '#fdf2f8', bg300: '#f9a8d4', bgSolid: '#ec4899' },
    yellow: { text600: '#ca8a04', text500: '#eab308', border: '#eab308', bg50: '#fefce8', bg300: '#fde047', bgSolid: '#eab308' },
    lime: { text600: '#65a30d', text500: '#84cc16', border: '#84cc16', bg50: '#f7fee7', bg300: '#bef264', bgSolid: '#84cc16' },
};

// Bengali numbers helper
const toBengaliNumber = (num: number) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num
        .toString()
        .split('')
        .map((digit) => bengaliDigits[parseInt(digit, 10)])
        .join('');
};

const MockQRCode = () => (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        <path fill="#000" d="M5,5 h30 v30 h-30 z M10,10 h20 v20 h-20 z M65,5 h30 v30 h-30 z M70,10 h20 v20 h-20 z M5,65 h30 v30 h-30 z M10,70 h20 v20 h-20 z" />
        <path fill="#000" d="M45,5 h10 v10 h-10 z M45,20 h10 v10 h-10 z M45,35 h10 v10 h-10 z M45,50 h10 v10 h-10 z M5,45 h10 v10 h-10 z M20,45 h10 v10 h-10 z M5,55 h10 v10 h-10 z M25,55 h10 v10 h-10 z M65,45 h10 v10 h-10 z M80,45 h10 v10 h-10 z M65,55 h10 v10 h-10 z M85,55 h10 v10 h-10 z M45,65 h10 v10 h-10 z M45,85 h10 v10 h-10 z M65,65 h10 v10 h-10 z M80,75 h10 v10 h-10 z M60,85 h10 v10 h-10 z M85,85 h10 v10 h-10 z M55,55 h15 v15 h-15 z M35,25 h10 v10 h-10 z M25,35 h10 v10 h-10 z" />
    </svg>
);

export default function OMRSheet({
    color = 'red',
    questionCount = 100,
    headerSize = 'Big',
    infoType = 'Digital',
    institutionName = 'Md Tanvir Ahamed Shanto',
    address = 'কলাপাড়া, পটুয়াখালী',
    titleSize = 18,
    addressSize = 14,
}: OMRSheetProps) {
    const theme = colorMaps[color];

    const questionsPerColumn = questionCount === 100 ? 25 : 20;
    const numColumns = Math.ceil(questionCount / questionsPerColumn);

    const columns = Array.from({ length: numColumns }, (_, colIndex) => {
        const start = colIndex * questionsPerColumn + 1;
        const end = Math.min((colIndex + 1) * questionsPerColumn, questionCount);
        return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    });

    return (
        <div style={{ backgroundColor: '#ffffff', padding: '20px', userSelect: 'none', width: 'max-content', margin: '0 auto', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', border: '1px solid #e5e7eb', borderRadius: '8px', overflowX: 'auto' }}>
            <div id="omr-printable-area" style={{ position: 'relative', width: '750px', margin: '0 auto', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'sans-serif' }}>
                {/* Markers */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', backgroundColor: '#000000' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', backgroundColor: '#ffffff' }}></div>
                </div>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', backgroundColor: '#000000' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '16px', height: '16px', backgroundColor: '#ffffff' }}></div>
                    <div style={{ position: 'absolute', bottom: '0', left: '0', width: '16px', height: '16px', backgroundColor: '#000000' }}></div>
                </div>
                {/* Bottom makers absent in images initially, let's keep them zero opacity or standard if they need timing */}

                {/* Top Warning Box */}
                <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '4px' }}>
                    <div style={{ width: '660px', height: '36px', backgroundColor: theme.bg50, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '2px' }}>
                        <div style={{ textAlign: 'center', fontSize: '13px', fontWeight: 'bold', color: theme.text600 }}>এই বক্সে কোনো দাগ দেয়া যাবে না।</div>
                        <div style={{ height: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '-2px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', alignItems: 'center' }}>
                                <div style={{ width: '14px', height: '14px', border: '1px solid #000000', borderRadius: '50%', backgroundColor: '#ffffff', boxSizing: 'border-box' }}></div>
                                <div style={{ width: '14px', height: '14px', border: '1px solid #000000', borderRadius: '50%', backgroundColor: '#ffffff', boxSizing: 'border-box' }}></div>
                                {Array.from({ length: 9 }).map((_, i) => <div key={`b2-${i}`} style={{ width: '10px', height: '14px', backgroundColor: '#000000' }}></div>)}
                                <div style={{ width: '14px', height: '14px', border: '1px solid #000000', borderRadius: '50%', backgroundColor: '#ffffff', boxSizing: 'border-box' }}></div>
                                <div style={{ width: '10px', height: '14px', backgroundColor: '#000000' }}></div>
                                <div style={{ width: '14px', height: '14px', border: '1px solid #000000', borderRadius: '50%', backgroundColor: '#ffffff', boxSizing: 'border-box' }}></div>
                                <div style={{ width: '10px', height: '14px', backgroundColor: '#000000' }}></div>
                                <div style={{ width: '14px', height: '14px', border: '1px solid #000000', borderRadius: '50%', backgroundColor: '#ffffff', boxSizing: 'border-box' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ height: '50px' }}></div> {/* Header Clearance */}
                <div style={{ margin: '16px 40px 0 40px', paddingBottom: '40px' }}>

                    {/* Header / Institution Name */}
                    {!(infoType === 'Manual' && headerSize === 'Small') && (
                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ lineHeight: '1.25', textAlign: 'center' }}>
                                <p style={{ fontWeight: 'bold', fontSize: `${titleSize}px`, margin: 0 }}>
                                    {institutionName}
                                </p>
                                <p style={{ fontWeight: 'bold', fontSize: `${addressSize}px`, color: '#000', margin: 0 }}>
                                    {address}
                                </p>
                            </div>
                        </div>
                    )}
                    {(infoType === 'Manual' && headerSize === 'Small') && (
                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ lineHeight: '1.25', textAlign: 'center' }}>
                                <p style={{ fontWeight: 'bold', fontSize: `22px`, margin: 0 }}>
                                    {institutionName}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Student Info Area */}
                    <div style={{ margin: '12px 0' }}>
                        {infoType === 'Digital' ? (
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                                {/* Class */}
                                <div style={{ width: '90px' }}>
                                    <div style={{ border: `1px solid ${theme.border}`, paddingBottom: '16px', height: '302px', boxSizing: 'border-box' }}>
                                        <div style={{ borderBottom: `1px solid ${theme.border}`, textAlign: 'center', fontWeight: 'bold', fontSize: '14px', padding: '2px 0', backgroundColor: theme.bg50 }}>শ্রেণি</div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <tbody>
                                                {[{ num: null }, ...[6, 7, 8, 9, 10, 11, 12].map(n => ({ num: n }))].map((item, idx) => (
                                                    <tr key={`cls-r-${idx}`}>
                                                        <td style={{ borderRight: `1px solid ${theme.border}`, width: '33.33%' }}></td>
                                                        <td style={{ borderRight: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, width: '33.33%', height: '25px', textAlign: 'center', verticalAlign: 'middle' }}>
                                                            {item.num && (
                                                                <span style={{ border: '1px solid rgba(0,0,0,0.6)', borderRadius: '50%', height: '18px', width: '18px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '12px' }}>
                                                                    {toBengaliNumber(item.num)}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ width: '33.33%' }}></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Roll Number */}
                                <div style={{ border: `1px solid ${theme.border}`, width: '182px', height: '302px', boxSizing: 'border-box' }}>
                                    <div style={{ borderBottom: `1px solid ${theme.border}`, textAlign: 'center', fontWeight: 'bold', fontSize: '14px', padding: '2px 0', backgroundColor: theme.bg50 }}>রোল নম্বর</div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', height: '25px' }}>
                                        <tbody>
                                            <tr>
                                                {Array.from({ length: 6 }).map((_, i) => (
                                                    <td key={`rth-${i}`} style={{ borderRight: i === 5 ? 'none' : `1px solid ${theme.border}` }}></td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: `1px solid ${theme.border}` }}>
                                        <tbody>
                                            {Array.from({ length: 10 }).map((_, num) => (
                                                <tr key={`rr-${num}`}>
                                                    {Array.from({ length: 6 }).map((_, col) => (
                                                        <td key={`rc-${col}-${num}`} style={{ borderRight: col === 5 ? 'none' : `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, height: '24px', textAlign: 'center', verticalAlign: 'middle', backgroundColor: col % 2 === 0 ? theme.bg300 : 'transparent' }}>
                                                            <div style={{ border: '1px solid rgba(0,0,0,0.6)', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', margin: '0 auto' }}>
                                                                {toBengaliNumber(num)}
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Subject Code */}
                                <div style={{ border: `1px solid ${theme.border}`, width: '92px', height: '302px', boxSizing: 'border-box' }}>
                                    <div style={{ borderBottom: `1px solid ${theme.border}`, textAlign: 'center', fontWeight: 'bold', fontSize: '14px', padding: '2px 0', backgroundColor: theme.bg50 }}>বিষয় কোড</div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', height: '25px' }}>
                                        <tbody>
                                            <tr>
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                    <td key={`sth-${i}`} style={{ borderRight: i === 2 ? 'none' : `1px solid ${theme.border}` }}></td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: `1px solid ${theme.border}` }}>
                                        <tbody>
                                            {Array.from({ length: 10 }).map((_, num) => (
                                                <tr key={`sr-${num}`}>
                                                    {Array.from({ length: 3 }).map((_, col) => (
                                                        <td key={`sc-${col}-${num}`} style={{ borderRight: col === 2 ? 'none' : `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, height: '24px', textAlign: 'center', verticalAlign: 'middle', backgroundColor: col % 2 !== 0 ? theme.bg300 : 'transparent' }}>
                                                            <div style={{ border: '1px solid rgba(0,0,0,0.6)', borderRadius: '50%', width: '18px', height: '18px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', margin: '0 auto' }}>
                                                                {toBengaliNumber(num)}
                                                            </div>
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Set Code */}
                                <div style={{ width: '90px' }}>
                                    <div style={{ border: `1px solid ${theme.border}`, paddingBottom: '16px', height: '302px', boxSizing: 'border-box' }}>
                                        <div style={{ borderBottom: `1px solid ${theme.border}`, textAlign: 'center', fontWeight: 'bold', fontSize: '14px', padding: '2px 0', backgroundColor: theme.bg50 }}>সেট কোড</div>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                            <tbody>
                                                {[{ set: null }, ...['ক', 'খ', 'গ', 'ঘ', 'ঙ', 'চ'].map(s => ({ set: s }))].map((item, idx) => (
                                                    <tr key={`set-r-${idx}`}>
                                                        <td style={{ borderRight: `1px solid ${theme.border}`, width: '33.33%' }}></td>
                                                        <td style={{ borderRight: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, width: '33.33%', height: '25px', textAlign: 'center', verticalAlign: 'middle' }}>
                                                            {item.set && (
                                                                <span style={{ border: '1px solid rgba(0,0,0,0.6)', borderRadius: '50%', height: '18px', width: '18px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '11px' }}>
                                                                    {item.set}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td style={{ width: '33.33%' }}></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div style={{ width: '168px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '302px' }}>
                                    <div>
                                        <div style={{ backgroundColor: theme.bgSolid, color: '#ffffff', textAlign: 'center', padding: '4px 0' }}>
                                            <p style={{ fontSize: '12px', fontWeight: 'bold', margin: 0 }}>নিয়মাবলী</p>
                                        </div>
                                        <div style={{ fontSize: '11px', lineHeight: '1.2', textAlign: 'justify', marginTop: '8px', padding: '0 4px' }}>
                                            <p style={{ margin: '0 0 4px 0' }}>১। বৃত্তাকার ঘরগুলো এমন ভাবে ভরাট করতে হবে যাতে ভেতরের লেখাটি দেখা না যায়।</p>
                                            <p style={{ margin: '0 0 4px 0' }}>২। উত্তরপত্রে অবাঞ্চিত দাগ দেয়া যাবেনা।</p>
                                            <p style={{ margin: '0 0 4px 0' }}>৩। উত্তরপত্র ভাজ করা যাবেনা।</p>
                                            <p style={{ margin: '0 0 4px 0' }}>৪। সেট কোডবিহীন উত্তরপত্র বাতিল হবে।</p>
                                        </div>
                                    </div>
                                    <div style={{ border: `1px solid ${theme.border}`, flex: 1, minHeight: '60px', position: 'relative', marginTop: 'auto', marginBottom: 0, marginLeft: '4px', marginRight: '4px' }}>
                                        <p style={{ position: 'absolute', bottom: '8px', width: '100%', textAlign: 'center', fontSize: '12px', margin: 0 }}>কক্ষ পরিদর্শকের স্বাক্ষর<br />তারিখসহ</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            headerSize === 'Small' ? (
                                <div style={{ width: '100%' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        {/* Left Side: Exam Types */}
                                        <div style={{ flex: 1, paddingLeft: '8px', paddingTop: '8px' }}>
                                            <div style={{ display: 'flex', gap: '32px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', border: `2px solid ${theme.border}`, boxSizing: 'border-box' }}></div>
                                                        <span style={{ fontWeight: 'bold', fontSize: '15px' }}>অর্ধ-বার্ষিক পরীক্ষা</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', border: `2px solid ${theme.border}`, boxSizing: 'border-box' }}></div>
                                                        <span style={{ fontWeight: 'bold', fontSize: '15px' }}>বার্ষিক পরীক্ষা</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', border: `2px solid ${theme.border}`, boxSizing: 'border-box' }}></div>
                                                        <span style={{ fontWeight: 'bold', fontSize: '15px' }}>মডেল টেস্ট পরীক্ষা</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '20px', height: '20px', border: `2px solid ${theme.border}`, boxSizing: 'border-box' }}></div>
                                                        <span style={{ fontWeight: 'bold', fontSize: '15px' }}>..................... পরীক্ষা</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Side: Rules & QR */}
                                        <div style={{ display: 'flex', border: `1px solid ${theme.border}`, width: '280px', height: '70px' }}>
                                            <div style={{ width: '20px', backgroundColor: theme.bgSolid, color: '#ffffff', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '11px', fontWeight: 'bold' }}>নিয়মাবলী</span>
                                            </div>
                                            <div style={{ padding: '4px', fontSize: '10px', flex: 1, lineHeight: '1.2' }}>
                                                <p style={{ margin: '0 0 2px 0' }}>১। বৃত্তাকার ঘরগুলো এমন ভাবে ভরাট করতে হবে যাতে ভেতরের লেখাটি দেখা না যায়।</p>
                                                <p style={{ margin: '0 0 2px 0' }}>২। উত্তরপত্রে কোন অবাঞ্ছিত দাগ দেয়া যাবেনা।</p>
                                                <p style={{ margin: '0 0 2px 0' }}>৩। উত্তরপত্র কোন ভাবেই ভাজ করা যাবেনা।</p>
                                                <p style={{ margin: '0' }}>৪। সেট কোড না ভরাট করলে উত্তরপত্র বাতিল হবে।</p>
                                            </div>
                                            <div style={{ borderLeft: `1px solid ${theme.border}`, padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '60px' }}>
                                                <MockQRCode />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Set Code Box */}
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                                        <div style={{ border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', width: '280px', height: '30px' }}>
                                            <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: '14px' }}>প্রশ্নের সেট কোড</div>
                                            <div style={{ display: 'flex', gap: '12px', padding: '0 12px', borderLeft: `1px solid ${theme.border}`, height: '100%', alignItems: 'center' }}>
                                                {['ক', 'খ', 'গ', 'ঘ'].map(opt => (
                                                    <div key={opt} style={{ border: `1px solid ${theme.border}`, borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: theme.text600 }}>{opt}</div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Student Info Lines */}
                                    <div style={{ borderTop: `2px solid ${theme.border}`, borderBottom: `2px solid ${theme.border}`, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-end' }}>
                                            <div style={{ flex: 1.5, display: 'flex', alignItems: 'flex-end' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '16px', marginRight: '8px' }}>নাম:</span>
                                                <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '16px', marginRight: '8px' }}>রোল:</span>
                                                <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-end' }}>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '16px', marginRight: '8px' }}>শ্রেণি:</span>
                                                <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '16px', marginRight: '8px' }}>বিষয়:</span>
                                                <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                            </div>
                                            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '16px', marginRight: '8px' }}>বিভাগ:</span>
                                                <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ width: '100%', display: 'flex', gap: '16px', marginBottom: '12px' }}>
                                    {/* Left Box: পরীক্ষার্থীর তথ্য */}
                                    <div style={{ flex: 1, border: `1px solid ${theme.border}`, padding: '16px', position: 'relative' }}>
                                        <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginBottom: '20px' }}>
                                            <span style={{ display: 'inline-block', borderBottom: `1px solid ${theme.text600}`, paddingBottom: '2px' }}>পরীক্ষার্থীর তথ্য</span>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '15px', marginRight: '8px' }}>নাম:</span>
                                                <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                                                <div style={{ flex: 1.5, display: 'flex', alignItems: 'flex-end' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '15px', marginRight: '8px' }}>শ্রেণি:</span>
                                                    <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                                </div>
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '15px', marginRight: '8px' }}>রোল:</span>
                                                    <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                                </div>
                                                <div style={{ flex: 1.5, display: 'flex', alignItems: 'flex-end' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '15px', marginRight: '8px' }}>বিভাগ:</span>
                                                    <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                                                <div style={{ flex: 1.5, display: 'flex', alignItems: 'flex-end' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '15px', marginRight: '8px' }}>বিষয়:</span>
                                                    <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                                </div>
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '15px', marginRight: '8px' }}>পত্র:</span>
                                                    <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                                </div>
                                                <div style={{ flex: 1.5, display: 'flex', alignItems: 'flex-end' }}>
                                                    <span style={{ fontWeight: 'bold', fontSize: '15px', marginRight: '8px' }}>বিষয় কোড:</span>
                                                    <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                                                <span style={{ fontWeight: 'bold', fontSize: '15px', marginRight: '8px' }}>তারিখ:</span>
                                                <div style={{ flex: 1, borderBottom: `1px dashed ${theme.border}`, height: '1px', marginBottom: '4px' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Flow: Rules, QR, Signature */}
                                    <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div>
                                            <div style={{ backgroundColor: theme.text500, color: '#ffffff', textAlign: 'center', padding: '4px 0' }}>
                                                <span style={{ fontSize: '13px', fontWeight: 'bold' }}>নিয়মাবলী</span>
                                            </div>
                                            <div style={{ fontSize: '10px', lineHeight: '1.3', marginTop: '6px', textAlign: 'justify' }}>
                                                <p style={{ margin: '0 0 4px 0' }}>১। বৃত্তাকার ঘরগুলো এমন ভাবে ভরাট করতে হবে যাতে ভেতরের লেখাটি দেখা না যায়।</p>
                                                <p style={{ margin: '0 0 4px 0' }}>২। উত্তরপত্রে অবাঞ্চিত দাগ দেয়া যাবেনা।</p>
                                                <p style={{ margin: '0 0 4px 0' }}>৩। উত্তরপত্র ভাজ করা যাবেনা।</p>
                                                <p style={{ margin: '0 0 4px 0' }}>৪। সেট কোডবিহীন উত্তরপত্র বাতিল হবে।</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <div style={{ width: '60px', height: '60px', border: '1px solid #000', padding: '2px' }}>
                                                <MockQRCode />
                                            </div>
                                        </div>
                                        <div style={{ border: `1px solid ${theme.border}`, flex: 1, minHeight: '60px', position: 'relative' }}>
                                            <div style={{ position: 'absolute', bottom: '8px', width: '100%', textAlign: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                                                কক্ষ পরিদর্শকের স্বাক্ষর তারিখসহ
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    <p style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '12px', marginTop: '16px', fontSize: '15px' }}>বহুনির্বাচনি অভিক্ষার উত্তরপত্র</p>

                    {/* Questions Grid using Tables */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        {columns.map((columnQuestions, colIdx) => (
                            <div key={`col-${colIdx}`} style={{ width: '160px', fontSize: '12px' }}>
                                {/* Header */}
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${theme.border}`, marginBottom: '1px' }}>
                                    <tbody>
                                        <tr style={{ height: '25px', fontWeight: 'bold' }}>
                                            <td style={{ width: '38px', textAlign: 'center', borderRight: `1px solid ${theme.border}`, verticalAlign: 'middle' }}>প্রশ্ন</td>
                                            <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>উত্তর</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* Rows */}
                                <table style={{ width: '100%', borderCollapse: 'collapse', border: `1px solid ${theme.border}` }}>
                                    <tbody>
                                        {columnQuestions.map((qNum) => (
                                            <tr key={`q-${qNum}`} style={{ height: '22px' }}>
                                                <td style={{ width: '38px', textAlign: 'center', borderRight: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, backgroundColor: 'rgba(249,250,251,0.5)', verticalAlign: 'middle' }}>
                                                    {toBengaliNumber(qNum)}
                                                </td>
                                                {['ক', 'খ', 'গ', 'ঘ'].map((opt, optIdx) => (
                                                    <td
                                                        key={`opt-${qNum}-${optIdx}`}
                                                        style={{
                                                            borderBottom: `1px solid ${theme.border}`,
                                                            borderRight: optIdx < 3 ? `1px solid ${theme.border}` : 'none',
                                                            backgroundColor: optIdx === 0 || optIdx === 2 ? theme.bg300 : 'transparent',
                                                            textAlign: 'center',
                                                            verticalAlign: 'middle'
                                                        }}
                                                    >
                                                        <div style={{ margin: '0 auto', border: '1px solid rgba(0,0,0,0.6)', borderRadius: '50%', width: '17px', height: '17px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1f2937', boxSizing: 'border-box' }}>
                                                            {opt}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}
