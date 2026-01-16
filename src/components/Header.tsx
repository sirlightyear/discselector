import { User } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { PageType } from '../App';

interface HeaderProps {
  currentPage?: PageType;
}

const PAGE_NAMES: Record<PageType, string> = {
  calculator: 'Beregner',
  collection: 'Samling',
  bags: 'Bags',
  courses: 'Baner',
  wishlist: 'Ønskeliste',
  settings: 'Indstillinger',
  links: 'Links',
  'my-bag': 'Min Bag',
  'bag-builder': 'Bag Builder',
};

export function Header({ currentPage }: HeaderProps) {
  const { user } = useUser();

  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-3 px-4 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/caddy.png" alt="Disc Caddy" className="w-10 h-10" />
            <h1 className="text-xl md:text-2xl font-bold">
              <span className="hidden md:inline">Disc Caddy</span>
              <span className="md:hidden">
                Disc Caddy{currentPage ? ` - ${PAGE_NAMES[currentPage]}` : ''}
              </span>
            </h1>
          </div>
          {user && (
            <div className="flex items-center gap-2">
              {user.profile_photo_url ? (
                <img
                  src={user.profile_photo_url}
                  alt={user.initialer || 'Profil'}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : user.initialer ? (
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-md">
                  {user.initialer}
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center border-2 border-white shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
