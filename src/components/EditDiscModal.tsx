import { useState } from 'react';
import { X } from 'lucide-react';
import { Disc, DiscInsert } from '../lib/database.types';

interface EditDiscModalProps {
  disc: Disc;
  onClose: () => void;
  onUpdate: (discId: number, updates: Partial<DiscInsert>) => Promise<void>;
}

export function EditDiscModal({ disc, onClose, onUpdate }: EditDiscModalProps) {
  const [name, setName] = useState(disc.name);
  const [speed, setSpeed] = useState(disc.speed);
  const [glide, setGlide] = useState(disc.glide);
  const [turn, setTurn] = useState(disc.turn);
  const [fade, setFade] = useState(disc.fade);
  const [throwType, setThrowType] = useState<'forhånd' | 'baghånd' | 'begge'>(disc.throw_type);
  const [note, setNote] = useState(disc.note || '');
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
      await onUpdate(disc.disc_id, {
        name: name.trim(),
        speed,
        glide,
        turn,
        fade,
        throw_type: throwType,
        note: note.trim() || null,
      });
    } catch (err) {
      setError('Kunne ikke opdatere disc. Prøv igen.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Rediger disc</h2>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
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
              placeholder="f.eks. Destroyer"
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Speed
              </label>
              <input
                type="number"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                min={1}
                max={14}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Glide
              </label>
              <input
                type="number"
                value={glide}
                onChange={(e) => setGlide(Number(e.target.value))}
                min={1}
                max={7}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Turn
              </label>
              <input
                type="number"
                value={turn}
                onChange={(e) => setTurn(Number(e.target.value))}
                min={-5}
                max={5}
                step={0.5}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fade
              </label>
              <input
                type="number"
                value={fade}
                onChange={(e) => setFade(Number(e.target.value))}
                min={0}
                max={5}
                step={0.5}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Kastetype *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setThrowType('forhånd')}
                className={`py-2 px-3 rounded-lg font-medium transition-all ${
                  throwType === 'forhånd'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                disabled={isSubmitting}
              >
                Forhånd
              </button>
              <button
                type="button"
                onClick={() => setThrowType('baghånd')}
                className={`py-2 px-3 rounded-lg font-medium transition-all ${
                  throwType === 'baghånd'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                disabled={isSubmitting}
              >
                Baghånd
              </button>
              <button
                type="button"
                onClick={() => setThrowType('begge')}
                className={`py-2 px-3 rounded-lg font-medium transition-all ${
                  throwType === 'begge'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                disabled={isSubmitting}
              >
                Begge
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Noter (valgfrit)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none resize-none"
              placeholder="f.eks. Min favorit distance driver"
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
              {isSubmitting ? 'Gemmer...' : 'Gem ændringer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
