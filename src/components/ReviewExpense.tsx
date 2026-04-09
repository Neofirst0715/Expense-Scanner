import React, { useState, useRef } from 'react';
import { X, Sparkles, Store, Calendar, ZoomIn, ChevronDown, Check, Utensils, Car, Home, Smartphone, Plane, HeartPulse, BookOpen, Dumbbell, CircleEllipsis, ScanLine } from 'lucide-react';
import { IMAGES, CATEGORIES } from '../constants';
import { Category, Expense } from '../types';
import { DiscardModal, DuplicateModal } from './Modals';

const ICON_MAP: Record<string, any> = {
  Utensils,
  Car,
  Home,
  Smartphone,
  Plane,
  HeartPulse,
  BookOpen,
  Dumbbell,
  CircleEllipsis,
};

interface InitialData {
  merchant?: string;
  amount?: number | null;
  date?: string | null;
  confidence?: 'high' | 'medium' | 'low';
  imageDataUrl?: string;
}

interface ReviewExpenseProps {
  onSave: () => void;
  onCancel: () => void;
  onRescan?: () => void;
  isNew?: boolean;
  addExpense: (expenseData: Partial<Expense>) => Promise<any>;
  updateExpense?: (id: string, expenseData: Partial<Expense>) => Promise<any>;
  initialData?: InitialData;
  existingExpense?: Expense;
  expenses?: Expense[];
  preferScannedData?: boolean;
}

/** Convert a JS Date → "Apr 8, 2026" */
function formatDisplayDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Convert "Apr 8, 2026" → "2026-04-08" (for <input type="date">) */
function displayToInputValue(display: string): string {
  try {
    const d = new Date(display);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/** Convert "2026-04-08" → "Apr 8, 2026" */
function inputValueToDisplay(val: string): string {
  // val is YYYY-MM-DD — parse as local date to avoid UTC shift
  const [y, m, d] = val.split('-').map(Number);
  return formatDisplayDate(new Date(y, m - 1, d));
}

export default function ReviewExpense({ onSave, onCancel, onRescan, isNew = false, addExpense, updateExpense, initialData, existingExpense, expenses, preferScannedData }: ReviewExpenseProps) {
  const today = formatDisplayDate(new Date());

  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // When preferScannedData is true (rescan result), use initialData values over existingExpense
  const initCategory = (preferScannedData ? undefined : existingExpense?.category as Category) ?? existingExpense?.category as Category;
  const [selectedCategory, setSelectedCategory] = useState<Category>(
    initCategory && CATEGORIES[initCategory] ? initCategory : 'Food & Drink'
  );
  const [amount, setAmount] = useState<string>(() => {
    if (preferScannedData && initialData?.amount != null) return String(initialData.amount);
    if (existingExpense) return String(existingExpense.amount);
    if (initialData?.amount != null) return String(initialData.amount);
    return isNew ? '' : '42.50';
  });
  const [merchant, setMerchant] = useState(() => {
    if (preferScannedData && initialData?.merchant && initialData.merchant !== 'Unknown') return initialData.merchant;
    if (existingExpense) return existingExpense.merchant;
    if (initialData?.merchant && initialData.merchant !== 'Unknown') return initialData.merchant;
    return isNew ? '' : 'Starbucks';
  });
  const [displayDate, setDisplayDate] = useState<string>(() => {
    const scannedRaw = preferScannedData ? initialData?.date : null;
    const raw = scannedRaw ?? existingExpense?.date ?? initialData?.date;
    if (!raw) return isNew ? today : 'Oct 24, 2023';
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return inputValueToDisplay(raw);
    return raw;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const dateInputRef = useRef<HTMLInputElement>(null);
  const categoryOptions = Object.keys(CATEGORIES) as Category[];

  const findDuplicate = (): Expense | undefined => {
    if (!expenses || !merchant || !amount) return undefined;
    const normalizedDate = displayToInputValue(displayDate);
    return expenses.find(exp => {
      if (existingExpense && exp.id === existingExpense.id) return false;
      const expDate = displayToInputValue(exp.date);
      return (
        Math.abs(exp.amount - Number(amount)) < 0.01 &&
        exp.merchant.toLowerCase().trim() === merchant.toLowerCase().trim() &&
        expDate === normalizedDate
      );
    });
  };

  const doSave = async () => {
    if (!merchant || !amount) return;
    setIsSaving(true);
    try {
      setSaveError(null);
      const catMeta = CATEGORIES[selectedCategory] ?? CATEGORIES['Other'];
      const expenseData = {
        merchant,
        category: selectedCategory,
        date: displayDate,
        amount: Number(amount),
        icon: catMeta.icon,
        color: catMeta.bg
      };
      if (existingExpense && updateExpense) {
        await updateExpense(existingExpense.id, expenseData);
      } else {
        await addExpense(expenseData);
      }
      onSave();
    } catch (e: any) {
      console.error('Failed to save', e);
      setSaveError(e?.message || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // AI confidence badge (only when data came from scan)
  const confidence = initialData?.confidence;
  const hasScannedImage = !isNew && initialData?.imageDataUrl;
  const receiptThumb = hasScannedImage ? initialData!.imageDataUrl! : IMAGES.RECEIPT_THUMB;

  const handleDateRowClick = () => {
    setIsDatePickerOpen(true);
    // Programmatically open the native date picker
    dateInputRef.current?.showPicker?.();
    dateInputRef.current?.click();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setDisplayDate(inputValueToDisplay(e.target.value));
    }
    setIsDatePickerOpen(false);
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-hidden bg-background-light">
      <div className="flex items-center px-4 py-3 justify-between sticky top-0 z-10 bg-background-light/90 backdrop-blur-md">
        <button 
          onClick={onCancel}
          className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 transition-colors text-slate-900"
        >
          <X size={24} />
        </button>
        <h2 className="text-lg font-bold leading-tight flex-1 text-center pr-10">{isNew ? 'Add Expense' : existingExpense ? 'Edit Expense' : 'Review Expense'}</h2>
      </div>

      <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-8 w-full max-w-lg mx-auto">
        <div className="w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
          <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6 bg-gradient-to-b from-white to-slate-50 rounded-t-3xl">
            {/* Receipt thumbnail — show for scanned or default review */}
            {!isNew && (
              <div className="mb-4 h-12 w-12 rounded-lg overflow-hidden shadow-sm border border-slate-200 relative bg-white group cursor-pointer">
                <img 
                  alt="Receipt Thumbnail" 
                  className="object-cover w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" 
                  src={receiptThumb}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <ZoomIn size={16} className="text-white drop-shadow-md" />
                </div>
              </div>
            )}
            <div className="relative flex items-center justify-center">
              <span className="text-3xl font-bold text-slate-400 mr-1">$</span>
              <input 
                type="number" 
                className="text-5xl font-extrabold tracking-tight text-slate-900 bg-transparent border-none p-0 text-center focus:ring-0 w-[150px]" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            {/* Confidence badge */}
            {!isNew && confidence && (
              <div className={`mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full ${
                confidence === 'high' ? 'bg-green-100 text-green-700' :
                confidence === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                <Sparkles size={14} />
                <p className="text-xs font-bold uppercase tracking-wide">
                  {confidence === 'high' ? 'High Confidence' : confidence === 'medium' ? 'Medium Confidence' : 'Low Confidence'}
                </p>
              </div>
            )}
            {!isNew && !confidence && (
              <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700">
                <Sparkles size={14} />
                <p className="text-xs font-bold uppercase tracking-wide">High Confidence</p>
              </div>
            )}
          </div>

          <div className="w-full h-px bg-slate-100"></div>

          <div className="flex flex-col gap-0 p-2 relative">
            {/* Merchant */}
            <div>
              <div className="group relative p-2 transition-colors hover:bg-slate-50 rounded-xl">
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 pl-3 mb-0.5 block">Merchant</label>
                <div className="relative flex items-center">
                  <input 
                    className="w-full bg-transparent text-slate-900 border-0 p-0 pl-3 pr-10 text-lg font-semibold focus:ring-0 placeholder-slate-300" 
                    type="text" 
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    placeholder="Enter merchant name"
                  />
                  <div className="absolute right-3 text-primary pointer-events-none">
                    <Store size={20} />
                  </div>
                </div>
              </div>
              <div className="mx-4 h-px bg-slate-100"></div>
            </div>

            {/* Category */}
            <div className="relative z-20">
              <div 
                className="group relative p-2 transition-colors hover:bg-slate-50 rounded-xl cursor-pointer"
                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              >
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 pl-3 mb-0.5 block">Category</label>
                <div className="relative flex items-center">
                  <div className="w-full bg-transparent text-slate-900 border-0 p-0 pl-3 pr-10 text-lg font-semibold flex items-center gap-2">
                    {(() => {
                      const Icon = ICON_MAP[CATEGORIES[selectedCategory].icon];
                      return <Icon size={18} className={CATEGORIES[selectedCategory].color} />;
                    })()}
                    {selectedCategory}
                  </div>
                  <div className="absolute right-3 text-slate-400 pointer-events-none">
                    <ChevronDown size={20} className={isCategoryDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                  </div>
                </div>
              </div>
              
              {isCategoryDropdownOpen && (
                <div className="absolute top-full left-2 right-2 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 max-h-60 overflow-y-auto">
                  {categoryOptions.map(opt => {
                    const Icon = ICON_MAP[CATEGORIES[opt].icon];
                    return (
                      <button 
                        key={opt} 
                        onClick={() => { setSelectedCategory(opt); setIsCategoryDropdownOpen(false); }} 
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 flex justify-between items-center"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex size-8 items-center justify-center rounded-lg ${CATEGORIES[opt].bg} ${CATEGORIES[opt].color}`}>
                            <Icon size={16} />
                          </div>
                          <span className={selectedCategory === opt ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}>{opt}</span>
                        </div>
                        {selectedCategory === opt && <Check size={18} className="text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mx-4 h-px bg-slate-100"></div>
            </div>

            {/* Date Picker */}
            <div className="relative z-10">
              <div
                className="group relative p-2 transition-colors hover:bg-slate-50 rounded-xl cursor-pointer"
                onClick={handleDateRowClick}
              >
                <label className="text-[11px] uppercase tracking-wider font-bold text-slate-400 pl-3 mb-0.5 block cursor-pointer">Date</label>
                <div className="relative flex items-center">
                  <div className="w-full bg-transparent text-slate-900 border-0 p-0 pl-3 pr-10 text-lg font-semibold">
                    {displayDate || 'Select date'}
                  </div>
                  <div className={`absolute right-3 pointer-events-none transition-colors ${isDatePickerOpen ? 'text-primary' : 'text-slate-400'}`}>
                    <Calendar size={20} />
                  </div>
                </div>
              </div>
              {/* Hidden native date input — visually invisible but functional */}
              <input
                ref={dateInputRef}
                type="date"
                className="absolute opacity-0 pointer-events-none w-0 h-0 bottom-0 left-4"
                value={displayToInputValue(displayDate)}
                onChange={handleDateChange}
                onBlur={() => setIsDatePickerOpen(false)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            {isCategoryDropdownOpen && (
              <div className="fixed inset-0 z-10" onClick={() => setIsCategoryDropdownOpen(false)} />
            )}
          </div>
        </div>

        <div className="w-full mt-auto pt-8 pb-4 flex flex-col gap-4">
          <button
            onClick={() => {
              if (!merchant || !amount) return;
              // Only check duplicates when adding new (not updating existing)
              if (!existingExpense) {
                const dup = findDuplicate();
                if (dup) {
                  setIsDuplicateModalOpen(true);
                  return;
                }
              }
              doSave();
            }}
            disabled={isSaving}
            className={`w-full ${isSaving ? 'bg-blue-400' : 'bg-primary hover:bg-blue-600'} text-white font-bold text-lg py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2`}
          >
            {isSaving ? 'Saving...' : 'Save Expense'}
          </button>
          {saveError && (
            <p className="text-red-500 text-sm text-center font-medium -mt-2">{saveError}</p>
          )}
          {!isNew && (
            <div className="flex items-center justify-center gap-8">
              <button
                onClick={onRescan}
                className="text-slate-500 hover:text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm"
              >
                <ScanLine size={16} />
                Rescan
              </button>
              <div className="w-px h-4 bg-slate-300"></div>
              <button
                onClick={() => setIsDiscardModalOpen(true)}
                className="text-slate-500 hover:text-red-600 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
              >
                Discard
              </button>
            </div>
          )}
        </div>
      </main>

      <DiscardModal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        onDiscard={onCancel}
      />

      <DuplicateModal
        isOpen={isDuplicateModalOpen}
        merchant={merchant}
        date={displayDate}
        amount={Number(amount) || 0}
        onClose={() => setIsDuplicateModalOpen(false)}
        onConfirm={() => { setIsDuplicateModalOpen(false); doSave(); }}
      />
    </div>
  );
}
