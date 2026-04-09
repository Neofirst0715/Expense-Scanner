import { Check, X, LogOut, Trash2, AlertCircle, TriangleAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanAnother: () => void;
}

export function SuccessModal({ isOpen, onClose, onScanAnother }: SuccessModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0d141b]/60 backdrop-blur-[1px]" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[340px] bg-white rounded-2xl shadow-2xl flex flex-col items-center p-6 md:p-8 z-10"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check size={40} strokeWidth={3} />
            </div>
            <div className="mb-8 w-full text-center">
              <h2 className="text-[#0d141b] tracking-tight text-2xl font-bold leading-tight mb-2">
                Expense Saved!
              </h2>
              <p className="text-slate-500 text-sm font-normal leading-relaxed">
                Your transaction has been recorded.
              </p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <button 
                onClick={onScanAnother}
                className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-primary h-12 px-5 text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                <span className="text-base font-bold leading-normal tracking-[0.015em]">Scan Another Receipt</span>
              </button>
              <button 
                onClick={onClose}
                className="flex w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-transparent text-slate-500 hover:text-[#0d141b] transition-colors text-sm font-bold"
              >
                Done for Now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function LogoutModal({ isOpen, onClose, onLogout }: LogoutModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[320px] bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <div className="flex flex-col p-6 items-center text-center">
              <div className="mb-4 text-red-500 bg-red-50 p-3 rounded-full">
                <LogOut size={32} />
              </div>
              <h3 className="text-slate-900 text-lg font-bold leading-tight mb-2">Log Out?</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed font-normal">
                Are you sure you want to log out of your account? You will need to sign in again to access your expenses.
              </p>
              <div className="flex w-full gap-3 mt-8">
                <button 
                  onClick={onClose}
                  className="flex-1 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <span className="text-slate-900 text-base font-semibold">Cancel</span>
                </button>
                <button 
                  onClick={onLogout}
                  className="flex-1 h-12 flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors shadow-sm"
                >
                  <span className="text-white text-base font-semibold">Log Out</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface DiscardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDiscard: () => void;
}

export function DiscardModal({ isOpen, onClose, onDiscard }: DiscardModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0d141b]/60 backdrop-blur-[1px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[340px] bg-white rounded-2xl shadow-2xl flex flex-col items-center p-6 md:p-8 z-10"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500">
              <TriangleAlert size={36} strokeWidth={2.5} />
            </div>
            <div className="mb-8 w-full text-center">
              <h2 className="text-[#0d141b] tracking-tight text-2xl font-bold leading-tight mb-2">
                Discard Receipt?
              </h2>
              <p className="text-slate-500 text-sm font-normal leading-relaxed">
                This receipt data will not be saved. You can scan it again at any time.
              </p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={onClose}
                className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 h-12 px-5 transition-all active:scale-[0.98]"
              >
                <span className="text-slate-900 text-base font-bold leading-normal">Keep Editing</span>
              </button>
              <button
                onClick={onDiscard}
                className="flex w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-transparent text-red-500 hover:text-red-700 transition-colors text-sm font-bold active:scale-[0.98]"
              >
                Discard
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface DuplicateModalProps {
  isOpen: boolean;
  merchant: string;
  date: string;
  amount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function DuplicateModal({ isOpen, merchant, date, amount, onClose, onConfirm }: DuplicateModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0d141b]/60 backdrop-blur-[1px]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-[340px] bg-white rounded-2xl shadow-2xl flex flex-col items-center p-6 md:p-8 z-10"
          >
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-500">
              <AlertCircle size={36} strokeWidth={2.5} />
            </div>
            <div className="mb-8 w-full text-center">
              <h2 className="text-[#0d141b] tracking-tight text-2xl font-bold leading-tight mb-2">
                Duplicate Record
              </h2>
              <p className="text-slate-500 text-sm font-normal leading-relaxed">
                A payment of <span className="font-semibold text-slate-700">${amount.toFixed(2)}</span> at{' '}
                <span className="font-semibold text-slate-700">{merchant}</span> on{' '}
                <span className="font-semibold text-slate-700">{date}</span> already exists. Add it anyway?
              </p>
            </div>
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className="flex w-full cursor-pointer items-center justify-center rounded-lg bg-primary h-12 px-5 text-white shadow-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
              >
                <span className="text-base font-bold leading-normal">Add Anyway</span>
              </button>
              <button
                onClick={onClose}
                className="flex w-full cursor-pointer items-center justify-center rounded-lg h-10 px-4 bg-transparent text-slate-500 hover:text-[#0d141b] transition-colors text-sm font-bold active:scale-[0.98]"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export function DeleteModal({ isOpen, onClose, onDelete }: DeleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" 
            onClick={onClose}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-[320px] bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
          >
            <div className="flex flex-col p-6 items-center text-center">
              <div className="mb-4 text-red-500 bg-red-50 p-3 rounded-full">
                <Trash2 size={32} />
              </div>
              <h3 className="text-slate-900 text-lg font-bold leading-tight mb-2">Delete Expense?</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed font-normal">
                This receipt and its extracted data will be removed.
              </p>
              <div className="flex w-full gap-3 mt-8">
                <button 
                  onClick={onClose}
                  className="flex-1 h-12 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  <span className="text-slate-900 text-base font-semibold">Cancel</span>
                </button>
                <button 
                  onClick={onDelete}
                  className="flex-1 h-12 flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 transition-colors shadow-sm"
                >
                  <span className="text-white text-base font-semibold">Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
