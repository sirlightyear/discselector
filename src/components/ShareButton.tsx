import { useState } from 'react';
import { Share2, Check, Copy as CopyIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ShareButtonProps {
  type: 'bag' | 'course' | 'collection';
  itemId?: number;
  userId?: string;
  isShared: boolean;
  shareToken?: string | null;
  onUpdate: () => void;
}

export function ShareButton({ type, itemId, userId, isShared, shareToken, onUpdate }: ShareButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggleShare = async () => {
    try {
      const newToken = !isShared ? crypto.randomUUID() : null;
      const newIsShared = !isShared;

      if (type === 'bag' && itemId) {
        await supabase
          .from('bags')
          .update({
            is_public: newIsShared,
            share_token: newToken
          })
          .eq('bag_id', itemId);
      } else if (type === 'course' && itemId) {
        await supabase
          .from('courses')
          .update({
            is_shared: newIsShared
          })
          .eq('course_id', itemId);
      } else if (type === 'collection' && userId) {
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();

        if (!settings) {
          await supabase
            .from('user_settings')
            .insert({
              user_id: userId,
              share_collection: newIsShared,
              share_token: newToken
            });
        } else {
          await supabase
            .from('user_settings')
            .update({
              share_collection: newIsShared,
              share_token: newToken
            })
            .eq('user_id', userId);
        }
      }

      onUpdate();
    } catch (error) {
      console.error('Error toggling share:', error);
    }
  };

  const handleCopyLink = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/share/${type}?token=${shareToken}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isShared
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
        title={isShared ? 'Delt offentligt' : 'Del'}
      >
        <Share2 className="w-4 h-4" />
        {isShared ? 'Delt' : 'Del'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">
              Del {type === 'bag' ? 'bag' : type === 'course' ? 'bane' : 'samling'}
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="share-toggle"
                  checked={isShared}
                  onChange={handleToggleShare}
                  className="mt-1"
                />
                <label htmlFor="share-toggle" className="flex-1 cursor-pointer">
                  <div className="font-medium text-slate-800">
                    Del offentligt
                  </div>
                  <div className="text-sm text-slate-600">
                    Alle med linket kan se {type === 'bag' ? 'denne bag' : type === 'course' ? 'denne bane' : 'din samling'} uden at være logget ind
                  </div>
                </label>
              </div>

              {isShared && shareToken && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-slate-700 mb-2">
                    Delings-link
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${window.location.origin}/share/${type}?token=${shareToken}`}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                      {copied ? 'Kopieret!' : 'Kopier'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
              >
                Luk
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
