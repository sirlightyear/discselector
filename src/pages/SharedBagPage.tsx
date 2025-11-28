import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Disc, Bag } from '../lib/database.types';
import { BagCoverageChart } from '../components/BagCoverageChart';
import { getStabilityColor, getStabilityCategory } from '../utils/stability';

export function SharedBagPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [bag, setBag] = useState<Bag | null>(null);
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadSharedBag();
    } else {
      setError('Intet delingslink fundet');
      setIsLoading(false);
    }
  }, [token]);

  const loadSharedBag = async () => {
    try {
      setIsLoading(true);

      const { data: bagData, error: bagError } = await supabase
        .from('bags')
        .select('*')
        .eq('share_token', token)
        .eq('is_public', true)
        .maybeSingle();

      if (bagError) throw bagError;
      if (!bagData) {
        setError('Bag ikke fundet eller ikke offentlig');
        setIsLoading(false);
        return;
      }

      setBag(bagData);

      const { data: bagDiscData, error: bagDiscsError } = await supabase
        .from('bag_discs')
        .select('disc_id')
        .eq('bag_id', bagData.bag_id)
        .order('position');

      if (bagDiscsError) throw bagDiscsError;

      const discIds = bagDiscData?.map(bd => bd.disc_id) || [];

      if (discIds.length > 0) {
        const { data: discsData, error: discsError } = await supabase
          .from('discs')
          .select('*')
          .in('disc_id', discIds);

        if (discsError) throw discsError;

        const sortedDiscs = discIds
          .map(id => discsData?.find(d => d.disc_id === id))
          .filter(Boolean) as Disc[];

        setDiscs(sortedDiscs);
      }
    } catch (error) {
      console.error('Error loading shared bag:', error);
      setError('Kunne ikke indlæse bag');
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

  if (error || !bag) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-200 via-purple-200 to-pink-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Kunne ikke vise bag
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
            <Package className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">{bag.name}</h1>
          </div>
          {bag.description && (
            <p className="text-slate-600 mb-2">{bag.description}</p>
          )}
          <div className="text-sm text-slate-500">
            {discs.length} discs i baggen (Kun visning)
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Discs i baggen
              </h2>
              {discs.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  Ingen discs i denne bag
                </div>
              ) : (
                <div className="space-y-2">
                  {discs.map((disc) => (
                    <div
                      key={disc.disc_id}
                      className="flex items-center gap-3 border border-slate-200 rounded-lg p-3"
                    >
                      {disc.photo_url ? (
                        <div className="w-16 h-16 flex-shrink-0 bg-slate-100 rounded">
                          <img
                            src={disc.photo_url}
                            alt={disc.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ) : disc.color ? (
                        <div
                          className="w-8 h-8 rounded-full border-2 border-slate-300 flex-shrink-0"
                          style={{ backgroundColor: disc.color }}
                        />
                      ) : null}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-800">
                            {disc.name}
                          </span>
                          {disc.is_glow && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                              Glow
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">
                          {disc.personal_speed ?? disc.speed} |{' '}
                          {disc.personal_glide ?? disc.glide} |{' '}
                          {disc.personal_turn ?? disc.turn} |{' '}
                          {disc.personal_fade ?? disc.fade}
                          {disc.disc_type && (
                            <span className="ml-2 text-slate-500">• {disc.disc_type}</span>
                          )}
                        </div>
                        {disc.note && (
                          <div className="text-xs text-slate-500 mt-1 truncate">
                            {disc.note}
                          </div>
                        )}
                      </div>
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0"
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
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                Bag Coverage
              </h2>
              <BagCoverageChart discs={discs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
