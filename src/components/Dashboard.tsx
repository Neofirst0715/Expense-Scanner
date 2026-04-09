import { useState, useMemo } from 'react';
import { Bell, TrendingDown, Image as ImageIcon, ChevronRight, Car, Film, Coffee, ChevronDown, Check, Utensils, Home, Smartphone, Plane, HeartPulse, BookOpen, Dumbbell, CircleEllipsis } from 'lucide-react';
import { IMAGES, CATEGORIES } from '../constants';
import { Category, Expense } from '../types';

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

interface DashboardProps {
  expenses: Expense[];
  onImport: () => void;
  onSeeAll: () => void;
  onNotificationClick: () => void;
  onAvatarClick: () => void;
  onExpenseClick: (expense: Expense) => void;
}

export default function Dashboard({ expenses, onImport, onSeeAll, onNotificationClick, onAvatarClick, onExpenseClick }: DashboardProps) {
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  
  const months = useMemo(() => {
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

  const [selectedMonth, setSelectedMonth] = useState(months[0]);

  const filteredExpenses = useMemo(() => {
    const [monthStr, yearStr] = selectedMonth.split(' ');
    // Sort expenses by date desc before slicing if you want to show most recent ones 
    // although they come sorted from API usually
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const expMonthStr = expDate.toLocaleDateString('en-US', { month: 'short' });
      const expYearStr = expDate.getFullYear().toString();
      return expMonthStr === monthStr && expYearStr === yearStr;
    });
  }, [selectedMonth]);

  const { totalAmount, sortedCategories, conicGradient } = useMemo(() => {
    const categoryTotals = filteredExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const total = (Object.values(categoryTotals) as number[]).reduce((sum, val) => sum + val, 0);

    const sorted = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([category, amount]) => ({ 
        category: category as Category, 
        amount: amount as number, 
        percentage: total > 0 ? ((amount as number) / total) * 100 : 0 
      }));

    let currentPercentage = 0;
    const gradientParts = sorted.map(item => {
      const color = CATEGORIES[item.category]?.hex || '#cbd5e1';
      const start = currentPercentage;
      const end = currentPercentage + item.percentage;
      currentPercentage = end;
      return `${color} ${start}% ${end}%`;
    });

    const gradient = gradientParts.length > 0 
      ? `conic-gradient(${gradientParts.join(', ')})` 
      : 'conic-gradient(#f1f5f9 0% 100%)';

    return { totalAmount: total, sortedCategories: sorted, conicGradient: gradient };
  }, [filteredExpenses]);

  return (
    <div className="flex flex-col gap-6 p-5 pb-24 no-scrollbar">
      <header className="flex items-center justify-between">
        <button 
          onClick={onAvatarClick}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 overflow-hidden ring-2 ring-white shadow-sm hover:opacity-80 transition-opacity cursor-pointer"
        >
          <img src={IMAGES.AVATAR} alt="User" className="size-full object-cover" referrerPolicy="no-referrer" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="text-slate-900 text-base font-bold leading-tight tracking-tight">Dashboard</h2>
          <span className="text-xs font-medium text-slate-500">Good Morning, Alex</span>
        </div>
        <button 
          onClick={onNotificationClick}
          className="flex size-10 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100 text-slate-600 relative hover:bg-slate-50 transition-colors"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full ring-1 ring-white"></span>
        </button>
      </header>

      <div className="flex flex-col items-center justify-center gap-2 rounded-3xl p-6 bg-white shadow-soft border border-slate-100">
        <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider">Total Spent</p>
        <h1 className="text-slate-900 text-4xl font-extrabold tracking-tight">${totalAmount.toFixed(2)}</h1>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold">
          <TrendingDown size={14} />
          <span>12% vs last month</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl p-6 bg-white shadow-soft border border-slate-100 relative">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-900 text-lg font-bold">Breakdown</h3>
          <div className="relative">
            <button 
              onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)}
              className="flex items-center gap-1 text-primary text-sm font-semibold hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
            >
              {selectedMonth} <ChevronDown size={16} className={isMonthDropdownOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
            </button>
            {isMonthDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-40 max-h-60 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50">
                {months.map(opt => (
                  <button 
                    key={opt} 
                    onClick={() => { setSelectedMonth(opt); setIsMonthDropdownOpen(false); }} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 flex justify-between items-center"
                  >
                    <span className={selectedMonth === opt ? 'font-bold text-primary' : 'font-medium text-slate-700'}>{opt}</span>
                    {selectedMonth === opt && <Check size={16} className="text-primary" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {isMonthDropdownOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsMonthDropdownOpen(false)} />
        )}

        <div className="flex flex-col items-center py-2 relative z-10">
          <div className="relative size-44 rounded-full flex items-center justify-center transition-all duration-500" style={{ background: conicGradient }}>
            <div className="absolute inset-6 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
              <span className="text-2xl font-bold text-slate-800">
                {sortedCategories.length > 0 ? `${Math.round(sortedCategories[0].percentage)}%` : '0%'}
              </span>
              <span className="text-xs font-medium text-slate-500">
                {sortedCategories.length > 0 ? sortedCategories[0].category : 'No Data'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-2 relative z-10">
          {sortedCategories.slice(0, 4).map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ backgroundColor: CATEGORIES[item.category]?.hex }}></span>
              <span className="text-sm font-medium text-slate-600 truncate">{item.category}</span>
            </div>
          ))}
          {sortedCategories.length === 0 && (
            <div className="col-span-2 text-center text-sm text-slate-400 py-2">No expenses this month</div>
          )}
        </div>
      </div>

      <button 
        onClick={onImport}
        className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-14 bg-primary text-white shadow-lg shadow-primary/30 transition-all active:scale-[0.98] hover:shadow-primary/40"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-full bg-white/20 p-1">
            <ImageIcon size={20} />
          </div>
          <span className="text-[17px] font-bold tracking-wide">Import Screenshot</span>
        </div>
      </button>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <p className="text-slate-900 text-lg font-bold">Recent Expenses</p>
          <button 
            onClick={onSeeAll}
            className="flex items-center gap-0.5 text-sm font-bold text-primary hover:bg-primary/5 px-2 py-1 rounded-lg transition-colors"
          >
            See All <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {expenses.slice(0, 3).map((item, idx) => {
            const Icon = ICON_MAP[item.icon] || Coffee;
            const catMeta = CATEGORIES[item.category];
            return (
              <div key={idx} onClick={() => onExpenseClick(item)} className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100 cursor-pointer active:bg-slate-50 transition-colors">
                <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${catMeta?.bg} ${catMeta?.color}`}>
                  <Icon size={24} />
                </div>
                <div className="flex flex-1 flex-col justify-center">
                  <p className="text-slate-900 text-base font-bold leading-tight">{item.merchant}</p>
                  <p className="text-slate-500 text-xs font-medium">{item.date}</p>
                </div>
                <p className="text-slate-900 text-base font-bold">-${item.amount.toFixed(2)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
