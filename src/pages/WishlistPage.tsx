import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Heart, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { WishlistItem, WishlistItemInsert } from '../lib/database.types';

export function WishlistPage() {
  const { user } = useUser();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<WishlistItem | null>(null);

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.user_id)
        .order('priority');

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading wishlist items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = async (productName: string, notes: string, productLink: string) => {
    if (!user) return;

    try {
      const maxPriority = items.length > 0 ? Math.max(...items.map(i => i.priority)) : 0;

      const { error } = await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.user_id,
          product_name: productName.trim(),
          notes: notes.trim() || null,
          product_link: productLink.trim() || null,
          priority: maxPriority + 1
        });

      if (error) throw error;
      await loadItems();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const handleUpdateItem = async (itemId: number, productName: string, notes: string, productLink: string) => {
    try {
      const { error } = await supabase
        .from('wishlist_items')
        .update({
          product_name: productName.trim(),
          notes: notes.trim() || null,
          product_link: productLink.trim() || null
        })
        .eq('item_id', itemId);

      if (error) throw error;
      await loadItems();
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Er du sikker på at du vil slette dette produkt?')) return;

    try {
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('item_id', itemId);

      if (error) throw error;
      await loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleMovePriority = async (itemId: number, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(i => i.item_id === itemId);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === items.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newItems = [...items];
    [newItems[currentIndex], newItems[newIndex]] = [newItems[newIndex], newItems[currentIndex]];

    try {
      const updates = newItems.map((item, index) => ({
        item_id: item.item_id,
        priority: index
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('wishlist_items')
          .update({ priority: update.priority })
          .eq('item_id', update.item_id);

        if (error) throw error;
      }

      await loadItems();
    } catch (error) {
      console.error('Error updating priorities:', error);
    }
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
              <Heart className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Ønskeliste</h1>
                <p className="text-sm text-slate-600">
                  Hold styr på discs og udstyr du ønsker dig
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tilføj produkt
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Tom ønskeliste
            </h2>
            <p className="text-slate-600 mb-6">
              Tilføj produkter du ønsker dig
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tilføj produkt
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={item.item_id}
                className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-2 pt-1">
                    <button
                      onClick={() => handleMovePriority(item.item_id, 'up')}
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
                      onClick={() => handleMovePriority(item.item_id, 'down')}
                      disabled={index === items.length - 1}
                      className={`${
                        index === items.length - 1
                          ? 'text-slate-300 cursor-not-allowed'
                          : 'text-slate-400 hover:text-slate-700'
                      } transition-colors`}
                      title="Flyt ned"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">
                          {item.product_name}
                        </h3>
                        {item.notes && (
                          <p className="text-sm text-slate-600 mb-2">
                            {item.notes}
                          </p>
                        )}
                        {item.product_link && (
                          <a
                            href={item.product_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            Se produkt
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="text-slate-600 hover:text-blue-600 transition-colors"
                          title="Rediger"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.item_id)}
                          className="text-slate-600 hover:text-red-600 transition-colors"
                          title="Slet"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Prioritet #{index + 1}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <WishlistModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddItem}
        />
      )}

      {editingItem && (
        <WishlistModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={(name, notes, link) => handleUpdateItem(editingItem.item_id, name, notes, link)}
        />
      )}
    </div>
  );
}

interface WishlistModalProps {
  item?: WishlistItem;
  onClose: () => void;
  onSave: (productName: string, notes: string, productLink: string) => Promise<void>;
}

function WishlistModal({ item, onClose, onSave }: WishlistModalProps) {
  const [productName, setProductName] = useState(item?.product_name || '');
  const [notes, setNotes] = useState(item?.notes || '');
  const [productLink, setProductLink] = useState(item?.product_link || '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!productName.trim()) {
      setError('Indtast venligst et produktnavn');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(productName, notes, productLink);
    } catch (err) {
      setError('Kunne ikke gemme produkt. Prøv igen.');
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
            {item ? 'Rediger produkt' : 'Nyt produkt'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Produktnavn *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
              placeholder="f.eks. Innova Destroyer"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Noter (valgfrit)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none resize-none"
              placeholder="f.eks. Star plastic, 175g"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Link til produkt (valgfrit)
            </label>
            <input
              type="url"
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
              placeholder="https://..."
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
              {isSubmitting ? 'Gemmer...' : item ? 'Gem ændringer' : 'Tilføj produkt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
