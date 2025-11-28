import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Disc as DiscIcon, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Disc } from '../lib/database.types';
import { getStabilityColor, getStabilityCategory } from '../utils/stability';

export function SharedCollectionPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [ownerName, setOwnerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadSharedCollection();
    } else {
      setError('Intet delingslink fundet');
      setIsLoading(false);
    }
  }, [token]);

  const loadSharedCollection = async () => {
    try {
      setIsLoading(true);

      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('user_id')
        .eq('share_token', token)
        .eq('share_collection', true)
        .maybeSingle();

      if (settingsError) throw settingsError;
      if (!settings) {
        setError('Samling ikke fundet eller ikke delt');
        setIsLoading(false);
        return;
      }

      const { data: user } = await supabase
        .from('users')
        .select('initialer')
        .eq('user_id', settings.user_id)
        .maybeSingle();

      setOwnerName(user?.initialer || 'Bruger');

      const { data: discsData, error: discsError } = await supabase
        .from('discs')
        .select('*')
        .eq('user_id', settings.user_id)
        .order('name');

      if (discsError) throw discsError;

      setDiscs(discsData || []);
    } catch (error) {
      console.error('Error loading shared collection:', error);
      setError('Kunne ikke indlæse samling');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-200 via-purple-200 to-pink-200 flex items-center justify-center">
        <div className="text-slate-600">Indlæser...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-200 via-purple-200 to-pink-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Kunne ikke vise samling
          </h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-200 via-purple-200 to-pink-200">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <DiscIcon className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">
              {ownerName}s Disc Samling
            </h1>
          </div>
          <div className="text-sm text-slate-500">
            {discs.length} discs i samlingen (Kun visning)
          </div>
        </div>

        {discs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <DiscIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Ingen discs endnu
            </h2>
            <p className="text-slate-600">
              Denne samling er tom
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {discs.map((disc) => (
              <div
                key={disc.disc_id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <div className="p-4 flex items-center gap-4">
                  {disc.photo_url ? (
                    <div className="w-20 h-20 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden">
                      <img
                        src={disc.photo_url}
                        alt={disc.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : disc.color ? (
                    <div
                      className="w-12 h-12 rounded-full border-2 border-slate-300 flex-shrink-0"
                      style={{ backgroundColor: disc.color }}
                    />
                  ) : null}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-800">
                        {disc.name}
                      </h3>
                      {disc.is_glow && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                          Glow
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Flight:</span>
                        <span>
                          {disc.personal_speed ?? disc.speed} |{' '}
                          {disc.personal_glide ?? disc.glide} |{' '}
                          {disc.personal_turn ?? disc.turn} |{' '}
                          {disc.personal_fade ?? disc.fade}
                        </span>
                      </div>
                      {disc.disc_type && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Type:</span>
                          <span>{disc.disc_type}</span>
                        </div>
                      )}
                      {disc.manufacturer && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Fabrikant:</span>
                          <span>{disc.manufacturer}</span>
                        </div>
                      )}
                      {disc.plastic && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Plastic:</span>
                          <span>{disc.plastic}</span>
                        </div>
                      )}
                      {disc.weight && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Vægt:</span>
                          <span>{disc.weight}g</span>
                        </div>
                      )}
                    </div>

                    {disc.note && (
                      <div className="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded">
                        {disc.note}
                      </div>
                    )}
                  </div>

                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: getStabilityColor(
                        disc.personal_turn ?? disc.turn,
                        disc.personal_fade ?? disc.fade
                      ),
                      color: 'white',
                    }}
                  >
                    {getStabilityCategory(
                      disc.personal_turn ?? disc.turn,
                      disc.personal_fade ?? disc.fade
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
