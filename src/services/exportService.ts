import type { PolicyData } from '../types';

// Declare global variables for CDN-loaded libraries to satisfy TypeScript
declare const XLSX: any;
declare const jsPDF: any;

const getHeaders = (data: PolicyData[]) => {
    if (data.length === 0) return [];
    return Object.keys(data[0]);
};

const getRows = (data: PolicyData[]) => {
    return data.map(row => Object.values(row));
};

export const exportToCsv = (data: PolicyData[], fileName: string) => {
    const headers = getHeaders(data);
    const rows = getRows(data);
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
        URL.revokeObjectURL(link.href);
    }
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `${fileName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToXlsx = (data: PolicyData[], fileName: string) => {
    const headers = getHeaders(data);
    const rows = getRows(data);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Policies');
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPdf = (data: PolicyData[], fileName: string) => {
    const doc = new jsPDF.default('l', 'pt', 'a4'); // landscape, points, a4
    const headers = getHeaders(data);
    const rows = getRows(data);
    
    doc.autoTable({
        head: [headers],
        body: rows,
        styles: {
            fontSize: 6,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: [22, 160, 133],
            fontSize: 7,
        },
        margin: { top: 20 },
    });

    doc.save(`${fileName}.pdf`);
};