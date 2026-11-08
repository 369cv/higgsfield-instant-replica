import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { VaultItem } from '../types';

const InstagramIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

interface BufferPost {
  id: string;
  channel: string;
  handle: string;
  imageUrl: string;
  caption: string;
  scheduledTime: string;
  status: 'queued' | 'published';
}

interface BufferQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem?: VaultItem | null;
}

export const BufferQueueModal: React.FC<BufferQueueModalProps> = ({ isOpen, onClose, activeItem }) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'compose'>('queue');

  // Initial mockup of scheduled posts
  const [queue, setQueue] = useState<BufferPost[]>([
    {
      id: 'buf-1',
      channel: 'Instagram',
      handle: '@savage_mode',
      imageUrl: 'https://storage.googleapis.com/antigravity-media/higgsfield/0053510b-801a-4712-ae6a-b28ec4b953c8.webp',
      caption: 'When it’s your turn, don’t feel bad. Go full savage mode. #HalalFans #ModestFashion #Nightlife',
      scheduledTime: 'Tomorrow at 6:30 PM',
      status: 'queued'
    },
    {
      id: 'buf-2',
      channel: 'Instagram',
      handle: '@savage_mode',
      imageUrl: 'https://storage.googleapis.com/antigravity-media/higgsfield/005a76c8-500b-4770-b74c-47bc63aa9a4a.webp',
      caption: 'Golden hour reflections in luxury silk abaya. Direct from Halal Fans Soul studio. #Elegance #Editorial',
      scheduledTime: 'Nov 10 at 12:00 PM',
      status: 'queued'
    }
  ]);

  const [composerCaption, setComposerCaption] = useState(
    activeItem ? `${activeItem.prompt.slice(0, 140)}... #HalalFans #Soul` : ''
  );
  const [scheduledSlot, setScheduledSlot] = useState('Tomorrow at 8:00 PM');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddPost = () => {
    if (!composerCaption.trim()) return;
    const newPost: BufferPost = {
      id: `buf-${Date.now()}`,
      channel: 'Instagram',
      handle: '@savage_mode',
      imageUrl: activeItem?.imageUrl || queue[0]?.imageUrl || '',
      caption: composerCaption,
      scheduledTime: scheduledSlot,
      status: 'queued'
    };
    setQueue([newPost, ...queue]);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setActiveTab('queue');
    }, 1200);
  };

  const handleDeletePost = (id: string) => {
    setQueue(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-[#141416] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#d1fe17]/20 border border-[#d1fe17]/30 flex items-center justify-center text-[#d1fe17]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Scheduled Content</h2>
              <p className="text-xs text-neutral-400">Buffer Instagram Dispatcher · @savage_mode</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setActiveTab('queue')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'queue' ? 'bg-white/15 text-white' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Queue ({queue.length})
              </button>
              <button
                onClick={() => setActiveTab('compose')}
                className={`px-3 py-1 rounded-md font-medium transition-colors ${
                  activeTab === 'compose' ? 'bg-[#d1fe17] text-black font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                + New Post
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {activeTab === 'queue' ? (
            <div className="space-y-4">
              {queue.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No posts currently scheduled in Buffer queue.</p>
                  <button
                    onClick={() => setActiveTab('compose')}
                    className="mt-4 px-4 py-2 bg-[#d1fe17] hover:bg-[#bfee00] text-black text-xs font-bold rounded-xl"
                  >
                    Schedule First Post
                  </button>
                </div>
              ) : (
                queue.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-xl bg-[#1c1c1f] border border-white/5 flex gap-4 items-start hover:border-white/10 transition-colors"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-black flex-shrink-0 border border-white/10">
                      <img
                        src={post.imageUrl}
                        alt="Queued drop"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/influencer-avatar.png';
                        }}
                      />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <InstagramIcon className="w-3.5 h-3.5 text-pink-400" />
                          <span className="font-semibold text-white">{post.handle}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#d1fe17] font-medium bg-[#d1fe17]/10 px-2 py-0.5 rounded">
                          <Clock className="w-3 h-3" />
                          <span>{post.scheduledTime}</span>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
                        {post.caption}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-[10px] text-neutral-500 uppercase font-semibold">
                          Synced with Buffer API
                        </span>
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-neutral-400 hover:text-red-400 p-1 transition-colors"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Compose Tab */
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Instagram Caption & Tags
                </label>
                <textarea
                  rows={4}
                  value={composerCaption}
                  onChange={(e) => setComposerCaption(e.target.value)}
                  placeholder="Write your Instagram caption..."
                  className="w-full p-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#d1fe17] transition-colors resize-none"
                />
              </div>

              {/* Hashtag suggestions */}
              <div>
                <label className="text-xs font-semibold text-neutral-400 mb-1.5 block">
                  Suggested Hashtags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {['#HalalFans', '#ModestLuxury', '#AIInfluencer', '#Soul20', '#VirtualModel', '#DubaiFashion'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setComposerCaption(prev => `${prev} ${tag}`)}
                      className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-neutral-300 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time slot */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                  Buffer Queue Slot
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {['Tomorrow at 12:00 PM', 'Tomorrow at 6:30 PM', 'Nov 10 at 8:00 PM', 'Nov 11 at 10:00 AM'].map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setScheduledSlot(slot)}
                      className={`p-2.5 rounded-xl border text-left transition-colors ${
                        scheduledSlot === slot
                          ? 'border-[#d1fe17] bg-[#d1fe17]/10 text-white font-medium'
                          : 'border-white/10 bg-white/5 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleAddPost}
                  disabled={isSuccess}
                  className="w-full py-3 bg-[#d1fe17] hover:bg-[#bfee00] text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-lg shadow-[#d1fe17]/20"
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Scheduled to Buffer!</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Schedule Post to Instagram</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
