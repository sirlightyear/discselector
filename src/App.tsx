import { useState, useEffect } from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import { LoginPage } from './pages/LoginPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { CollectionPage } from './pages/CollectionPage';
import { BagsPage } from './pages/BagsPage';
import { CoursesPage } from './pages/CoursesPage';
import { WishlistPage } from './pages/WishlistPage';
import { SettingsPage } from './pages/SettingsPage';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { supabase } from './lib/supabase';

export type PageType = 'calculator' | 'collection' | 'bags' | 'courses' | 'wishlist' | 'settings';

function AppContent() {
  const { user, isLoading } = useUser();
  const [currentPage, setCurrentPage] = useState<PageType>('calculator');
  const [favoritePages, setFavoritePages] = useState<PageType[]>([]);

  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_settings')
        .select('startup_page, favorite_pages')
        .eq('user_id', user.user_id)
        .maybeSingle();

      if (data) {
        if (data.startup_page) {
          setCurrentPage(data.startup_page as PageType);
        }
        if (Array.isArray(data.favorite_pages)) {
          setFavoritePages(data.favorite_pages as PageType[]);
        }
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-slate-600 text-lg">Indlæser...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const handleNavigateToBag = (_bagId: number) => {
    setCurrentPage('bags');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <Header currentPage={currentPage} />
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} favoritePages={favoritePages} />
      {currentPage === 'calculator' && <CalculatorPage />}
      {currentPage === 'collection' && <CollectionPage onNavigateToBag={handleNavigateToBag} />}
      {currentPage === 'bags' && <BagsPage />}
      {currentPage === 'courses' && <CoursesPage />}
      {currentPage === 'wishlist' && <WishlistPage />}
      {currentPage === 'settings' && <SettingsPage />}
    </div>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
