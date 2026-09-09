import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, List, PlusCircle, Search, Calendar, CheckCircle, Bookmark } from 'lucide-react';

const navItems = [
  { path: '/intelligence', label: 'List', icon: List },
  { path: '/intelligence/new', label: 'New Record', icon: PlusCircle },
  { path: '/intelligence/search', label: 'Search', icon: Search },
  { path: '/intelligence/schedule', label: 'Schedule', icon: Calendar },
  { path: '/intelligence/visited', label: 'Visited', icon: CheckCircle },
  { path: '/intelligence/booked', label: 'Booked', icon: Bookmark },
];

export default function IntelligenceLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/intelligence') return location.pathname === '/intelligence';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-xl flex items-center justify-center
                       hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Intelligence</h1>
        </div>

        {/* Desktop tab navigation */}
        <nav className="hidden md:flex max-w-3xl mx-auto px-4 gap-1">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg
                           transition-colors relative
                           ${active
                             ? 'text-primary'
                             : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                           }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-bottom-nav animate-page">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20
                      bg-card/90 backdrop-blur-lg border-t border-border
                      safe-area-inset-bottom">
        <div className="flex items-center justify-start overflow-x-auto hide-scrollbar h-16 px-2 gap-4">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl
                           transition-all duration-200
                           ${active
                             ? 'text-primary'
                             : 'text-muted-foreground'
                           }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                                ${active ? 'bg-primary/10' : ''}`}>
                  <item.icon className={`w-5 h-5 ${active ? 'text-primary' : ''}`} />
                </div>
                <span className={`text-[10px] font-semibold ${active ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
