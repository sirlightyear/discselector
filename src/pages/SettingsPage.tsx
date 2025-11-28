import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Moon, Sun, LogOut } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { UserSettings, UserSettingsInsert } from '../lib/database.types';
import { PageType } from '../App';

const PAGE_OPTIONS: { value: PageType; label: string }[] = [
  { value: 'calculator', label: 'Beregner' },
  { value: 'collection', label: 'Samling' },
  { value: 'bags', label: 'Bags' },
  { value: 'courses', label: 'Baner' },
  { value: 'wishlist', label: 'Ønskeliste' },
  { value: 'links', label: 'Links' },
  { value: 'settings', label: 'Indstillinger' },
];

export function SettingsPage() {
  const { user, logout } = useUser();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [username, setUsername] = useState('');
  const [initials, setInitials] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [handPreference, setHandPreference] = useState<'R' | 'L' | ''>('');
  const [throwTypePreference, setThrowTypePreference] = useState<'BH' | 'FH' | 'begge' | ''>('');
  const [favoritePages, setFavoritePages] = useState<PageType[]>([]);
  const [startupPage, setStartupPage] = useState<PageType>('calculator');
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadSettings();
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('users')
        .select('user_id, initialer')
        .eq('user_id', user.user_id)
        .single();

      if (error) throw error;

      if (data) {
        setUsername(data.user_id);
        setInitials(data.initialer || '');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadSettings = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.user_id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings(data);
        setDarkMode(data.dark_mode);
        setHandPreference((data.hand_preference as 'R' | 'L') || '');
        setThrowTypePreference((data.throw_type_preference as 'BH' | 'FH' | 'begge') || '');
        setFavoritePages(Array.isArray(data.favorite_pages) ? data.favorite_pages as PageType[] : []);
        setStartupPage((data.startup_page as PageType) || 'calculator');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('users')
        .update({ initialer: initials.trim() || null })
        .eq('user_id', user.user_id);

      if (error) throw error;

      setSaveMessage('Profil gemt!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveMessage('Fejl ved gemning');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      const settingsData: UserSettingsInsert = {
        user_id: user.user_id,
        dark_mode: darkMode,
        hand_preference: handPreference || null,
        throw_type_preference: throwTypePreference || null,
        favorite_pages: favoritePages,
        startup_page: startupPage
      };

      if (settings) {
        const { error } = await supabase
          .from('user_settings')
          .update(settingsData)
          .eq('user_id', user.user_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_settings')
          .insert(settingsData);

        if (error) throw error;
      }

      await loadSettings();
      setSaveMessage('Indstillinger gemt!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Fejl ved gemning');
      setTimeout(() => setSaveMessage(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-200 via-purple-200 to-pink-200 flex items-center justify-center">
        <div className="text-slate-600">Indlæser...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-200 via-purple-200 to-pink-200">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Indstillinger</h1>
              <p className="text-sm text-slate-600">
                Administrer dine præferencer
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Profil</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Brugernavn
              </label>
              <input
                type="text"
                value={username}
                disabled
                className="w-full px-4 py-2 rounded-lg border border-slate-300 bg-slate-50 text-slate-600 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">
                Brugernavn kan ikke ændres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Initialer
              </label>
              <input
                type="text"
                value={initials}
                onChange={(e) => setInitials(e.target.value)}
                maxLength={5}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
                placeholder="f.eks. JD"
              />
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Gem profil
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Præferencer</h2>

          <div className="space-y-6">
            <div>
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon className="w-5 h-5 text-slate-700" /> : <Sun className="w-5 h-5 text-slate-700" />}
                  <div>
                    <div className="font-medium text-slate-800">Dark Mode</div>
                    <div className="text-sm text-slate-600">
                      Bedre læsbarhed i sollys og lavere batteriforbrug
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </div>
              </label>
              <p className="text-xs text-slate-500 mt-2 ml-8">
                Note: Dark mode er ikke implementeret endnu
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Hånd præference
              </label>
              <select
                value={handPreference}
                onChange={(e) => setHandPreference(e.target.value as 'R' | 'L' | '')}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none bg-white"
              >
                <option value="">Ikke valgt</option>
                <option value="R">Højrehåndet</option>
                <option value="L">Venstrehåndet</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Bruges som standard i beregneren
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Kaste type præference
              </label>
              <select
                value={throwTypePreference}
                onChange={(e) => setThrowTypePreference(e.target.value as 'BH' | 'FH' | 'begge' | '')}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none bg-white"
              >
                <option value="">Ikke valgt</option>
                <option value="BH">Kun baghånd</option>
                <option value="FH">Kun forhånd</option>
                <option value="begge">Begge</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Bruges som standard i beregneren
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Opstartsside
              </label>
              <select
                value={startupPage}
                onChange={(e) => setStartupPage(e.target.value as PageType)}
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none bg-white"
              >
                {PAGE_OPTIONS.map(page => (
                  <option key={page.value} value={page.value}>{page.label}</option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Hvilken side der skal vises når du logger ind
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Favorit sider i mobil menu (vælg 2)
              </label>
              <div className="space-y-2">
                {PAGE_OPTIONS.map(page => (
                  <label key={page.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={favoritePages.includes(page.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (favoritePages.length < 2) {
                            setFavoritePages([...favoritePages, page.value]);
                          }
                        } else {
                          setFavoritePages(favoritePages.filter(p => p !== page.value));
                        }
                      }}
                      disabled={!favoritePages.includes(page.value) && favoritePages.length >= 2}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                    />
                    <span className="text-sm text-slate-700">{page.label}</span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                De valgte sider vises direkte i mobil menuen (alle sider er stadig tilgængelige i burger menuen)
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Gem indstillinger
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Konto</h2>
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Log ud
          </button>
        </div>

        {saveMessage && (
          <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-lg shadow-lg font-medium ${
            saveMessage.includes('Fejl')
              ? 'bg-red-600 text-white'
              : 'bg-green-600 text-white'
          }`}>
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
}
