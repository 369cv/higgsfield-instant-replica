import React, { useEffect, useState } from 'react';
import { ImagePlus, Shuffle, Sparkles, Video, Images, X, Palette, ChevronRight, Upload, Check } from 'lucide-react';
import { TRAITS, TRAIT_SECTIONS, TraitSelection, isTraitVisible, randomSelection } from './traits';
import { TraitAccordion, SelectPopover, Dropzone } from './controls';
import { PRESET_TRAITS } from './presetTraits';
import { MOTION_MODELS, QUALITIES, Quality, STYLE_PRESETS, CHARACTER_PRESETS, presetFace } from './catalog';
import { Sheet, Switch, toast } from '../../components/ui';

/* ============================================================
 * Create Influencer
 * ============================================================ */

interface BuilderPanelProps {
  selection: TraitSelection;
  onChange: (s: TraitSelection) => void;
  photo: string | null;
  onPhoto: (url: string | null) => void;
  presetId: string | null;
  onPreset: (id: string | null) => void;
  onGenerate: () => void;
}

export const BuilderPanel: React.FC<BuilderPanelProps> = ({
  selection,
  onChange,
  photo,
  onPhoto,
  presetId,
  onPreset,
  onGenerate,
}) => {
  const [openId, setOpenId] = useState<string | null>(TRAITS[0].id);
  const [allPresets, setAllPresets] = useState(false);
  const [nicheFilter, setNicheFilter] = useState<string | null>(null);
  const niches = TRAITS.find((t) => t.id === 'niche')!.options.map((o) => o.value).filter((n) => CHARACTER_PRESETS.some((p) => PRESET_TRAITS[p.id]?.niche?.[0] === n));
  const filteredPresets = nicheFilter ? CHARACTER_PRESETS.filter((p) => PRESET_TRAITS[p.id]?.niche?.[0] === nicheFilter) : CHARACTER_PRESETS;
  const preset = CHARACTER_PRESETS.find((p) => p.id === presetId) || null;
  // Show the selected preset first in the strip.
  const strip = preset ? [preset, ...CHARACTER_PRESETS.filter((p) => p.id !== preset.id)] : CHARACTER_PRESETS;
  const pickPreset = (id: string) => {
    if (id === presetId) return onPreset(null);
    if (photo) {
      URL.revokeObjectURL(photo);
      onPhoto(null);
    }
    onPreset(id);
  };

  const select = (traitId: string, value: string) => {
    const t = TRAITS.find((x) => x.id === traitId)!;
    const cur = selection[traitId] || [];
    let next: string[];
    if (t.multi) {
      if (cur.includes(value)) next = cur.filter((v) => v !== value);
      else if (t.max && cur.length >= t.max) {
        toast(`Up to ${t.max} ${t.label.toLowerCase()}`);
        return;
      } else next = [...cur, value];
    }
    else next = cur[0] === value ? [] : [value];
    onChange({ ...selection, [traitId]: next });
  };

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-2">
        {/* Preset characters */}
        <section className="rounded-xl bg-surface border border-white/[0.06] p-2.5">
          <div className="flex items-center justify-between px-1 pb-2">
            <span className="text-[13px] font-medium text-white">
              Start from a preset <span className="text-neutral-500 font-normal">· {CHARACTER_PRESETS.length}</span>
            </span>
            <button type="button" onClick={() => setAllPresets(true)} className="text-[12px] text-neutral-400 hover:text-white cursor-pointer">
              See all
            </button>
          </div>
          <div role="radiogroup" aria-label="Preset characters" className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
            {strip.slice(0, 12).map((p) => (
              <PresetTile key={p.id} id={p.id} name={p.name} active={p.id === presetId} onClick={() => pickPreset(p.id)} />
            ))}
          </div>
          {preset && (
            <p className="px-1 pt-2 text-[12px] text-accent-ink">
              Base: {preset.name} ·{' '}
              <button type="button" onClick={() => onPreset(null)} className="underline cursor-pointer">
                clear
              </button>
            </p>
          )}
        </section>

        {/* Photo upload (optional identity base) */}
        <Dropzone
          accept="image/*"
          icon={<ImagePlus className="w-4 h-4" />}
          title={photo ? 'Replace your photo' : 'Upload your photo'}
          hint="Optional · used as the face identity"
          onFiles={(files) => {
            const f = files.find((x) => x.type.startsWith('image/'));
            if (!f) return toast('Please choose an image');
            if (photo) URL.revokeObjectURL(photo);
            onPreset(null);
            onPhoto(URL.createObjectURL(f));
          }}
        >
          {photo && (
            <div className="px-3 pb-3 flex items-center gap-2">
              <img src={photo} alt="Your photo" className="w-12 h-12 rounded-lg object-cover" />
              <span className="flex-1 text-[12px] text-neutral-400">Photo added</span>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(photo);
                  onPhoto(null);
                }}
                className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-neutral-400 cursor-pointer"
                aria-label="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </Dropzone>

        {TRAIT_SECTIONS.map((sec) => (
          <div key={sec.id} className="space-y-2">
            <div className="px-1 pt-2 flex items-baseline gap-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-neutral-300">{sec.label}</h3>
              <span className="text-[11px] text-neutral-500">{sec.hint}</span>
            </div>
            {TRAITS.filter((t) => t.section === sec.id && isTraitVisible(t, selection)).map((t) => (
              <TraitAccordion
                key={t.id}
                trait={t}
                selected={selection[t.id] || []}
                open={openId === t.id}
                onToggleOpen={() => setOpenId(openId === t.id ? null : t.id)}
                onSelect={(v) => select(t.id, v)}
              />
            ))}
          </div>
        ))}
      </div>

      <Sheet open={allPresets} title="Preset characters" onClose={() => setAllPresets(false)}>
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-3" role="group" aria-label="Filter by niche">
          {[null, ...niches].map((n) => (
            <button
              key={n || 'all'}
              type="button"
              onClick={() => setNicheFilter(n)}
              aria-pressed={nicheFilter === n}
              className={`shrink-0 h-8 px-3 rounded-full text-[12px] cursor-pointer ${
                nicheFilter === n ? 'bg-[#d1fe17] text-black font-semibold' : 'bg-white/[0.06] text-neutral-300 hover:bg-white/10'
              }`}
            >
              {n || `All · ${CHARACTER_PRESETS.length}`}
            </button>
          ))}
        </div>
        <div role="radiogroup" aria-label="All preset characters" className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {filteredPresets.map((p) => (
            <PresetTile
              key={p.id}
              id={p.id}
              name={p.name}
              wide
              active={p.id === presetId}
              onClick={() => {
                pickPreset(p.id);
                setAllPresets(false);
              }}
            />
          ))}
        </div>
      </Sheet>

      <div className="shrink-0 p-3 border-t border-white/[0.06] flex gap-2">
        <button
          type="button"
          onClick={() => {
            onChange(randomSelection());
            toast('Randomized');
          }}
          className="w-12 h-12 rounded-xl bg-white/[0.06] hover:bg-white/10 flex items-center justify-center text-white cursor-pointer active:scale-95"
          aria-label="Randomize all traits"
          title="Randomize"
        >
          <Shuffle className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={onGenerate}
          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#e4ff3a] to-[#c3f000] text-black font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] shadow-[0_0_20px_rgba(209,254,23,0.25)]"
        >
          <Sparkles className="w-4 h-4" /> Generate
        </button>
      </div>
    </>
  );
};

const PresetTile: React.FC<{ id: string; name: string; active: boolean; onClick: () => void; wide?: boolean }> = ({
  id,
  name,
  active,
  onClick,
  wide,
}) => (
  <button
    type="button"
    role="radio"
    aria-checked={active}
    aria-label={name}
    onClick={onClick}
    className={`theme-dark relative shrink-0 ${wide ? 'w-full' : 'w-[76px]'} aspect-[4/5] rounded-lg overflow-hidden border-2 bg-neutral-100 cursor-pointer transition-all ${
      active ? 'border-[#d1fe17] scale-[1.02]' : 'border-transparent hover:border-white/20'
    }`}
  >
    <img src={presetFace(id)} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover object-top" />
    <span className="absolute inset-x-0 bottom-0 px-1 py-1 text-[10px] leading-tight font-medium text-white bg-gradient-to-t from-black/80 to-transparent truncate">
      {name}
    </span>
    {active && (
      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#d1fe17] text-black flex items-center justify-center">
        <Check className="w-3 h-3" strokeWidth={3} />
      </span>
    )}
  </button>
);

/* ============================================================
 * Motion
 * ============================================================ */

export interface MotionState {
  mode: 'Motion transfer' | 'Objects swap';
  styleId: string;
  customStyle: string | null;
  video: { url: string; seconds: number } | null;
  images: string[];
  model: string;
  quality: Quality;
  usePrompt: boolean;
  prompt: string;
}

export const initialMotion = (): MotionState => ({
  mode: 'Motion transfer',
  styleId: 'none',
  customStyle: null,
  video: null,
  images: [],
  model: MOTION_MODELS[0].id,
  quality: '1080p',
  usePrompt: false,
  prompt: '',
});

interface MotionPanelProps {
  state: MotionState;
  onChange: (s: MotionState) => void;
  onGenerate: () => void;
  characterLabel?: string | null; // when sent from a character sheet
}

const MAX_IMAGES = 30;

export const MotionPanel: React.FC<MotionPanelProps> = ({ state, onChange, onGenerate, characterLabel }) => {
  const [styleOpen, setStyleOpen] = useState(false);
  const [styleTab, setStyleTab] = useState<'Presets' | 'Custom'>('Presets');
  const set = (patch: Partial<MotionState>) => onChange({ ...state, ...patch });
  const style = STYLE_PRESETS.find((s) => s.id === state.styleId);
  const model = MOTION_MODELS.find((m) => m.id === state.model) || MOTION_MODELS[0];

  // Clamp quality to the model's max resolution.
  useEffect(() => {
    const max = QUALITIES.indexOf(model.maxRes as Quality);
    if (QUALITIES.indexOf(state.quality) > max) set({ quality: QUALITIES[max] });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.model]);

  const addVideo = (files: File[]) => {
    const f = files.find((x) => x.type.startsWith('video/'));
    if (!f) return toast('Please choose a video file');
    const url = URL.createObjectURL(f);
    const v = document.createElement('video');
    v.preload = 'metadata';
    v.onloadedmetadata = () => {
      const s = v.duration;
      if (!isFinite(s) || s < 4 || s > 30) {
        URL.revokeObjectURL(url);
        toast(`Video must be 4–30 seconds (yours is ${isFinite(s) ? s.toFixed(1) : '?'}s)`);
        return;
      }
      if (state.video) URL.revokeObjectURL(state.video.url);
      set({ video: { url, seconds: Math.round(s * 10) / 10 } });
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      toast('Could not read that video');
    };
    v.src = url;
  };

  const addImages = (files: File[]) => {
    const imgs = files.filter((x) => x.type.startsWith('image/'));
    const room = MAX_IMAGES - state.images.length;
    if (room <= 0) return toast(`Up to ${MAX_IMAGES} images`);
    if (imgs.length > room) toast(`Only ${room} more image${room === 1 ? '' : 's'} fit`);
    set({ images: [...state.images, ...imgs.slice(0, room).map((f) => URL.createObjectURL(f))] });
  };

  const canGenerate = !!state.video && (state.images.length > 0 || !!characterLabel);

  return (
    <>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3 space-y-2">
        {/* Mode */}
        <div role="radiogroup" aria-label="Motion mode" className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-surface border border-white/[0.06]">
          {(['Motion transfer', 'Objects swap'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={state.mode === m}
              onClick={() => set({ mode: m })}
              className={`h-9 rounded-lg text-[12.5px] font-medium cursor-pointer ${
                state.mode === m ? 'bg-white/10 text-white' : 'text-neutral-500 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="px-1 text-[11.5px] text-neutral-500 leading-snug">
          {state.mode === 'Motion transfer'
            ? 'Your character performs the motion from the reference video.'
            : 'Swap the characters, products or clothes in the reference video with yours.'}
        </p>

        {/* Style */}
        <button
          type="button"
          onClick={() => setStyleOpen(true)}
          className="w-full rounded-xl bg-surface border border-white/[0.06] px-3.5 py-2.5 flex items-center gap-3 text-left cursor-pointer hover:bg-white/[0.03]"
        >
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6d28d9] via-[#db2777] to-[#2dd4bf] flex items-center justify-center text-[#ffffff] shrink-0 overflow-hidden">
            {state.customStyle ? <img src={state.customStyle} alt="" className="w-full h-full object-cover" /> : <Palette className="w-4 h-4" />}
          </span>
          <span className="flex-1">
            <span className="block text-[11px] text-neutral-500">Style</span>
            <span className="block text-[13px] font-medium text-white">{state.customStyle ? 'Custom style' : style?.name}</span>
          </span>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </button>

        {/* Reference video */}
        <Dropzone
          accept="video/*"
          icon={<Video className="w-4 h-4" />}
          title={state.video ? 'Replace reference video' : 'Add a reference video'}
          hint={state.mode === 'Motion transfer' ? 'Motion is extracted from it · 4–30 seconds' : 'The video to edit · 4–30 seconds'}
          onFiles={addVideo}
        >
          {state.video && (
            <div className="px-3 pb-3 flex items-center gap-2">
              <video src={state.video.url} muted playsInline className="w-16 h-10 rounded-md object-cover bg-black" />
              <span className="flex-1 text-[12px] text-neutral-400">{state.video.seconds}s video</span>
              <button
                type="button"
                onClick={() => {
                  URL.revokeObjectURL(state.video!.url);
                  set({ video: null });
                }}
                className="w-7 h-7 rounded-full bg-white/[0.06] flex items-center justify-center text-neutral-400 cursor-pointer"
                aria-label="Remove video"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </Dropzone>

        {/* Characters / products / clothes */}
        <Dropzone
          accept="image/*"
          multiple
          icon={<Images className="w-4 h-4" />}
          title="Add your characters, products or clothes"
          hint={`Up to ${MAX_IMAGES} images · reference them as @image1, @image2…`}
          onFiles={addImages}
        >
          {characterLabel && (
            <div className="px-3 pb-2 text-[12px] text-accent-ink">Using character: {characterLabel}</div>
          )}
          {state.images.length > 0 && (
            <div className="px-3 pb-3 grid grid-cols-5 gap-1.5">
              {state.images.map((src, i) => (
                <div key={src} className="relative aspect-square rounded-md overflow-hidden bg-black">
                  <img src={src} alt={`@image${i + 1}`} className="w-full h-full object-cover" />
                  <span className="theme-dark absolute bottom-0 inset-x-0 text-[9px] text-center bg-black/60 text-white">@image{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(src);
                      set({ images: state.images.filter((x) => x !== src) });
                    }}
                    className="theme-dark absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center"
                    aria-label={`Remove @image${i + 1}`}
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Dropzone>

        <SelectPopover
          label="Model"
          value={state.model}
          searchable
          onChange={(v) => set({ model: v })}
          options={MOTION_MODELS.map((m) => ({ value: m.id, label: m.name, description: m.description, badges: [m.maxRes, m.duration] }))}
        />

        {/* Prompt */}
        <div className="rounded-xl bg-surface border border-white/[0.06]">
          <div className="px-3.5 h-11 flex items-center justify-between">
            <span className="text-[13px] font-medium text-white">Prompt</span>
            <Switch label="Use a prompt" checked={state.usePrompt} onChange={(v) => set({ usePrompt: v })} />
          </div>
          {state.usePrompt && (
            <div className="px-3 pb-3">
              <textarea
                value={state.prompt}
                onChange={(e) => set({ prompt: e.target.value })}
                rows={4}
                maxLength={1500}
                placeholder="Describe your new scene. Reference attachments with @image1…"
                className="w-full rounded-lg bg-white/[0.04] border border-white/[0.08] p-2.5 text-[13px] text-white placeholder-neutral-500 focus:outline-none focus:border-[#d1fe17] resize-none"
              />
            </div>
          )}
        </div>

        <SelectPopover
          label="Quality"
          value={state.quality}
          onChange={(v) => set({ quality: v as Quality })}
          options={QUALITIES.filter((q) => QUALITIES.indexOf(q) <= QUALITIES.indexOf(model.maxRes as Quality)).map((q) => ({
            value: q,
            label: q,
          }))}
        />
      </div>

      <div className="shrink-0 p-3 border-t border-white/[0.06]">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#e4ff3a] to-[#c3f000] text-black font-bold text-[15px] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4" /> Generate
        </button>
        {!canGenerate && (
          <p className="mt-1.5 text-center text-[11px] text-neutral-500">
            Add a reference video and at least one image{characterLabel ? '' : ' or character'}.
          </p>
        )}
      </div>

      {/* Style picker */}
      <Sheet open={styleOpen} title="Style" onClose={() => setStyleOpen(false)}>
        <div role="tablist" className="grid grid-cols-2 gap-1 p-1 mb-3 rounded-xl bg-surface">
          {(['Presets', 'Custom'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={styleTab === t}
              onClick={() => setStyleTab(t)}
              className={`h-8 rounded-lg text-[13px] cursor-pointer ${styleTab === t ? 'bg-white/10 text-white font-medium' : 'text-neutral-500'}`}
            >
              {t}
            </button>
          ))}
        </div>
        {styleTab === 'Presets' ? (
          <div className="grid grid-cols-3 gap-2">
            {STYLE_PRESETS.map((s) => {
              const active = !state.customStyle && state.styleId === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    set({ styleId: s.id, customStyle: null });
                    setStyleOpen(false);
                  }}
                  className={`aspect-square rounded-xl border-2 p-2 flex items-end text-left text-[12px] font-medium cursor-pointer overflow-hidden relative ${
                    active ? 'border-[#d1fe17]' : 'border-transparent bg-surface hover:bg-white/[0.04]'
                  }`}
                >
                  {s.image && <img src={s.image} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                  <span className={`relative ${s.image ? 'theme-dark text-white drop-shadow' : 'text-white'}`}>{s.name}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-neutral-400">Upload an image whose look you want. We take the look, not the subject.</p>
            <Dropzone
              accept="image/*"
              icon={<Upload className="w-4 h-4" />}
              title={state.customStyle ? 'Replace style image' : 'Upload style image'}
              hint="PNG or JPG"
              onFiles={(files) => {
                const f = files.find((x) => x.type.startsWith('image/'));
                if (!f) return toast('Please choose an image');
                if (state.customStyle) URL.revokeObjectURL(state.customStyle);
                set({ customStyle: URL.createObjectURL(f), styleId: 'custom' });
                setStyleOpen(false);
              }}
            />
          </div>
        )}
      </Sheet>
    </>
  );
};
