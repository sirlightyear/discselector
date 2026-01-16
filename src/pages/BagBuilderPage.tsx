import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, X, Edit2, ChevronUp, ChevronDown } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { Disc, Bag, DiscInsert } from '../lib/database.types';
import { BagCoverageChart } from '../components/BagCoverageChart';
import { getStabilityColor, getStabilityCategory } from '../utils/stability';
import { EditDiscModal } from '../components/EditDiscModal';

interface BagBuilderPageProps {
  bag: Bag;
  onBack: () => void;
}

export function BagBuilderPage({ bag, onBack }: BagBuilderPageProps) {
  const { user } = useUser();
  const [availableDiscs, setAvailableDiscs] = useState<Disc[]>([]);
  const [bagDiscs, setBagDiscs] = useState<Disc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingDisc, setEditingDisc] = useState<Disc | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, bag.bag_id]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data: allDiscs, error: discsError } = await supabase
        .from('discs')
        .select('*')
        .eq('user_id', user.user_id)
        .order('name');

      if (discsError) throw discsError;

      const { data: bagDiscData, error: bagDiscsError } = await supabase
        .from('bag_discs')
        .select('disc_id, position')
        .eq('bag_id', bag.bag_id)
        .order('position');

      if (bagDiscsError) throw bagDiscsError;

      const bagDiscIdSet = new Set(bagDiscData?.map(bd => bd.disc_id) || []);
      const inBag = bagDiscData?.map(bd => allDiscs?.find(d => d.disc_id === bd.disc_id)).filter(Boolean) as Disc[] || [];
      const available = allDiscs?.filter(d => !bagDiscIdSet.has(d.disc_id) && !d.is_lost) || [];

      setBagDiscs(inBag);
      setAvailableDiscs(available);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDisc = async (disc: Disc) => {
    try {
      const maxPosition = bagDiscs.length > 0 ? bagDiscs.length : 0;

      const { error } = await supabase
        .from('bag_discs')
        .insert({
          bag_id: bag.bag_id,
          disc_id: disc.disc_id,
          position: maxPosition
        });

      if (error) throw error;

      setAvailableDiscs(prev => prev.filter(d => d.disc_id !== disc.disc_id));
      setBagDiscs(prev => [...prev, disc]);
    } catch (error) {
      console.error('Error adding disc to bag:', error);
    }
  };

  const handleRemoveDisc = async (disc: Disc) => {
    try {
      const { error } = await supabase
        .from('bag_discs')
        .delete()
        .eq('bag_id', bag.bag_id)
        .eq('disc_id', disc.disc_id);

      if (error) throw error;

      setBagDiscs(prev => prev.filter(d => d.disc_id !== disc.disc_id));
      setAvailableDiscs(prev => [...prev, disc].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Error removing disc from bag:', error);
    }
  };

  const handleUpdateDisc = async (discId: number, updates: Partial<DiscInsert>) => {
    try {
      const { error } = await supabase
        .from('discs')
        .update(updates)
        .eq('disc_id', discId);

      if (error) throw error;
      await loadData();
      setEditingDisc(null);
    } catch (error) {
      console.error('Error updating disc:', error);
      throw error;
    }
  };

  const handleMoveDisc = async (discIndex: number, direction: 'up' | 'down') => {
    if (direction === 'up' && discIndex === 0) return;
    if (direction === 'down' && discIndex === bagDiscs.length - 1) return;

    const newIndex = direction === 'up' ? discIndex - 1 : discIndex + 1;
    const newBagDiscs = [...bagDiscs];
    [newBagDiscs[discIndex], newBagDiscs[newIndex]] = [newBagDiscs[newIndex], newBagDiscs[discIndex]];

    try {
      const updates = newBagDiscs.map((disc, index) => ({
        disc_id: disc.disc_id,
        position: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('bag_discs')
          .update({ position: update.position })
          .eq('bag_id', bag.bag_id)
          .eq('disc_id', update.disc_id);

        if (error) throw error;
      }

      setBagDiscs(newBagDiscs);
    } catch (error) {
      console.error('Error moving disc:', error);
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{bag.name}</h1>
              {bag.description && (
                <p className="text-sm text-slate-600">{bag.description}</p>
              )}
            </div>
          </div>

          <div className="text-sm text-slate-600">
            {bagDiscs.length} discs i baggen
          </div>
        </div>

        {bagDiscs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Bag Coverage</h2>
            <BagCoverageChart discs={bagDiscs} />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Discs i baggen ({bagDiscs.length})
            </h2>
            {bagDiscs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Ingen discs i baggen endnu. Tilføj fra listen til højre.
              </div>
            ) : (
              <div className="space-y-3">
                {bagDiscs.map((disc, index) => (
                  <div
                    key={disc.disc_id}
                    className={`border border-slate-200 rounded-lg hover:border-slate-300 transition-colors overflow-hidden ${
                      disc.is_lost ? 'opacity-40 bg-slate-50' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex flex-col gap-2 p-2 border-r border-slate-200">
                        <button
                          onClick={() => handleMoveDisc(index, 'up')}
                          disabled={index === 0}
                          className={`${
                            index === 0
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-slate-700'
                          } transition-colors`}
                          title="Flyt op"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleMoveDisc(index, 'down')}
                          disabled={index === bagDiscs.length - 1}
                          className={`${
                            index === bagDiscs.length - 1
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-slate-700'
                          } transition-colors`}
                          title="Flyt ned"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {disc.color && (
                            <div
                              className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0"
                              style={{ backgroundColor: disc.color }}
                            />
                          )}
                          <h3 className={`font-semibold ${disc.is_lost ? 'text-slate-400' : 'text-slate-800'}`}>
                            {disc.name}
                            {disc.is_lost && <span className="ml-2 text-xs font-normal text-red-600">(Mistet)</span>}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {disc.disc_type && (
                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {disc.disc_type}
                            </span>
                          )}
                          {disc.manufacturer && (
                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {disc.manufacturer.length > 15 ? disc.manufacturer.substring(0, 15) + '...' : disc.manufacturer}
                            </span>
                          )}
                          {disc.weight && (
                            <span className="text-xs text-slate-500">{disc.weight}g</span>
                          )}
                          {disc.is_glow && (
                            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                              Glow
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${getStabilityColor(
                                disc.personal_turn ?? disc.turn,
                                disc.personal_fade ?? disc.fade
                              )}`}
                            />
                            <span className="text-xs text-slate-600">
                              {getStabilityCategory(disc.personal_turn ?? disc.turn, disc.personal_fade ?? disc.fade)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs">
                          <span>S: {disc.personal_speed ?? disc.speed}</span>
                          <span>G: {disc.personal_glide ?? disc.glide}</span>
                          <span>T: {disc.personal_turn ?? disc.turn}</span>
                          <span>F: {disc.personal_fade ?? disc.fade}</span>
                        </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingDisc(disc);
                              }}
                              className="text-slate-400 hover:text-blue-600 transition-colors"
                              title="Rediger disc"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveDisc(disc)}
                              className="text-slate-400 hover:text-red-600 transition-colors"
                              title="Fjern fra bag"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Tilgængelige discs ({availableDiscs.length})
            </h2>
            {availableDiscs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Alle dine discs er i baggen.
              </div>
            ) : (
              <div className="space-y-3">
                {availableDiscs.map((disc) => (
                  <div
                    key={disc.disc_id}
                    className="border border-slate-200 rounded-lg hover:border-slate-300 transition-colors overflow-hidden"
                  >
                    <div className="flex items-start">
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {disc.color && (
                            <div
                              className="w-4 h-4 rounded-full border-2 border-slate-300 flex-shrink-0"
                              style={{ backgroundColor: disc.color }}
                            />
                          )}
                          <h3 className="font-semibold text-slate-800">{disc.name}</h3>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {disc.disc_type && (
                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {disc.disc_type}
                            </span>
                          )}
                          {disc.manufacturer && (
                            <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                              {disc.manufacturer.length > 15 ? disc.manufacturer.substring(0, 15) + '...' : disc.manufacturer}
                            </span>
                          )}
                          {disc.weight && (
                            <span className="text-xs text-slate-500">{disc.weight}g</span>
                          )}
                          {disc.is_glow && (
                            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded">
                              Glow
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${getStabilityColor(
                                disc.personal_turn ?? disc.turn,
                                disc.personal_fade ?? disc.fade
                              )}`}
                            />
                            <span className="text-xs text-slate-600">
                              {getStabilityCategory(disc.personal_turn ?? disc.turn, disc.personal_fade ?? disc.fade)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-3 text-xs">
                          <span>S: {disc.personal_speed ?? disc.speed}</span>
                          <span>G: {disc.personal_glide ?? disc.glide}</span>
                          <span>T: {disc.personal_turn ?? disc.turn}</span>
                          <span>F: {disc.personal_fade ?? disc.fade}</span>
                        </div>
                          </div>
                          <button
                            onClick={() => handleAddDisc(disc)}
                            className="text-slate-400 hover:text-blue-600 transition-colors"
                            title="Tilføj til bag"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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
