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
};

export function Header({ currentPage }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-3 px-4 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/caddy.png" alt="Disc Caddy" className="w-10 h-10" />
          <h1 className="text-xl md:text-2xl font-bold">
            <span className="hidden md:inline">Disc Caddy</span>
            <span className="md:hidden">
              Disc Caddy{currentPage ? ` - ${PAGE_NAMES[currentPage]}` : ''}
            </span>
          </h1>
        </div>
      </div>
    </header>
  );
}
