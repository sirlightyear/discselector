import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Disc } from '../lib/database.types';

interface MarkLostModalProps {
  disc: Disc;
  onClose: () => void;
  onSave: (lostDate: string, lostLocation: string) => void;
}

export default function MarkLostModal({ disc, onClose, onSave }: MarkLostModalProps) {
  const [lostDate, setLostDate] = useState(new Date().toISOString().split('T')[0]);
  const [lostLocation, setLostLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(lostDate, lostLocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <h2 className="text-xl font-bold text-slate-800">Marker som mistet</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              Du er ved at markere <span className="font-semibold">{disc.name}</span> som mistet.
              Disc'en vil stadig være synlig i din samling, men vil fremstå gråtonet og vil ikke tælle
              med i dit samlede antal discs.
            </p>
          </div>

          <div>
            <label htmlFor="lost_date" className="block text-sm font-medium text-slate-700 mb-1">
              Dato mistet *
            </label>
            <input
              type="date"
              id="lost_date"
              value={lostDate}
              onChange={(e) => setLostDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="lost_location" className="block text-sm font-medium text-slate-700 mb-1">
              Sted / Bane
            </label>
            <input
              type="text"
              id="lost_location"
              value={lostLocation}
              onChange={(e) => setLostLocation(e.target.value)}
              placeholder="F.eks. 'Sønderskov Discgolf, hul 7'"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
            <p className="text-xs text-slate-500 mt-1">
              Valgfrit - noter hvor disc'en blev mistet
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Marker som mistet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
