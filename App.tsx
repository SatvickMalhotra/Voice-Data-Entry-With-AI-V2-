import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DataTable from './components/DataTable';
import DataEntryForm from './components/DataEntryForm';
import Toast from './components/Toast';
import useLocalStorage from './hooks/useLocalStorage';
import type { PolicyData, ToastMessage } from './types';

type View = 'table' | 'form';

function App() {
  const [policies, setPolicies] = useLocalStorage<PolicyData[]>('mswasth-policies', []);
  const [view, setView] = useState<View>('table');
  const [editingPolicy, setEditingPolicy] = useState<PolicyData | null>(null);
  const [theme, setTheme] = useLocalStorage<string>('mswasth-theme', 'light');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast = { id: Date.now(), message, type };
    setToast(newToast);
    setTimeout(() => {
        setToast(currentToast => currentToast?.id === newToast.id ? null : currentToast);
    }, 4000);
  }, []);

  const handleSavePolicy = (policy: PolicyData) => {
    if (editingPolicy) {
      setPolicies(prev => prev.map(p => p.id === policy.id ? policy : p));
      showToast('Policy updated successfully!', 'success');
    } else {
      setPolicies(prev => [...prev, { ...policy, id: Date.now().toString() }]);
      showToast('New policy added successfully!', 'success');
    }
    setView('table');
    setEditingPolicy(null);
  };
  
  const handleAddNew = () => {
    setEditingPolicy(null);
    setView('form');
  };

  const handleEdit = (policy: PolicyData) => {
    setEditingPolicy(policy);
    setView('form');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setPolicies(prev => prev.filter(p => p.id !== id));
      showToast('Policy deleted.', 'success');
    }
  };

  const handleDeleteAll = () => {
    if (window.confirm('Are you sure you want to delete ALL entries? This action cannot be undone.')) {
      setPolicies([]);
      showToast('All policies deleted.', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-base-300">
      <Header currentTheme={theme} onThemeChange={setTheme} />
      <main>
        {view === 'table' ? (
          <DataTable
            policies={policies}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteAll={handleDeleteAll}
            onAddNew={handleAddNew}
          />
        ) : (
          <DataEntryForm
            onSave={handleSavePolicy}
            onClose={() => setView('table')}
            initialData={editingPolicy}
            showToast={showToast}
          />
        )}
      </main>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default App;