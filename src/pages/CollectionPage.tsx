import { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Edit2, Package, ShoppingBag, Search } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { Disc, DiscInsert, Bag } from '../lib/database.types';
import { AddDiscModal } from '../components/AddDiscModal';
import { EditDiscModal } from '../components/EditDiscModal';
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

  useEffect(() => {
    if (user) {
      loadDiscs();
    }
  }, [user]);

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


  const filteredAndSortedDiscs = useMemo(() => {
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
  }, [discs, searchQuery, sortBy]);

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
                <p className="text-sm text-slate-600">
                  {discs.length} disc{discs.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tilføj disc
            </button>
          </div>

          {discs.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
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
            </div>
          )}
        </div>

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
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredAndSortedDiscs.map((disc) => (
              <div
                key={disc.disc_id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                {disc.photo_url && (
                  <div className="w-full h-48 overflow-hidden bg-slate-100">
                    <img
                      src={disc.photo_url}
                      alt={disc.name}
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => window.open(disc.photo_url!, '_blank')}
                    />
                  </div>
                )}
                <div className="p-5">
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
    </div>
  );
}
