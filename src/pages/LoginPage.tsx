import { useState } from 'react';
import { User, LogIn } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export function LoginPage() {
  const [userId, setUserId] = useState('');
  const [initialer, setInitialer] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!userId.trim()) {
      setError('Indtast venligst et bruger-ID');
      return;
    }

    if (initialer && initialer.length > 5) {
      setError('Initialer må max være 5 tegn');
      return;
    }

    setIsLoading(true);
    try {
      await login(userId.trim(), initialer.trim() || undefined);
    } catch (err) {
      setError('Kunne ikke logge ind. Prøv igen.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">
            Disc Caddy
          </h1>
          <p className="text-slate-600 text-center mb-8">
            Indtast dit bruger-ID for at komme i gang
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Bruger-ID *
              </label>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none transition-all"
                placeholder="f.eks. anders123"
                disabled={isLoading}
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="initialer"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Initialer (valgfrit)
              </label>
              <input
                type="text"
                id="initialer"
                value={initialer}
                onChange={(e) => setInitialer(e.target.value)}
                maxLength={5}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none transition-all"
                placeholder="f.eks. ASM"
                disabled={isLoading}
              />
              <p className="text-xs text-slate-500 mt-1">Max 5 tegn</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-slate-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              {isLoading ? 'Logger ind...' : 'Log ind'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600 text-center">
              Ingen kodeord krævet - kun dine initialer. Dit bruger-ID oprettes automatisk hvis det ikke findes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
