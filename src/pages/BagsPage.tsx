import { Plus, Trash2, Edit2, Briefcase, Copy, Package } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { Bag } from '../lib/database.types';
import { BagBuilderPage } from './BagBuilderPage';

type BagWithCount = Bag & { discCount: number };

export function BagsPage() {
  const { user } = useUser();
  const [bags, setBags] = useState<BagWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBag, setEditingBag] = useState<Bag | null>(null);
  const [selectedBag, setSelectedBag] = useState<Bag | null>(null);

  useEffect(() => {
    if (user) {
      loadBags();
    }
  }, [user]);

  const loadBags = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data: bagsData, error: bagsError } = await supabase
        .from('bags')
        .select('*')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false });

      if (bagsError) throw bagsError;

      const { data: bagDiscsData, error: bagDiscsError } = await supabase
        .from('bag_discs')
        .select('bag_id');

      if (bagDiscsError) throw bagDiscsError;

      const bagsWithCounts: BagWithCount[] = (bagsData || []).map(bag => {
        const discCount = bagDiscsData?.filter(bd => bd.bag_id === bag.bag_id).length || 0;
        return { ...bag, discCount };
      });

      setBags(bagsWithCounts);
    } catch (error) {
      console.error('Error loading bags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBag = async (name: string, description: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('bags')
        .insert({
          user_id: user.user_id,
          name: name.trim(),
          description: description.trim() || null
        });

      if (error) throw error;
      await loadBags();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding bag:', error);
      throw error;
    }
  };

  const handleUpdateBag = async (bagId: number, name: string, description: string) => {
    try {
      const { error } = await supabase
        .from('bags')
        .update({
          name: name.trim(),
          description: description.trim() || null
        })
        .eq('bag_id', bagId);

      if (error) throw error;
      await loadBags();
      setEditingBag(null);
    } catch (error) {
      console.error('Error updating bag:', error);
      throw error;
    }
  };

  const handleDeleteBag = async (bagId: number) => {
    if (!confirm('Er du sikker på at du vil slette denne bag? Alle discs i baggen vil blive fjernet.')) return;

    try {
      const { error } = await supabase
        .from('bags')
        .delete()
        .eq('bag_id', bagId);

      if (error) throw error;
      await loadBags();
    } catch (error) {
      console.error('Error deleting bag:', error);
    }
  };

  const handleDuplicateBag = async (bag: Bag) => {
    if (!user) return;

    try {
      const { data: newBag, error: bagError } = await supabase
        .from('bags')
        .insert({
          user_id: user.user_id,
          name: `${bag.name} (kopi)`,
          description: bag.description
        })
        .select()
        .single();

      if (bagError) throw bagError;

      const { data: bagDiscs, error: bagDiscsError } = await supabase
        .from('bag_discs')
        .select('disc_id, position')
        .eq('bag_id', bag.bag_id);

      if (bagDiscsError) throw bagDiscsError;

      if (bagDiscs && bagDiscs.length > 0) {
        const newBagDiscs = bagDiscs.map(bd => ({
          bag_id: newBag.bag_id,
          disc_id: bd.disc_id,
          position: bd.position
        }));

        const { error: insertError } = await supabase
          .from('bag_discs')
          .insert(newBagDiscs);

        if (insertError) throw insertError;
      }

      await loadBags();
    } catch (error) {
      console.error('Error duplicating bag:', error);
    }
  };

  if (selectedBag) {
    return <BagBuilderPage bag={selectedBag} onBack={() => setSelectedBag(null)} />;
  }

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
              <Briefcase className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Mine Bags</h1>
                <p className="text-sm text-slate-600">
                  Opret og administrer dine disc golf bags
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Ny bag
            </button>
          </div>
        </div>

        {bags.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Ingen bags endnu
            </h2>
            <p className="text-slate-600 mb-6">
              Opret din første bag for at sammensætte dit perfekte udvalg af discs
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Opret bag
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {bags.map((bag) => (
              <div
                key={bag.bag_id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => setSelectedBag(bag)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                        {bag.name}
                      </h3>
                      {bag.description && (
                        <p className="text-sm text-slate-600 mb-3">
                          {bag.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {bag.discCount} disc{bag.discCount !== 1 ? 's' : ''}
                        </span>
                        <span>Oprettet {new Date(bag.created_at).toLocaleDateString('da-DK')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleDuplicateBag(bag)}
                      className="text-slate-600 hover:text-green-600 transition-colors"
                      title="Kopier bag"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingBag(bag)}
                      className="text-slate-600 hover:text-blue-600 transition-colors"
                      title="Rediger"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBag(bag.bag_id)}
                      className="text-slate-600 hover:text-red-600 transition-colors"
                      title="Slet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <BagModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddBag}
        />
      )}

      {editingBag && (
        <BagModal
          bag={editingBag}
          onClose={() => setEditingBag(null)}
          onSave={(name, desc) => handleUpdateBag(editingBag.bag_id, name, desc)}
        />
      )}
    </div>
  );
}

interface BagModalProps {
  bag?: Bag;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
}

function BagModal({ bag, onClose, onSave }: BagModalProps) {
  const [name, setName] = useState(bag?.name || '');
  const [description, setDescription] = useState(bag?.description || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Indtast venligst et navn');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(name, description);
    } catch (err) {
      setError('Kunne ikke gemme bag. Prøv igen.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-slate-200 p-4">
          <h2 className="text-xl font-bold text-slate-800">
            {bag ? 'Rediger bag' : 'Ny bag'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Navn *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
              placeholder="f.eks. Min turneringsbag"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Beskrivelse (valgfrit)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none resize-none"
              placeholder="f.eks. Min go-to setup til turneringer"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-200 text-slate-700 py-3 px-4 rounded-lg font-medium hover:bg-slate-300 transition-colors"
              disabled={isSubmitting}
            >
              Annuller
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Gemmer...' : bag ? 'Gem ændringer' : 'Opret bag'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
