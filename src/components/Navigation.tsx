import { useState } from 'react';
import { Calculator, Package, Briefcase, Map, Heart, Settings, Menu, X, Link } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { PageType } from '../App';

interface NavigationProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  favoritePages?: PageType[];
}

export function Navigation({ currentPage, onNavigate, favoritePages = [] }: NavigationProps) {
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'calculator' as PageType, label: 'Beregner', icon: Calculator },
    { id: 'collection' as PageType, label: 'Samling', icon: Package },
    { id: 'bags' as PageType, label: 'Bags', icon: Briefcase },
    { id: 'courses' as PageType, label: 'Baner', icon: Map },
    { id: 'wishlist' as PageType, label: 'Ønskeliste', icon: Heart },
    { id: 'links' as PageType, label: 'Links', icon: Link },
    { id: 'settings' as PageType, label: 'Indstillinger', icon: Settings },
  ];

  const handleNavigate = (page: PageType) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <div className="hidden md:flex gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  currentPage === item.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="md:hidden flex items-center gap-3 w-full">
            {favoritePages.length === 2 && (
              <div className="flex gap-2 flex-1">
                {favoritePages.map((pageId) => {
                  const item = navItems.find(n => n.id === pageId);
                  if (!item) return null;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigate(item.id)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                        currentPage === item.id
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-700 hover:text-slate-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => handleNavigate('settings')}
                className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors px-3 py-1 rounded-lg hover:bg-slate-100"
                title="Gå til indstillinger"
              >
                {user.initialer || user.user_id}
              </button>
            )}
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.id)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-colors ${
                    currentPage === item.id
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
