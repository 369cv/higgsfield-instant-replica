import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { TraitDef } from './traits';

/* ---------- Trait accordion ---------- */

interface TraitAccordionProps {
  trait: TraitDef;
  selected: string[];
  open: boolean;
  onToggleOpen: () => void;
  onSelect: (value: string) => void;
}

export const TraitAccordion: React.FC<TraitAccordionProps> = ({ trait, selected, open, onToggleOpen, onSelect }) => {
  const bodyId = `trait-${trait.id}`;
  const summary = selected.length ? selected.join(', ') : null;

  return (
    <section className="rounded-xl bg-surface border border-white/[0.06] overflow-hidden">
      <button
        type="button"
        onClick={onToggleOpen}
        aria-expanded={open}
        aria-controls={bodyId}
        className="w-full h-11 px-3.5 flex items-center gap-2 text-left cursor-pointer hover:bg-white/[0.03]"
      >
        <span className="text-[13px] font-medium text-white">{trait.label}</span>
        <span className="text-[12px] text-neutral-500">· {trait.multi && trait.max ? `pick up to ${trait.max}` : trait.options.length}</span>
        {summary && !open && (
          <span className="ml-auto mr-1 max-w-[45%] truncate text-[12px] text-accent-ink">{summary}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-neutral-500 shrink-0 transition-transform duration-200 ${summary && !open ? '' : 'ml-auto'} ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        id={bodyId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div
            role={trait.multi ? 'group' : 'radiogroup'}
            aria-label={trait.label}
            className={`p-2.5 pt-0 ${
              trait.control === 'swatches'
                ? 'flex flex-wrap gap-2.5'
                : trait.control === 'chips'
                  ? 'flex flex-wrap gap-2'
                  : 'grid grid-cols-3 gap-2'
            }`}
          >
            {trait.options.map((o) => {
              const active = selected.includes(o.value);
              const common = {
                type: 'button' as const,
                role: trait.multi ? 'checkbox' : 'radio',
                'aria-checked': active,
                onClick: () => onSelect(o.value),
                title: o.value,
              };
              if (trait.control === 'swatches') {
                return (
                  <button key={o.value} {...common} className="flex flex-col items-center gap-1 w-[52px] cursor-pointer">
                    <span
                      className={`w-9 h-9 rounded-full border border-black/20 transition-all ${
                        active ? 'ring-2 ring-[#ff3d9a] ring-offset-2 ring-offset-surface scale-105' : ''
                      }`}
                      style={{ background: o.hex }}
                    />
                    <span className={`text-[10.5px] leading-tight text-center ${active ? 'text-white' : 'text-neutral-500'}`}>
                      {o.value}
                    </span>
                  </button>
                );
              }
              if (trait.control === 'chips') {
                return (
                  <button
                    key={o.value}
                    {...common}
                    className={`h-9 px-3.5 rounded-lg text-[13px] border transition-all cursor-pointer ${
                      active
                        ? 'border-[#ff3d9a] bg-[#ff3d9a]/10 text-white'
                        : 'border-white/[0.08] bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    {o.value}
                  </button>
                );
              }
              return (
                <button
                  key={o.value}
                  {...common}
                  className={`relative ${o.image ? 'aspect-[4/5] items-end' : 'min-h-[52px] items-center'} rounded-lg overflow-hidden border-2 transition-all cursor-pointer flex ${
                    active ? 'border-[#ff3d9a] scale-[1.02]' : 'border-transparent hover:border-white/15'
                  } ${o.image ? 'bg-neutral-900' : 'bg-white/[0.04]'}`}
                >
                  {o.image && (
                    <img src={o.image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <span
                    className={`relative w-full px-1.5 py-1.5 text-[11px] leading-tight text-center font-medium ${
                      o.image ? 'theme-dark bg-gradient-to-t from-black/80 to-transparent text-white' : active ? 'text-white' : 'text-neutral-300'
                    }`}
                  >
                    {o.value}
                  </span>
                  {active && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ff3d9a] text-[#fff] flex items-center justify-center">
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- Select popover (searchable) ---------- */

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  badges?: string[];
}

interface SelectPopoverProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (v: string) => void;
  searchable?: boolean;
}

export const SelectPopover: React.FC<SelectPopoverProps> = ({ label, value, options, onChange, searchable }) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const filtered = useMemo(
    () => options.filter((o) => (o.label + ' ' + (o.description || '')).toLowerCase().includes(q.toLowerCase())),
    [options, q]
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="w-full rounded-xl bg-surface border border-white/[0.06] px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer hover:bg-white/[0.03]"
      >
        <span>
          <span className="block text-[11px] text-neutral-500">{label}</span>
          <span className="block text-[13px] font-medium text-white">{current?.label || value}</span>
        </span>
        <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-30 left-0 right-0 bottom-full mb-2 rounded-xl bg-base border border-white/10 shadow-2xl p-1.5 animate-sheet-up">
          {searchable && (
            <div className="flex items-center gap-2 px-2.5 h-9 mb-1 rounded-lg bg-white/[0.05]">
              <Search className="w-3.5 h-3.5 text-neutral-500" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="flex-1 bg-transparent text-[13px] text-white placeholder-neutral-500 focus:outline-none"
              />
            </div>
          )}
          <ul role="listbox" aria-label={label} className="max-h-64 overflow-y-auto">
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                    setQ('');
                  }}
                  className="w-full px-2.5 py-2 rounded-lg flex items-center gap-2 text-left hover:bg-white/[0.06] cursor-pointer"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] text-white">{o.label}</span>
                    {o.description && <span className="block text-[11px] text-neutral-500">{o.description}</span>}
                  </span>
                  {o.badges?.map((b) => (
                    <span key={b} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.07] text-neutral-400">
                      {b}
                    </span>
                  ))}
                  <Check className={`w-4 h-4 text-accent-ink ${o.value === value ? '' : 'invisible'}`} />
                </button>
              </li>
            ))}
            {filtered.length === 0 && <li className="px-2.5 py-3 text-[12px] text-neutral-500">No matches</li>}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ---------- Dropzone ---------- */

interface DropzoneProps {
  accept: string;
  multiple?: boolean;
  icon: React.ReactNode;
  title: string;
  hint: string;
  onFiles: (files: File[]) => void;
  children?: React.ReactNode; // previews
}

export const Dropzone: React.FC<DropzoneProps> = ({ accept, multiple, icon, title, hint, onFiles, children }) => {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onFiles(Array.from(e.dataTransfer.files));
      }}
      className={`rounded-xl border border-dashed transition-colors ${
        over ? 'border-[#ff3d9a] bg-[#ff3d9a]/5' : 'border-white/[0.12] bg-surface'
      }`}
    >
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="w-full px-4 py-5 flex flex-col items-center text-center gap-1.5 cursor-pointer"
      >
        <span className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center text-neutral-300">{icon}</span>
        <span className="text-[13px] font-semibold text-white">{title}</span>
        <span className="text-[11px] text-neutral-500">{hint}</span>
      </button>
      {children}
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          onFiles(Array.from(e.target.files || []));
          e.target.value = '';
        }}
      />
    </div>
  );
};
