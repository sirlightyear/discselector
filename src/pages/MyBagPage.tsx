import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { Disc, DiscInsert } from '../lib/database.types';
import { AddDiscModal } from '../components/AddDiscModal';
import { EditDiscModal } from '../components/EditDiscModal';

export function MyBagPage() {
  const { user } = useUser();
  const [discs, setDiscs] = useState<Disc[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDisc, setEditingDisc] = useState<Disc | null>(null);

  useEffect(() => {
    if (user) {
      loadDiscs();
    }
  }, [user]);

  const loadDiscs = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('discs')
        .select('*')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscs(data || []);
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

  const getStabilityColor = (turn: number, fade: number): string => {
    const stability = fade - turn;
    if (stability < -1) return 'bg-green-500';
    if (stability < 0) return 'bg-lime-500';
    if (stability < 1) return 'bg-yellow-500';
    if (stability < 2) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-slate-600">Indlæser...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Min Bag</h1>
                {user?.initialer && (
                  <p className="text-sm text-slate-600">
                    {user.initialer} ({user.user_id})
                  </p>
                )}
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
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {discs.map((disc) => (
              <div
                key={disc.disc_id}
                className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow"
              >
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
                      <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        {disc.throw_type}
                      </span>
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
                      <div
                        className={`w-3 h-3 rounded-full ${getStabilityColor(
                          disc.turn,
                          disc.fade
                        )}`}
                        title="Stabilitet"
                      />
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
                  <p className="text-sm text-slate-600 italic">
                    {disc.note}
                  </p>
                )}
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
