import { Calculator, Package, LogOut } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

interface NavigationProps {
  currentPage: 'calculator' | 'bag';
  onNavigate: (page: 'calculator' | 'bag') => void;
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user, logout } = useUser();

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex gap-1">
            <button
              onClick={() => onNavigate('calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'calculator'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Calculator className="w-5 h-5" />
              Beregner
            </button>
            <button
              onClick={() => onNavigate('bag')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                currentPage === 'bag'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Package className="w-5 h-5" />
              Min Bag
            </button>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <div className="text-sm text-slate-600">
                  {user.initialer || user.user_id}
                </div>
                <button
                  onClick={logout}
                  className="flex items-center gap-2 text-slate-700 hover:text-red-600 transition-colors"
                  title="Log ud"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
