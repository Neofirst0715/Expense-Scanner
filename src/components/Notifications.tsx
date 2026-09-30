import { Bell, ArrowLeft, Circle } from 'lucide-react';

interface NotificationsProps {
  onBack: () => void;
}

export default function Notifications({ onBack }: NotificationsProps) {
  const notifications = [
    {
      id: 1,
      title: 'New Feature Available',
      message: 'You can now manually add expenses from the history tab!',
      time: '2 hours ago',
      isUnread: true,
    },
    {
      id: 2,
      title: 'Monthly Report Ready',
      message: 'Your expense report for last month is ready to view.',
      time: '1 day ago',
      isUnread: true,
    },
    {
      id: 3,
      title: 'Unusual Spending Detected',
      message: 'You spent 50% more on Transport this week compared to last week.',
      time: '3 days ago',
      isUnread: false,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
        <div className="h-[50px] bg-white" />
        <header className="flex items-center px-4 py-3 z-30 bg-white border-b border-gray-100 h-[60px]">
        <button 
          onClick={onBack}
          className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-slate-600"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-bold tracking-tight ml-2">Notifications</h1>
      </header>

      <main className="flex-1 flex flex-col overflow-y-auto p-4 gap-3">
        {notifications.map(notification => (
          <div 
            key={notification.id} 
            className={`relative flex items-start gap-4 p-4 rounded-2xl border ${notification.isUnread ? 'bg-white border-primary/20 shadow-sm' : 'bg-slate-50 border-slate-100'}`}
          >
            <div className={`flex shrink-0 size-10 items-center justify-center rounded-full ${notification.isUnread ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-500'}`}>
              <Bell size={20} />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-base font-bold leading-tight ${notification.isUnread ? 'text-slate-900' : 'text-slate-700'}`}>
                  {notification.title}
                </h3>
                {notification.isUnread && (
                  <Circle size={8} className="text-primary fill-primary mt-1 shrink-0" />
                )}
              </div>
              <p className="text-slate-500 text-sm leading-snug mb-2">
                {notification.message}
              </p>
              <span className="text-xs font-medium text-slate-400">
                {notification.time}
              </span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
