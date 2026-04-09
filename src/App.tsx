/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { View } from './types';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Settings from './components/Settings';
import ReviewExpense from './components/ReviewExpense';
import ScanningView from './components/ScanningView';
import Notifications from './components/Notifications';
import { SuccessModal, LogoutModal } from './components/Modals';
import { useExpenses } from './hooks/useExpenses';
import { ReceiptData } from './services/ollamaService';

interface ScannedPayload {
  data: ReceiptData;
  imageDataUrl: string;
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [scannedPayload, setScannedPayload] = useState<ScannedPayload | null>(null);

  const [editingExpense, setEditingExpense] = useState<import('./types').Expense | null>(null);
  const [rescanFromEdit, setRescanFromEdit] = useState(false);
  const [editOriginView, setEditOriginView] = useState<'home' | 'history'>('home');
  const { expenses, addExpense, updateExpense, deleteExpense, refresh } = useExpenses();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string) => {
    setToast(message);
  };

  // Open camera scanning view (from home/navbar)
  const handleImport = () => {
    setScannedPayload(null);
    setRescanFromEdit(false);
    setCurrentView('scanning');
  };

  // Open camera scanning view from edit-expense rescan
  const handleRescanFromEdit = () => {
    setScannedPayload(null);
    setRescanFromEdit(true);
    setCurrentView('scanning');
  };

  // Called by ScanningView when scan returns results
  const handleScanResult = (data: ReceiptData, imageDataUrl: string) => {
    setScannedPayload({ data, imageDataUrl });
    if (rescanFromEdit) {
      setRescanFromEdit(false);
      setCurrentView('edit-expense');
    } else {
      setCurrentView('review');
    }
  };

  const handleSave = () => {
    setIsSuccessModalOpen(true);
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    setScannedPayload(null);
    setCurrentView('home');
  };

  const handleScanAnother = () => {
    setIsSuccessModalOpen(false);
    setScannedPayload(null);
    handleImport();
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <Dashboard
            expenses={expenses}
            onImport={handleImport}
            onSeeAll={() => setCurrentView('history')}
            onNotificationClick={() => setCurrentView('notifications')}
            onAvatarClick={() => setCurrentView('settings')}
            onExpenseClick={(expense) => { setEditingExpense(expense); setEditOriginView('home'); setCurrentView('edit-expense'); }}
          />
        );
      case 'history':
        return (
          <History
            expenses={expenses}
            deleteExpense={deleteExpense}
            onAddClick={() => setCurrentView('manual-add')}
            onExpenseClick={(expense) => {
              setEditingExpense(expense);
              setEditOriginView('history');
              setCurrentView('edit-expense');
            }}
          />
        );
      case 'settings':
        return (
          <Settings 
            onExport={() => showToast('Exporting to CSV...')}
            onLogout={() => setIsLogoutModalOpen(true)}
          />
        );
      case 'review':
        return (
          <ReviewExpense
            onSave={handleSave}
            onCancel={() => { setScannedPayload(null); setCurrentView('home'); }}
            onRescan={() => { setScannedPayload(null); handleImport(); }}
            addExpense={addExpense}
            expenses={expenses}
            initialData={scannedPayload ? {
              merchant: scannedPayload.data.merchant,
              amount: scannedPayload.data.amount,
              date: scannedPayload.data.date ?? undefined,
              confidence: scannedPayload.data.confidence,
              imageDataUrl: scannedPayload.imageDataUrl,
            } : undefined}
          />
        );
      case 'edit-expense':
        return (
          <ReviewExpense
            onSave={() => { setEditingExpense(null); setScannedPayload(null); setIsSuccessModalOpen(true); }}
            onCancel={() => { setEditingExpense(null); setScannedPayload(null); setCurrentView(editOriginView); }}
            onRescan={handleRescanFromEdit}
            addExpense={addExpense}
            updateExpense={updateExpense}
            existingExpense={editingExpense ?? undefined}
            expenses={expenses}
            initialData={scannedPayload ? {
              merchant: scannedPayload.data.merchant,
              amount: scannedPayload.data.amount,
              date: scannedPayload.data.date ?? undefined,
              confidence: scannedPayload.data.confidence,
              imageDataUrl: scannedPayload.imageDataUrl,
            } : undefined}
            preferScannedData={!!scannedPayload}
          />
        );
      case 'manual-add':
        return (
          <ReviewExpense
            onSave={handleSave}
            onCancel={() => setCurrentView('history')}
            isNew={true}
            addExpense={addExpense}
            expenses={expenses}
          />
        );
      case 'scanning':
        return (
          <ScanningView
            onCancel={() => {
              if (rescanFromEdit) {
                setRescanFromEdit(false);
                setCurrentView('edit-expense');
              } else {
                setCurrentView('home');
              }
            }}
            onResult={handleScanResult}
          />
        );
      case 'notifications':
        return <Notifications onBack={() => setCurrentView('home')} />;
      default:
        return (
          <Dashboard
            expenses={expenses}
            onImport={handleImport}
            onSeeAll={() => setCurrentView('history')}
            onNotificationClick={() => setCurrentView('notifications')}
            onAvatarClick={() => setCurrentView('settings')}
            onExpenseClick={(expense) => { setEditingExpense(expense); setEditOriginView('home'); setCurrentView('edit-expense'); }}
          />
        );
    }
  };

  const showNavbar = ['home', 'history', 'settings'].includes(currentView);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto bg-background-light overflow-x-hidden shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
          className="flex-1 flex flex-col h-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>

      {showNavbar && (
        <Navbar currentView={currentView} onViewChange={setCurrentView} />
      )}

      <SuccessModal 
        isOpen={isSuccessModalOpen} 
        onClose={handleSuccessClose} 
        onScanAnother={handleScanAnother} 
      />

      <LogoutModal 
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onLogout={() => {
          setIsLogoutModalOpen(false);
          showToast('Logged out successfully');
          setCurrentView('home');
        }}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
