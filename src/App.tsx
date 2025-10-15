import { useState } from 'react';
import { UserProvider, useUser } from './contexts/UserContext';
import { LoginPage } from './pages/LoginPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { MyBagPage } from './pages/MyBagPage';
import { Navigation } from './components/Navigation';

function AppContent() {
  const { user, isLoading } = useUser();
  const [currentPage, setCurrentPage] = useState<'calculator' | 'bag'>('calculator');

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      {currentPage === 'calculator' ? <CalculatorPage /> : <MyBagPage />}
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
