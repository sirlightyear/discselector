import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Edit2, Package, ShoppingBag, Search, Grid3x3, List, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { Disc, DiscInsert, Bag, UserSettings } from '../lib/database.types';
import { AddDiscModal } from '../components/AddDiscModal';
import { EditDiscModal } from '../components/EditDiscModal';
import { ShareButton } from '../components/ShareButton';
import { FilterableCoverageChart } from '../components/FilterableCoverageChart';
import { ImageModal } from '../components/ImageModal';
import { FlightPathModal } from '../components/FlightPathModal';
import MarkLostModal from '../components/MarkLostModal';
import { getStabilityColor, getStabilityCategory } from '../utils/stability';

type DiscWithBags = Disc & { bags: Bag[] };
type SortOption = 'name' | 'type' | 'newest' | 'most_used';

interface CollectionPageProps {
  onNavigateToBag?: (bagId: number) => void;
}

export function CollectionPage({ onNavigateToBag }: CollectionPageProps) {
  const { user } = useUser();
  const [discs, setDiscs] = useState<DiscWithBags[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDisc, setEditingDisc] = useState<Disc | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [selectedSpeedRanges, setSelectedSpeedRanges] = useState<string[]>([]);
  const [selectedStabilityCategories, setSelectedStabilityCategories] = useState<string[]>([]);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [selectedGlowFilter, setSelectedGlowFilter] = useState<'all' | 'glow' | 'non-glow'>('all');
  const [selectedImage, setSelectedImage] = useState<{ url: string; alt: string } | null>(null);
  const [flightPathDisc, setFlightPathDisc] = useState<Disc | null>(null);
  const [markingLostDisc, setMarkingLostDisc] = useState<Disc | null>(null);
  const [lostFilter, setLostFilter] = useState<'active' | 'lost' | 'all'>('active');

  useEffect(() => {
    if (user) {
      loadDiscs();
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.user_id)
        .maybeSingle();

      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const loadDiscs = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data: discsData, error: discsError } = await supabase
        .from('discs')
        .select('*')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false });

      if (discsError) throw discsError;

      const { data: bagDiscsData, error: bagDiscsError } = await supabase
        .from('bag_discs')
        .select(`
          disc_id,
          bags:bag_id (
            bag_id,
            name
          )
        `);

      if (bagDiscsError) throw bagDiscsError;

      const discWithBags: DiscWithBags[] = (discsData || []).map(disc => {
        const discBags = bagDiscsData
          ?.filter(bd => bd.disc_id === disc.disc_id)
          .map(bd => bd.bags as any)
          .filter(Boolean) || [];
        return { ...disc, bags: discBags };
      });

      setDiscs(discWithBags);
    } catch (error) {
      console.error('Error loading discs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDisc = async (disc: Omit<DiscInsert, 'user_id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('discs')
        .insert({ ...disc, user_id: user.user_id });

      if (error) throw error;
      await loadDiscs();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding disc:', error);
      throw error;
    }
  };

  const handleUpdateDisc = async (discId: number, updates: Partial<DiscInsert>) => {
    try {
      const { error } = await supabase
        .from('discs')
        .update(updates)
        .eq('disc_id', discId);

      if (error) throw error;
      await loadDiscs();
      setEditingDisc(null);
    } catch (error) {
      console.error('Error updating disc:', error);
      throw error;
    }
  };

  const handleDeleteDisc = async (discId: number) => {
    if (!confirm('Er du sikker på at du vil slette denne disc?')) return;

    try {
      const { error } = await supabase
        .from('discs')
        .delete()
        .eq('disc_id', discId);

      if (error) throw error;
      await loadDiscs();
    } catch (error) {
      console.error('Error deleting disc:', error);
    }
  };

  const handleMarkAsLost = async (lostDate: string, lostLocation: string) => {
    if (!markingLostDisc) return;

    try {
      const { error } = await supabase
        .from('discs')
        .update({
          is_lost: true,
          lost_date: lostDate,
          lost_location: lostLocation
        })
        .eq('disc_id', markingLostDisc.disc_id);

      if (error) throw error;
      await loadDiscs();
      setMarkingLostDisc(null);
    } catch (error) {
      console.error('Error marking disc as lost:', error);
    }
  };

  const handleMarkAsFound = async (discId: number) => {
    if (!confirm('Marker denne disc som fundet igen?')) return;

    try {
      const { error } = await supabase
        .from('discs')
        .update({
          is_lost: false,
          lost_date: null,
          lost_location: null
        })
        .eq('disc_id', discId);

      if (error) throw error;
      await loadDiscs();
    } catch (error) {
      console.error('Error marking disc as found:', error);
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

  const filteredAndSortedDiscs = useMemo(() => {
    let filtered = discs;

    if (lostFilter === 'active') {
      filtered = filtered.filter(disc => !disc.is_lost);
    } else if (lostFilter === 'lost') {
      filtered = filtered.filter(disc => disc.is_lost);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(disc =>
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

    if (selectedGlowFilter === 'glow') {
      filtered = filtered.filter(disc => disc.is_glow);
    } else if (selectedGlowFilter === 'non-glow') {
      filtered = filtered.filter(disc => !disc.is_glow);
    }

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          const typeOrder = ['Putter', 'Midrange', 'Fairway Driver', 'Distance Driver'];
          const aTypeIndex = a.disc_type ? typeOrder.indexOf(a.disc_type) : 999;
          const bTypeIndex = b.disc_type ? typeOrder.indexOf(b.disc_type) : 999;
          return aTypeIndex - bTypeIndex;
        case 'most_used':
          return b.bags.length - a.bags.length;
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return sorted;
  }, [discs, searchQuery, sortBy, selectedSpeedRanges, selectedStabilityCategories, selectedManufacturers, selectedGlowFilter, lostFilter]);

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

  const handleGlowFilterClick = (filter: 'all' | 'glow' | 'non-glow') => {
    setSelectedGlowFilter(filter);
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Min Samling</h1>
                <div className="flex items-center gap-3 text-sm">
                  <p className="text-slate-600">
                    {discs.filter(d => !d.is_lost).length} aktiv{discs.filter(d => !d.is_lost).length !== 1 ? 'e' : ''} disc{discs.filter(d => !d.is_lost).length !== 1 ? 's' : ''}
                  </p>
                  {discs.filter(d => d.is_lost).length > 0 && (
                    <p className="text-orange-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {discs.filter(d => d.is_lost).length} mistet
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {user && (
                <ShareButton
                  type="collection"
                  userId={user.user_id}
                  isShared={settings?.share_collection || false}
                  shareToken={settings?.share_token}
                  onUpdate={loadSettings}
                />
              )}
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Tilføj disc
              </button>
            </div>
          </div>

          {discs.length > 0 && (
            <>
              <div className="flex gap-2 pt-4 border-t border-slate-200">
                <button
                  onClick={() => setLostFilter('active')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    lostFilter === 'active'
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Aktive
                </button>
                <button
                  onClick={() => setLostFilter('lost')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    lostFilter === 'lost'
                      ? 'bg-orange-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Mistede ({discs.filter(d => d.is_lost).length})
                </button>
                <button
                  onClick={() => setLostFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    lostFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Alle
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Søg efter navn, producent, plastik..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
                  />
                </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none bg-white"
              >
                <option value="newest">Nyeste først</option>
                <option value="name">Navn (A-Å)</option>
                <option value="type">Type</option>
                <option value="most_used">Mest brugt</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'detailed'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Detaljeret visning"
                >
                  <Grid3x3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'compact'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Kompakt visning"
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
            </>
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
              selectedGlowFilter={selectedGlowFilter}
              onSpeedRangeClick={handleSpeedRangeClick}
              onStabilityCategoryClick={handleStabilityCategoryClick}
              onManufacturerClick={handleManufacturerClick}
              onGlowFilterClick={handleGlowFilterClick}
            />
          </div>
        )}

        {discs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Ingen discs endnu
            </h2>
            <p className="text-slate-600 mb-6">
              Tilføj din første disc for at komme i gang
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tilføj disc
            </button>
          </div>
        ) : filteredAndSortedDiscs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Ingen discs matcher søgningen
            </h2>
            <p className="text-slate-600 mb-6">
              Prøv at søge efter noget andet
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Ryd søgning
            </button>
          </div>
        ) : viewMode === 'compact' ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="divide-y divide-slate-200">
              {filteredAndSortedDiscs.map((disc) => (
                <div
                  key={disc.disc_id}
                  className={`p-3 hover:bg-slate-50 transition-colors flex items-center gap-3 ${
                    disc.is_lost ? 'opacity-50 bg-slate-50' : ''
                  }`}
                >
                  {disc.color && (
                    <div
                      className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0"
                      style={{ backgroundColor: disc.color }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold text-slate-800 truncate">{disc.name}</div>
                      {disc.is_lost && (
                        <span className="text-xs font-medium text-orange-700 bg-orange-100 px-1.5 py-0.5 rounded flex-shrink-0">
                          Mistet
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {disc.disc_type && (
                        <span className="text-slate-600">{disc.disc_type}</span>
                      )}
                      {disc.is_glow && (
                        <span className="text-green-700 font-medium">Glow</span>
                      )}
                      <span className="text-slate-500">
                        {disc.personal_speed ?? disc.speed} | {disc.personal_glide ?? disc.glide} | {disc.personal_turn ?? disc.turn} | {disc.personal_fade ?? disc.fade}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => setFlightPathDisc(disc)}
                      className="text-slate-400 hover:text-teal-600 transition-colors"
                      title="Se flight path"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    {disc.is_lost ? (
                      <button
                        onClick={() => handleMarkAsFound(disc.disc_id)}
                        className="text-slate-400 hover:text-green-600 transition-colors"
                        title="Marker som fundet"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setMarkingLostDisc(disc)}
                        className="text-slate-400 hover:text-orange-600 transition-colors"
                        title="Marker som mistet"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingDisc(disc)}
                      className="text-slate-400 hover:text-blue-600 transition-colors"
                      title="Rediger"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDisc(disc.disc_id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                      title="Slet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredAndSortedDiscs.map((disc) => (
              <div
                key={disc.disc_id}
                className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 ${
                  disc.is_lost ? 'opacity-50 bg-slate-50' : ''
                }`}
              >
                <div>
                  {disc.is_lost && (
                    <div className="mb-3 p-2 bg-orange-100 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-orange-800">
                        <AlertTriangle className="w-4 h-4" />
                        <div>
                          <div className="font-semibold">Mistet</div>
                          {disc.lost_date && (
                            <div className="text-xs">
                              {new Date(disc.lost_date).toLocaleDateString('da-DK')}
                              {disc.lost_location && ` - ${disc.lost_location}`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {disc.color && (
                        <div
                          className="w-5 h-5 rounded-full border-2 border-slate-300 flex-shrink-0"
                          style={{ backgroundColor: disc.color }}
                          title={disc.visual_description || 'Disc farve'}
                        />
                      )}
                      <h3 className="text-lg font-bold text-slate-800">
                        {disc.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {disc.disc_type && (
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {disc.disc_type}
                        </span>
                      )}
                      {disc.manufacturer && (
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {disc.manufacturer.length > 15 ? disc.manufacturer.substring(0, 15) + '...' : disc.manufacturer}
                        </span>
                      )}
                      {disc.weight && (
                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {disc.weight}g
                        </span>
                      )}
                      {disc.is_glow && (
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded">
                          Glow
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-3 h-3 rounded-full ${getStabilityColor(
                            disc.personal_turn ?? disc.turn,
                            disc.personal_fade ?? disc.fade
                          )}`}
                          title="Stabilitet"
                        />
                        <span className="text-xs font-medium text-slate-600">
                          {getStabilityCategory(disc.personal_turn ?? disc.turn, disc.personal_fade ?? disc.fade)}
                        </span>
                      </div>
                    </div>
                    {disc.visual_description && (
                      <p className="text-xs text-slate-500 mb-2">
                        {disc.visual_description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFlightPathDisc(disc)}
                      className="text-slate-600 hover:text-teal-600 transition-colors"
                      title="Se flight path"
                    >
                      <TrendingUp className="w-4 h-4" />
                    </button>
                    {disc.is_lost ? (
                      <button
                        onClick={() => handleMarkAsFound(disc.disc_id)}
                        className="text-slate-600 hover:text-green-600 transition-colors"
                        title="Marker som fundet"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setMarkingLostDisc(disc)}
                        className="text-slate-600 hover:text-orange-600 transition-colors"
                        title="Marker som mistet"
                      >
                        <AlertTriangle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingDisc(disc)}
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                      title="Rediger"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDisc(disc.disc_id)}
                      className="text-slate-600 hover:text-red-600 transition-colors"
                      title="Slet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-3">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-slate-50 rounded px-2 py-1 text-center">
                      <div className="text-xs text-slate-600">Speed</div>
                      <div className="text-base font-bold text-slate-800">
                        {disc.personal_speed ?? disc.speed}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded px-2 py-1 text-center">
                      <div className="text-xs text-slate-600">Glide</div>
                      <div className="text-base font-bold text-slate-800">
                        {disc.personal_glide ?? disc.glide}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded px-2 py-1 text-center">
                      <div className="text-xs text-slate-600">Turn</div>
                      <div className="text-base font-bold text-slate-800">
                        {disc.personal_turn ?? disc.turn}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded px-2 py-1 text-center">
                      <div className="text-xs text-slate-600">Fade</div>
                      <div className="text-base font-bold text-slate-800">
                        {disc.personal_fade ?? disc.fade}
                      </div>
                    </div>
                  </div>
                  {(disc.personal_speed || disc.personal_glide || disc.personal_turn || disc.personal_fade) && (
                    <div className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded text-center">
                      Viser personlige tal
                    </div>
                  )}
                </div>

                {disc.note && (
                  <p className="text-sm text-slate-600 italic mb-3">
                    {disc.note}
                  </p>
                )}

                {disc.bags.length > 0 && (
                  <div className="border-t border-slate-100 pt-3 mt-3">
                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <ShoppingBag className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <div className="flex flex-wrap gap-1.5">
                        {disc.bags.map((bag, idx) => (
                          <span key={bag.bag_id}>
                            {onNavigateToBag ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToBag(bag.bag_id);
                                }}
                                className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                {bag.name}
                              </button>
                            ) : (
                              <span className="font-medium text-slate-700">{bag.name}</span>
                            )}
                            {idx < disc.bags.length - 1 && ', '}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <AddDiscModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddDisc}
        />
      )}

      {editingDisc && (
        <EditDiscModal
          disc={editingDisc}
          onClose={() => setEditingDisc(null)}
          onUpdate={handleUpdateDisc}
        />
      )}

      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage.url}
          altText={selectedImage.alt}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {flightPathDisc && (
        <FlightPathModal
          disc={flightPathDisc}
          isLeftHanded={user?.dominant_hand === 'left'}
          onClose={() => setFlightPathDisc(null)}
        />
      )}

      {markingLostDisc && (
        <MarkLostModal
          disc={markingLostDisc}
          onClose={() => setMarkingLostDisc(null)}
          onSave={handleMarkAsLost}
        />
      )}
    </div>
  );
}
