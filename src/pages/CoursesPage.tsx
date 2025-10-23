import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Map, ChevronRight, ArrowLeft, ChevronLeft } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { Course, CourseInsert, CourseHole, Disc } from '../lib/database.types';

type CourseWithHoleCount = Course & { holeCount: number };
type HoleWithDiscs = CourseHole & { disc_colors: string[] };

export function CoursesPage() {
  const { user } = useUser();
  const [courses, setCourses] = useState<CourseWithHoleCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  useEffect(() => {
    if (user) {
      loadCourses();
    }
  }, [user]);

  const loadCourses = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;

      const coursesWithCount: CourseWithHoleCount[] = (coursesData || []).map(course => ({
        ...course,
        holeCount: course.hole_count
      }));

      setCourses(coursesWithCount);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async (name: string, description: string, holeCount: number) => {
    if (!user) return;

    try {
      const { data: newCourse, error: courseError } = await supabase
        .from('courses')
        .insert({
          user_id: user.user_id,
          name: name.trim(),
          description: description.trim() || null,
          hole_count: holeCount
        })
        .select()
        .single();

      if (courseError) throw courseError;

      const holes = Array.from({ length: holeCount }, (_, i) => ({
        course_id: newCourse.course_id,
        hole_number: i + 1,
        notes: null
      }));

      const { error: holesError } = await supabase
        .from('course_holes')
        .insert(holes);

      if (holesError) throw holesError;

      await loadCourses();
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding course:', error);
      throw error;
    }
  };

  const handleUpdateCourse = async (courseId: number, name: string, description: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({
          name: name.trim(),
          description: description.trim() || null
        })
        .eq('course_id', courseId);

      if (error) throw error;
      await loadCourses();
      setEditingCourse(null);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (!confirm('Er du sikker på at du vil slette denne bane? Alle huller og discs vil blive fjernet.')) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('course_id', courseId);

      if (error) throw error;
      await loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  if (selectedCourse) {
    return <CourseDetailPage course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

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
              <Map className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Baner</h1>
                <p className="text-sm text-slate-600">
                  Opret og administrer dine disc golf baner
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Ny bane
            </button>
          </div>
        </div>

        {courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Map className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              Ingen baner endnu
            </h2>
            <p className="text-slate-600 mb-6">
              Opret din første bane for at forberede dig til spil
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Opret bane
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <div
                key={course.course_id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all group cursor-pointer"
                onClick={() => setSelectedCourse(course)}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                        {course.name}
                      </h3>
                      {course.description && (
                        <p className="text-sm text-slate-600 mb-3">
                          {course.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>{course.hole_count} huller</span>
                        <span>Sidst redigeret {new Date(course.updated_at).toLocaleDateString('da-DK')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setEditingCourse(course)}
                        className="text-slate-600 hover:text-blue-600 transition-colors"
                        title="Rediger"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.course_id)}
                        className="text-slate-600 hover:text-red-600 transition-colors"
                        title="Slet"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddModal && (
        <CourseModal
          onClose={() => setShowAddModal(false)}
          onSave={handleAddCourse}
        />
      )}

      {editingCourse && (
        <CourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSave={(name, desc) => handleUpdateCourse(editingCourse.course_id, name, desc)}
        />
      )}
    </div>
  );
}

interface CourseModalProps {
  course?: Course;
  onClose: () => void;
  onSave: (name: string, description: string, holeCount: number) => Promise<void>;
}

function CourseModal({ course, onClose, onSave }: CourseModalProps) {
  const [name, setName] = useState(course?.name || '');
  const [description, setDescription] = useState(course?.description || '');
  const [holeCount, setHoleCount] = useState(course?.hole_count || 18);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Indtast venligst et navn');
      return;
    }

    if (holeCount < 1 || holeCount > 36) {
      setError('Antal huller skal være mellem 1 og 36');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(name, description, holeCount);
    } catch (err) {
      setError('Kunne ikke gemme bane. Prøv igen.');
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
            {course ? 'Rediger bane' : 'Ny bane'}
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
              placeholder="f.eks. Halsnæs"
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
              placeholder="f.eks. Min hjemmebane"
              disabled={isSubmitting}
            />
          </div>

          {!course && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Antal huller *
              </label>
              <input
                type="number"
                value={holeCount}
                onChange={(e) => setHoleCount(parseInt(e.target.value) || 18)}
                min="1"
                max="36"
                className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
                disabled={isSubmitting}
              />
            </div>
          )}

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
              {isSubmitting ? 'Gemmer...' : course ? 'Gem ændringer' : 'Opret bane'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface CourseDetailPageProps {
  course: Course;
  onBack: () => void;
}

function CourseDetailPage({ course, onBack }: CourseDetailPageProps) {
  const { user } = useUser();
  const [holes, setHoles] = useState<HoleWithDiscs[]>([]);
  const [selectedHole, setSelectedHole] = useState<CourseHole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHoles();
  }, [course.course_id]);

  const loadHoles = async () => {
    try {
      setIsLoading(true);
      const { data: holesData, error: holesError } = await supabase
        .from('course_holes')
        .select('*')
        .eq('course_id', course.course_id)
        .order('hole_number');

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
      console.error('Error loading holes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedHole) {
    return (
      <HoleDetailPage
        hole={selectedHole}
        courseName={course.name}
        courseId={course.course_id}
        allHoles={holes}
        onBack={() => setSelectedHole(null)}
        onUpdate={loadHoles}
        onSelectHole={setSelectedHole}
      />
    );
  }

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
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{course.name}</h1>
              {course.description && (
                <p className="text-sm text-slate-600">{course.description}</p>
              )}
            </div>
          </div>
          <div className="text-sm text-slate-600">
            {course.hole_count} huller
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {holes.map((hole) => (
            <button
              key={hole.hole_id}
              onClick={() => setSelectedHole(hole)}
              className={`aspect-square rounded-lg border-2 transition-all font-bold text-lg flex flex-col items-center justify-center gap-1 p-2 ${
                hole.notes || hole.disc_colors.length > 0
                  ? 'bg-blue-100 border-blue-600 text-blue-800 hover:bg-blue-200'
                  : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
              }`}
            >
              <span>{hole.hole_number}</span>
              {hole.disc_colors.length > 0 && (
                <div className="flex gap-0.5">
                  {hole.disc_colors.slice(0, 2).map((color, idx) => (
                    <div
                      key={idx}
                      className="w-3 h-3 rounded-full border border-slate-400"
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

interface HoleDetailPageProps {
  hole: CourseHole;
  courseName: string;
  courseId: number;
  allHoles: CourseHole[];
  onBack: () => void;
  onUpdate: () => void;
  onSelectHole: (hole: CourseHole) => void;
}

function HoleDetailPage({ hole, courseName, courseId, allHoles, onBack, onUpdate, onSelectHole }: HoleDetailPageProps) {
  const { user } = useUser();
  const [notes, setNotes] = useState(hole.notes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [holeDiscs, setHoleDiscs] = useState<Disc[]>([]);
  const [availableDiscs, setAvailableDiscs] = useState<Disc[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [hole.hole_id]);

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

      const { data: holeDiscIds, error: holeDiscsError } = await supabase
        .from('hole_discs')
        .select('disc_id')
        .eq('hole_id', hole.hole_id);

      if (holeDiscsError) throw holeDiscsError;

      const holeDiscIdSet = new Set(holeDiscIds?.map(hd => hd.disc_id) || []);
      const assigned = allDiscs?.filter(d => holeDiscIdSet.has(d.disc_id)) || [];
      const available = allDiscs?.filter(d => !holeDiscIdSet.has(d.disc_id)) || [];

      setHoleDiscs(assigned);
      setAvailableDiscs(available);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('course_holes')
        .update({ notes: notes.trim() || null })
        .eq('hole_id', hole.hole_id);

      if (error) throw error;

      await supabase
        .from('courses')
        .update({ updated_at: new Date().toISOString() })
        .eq('course_id', courseId);

      await new Promise(resolve => setTimeout(resolve, 1000));

      onUpdate();
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDisc = async (disc: Disc) => {
    try {
      const { error } = await supabase
        .from('hole_discs')
        .insert({
          hole_id: hole.hole_id,
          disc_id: disc.disc_id
        });

      if (error) throw error;

      await supabase
        .from('courses')
        .update({ updated_at: new Date().toISOString() })
        .eq('course_id', courseId);

      await loadData();
    } catch (error) {
      console.error('Error adding disc:', error);
    }
  };

  const handleRemoveDisc = async (disc: Disc) => {
    try {
      const { error } = await supabase
        .from('hole_discs')
        .delete()
        .eq('hole_id', hole.hole_id)
        .eq('disc_id', disc.disc_id);

      if (error) throw error;

      await supabase
        .from('courses')
        .update({ updated_at: new Date().toISOString() })
        .eq('course_id', courseId);

      await loadData();
    } catch (error) {
      console.error('Error removing disc:', error);
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
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="text-slate-600 hover:text-slate-800 transition-colors"
                title="Tilbage til oversigt"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Hul {hole.hole_number}
                </h1>
                <p className="text-sm text-slate-600">{courseName}</p>
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
                title="Forrige hul"
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
                title="Næste hul"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Noter
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none resize-none"
              placeholder="f.eks. Kastet med anhyzer, speed 7"
            />
            <button
              onClick={handleSaveNotes}
              disabled={isSaving}
              className="mt-3 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Gemmer...' : 'Gem noter'}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Valgte discs ({holeDiscs.length})
            </h2>
            {holeDiscs.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Ingen discs valgt endnu
              </div>
            ) : (
              <div className="space-y-2">
                {holeDiscs.map((disc) => (
                  <div
                    key={disc.disc_id}
                    className="flex items-center justify-between border border-slate-200 rounded-lg p-3 gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {disc.color && (
                        <div
                          className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0"
                          style={{ backgroundColor: disc.color }}
                          title={disc.color}
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{disc.name}</div>
                        <div className="text-xs text-slate-600">
                          {disc.personal_speed ?? disc.speed} | {disc.personal_glide ?? disc.glide} | {disc.personal_turn ?? disc.turn} | {disc.personal_fade ?? disc.fade}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDisc(disc)}
                      className="text-slate-400 hover:text-red-600 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
              <div className="text-center py-8 text-slate-500 text-sm">
                Alle discs er valgt
              </div>
            ) : (
              <div className="space-y-2">
                {availableDiscs.map((disc) => (
                  <div
                    key={disc.disc_id}
                    className="flex items-center justify-between border border-slate-200 rounded-lg p-3 gap-3"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {disc.color && (
                        <div
                          className="w-6 h-6 rounded-full border-2 border-slate-300 flex-shrink-0"
                          style={{ backgroundColor: disc.color }}
                          title={disc.color}
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-slate-800">{disc.name}</div>
                        <div className="text-xs text-slate-600">
                          {disc.personal_speed ?? disc.speed} | {disc.personal_glide ?? disc.glide} | {disc.personal_turn ?? disc.turn} | {disc.personal_fade ?? disc.fade}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddDisc(disc)}
                      className="text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
