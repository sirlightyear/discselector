import { useState } from 'react';
import { X, ExternalLink, Upload, Loader2 } from 'lucide-react';
import { Disc, DiscInsert } from '../lib/database.types';
import { MANUFACTURERS } from '../constants/manufacturers';
import { uploadToCloudinary } from '../utils/cloudinary';

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
  const [note, setNote] = useState(disc.note || '');
  const [weight, setWeight] = useState<number | ''>(disc.weight ?? '');
  const [isGlow, setIsGlow] = useState(disc.is_glow);
  const [color, setColor] = useState(disc.color || '#3b82f6');
  const [visualDescription, setVisualDescription] = useState(disc.visual_description || '');
  const [personalSpeed, setPersonalSpeed] = useState<number | ''>(disc.personal_speed ?? '');
  const [personalGlide, setPersonalGlide] = useState<number | ''>(disc.personal_glide ?? '');
  const [personalTurn, setPersonalTurn] = useState<number | ''>(disc.personal_turn ?? '');
  const [personalFade, setPersonalFade] = useState<number | ''>(disc.personal_fade ?? '');
  const [isTransparent, setIsTransparent] = useState(disc.is_transparent);
  const [discType, setDiscType] = useState<'Putter' | 'Midrange' | 'Fairway Driver' | 'Distance Driver' | null>(disc.disc_type);
  const [plastic, setPlastic] = useState(disc.plastic || '');
  const [manufacturer, setManufacturer] = useState(disc.manufacturer || '');
  const [purchaseYear, setPurchaseYear] = useState<number | ''>(disc.purchase_year ?? '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(disc.photo_url || null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
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

      let photoUrl: string | null | undefined = undefined;
      if (photoFile) {
        setIsUploadingPhoto(true);
        try {
          photoUrl = await uploadToCloudinary(photoFile);
        } catch (uploadError) {
          setError('Kunne ikke uploade billede. Prøv igen.');
          console.error(uploadError);
          setIsSubmitting(false);
          setIsUploadingPhoto(false);
          return;
        }
        setIsUploadingPhoto(false);
      }
      await onUpdate(disc.disc_id, {
        name: name.trim(),
        speed,
        glide,
        turn,
        fade,
        throw_type: null,
        note: note.trim() || null,
        weight: weight === '' ? null : Number(weight),
        is_glow: isGlow,
        color: color || null,
        visual_description: visualDescription.trim() || null,
        personal_speed: personalSpeed === '' ? null : Number(personalSpeed),
        personal_glide: personalGlide === '' ? null : Number(personalGlide),
        personal_turn: personalTurn === '' ? null : Number(personalTurn),
        personal_fade: personalFade === '' ? null : Number(personalFade),
        is_transparent: isTransparent,
        disc_type: discType,
        plastic: plastic.trim() || null,
        manufacturer: manufacturer.trim() || null,
        purchase_year: purchaseYear === '' ? null : Number(purchaseYear),
        ...(photoUrl !== undefined && { photo_url: photoUrl }),
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 text-sm text-blue-800">
            <ExternalLink className="w-4 h-4 flex-shrink-0" />
            <span>
              Opdater officielle tal fra{' '}
              <a
                href="https://www.discdb.info/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline hover:text-blue-900"
              >
                DiscDB
              </a>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Disc type
              </label>
              <select
                value={discType || ''}
                onChange={(e) => setDiscType(e.target.value as any || null)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
                disabled={isSubmitting}
              >
                <option value="">Vælg type</option>
                <option value="Putter">Putter</option>
                <option value="Midrange">Midrange</option>
                <option value="Fairway Driver">Fairway Driver</option>
                <option value="Distance Driver">Distance Driver</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Producent (valgfrit)
              </label>
              <select
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none bg-white"
                disabled={isSubmitting}
              >
                <option value="">Vælg producent...</option>
                {MANUFACTURERS.map((mfg) => (
                  <option key={mfg} value={mfg}>
                    {mfg}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">De officielle tal</h3>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Speed
              </label>
              <select
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none bg-white"
                disabled={isSubmitting}
              >
                {Array.from({ length: 14 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Glide
              </label>
              <select
                value={glide}
                onChange={(e) => setGlide(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none bg-white"
                disabled={isSubmitting}
              >
                {Array.from({ length: 7 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Turn
              </label>
              <select
                value={turn}
                onChange={(e) => setTurn(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none bg-white"
                disabled={isSubmitting}
              >
                {[1, 0.5, 0, -0.5, -1, -1.5, -2, -2.5, -3, -3.5, -4, -4.5, -5].map(num => (
                  <option key={num} value={num}>{num > 0 ? `+${num}` : num}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fade
              </label>
              <select
                value={fade}
                onChange={(e) => setFade(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none bg-white"
                disabled={isSubmitting}
              >
                {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
          </div>


          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-800">Som DU føler disc'en (Valgfrit)</h3>
              {(personalSpeed !== '' || personalGlide !== '' || personalTurn !== '' || personalFade !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setPersonalSpeed('');
                    setPersonalGlide('');
                    setPersonalTurn('');
                    setPersonalFade('');
                  }}
                  className="text-xs text-slate-600 hover:text-slate-800 underline"
                  disabled={isSubmitting}
                >
                  Nulstil personlige tal
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600 mb-3">
              Efterhånden som du lærer din disc at kende, kan du indtaste de tal du føler passer. Disse vil blive brugt i beregninger og visualiseringer i stedet for de officielle.
            </p>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Speed
                </label>
                <select
                  value={personalSpeed}
                  onChange={(e) => setPersonalSpeed(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-green-600 focus:ring-2 focus:ring-green-600 focus:ring-opacity-20 outline-none bg-white"
                  disabled={isSubmitting}
                >
                  <option value="">Brug officiel</option>
                  {Array.from({ length: 14 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Glide
                </label>
                <select
                  value={personalGlide}
                  onChange={(e) => setPersonalGlide(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-green-600 focus:ring-2 focus:ring-green-600 focus:ring-opacity-20 outline-none bg-white"
                  disabled={isSubmitting}
                >
                  <option value="">Brug officiel</option>
                  {Array.from({ length: 7 }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Turn
                </label>
                <select
                  value={personalTurn}
                  onChange={(e) => setPersonalTurn(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-green-600 focus:ring-2 focus:ring-green-600 focus:ring-opacity-20 outline-none bg-white"
                  disabled={isSubmitting}
                >
                  <option value="">Brug officiel</option>
                  {[1, 0.5, 0, -0.5, -1, -1.5, -2, -2.5, -3, -3.5, -4, -4.5, -5].map(num => (
                    <option key={num} value={num}>{num > 0 ? `+${num}` : num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Fade
                </label>
                <select
                  value={personalFade}
                  onChange={(e) => setPersonalFade(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-green-600 focus:ring-2 focus:ring-green-600 focus:ring-opacity-20 outline-none bg-white"
                  disabled={isSubmitting}
                >
                  <option value="">Brug officiel</option>
                  {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Plastik (valgfrit)
              </label>
              <input
                type="text"
                value={plastic}
                onChange={(e) => setPlastic(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
                placeholder="f.eks. Star"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Købsår (valgfrit)
              </label>
              <input
                type="number"
                value={purchaseYear}
                onChange={(e) => setPurchaseYear(e.target.value === '' ? '' : Number(e.target.value))}
                min={1970}
                max={2100}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
                placeholder="f.eks. 2024"
                disabled={isSubmitting}
              />
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

          <div className="flex gap-4">
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
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTransparent}
                onChange={(e) => setIsTransparent(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20"
                disabled={isSubmitting}
              />
              <span className="text-sm font-medium text-slate-700">Gennemsigtig</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Foto af disc (valgfrit)
            </label>
            {photoPreview && !photoFile && (
              <div className="mb-2 relative">
                <img
                  src={photoPreview}
                  alt="Current disc photo"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setPhotoFile(file);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setPhotoPreview(reader.result as string);
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
              disabled={isSubmitting}
            />
            {photoFile && photoPreview && (
              <div className="mt-2 relative">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(disc.photo_url || null);
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {isUploadingPhoto && (
              <div className="mt-2 flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploader billede...</span>
              </div>
            )}
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
              {isSubmitting ? 'Gemmer...' : 'Gem ændringer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
