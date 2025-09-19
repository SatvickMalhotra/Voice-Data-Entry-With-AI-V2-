import React, { useState, useMemo } from 'react';
import type { PolicyData } from '../types';
import { exportToCsv, exportToXlsx, exportToPdf } from '../services/exportService';

interface DataTableProps {
  policies: PolicyData[];
  onEdit: (policy: PolicyData) => void;
  onDelete: (id: string) => void;
  onDeleteAll: () => void;
  onAddNew: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ policies, onEdit, onDelete, onDeleteAll, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof PolicyData | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredPolicies = useMemo(() => {
    return policies.filter(policy =>
      Object.values(policy).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [policies, searchTerm]);

  const sortedPolicies = useMemo(() => {
    let sortableItems = [...filteredPolicies];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredPolicies, sortConfig]);

  const paginatedPolicies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPolicies.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPolicies, currentPage]);

  const totalPages = Math.ceil(sortedPolicies.length / itemsPerPage);

  const requestSort = (key: keyof PolicyData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const headers: { key: keyof PolicyData; label: string }[] = [
    { key: 'customerName', label: 'Customer Name' },
    { key: 'partnerName', label: 'Partner' },
    { key: 'productDetails', label: 'Product' },
    { key: 'premium', label: 'Premium' },
    { key: 'enrolmentDate', label: 'Enrolment Date' },
    { key: 'mobileNumber', label: 'Mobile' },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="card-title text-2xl">Policy Entries</h2>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search entries..."
                className="input input-bordered w-full max-w-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={onAddNew} className="btn btn-primary">Add New</button>
            </div>
          </div>

          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
             <div className="dropdown">
                <div tabIndex={0} role="button" className="btn">Export Data</div>
                <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li><button onClick={() => exportToCsv(policies, 'policies')}>Export as CSV</button></li>
                    <li><button onClick={() => exportToXlsx(policies, 'policies')}>Export as XLSX</button></li>
                    <li><button onClick={() => exportToPdf(policies, 'policies')}>Export as PDF</button></li>
                </ul>
              </div>
              {policies.length > 0 && (
                <button onClick={onDeleteAll} className="btn btn-error btn-outline">Delete All Entries</button>
              )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  {headers.map(({ key, label }) => (
                    <th key={key} onClick={() => requestSort(key)} className="cursor-pointer">
                      {label} {sortConfig.key === key ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : ''}
                    </th>
                  ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPolicies.map(policy => (
                  <tr key={policy.id} className="hover">
                    {headers.map(({ key }) => <td key={key}>{policy[key]}</td>)}
                    <td className="flex gap-2">
                      <button onClick={() => onEdit(policy)} className="btn btn-sm btn-outline btn-info">Edit</button>
                      <button onClick={() => onDelete(policy.id)} className="btn btn-sm btn-outline btn-error">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {paginatedPolicies.length === 0 && <p className="text-center p-4">No entries found.</p>}
          </div>

          <div className="flex justify-center mt-4">
            <div className="join">
                <button className="join-item btn" onClick={() => setCurrentPage(p => Math.max(1, p-1))} disabled={currentPage === 1}>«</button>
                <button className="join-item btn">{`Page ${currentPage} of ${totalPages}`}</button>
                <button className="join-item btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))} disabled={currentPage === totalPages}>»</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;