import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, Link as LinkIcon, Share2, Star, GripVertical, ExternalLink } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { supabase } from '../lib/supabase';
import { LinkGroup, Link, LinkGroupInsert, LinkInsert } from '../lib/database.types';

type GroupWithLinks = LinkGroup & { links: Link[] };

const DEFAULT_GROUPS = [
  'Forhånd',
  'Baghånd',
  'Putting',
  'Roller',
  'Approach',
  'Mental game',
  'Distance tips'
];

export function LinksPage() {
  const { user } = useUser();
  const [groups, setGroups] = useState<GroupWithLinks[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<LinkGroup | null>(null);
  const [addingLinkToGroup, setAddingLinkToGroup] = useState<number | null>(null);
  const [editingLink, setEditingLink] = useState<Link | null>(null);

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { data: groupsData, error: groupsError } = await supabase
        .from('link_groups')
        .select('*')
        .eq('user_id', user.user_id)
        .order('position');

      if (groupsError) throw groupsError;

      if (!groupsData || groupsData.length === 0) {
        await createDefaultGroups();
        return loadGroups();
      }

      const groupsWithLinks: GroupWithLinks[] = await Promise.all(
        groupsData.map(async (group) => {
          const { data: linksData } = await supabase
            .from('links')
            .select('*')
            .eq('group_id', group.group_id)
            .order('is_favorite', { ascending: false })
            .order('position');

          return { ...group, links: linksData || [] };
        })
      );

      setGroups(groupsWithLinks);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createDefaultGroups = async () => {
    if (!user) return;

    try {
      const groupInserts: LinkGroupInsert[] = DEFAULT_GROUPS.map((name, index) => ({
        user_id: user.user_id,
        name,
        position: index
      }));

      const { error } = await supabase.from('link_groups').insert(groupInserts);

      if (error) {
        console.error('Error creating default groups:', error);
      }
    } catch (error) {
      console.error('Error creating default groups:', error);
    }
  };

  const handleAddGroup = async (name: string) => {
    if (!user) return;

    try {
      const maxPosition = Math.max(...groups.map(g => g.position), -1);

      const { data, error } = await supabase.from('link_groups').insert({
        user_id: user.user_id,
        name: name.trim(),
        position: maxPosition + 1
      }).select();

      if (error) {
        console.error('Error adding group:', error);
        alert('Kunne ikke oprette gruppe: ' + error.message);
        return;
      }

      console.log('Group created:', data);
      await loadGroups();
      setShowAddGroupModal(false);
    } catch (error) {
      console.error('Error adding group:', error);
      alert('Kunne ikke oprette gruppe');
    }
  };

  const handleUpdateGroup = async (groupId: number, name: string) => {
    try {
      await supabase
        .from('link_groups')
        .update({ name: name.trim() })
        .eq('group_id', groupId);

      await loadGroups();
      setEditingGroup(null);
    } catch (error) {
      console.error('Error updating group:', error);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Er du sikker på at du vil slette denne gruppe og alle dens links?')) return;

    try {
      await supabase
        .from('link_groups')
        .delete()
        .eq('group_id', groupId);

      await loadGroups();
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const normalizeUrl = (url: string): string => {
    let normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = 'https://' + normalized;
    }
    return normalized;
  };

  const handleAddLink = async (groupId: number, url: string, description: string) => {
    try {
      const group = groups.find(g => g.group_id === groupId);
      const maxPosition = group ? Math.max(...group.links.map(l => l.position), -1) : -1;

      await supabase.from('links').insert({
        group_id: groupId,
        url: normalizeUrl(url),
        description: description.trim() || null,
        position: maxPosition + 1
      });

      await loadGroups();
      setAddingLinkToGroup(null);
    } catch (error) {
      console.error('Error adding link:', error);
    }
  };

  const handleUpdateLink = async (linkId: number, url: string, description: string) => {
    try {
      await supabase
        .from('links')
        .update({
          url: normalizeUrl(url),
          description: description.trim() || null
        })
        .eq('link_id', linkId);

      await loadGroups();
      setEditingLink(null);
    } catch (error) {
      console.error('Error updating link:', error);
    }
  };

  const handleDeleteLink = async (linkId: number) => {
    if (!confirm('Er du sikker på at du vil slette dette link?')) return;

    try {
      await supabase
        .from('links')
        .delete()
        .eq('link_id', linkId);

      await loadGroups();
    } catch (error) {
      console.error('Error deleting link:', error);
    }
  };

  const handleToggleFavorite = async (link: Link) => {
    try {
      await supabase
        .from('links')
        .update({ is_favorite: !link.is_favorite })
        .eq('link_id', link.link_id);

      await loadGroups();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const filteredGroups = groups.map(group => ({
    ...group,
    links: group.links.filter(link =>
      searchQuery === '' ||
      link.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      link.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(group => searchQuery === '' || group.links.length > 0);

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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-800">Links & Guides</h1>
          <button
            onClick={() => setShowAddGroupModal(true)}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ny gruppe
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søg i links..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
            />
          </div>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 mb-4">
              {searchQuery ? 'Ingen links matcher din søgning' : 'Ingen grupper endnu'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredGroups.map((group) => (
              <div key={group.group_id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-800">{group.name}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAddingLinkToGroup(group.group_id)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                      title="Tilføj link"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setEditingGroup(group)}
                      className="text-slate-600 hover:text-slate-700 transition-colors"
                      title="Rediger gruppe"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGroup(group.group_id)}
                      className="text-slate-600 hover:text-red-600 transition-colors"
                      title="Slet gruppe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {group.links.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    Ingen links i denne gruppe
                  </div>
                ) : (
                  <div className="space-y-2">
                    {group.links.map((link) => (
                      <div
                        key={link.link_id}
                        className="flex items-center gap-3 border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors"
                      >
                        <button
                          onClick={() => handleToggleFavorite(link)}
                          className={`flex-shrink-0 ${
                            link.is_favorite ? 'text-yellow-500' : 'text-slate-300'
                          } hover:text-yellow-500 transition-colors`}
                          title={link.is_favorite ? 'Fjern favorit' : 'Marker som favorit'}
                        >
                          <Star className="w-4 h-4" fill={link.is_favorite ? 'currentColor' : 'none'} />
                        </button>

                        <div className="flex-1 min-w-0">
                          {link.description && (
                            <div className="font-medium text-slate-800 truncate">
                              {link.description}
                            </div>
                          )}
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-700 truncate block flex items-center gap-1"
                          >
                            <LinkIcon className="w-3 h-3 flex-shrink-0" />
                            {link.url}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => setEditingLink(link)}
                            className="text-slate-400 hover:text-slate-600 transition-colors"
                            title="Rediger"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLink(link.link_id)}
                            className="text-slate-400 hover:text-red-600 transition-colors"
                            title="Slet"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddGroupModal && (
        <AddGroupModal
          onClose={() => setShowAddGroupModal(false)}
          onSave={handleAddGroup}
        />
      )}

      {editingGroup && (
        <EditGroupModal
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onSave={(name) => handleUpdateGroup(editingGroup.group_id, name)}
        />
      )}

      {addingLinkToGroup && (
        <AddLinkModal
          groupId={addingLinkToGroup}
          onClose={() => setAddingLinkToGroup(null)}
          onSave={handleAddLink}
        />
      )}

      {editingLink && (
        <EditLinkModal
          link={editingLink}
          onClose={() => setEditingLink(null)}
          onSave={(url, description) => handleUpdateLink(editingLink.link_id, url, description)}
        />
      )}
    </div>
  );
}

interface AddGroupModalProps {
  onClose: () => void;
  onSave: (name: string) => void;
}

function AddGroupModal({ onClose, onSave }: AddGroupModalProps) {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Ny gruppe</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gruppenavn
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="fx Putting"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Gem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditGroupModalProps {
  group: LinkGroup;
  onClose: () => void;
  onSave: (name: string) => void;
}

function EditGroupModal({ group, onClose, onSave }: EditGroupModalProps) {
  const [name, setName] = useState(group.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Rediger gruppe</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Gruppenavn
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Gem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddLinkModalProps {
  groupId: number;
  onClose: () => void;
  onSave: (groupId: number, url: string, description: string) => void;
}

function AddLinkModal({ groupId, onClose, onSave }: AddLinkModalProps) {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSave(groupId, url, description);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Tilføj link</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="youtube.com/watch?v=..."
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
              autoFocus
            />
            <p className="text-xs text-slate-500 mt-1">
              https:// tilføjes automatisk hvis det mangler
            </p>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Beskrivelse (valgfrit)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="fx God guide til forhåndskast"
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Gem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EditLinkModalProps {
  link: Link;
  onClose: () => void;
  onSave: (url: string, description: string) => void;
}

function EditLinkModal({ link, onClose, onSave }: EditLinkModalProps) {
  const [url, setUrl] = useState(link.url);
  const [description, setDescription] = useState(link.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSave(url, description);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Rediger link</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Beskrivelse (valgfrit)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-opacity-20 outline-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Annuller
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Gem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
