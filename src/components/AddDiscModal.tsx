import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { DiscInsert } from '../lib/database.types';

interface AddDiscModalProps {
  onClose: () => void;
  onAdd: (disc: Omit<DiscInsert, 'user_id'>) => Promise<void>;
}

export function AddDiscModal({ onClose, onAdd }: AddDiscModalProps) {
  const [name, setName] = useState('');
  const [speed, setSpeed] = useState(5);
  const [glide, setGlide] = useState(4);
  const [turn, setTurn] = useState(0);
  const [fade, setFade] = useState(1);
  const [throwType, setThrowType] = useState<'forhånd' | 'baghånd' | 'begge'>('begge');
  const [note, setNote] = useState('');
  const [weight, setWeight] = useState<number | ''>('');
  const [isGlow, setIsGlow] = useState(false);
  const [color, setColor] = useState('#3b82f6');
  const [visualDescription, setVisualDescription] = useState('');
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
      await onAdd({
        name: name.trim(),
        speed,
        glide,
        turn,
        fade,
        throw_type: throwType,
        note: note.trim() || null,
        weight: weight === '' ? null : Number(weight),
        is_glow: isGlow,
        color: color || null,
        visual_description: visualDescription.trim() || null,
      });
    } catch (err) {
      setError('Kunne ikke tilføje disc. Prøv igen.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Tilføj disc</h2>
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-sm text-blue-800">
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            <span>
              Kender du ikke tallene? Slå dem op på{' '}
              <a
                href="https://discgolfdata.com/pages/yadd.html"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-blue-900"
              >
                Disc Golf Data
              </a>
            </span>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">De officielle tal</h3>
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Vægt (gram)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                min={150}
                max={180}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
                placeholder="f.eks. 175"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Farve
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-[42px] rounded-lg border border-slate-300 cursor-pointer"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isGlow}
                onChange={(e) => setIsGlow(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-slate-700">Glow disc</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Visuel beskrivelse (valgfrit)
            </label>
            <input
              type="text"
              value={visualDescription}
              onChange={(e) => setVisualDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
              placeholder="f.eks. Rød med hvide swirls"
              disabled={isSubmitting}
            />
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
              {isSubmitting ? 'Tilføjer...' : 'Tilføj disc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
