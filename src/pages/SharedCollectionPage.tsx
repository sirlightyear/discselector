import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Disc as DiscIcon, AlertCircle, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Disc } from '../lib/database.types';
import { FilterableCoverageChart } from '../components/FilterableCoverageChart';
import { getStabilityColor, getStabilityCategory } from '../utils/stability';

export function SharedCollectionPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [ownerName, setOwnerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeedRanges, setSelectedSpeedRanges] = useState<string[]>([]);
  const [selectedStabilityCategories, setSelectedStabilityCategories] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);

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

  const getSpeed = (disc: Disc) => disc.personal_speed ?? disc.speed;
  const getTurn = (disc: Disc) => disc.personal_turn ?? disc.turn;
  const getFade = (disc: Disc) => disc.personal_fade ?? disc.fade;

  const getStabilityScore = (disc: Disc) => {
    return getTurn(disc) + getFade(disc);
  };

  const getSpeedRange = (speed: number) => {
    if (speed >= 1 && speed <= 3) return '1-3';
    if (speed >= 4 && speed <= 6) return '4-6';
    if (speed >= 7 && speed <= 9) return '7-9';
    if (speed >= 10 && speed <= 12) return '10-12';
    if (speed >= 13 && speed <= 14) return '13-14';
    return '';
  };

  const getStabilityCategoryName = (score: number) => {
    if (score < -2) return 'Meget understabil';
    if (score >= -2 && score < -0.1) return 'Understabil';
    if (score >= -0.1 && score < 1) return 'Neutral';
    if (score >= 1 && score < 2.5) return 'Overstabil';
    return 'Meget overstabil';
  };

  const filteredDiscs = useMemo(() => {
    let filtered = discs;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = discs.filter(disc =>
        disc.name.toLowerCase().includes(query) ||
        disc.manufacturer?.toLowerCase().includes(query) ||
        disc.plastic?.toLowerCase().includes(query) ||
        disc.disc_type?.toLowerCase().includes(query) ||
        disc.note?.toLowerCase().includes(query)
      );
    }

    if (selectedSpeedRanges.length > 0) {
      filtered = filtered.filter(disc => {
        const speedRange = getSpeedRange(getSpeed(disc));
        return selectedSpeedRanges.includes(speedRange);
      });
    }

    if (selectedStabilityCategories.length > 0) {
      filtered = filtered.filter(disc => {
        const category = getStabilityCategoryName(getStabilityScore(disc));
        return selectedStabilityCategories.includes(category);
      });
    }

    if (selectedManufacturers.length > 0) {
      filtered = filtered.filter(disc => {
        const mfr = disc.manufacturer || 'Ukendt';
        return selectedManufacturers.includes(mfr);
      });
    }

    return filtered;
  }, [discs, searchQuery, selectedSpeedRanges, selectedStabilityCategories, selectedManufacturers]);

  const handleSpeedRangeClick = (range: string) => {
    setSelectedSpeedRanges(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  const handleStabilityCategoryClick = (category: string) => {
    setSelectedStabilityCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleManufacturerClick = (manufacturer: string) => {
    setSelectedManufacturers(prev =>
      prev.includes(manufacturer)
        ? prev.filter(m => m !== manufacturer)
        : [...prev, manufacturer]
    );
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
          <div className="text-sm text-slate-500 mb-4">
            {discs.length} discs i samlingen (Kun visning)
          </div>

          {discs.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Søg efter navn, producent, plastik..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
              />
            </div>
          )}
        </div>

        {discs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Samlings Oversigt</h2>
            <FilterableCoverageChart
              discs={discs}
              selectedSpeedRanges={selectedSpeedRanges}
              selectedStabilityCategories={selectedStabilityCategories}
              selectedManufacturers={selectedManufacturers}
              onSpeedRangeClick={handleSpeedRangeClick}
              onStabilityCategoryClick={handleStabilityCategoryClick}
              onManufacturerClick={handleManufacturerClick}
            />
          </div>
        )}

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
        ) : filteredDiscs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Ingen discs matcher søgningen
            </h2>
            <p className="text-slate-600 mb-6">
              Prøv at søge efter noget andet eller fjern filtre
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSpeedRanges([]);
                setSelectedStabilityCategories([]);
                setSelectedManufacturers([]);
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Ryd alle filtre
            </button>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredDiscs.map((disc) => (
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
