import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Map, AlertCircle, ChevronRight, ArrowLeft, ChevronLeft, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Course, CourseHole, Disc } from '../lib/database.types';

type HoleWithDiscs = CourseHole & { disc_colors: string[] };

export function SharedCoursePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [course, setCourse] = useState<Course | null>(null);
  const [holes, setHoles] = useState<HoleWithDiscs[]>([]);
  const [selectedHole, setSelectedHole] = useState<CourseHole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadSharedCourse();
    } else {
      setError('Intet delingslink fundet');
      setIsLoading(false);
    }
  }, [token]);

  const loadSharedCourse = async () => {
    try {
      setIsLoading(true);

      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('is_shared', true)
        .maybeSingle();

      if (courseError) throw courseError;
      if (!courseData) {
        setError('Bane ikke fundet eller ikke delt');
        setIsLoading(false);
        return;
      }

      setCourse(courseData);

      const { data: holesData, error: holesError } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', courseData.course_id)
        .order('position');

      if (holesError) throw holesError;

      const holesWithDiscs: HoleWithDiscs[] = await Promise.all(
        (holesData || []).map(async (hole) => {
          const { data: holeDiscs } = await supabase
            .from('hole_discs')
            .select('disc_id')
            .eq('hole_id', hole.hole_id);

          const discColors: string[] = [];
          if (holeDiscs && holeDiscs.length > 0) {
            const { data: discs } = await supabase
              .from('discs')
              .select('color')
              .in('disc_id', holeDiscs.map(hd => hd.disc_id));

            discColors.push(...(discs || []).map(d => d.color).filter(Boolean) as string[]);
          }

          return { ...hole, disc_colors: discColors };
        })
      );

      setHoles(holesWithDiscs);
    } catch (error) {
      console.error('Error loading shared course:', error);
      setError('Kunne ikke indlæse bane');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-200 via-purple-200 to-pink-200 flex items-center justify-center">
        <div className="text-slate-600">Indlæser...</div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-200 via-purple-200 to-pink-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Kunne ikke vise bane
          </h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  if (selectedHole) {
    return (
      <SharedHoleDetail
        hole={selectedHole}
        course={course}
        allHoles={holes}
        onBack={() => setSelectedHole(null)}
        onSelectHole={setSelectedHole}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-200 via-purple-200 to-pink-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Map className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-800">{course.name}</h1>
          </div>
          {course.description && (
            <p className="text-slate-600 mb-2">{course.description}</p>
          )}
          <div className="text-sm text-slate-500 mb-4">
            {holes.length} huller (Kun visning)
          </div>

          {(course.link1 || course.link2) && (
            <div className="flex gap-3 mb-4">
              {course.link1 && (
                <a
                  href={course.link1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <LinkIcon className="w-4 h-4" />
                  Link 1
                </a>
              )}
              {course.link2 && (
                <a
                  href={course.link2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <LinkIcon className="w-4 h-4" />
                  Link 2
                </a>
              )}
            </div>
          )}

          {course.share_photos && course.photo_urls && course.photo_urls.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {course.photo_urls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Course photo ${idx + 1}`}
                  className="w-full aspect-square object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {holes.map((hole) => (
            <button
              key={hole.hole_id}
              onClick={() => setSelectedHole(hole)}
              className={`aspect-square rounded-lg border-2 transition-all font-bold text-lg flex flex-col items-center justify-center gap-1 p-2 overflow-hidden relative ${
                hole.notes || hole.disc_colors.length > 0
                  ? 'border-blue-600 hover:border-blue-700'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
              style={{
                backgroundImage: course.share_photos && hole.background_photo_url ? `url(${hole.background_photo_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {course.share_photos && hole.background_photo_url && (
                <div className="absolute inset-0 bg-black/30" />
              )}
              <span className={`relative z-10 ${course.share_photos && hole.background_photo_url ? 'text-white text-shadow-lg' : hole.notes || hole.disc_colors.length > 0 ? 'text-blue-800' : 'text-slate-700'}`}>
                {hole.custom_name || hole.hole_number}
              </span>
              {hole.disc_colors.length > 0 && (
                <div className="flex gap-0.5 relative z-10">
                  {hole.disc_colors.slice(0, 2).map((color, idx) => (
                    <div
                      key={idx}
                      className="w-3 h-3 rounded-full border-2 border-white"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

interface SharedHoleDetailProps {
  hole: CourseHole;
  course: Course;
  allHoles: CourseHole[];
  onBack: () => void;
  onSelectHole: (hole: CourseHole) => void;
}

function SharedHoleDetail({ hole, course, allHoles, onBack, onSelectHole }: SharedHoleDetailProps) {
  const [holeDiscs, setHoleDiscs] = useState<Disc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHoleDiscs();
  }, [hole.hole_id]);

  const loadHoleDiscs = async () => {
    try {
      setIsLoading(true);

      const { data: holeDiscIds } = await supabase
        .from('hole_discs')
        .select('disc_id')
        .eq('hole_id', hole.hole_id);

      if (holeDiscIds && holeDiscIds.length > 0) {
        const { data: discs } = await supabase
          .from('discs')
          .select('*')
          .in('disc_id', holeDiscIds.map(hd => hd.disc_id));

        setHoleDiscs(discs || []);
      }
    } catch (error) {
      console.error('Error loading hole discs:', error);
    } finally {
      setIsLoading(false);
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-slate-600 hover:text-slate-800 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {hole.custom_name || `Hul ${hole.hole_number}`}
                </h1>
                <p className="text-sm text-slate-600">{course.name} (Kun visning)</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const currentIndex = allHoles.findIndex(h => h.hole_id === hole.hole_id);
                  if (currentIndex > 0) {
                    onSelectHole(allHoles[currentIndex - 1]);
                  }
                }}
                disabled={allHoles.findIndex(h => h.hole_id === hole.hole_id) === 0}
                className="p-2 text-slate-600 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => {
                  const currentIndex = allHoles.findIndex(h => h.hole_id === hole.hole_id);
                  if (currentIndex < allHoles.length - 1) {
                    onSelectHole(allHoles[currentIndex + 1]);
                  }
                }}
                disabled={allHoles.findIndex(h => h.hole_id === hole.hole_id) === allHoles.length - 1}
                className="p-2 text-slate-600 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {course.share_notes && hole.notes && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Noter
              </label>
              <div className="bg-slate-50 px-4 py-3 rounded-lg text-slate-700">
                {hole.notes}
              </div>
            </div>
          )}

          {course.share_photos && hole.photo_urls && hole.photo_urls.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Fotos
              </label>
              <div className="grid grid-cols-3 gap-2">
                {hole.photo_urls.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Hole photo ${idx + 1}`}
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {(hole.link1 || hole.link2) && (
            <div className="flex gap-3">
              {hole.link1 && (
                <a
                  href={hole.link1}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <LinkIcon className="w-4 h-4" />
                  Link 1
                </a>
              )}
              {hole.link2 && (
                <a
                  href={hole.link2}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <LinkIcon className="w-4 h-4" />
                  Link 2
                </a>
              )}
            </div>
          )}
        </div>

        {holeDiscs.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Valgte discs ({holeDiscs.length})
            </h2>
            <div className="space-y-2">
              {holeDiscs.map((disc) => (
                <div
                  key={disc.disc_id}
                  className="flex items-center gap-3 border border-slate-200 rounded-lg p-3"
                >
                  {disc.color && (
                    <div
                      className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0"
                      style={{ backgroundColor: disc.color }}
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">{disc.name}</div>
                    <div className="text-xs text-slate-600">
                      {disc.personal_speed ?? disc.speed} | {disc.personal_glide ?? disc.glide} | {disc.personal_turn ?? disc.turn} | {disc.personal_fade ?? disc.fade}
                      {disc.disc_type && <span className="ml-2 text-slate-500">• {disc.disc_type}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
