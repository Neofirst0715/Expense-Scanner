import { ShieldCheck, Table, LogOut, ChevronRight, Mail, Phone } from 'lucide-react';
import { IMAGES } from '../constants';

interface SettingsProps {
  onExport: () => void;
  onLogout: () => void;
}

export default function Settings({ onExport, onLogout }: SettingsProps) {
  return (
    <div className="flex flex-col h-full bg-background-light">
      <main className="flex-1 px-4 pt-14 space-y-8 pb-24 overflow-y-auto no-scrollbar">
        {/* Profile Section */}
        <section className="flex flex-col items-center justify-center">
          <div className="relative mb-3" >
            <img src={IMAGES.AVATAR} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-sm" referrerPolicy="no-referrer" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Alex</h2>
          <p className="text-sm text-slate-500">alex@example.com</p>
        </section>

        {/* Account Connections */}
        <section>
          <h2 className="px-1 mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">Account</h2>
          <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-500">
                  <Mail size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">Google (Gmail)</span>
                  <span className="text-xs text-slate-500">alex@example.com</span>
                </div>
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">Connected</span>
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500">
                  <Phone size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-slate-900">Phone Number</span>
                  <span className="text-xs text-slate-500">Not connected</span>
                </div>
              </div>
              <button className="text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-colors px-3 py-1.5 rounded-md">
                Link
              </button>
            </div>
          </div>
        </section>

        <section>
          <h2 className="px-1 mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">Storage</h2>
          <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between p-4">
              <span className="text-base font-medium text-slate-900">Keep screenshots on device</span>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-[51px] h-[31px] bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
          </div>
          <p className="mt-2 px-1 text-xs text-slate-500 leading-relaxed">
            Original screenshots will be saved to your main photo gallery so you have a backup outside the app.
          </p>
        </section>

        <section>
          <h2 className="px-1 mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">Privacy & Security</h2>
          <div className="relative overflow-hidden bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="text-base font-medium text-slate-900">Allow Analytics</span>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-[51px] h-[31px] bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[27px] after:w-[27px] after:transition-all peer-checked:bg-primary shadow-inner"></div>
              </label>
            </div>
            <div className="p-4 bg-primary/5 flex gap-3">
              <ShieldCheck className="text-primary shrink-0" size={20} />
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-slate-900">Secure Processing</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  We process your receipts securely. No humans see your screenshots—only our automated scanner reads the numbers.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="px-1 mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">Your Data</h2>
          <div className="overflow-hidden bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
            <button 
              onClick={onExport}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-primary">
                  <Table size={18} />
                </div>
                <span className="text-base font-medium text-slate-900">Export to CSV</span>
              </div>
              <ChevronRight className="text-slate-400 group-hover:text-primary transition-colors" size={20} />
            </button>
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600">
                  <LogOut size={18} />
                </div>
                <span className="text-base font-medium text-red-600">Log Out</span>
              </div>
            </button>
          </div>
        </section>

        <div className="pt-4 pb-8 text-center">
          <p className="text-xs font-medium text-slate-400">Version 1.0.4</p>
        </div>
      </main>
    </div>
  );
}
