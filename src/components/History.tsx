import { useState, useMemo } from 'react';
import { Search, ChevronDown, Check, Plus, X, Utensils, Car, Home, Smartphone, Plane, HeartPulse, BookOpen, Dumbbell, CircleEllipsis, Coffee, Film } from 'lucide-react';
import { CATEGORIES } from '../constants';
import { Expense } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { DeleteModal } from './Modals';

function parseExpenseDate(raw: string): Date | null {
  if (!raw) return null;
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  // YY/MM/DD (e.g. 26/04/08)
  const yymmdd = raw.match(/^(\d{2})\/(\d{2})\/(\d{2})$/);
  if (yymmdd) return new Date(2000 + Number(yymmdd[1]), Number(yymmdd[2]) - 1, Number(yymmdd[3]));
  // Fallback: JS Date parse (handles "Apr 8, 2026" etc.)
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

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
  Coffee,
  Film,
};

interface HistoryProps {
  expenses: Expense[];
  deleteExpense: (id: string) => void;
  onAddClick: () => void;
  onExpenseClick?: (expense: Expense) => void;
}

export default function History({ expenses, deleteExpense, onAddClick, onExpenseClick }: HistoryProps) {
  const [activeDropdown, setActiveDropdown] = useState<'time' | 'category' | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [swipedExpenseId, setSwipedExpenseId] = useState<string | null>(null);

  const timeOptions = useMemo(() => {
    const result = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    for (let year = currentYear; year >= 2000; year--) {
      const startMonth = year === currentYear ? currentMonth : 11;
      for (let month = startMonth; month >= 0; month--) {
        const date = new Date(year, month, 1);
        result.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
      }
    }
    return result;
  }, []);

  const [selectedTime, setSelectedTime] = useState(timeOptions[0]);

  const categoryOptions = ['All Categories', ...Object.keys(CATEGORIES)];

  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = selectedCategory === 'All Categories' || exp.category === selectedCategory;
    const matchesSearch = exp.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exp.category.toLowerCase().includes(searchQuery.toLowerCase());

    const [monthStr, yearStr] = selectedTime.split(' ');
    const expDate = parseExpenseDate(exp.date);
    if (!expDate) return false;
    const expMonthStr = expDate.toLocaleDateString('en-US', { month: 'short' });
    const expYearStr = expDate.getFullYear().toString();
    const matchesTime = expMonthStr === monthStr && expYearStr === yearStr;

    return matchesCategory && matchesSearch && matchesTime;
  });

  const handleDeleteConfirm = () => {
    if (expenseToDelete) {
      deleteExpense(expenseToDelete);
      setExpenseToDelete(null);
      setSwipedExpenseId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-light">
      <header className="flex items-center px-4 py-3 justify-between sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 h-[60px]">
        <AnimatePresence mode="wait">
          {!isSearchOpen ? (
            <motion.div 
              key="title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center justify-between w-full"
            >
              <h1 className="text-xl font-bold tracking-tight">Expense History</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Search size={24} />
                </button>
                <button 
                  onClick={onAddClick}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors text-primary"
                >
                  <Plus size={26} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center w-full gap-2"
            >
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expenses..."
                  className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary sm:text-sm transition-all"
                />
              </div>
              <button 
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-slate-500"
              >
                <X size={24} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <div className="w-full bg-white py-3 sticky top-[60px] z-20 border-b border-gray-50 relative">
        <div className="flex gap-3 px-4 relative z-50 flex-wrap">
          
          {/* Time Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'time' ? null : 'time')}
              className={`flex shrink-0 h-9 items-center justify-center gap-1 rounded-full px-4 text-sm font-semibold transition-all ${
                selectedTime !== timeOptions[0] || activeDropdown === 'time' ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              {selectedTime} <ChevronDown size={16} className={activeDropdown === 'time' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
            {activeDropdown === 'time' && (
              <div className="absolute top-full left-0 mt-2 w-48 max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                {timeOptions.map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => { setSelectedTime(opt); setActiveDropdown(null); }} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex justify-between items-center"
                  >
                    <span className={selectedTime === opt ? 'font-bold text-primary' : 'font-medium text-slate-700'}>{opt}</span>
                    {selectedTime === opt && <Check size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setActiveDropdown(activeDropdown === 'category' ? null : 'category')}
              className={`flex shrink-0 h-9 items-center justify-center gap-1 rounded-full px-4 text-sm font-semibold transition-all ${
                selectedCategory !== 'All Categories' || activeDropdown === 'category' ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              {selectedCategory === 'All Categories' ? 'Categories' : selectedCategory} 
              <ChevronDown size={16} className={activeDropdown === 'category' ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
            {activeDropdown === 'category' && (
              <div className="absolute top-full left-0 mt-2 w-56 max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                {categoryOptions.map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => { setSelectedCategory(opt); setActiveDropdown(null); }} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex justify-between items-center"
                  >
                    <span className={selectedCategory === opt ? 'font-bold text-primary' : 'font-medium text-slate-700'}>{opt}</span>
                    {selectedCategory === opt && <Check size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
        
        {/* Backdrop for dropdowns */}
        {activeDropdown && (
          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
        )}
      </div>

      <main className="flex-1 flex flex-col overflow-y-auto pb-24 overflow-x-hidden">
        {filteredExpenses.length > 0 ? (
          <div className="pt-2">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50/90 sticky top-0 backdrop-blur-sm z-10 border-y border-gray-100">
              <h3 className="text-gray-600 text-sm font-bold">{selectedTime}</h3>
              <span className="text-xs font-semibold text-gray-400">
                -${filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
              </span>
            </div>
            
            {filteredExpenses.map((expense) => {
              const Icon = ICON_MAP[expense.icon] || Coffee;
              const isSwiped = swipedExpenseId === expense.id;
              const catMeta = CATEGORIES[expense.category as keyof typeof CATEGORIES];
              
              return (
                <div key={expense.id} className="relative overflow-hidden w-full bg-red-500 border-b border-gray-100">
                  <div className="absolute inset-y-0 right-0 w-[90px] flex items-center justify-center z-0">
                    <button 
                      onClick={() => setExpenseToDelete(expense.id)}
                      className="flex flex-col items-center justify-center gap-1 text-white w-full h-full active:bg-red-600"
                    >
                      <span className="text-xs font-bold">Delete</span>
                    </button>
                  </div>
                  
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: -90, right: 0 }}
                    dragElastic={0.1}
                    onDragEnd={(e, info) => {
                      if (info.offset.x < -45) {
                        setSwipedExpenseId(expense.id);
                      } else {
                        setSwipedExpenseId(null);
                      }
                    }}
                    animate={{ x: isSwiped ? -90 : 0 }}
                    transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                    onClick={() => {
                      if (isSwiped) {
                        setSwipedExpenseId(null);
                      } else {
                        onExpenseClick?.(expense);
                      }
                    }}
                    className="relative flex items-center gap-4 px-4 py-4 bg-white hover:bg-gray-50 transition-colors cursor-pointer z-10"
                  >
                    <div className="relative shrink-0 pointer-events-none">
                      <div className={`h-10 w-10 rounded-lg ${catMeta?.bg || expense.color} flex items-center justify-center ring-1 ring-black/5 ${catMeta?.color || 'text-slate-700'}`}>
                        <Icon size={20} />
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 min-w-0 pointer-events-none">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-slate-900 text-base font-semibold truncate mr-2">{expense.merchant}</p>
                        <p className="text-slate-900 text-base font-bold whitespace-nowrap">${expense.amount.toFixed(2)}</p>
                      </div>
                      <p className="text-gray-500 text-xs font-medium truncate">{expense.category} • {expense.date.split(',')[0]}</p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center text-slate-500">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Search size={24} className="text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">No expenses found</p>
            <p className="text-sm mt-1">Try changing your category, time filter, or search query.</p>
          </div>
        )}
      </main>

      <DeleteModal 
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        onDelete={handleDeleteConfirm}
      />
    </div>
  );
}
