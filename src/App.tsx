import { useState } from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import { LoginPage } from './pages/LoginPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { CollectionPage } from './pages/CollectionPage';
import { BagsPage } from './pages/BagsPage';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';

export type PageType = 'calculator' | 'collection' | 'bags' | 'courses' | 'wishlist' | 'settings';

function AppContent() {
  const { user, isLoading } = useUser();
  const [currentPage, setCurrentPage] = useState<PageType>('calculator');

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
      <Header />
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'calculator' && <CalculatorPage />}
      {currentPage === 'collection' && <CollectionPage onNavigateToBag={handleNavigateToBag} />}
      {currentPage === 'bags' && <BagsPage />}
      {currentPage === 'courses' && <div className="p-8 text-center text-slate-600">Baner kommer snart...</div>}
      {currentPage === 'wishlist' && <div className="p-8 text-center text-slate-600">Ønskeliste kommer snart...</div>}
      {currentPage === 'settings' && <div className="p-8 text-center text-slate-600">Indstillinger kommer snart...</div>}
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
