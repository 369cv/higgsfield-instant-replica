import React, { useEffect, useId, useState } from 'react';
import { ChevronRight, X, Check } from 'lucide-react';

/* ============================================================
 * Shared iOS-style UI primitives. Theme-aware via colour tokens.
 * ============================================================ */

/* ---------- Switch ---------- */

interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string; // accessible name
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={(e) => {
      e.stopPropagation();
      onChange(!checked);
    }}
    className={`relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d1fe17]/60 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
      checked ? 'bg-[#d1fe17]' : 'bg-neutral-700'
    }`}
  >
    <span
      className={`inline-block h-[27px] w-[27px] rounded-full bg-[#ffffff] shadow-[0_2px_6px_rgba(0,0,0,0.25)] transition-transform duration-200 ${
        checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
      }`}
    />
  </button>
);

/* ---------- Segmented control ---------- */

interface SegmentedControlProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}

export function SegmentedControl<T extends string>({ value, options, onChange, label }: SegmentedControlProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex p-0.5 rounded-[9px] bg-neutral-800/80 text-[13px]">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`px-3 h-7 rounded-[7px] font-medium transition-all cursor-pointer ${
              active ? 'bg-surface text-white shadow-[0_1px_4px_rgba(0,0,0,0.18)]' : 'text-neutral-400'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Grouped list ---------- */

export const ListGroup: React.FC<{ title?: string; footer?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  footer,
  children,
}) => (
  <section className="mb-7">
    {title && <h3 className="px-4 pb-1.5 text-[13px] uppercase tracking-wide text-neutral-500">{title}</h3>}
    <div className="rounded-xl bg-surface overflow-hidden border border-white/[0.06] divide-y divide-white/[0.07]">
      {children}
    </div>
    {footer && <p className="px-4 pt-1.5 text-[13px] leading-snug text-neutral-500">{footer}</p>}
  </section>
);

interface ListRowProps {
  icon?: React.ElementType;
  iconBg?: string; // tailwind bg class for the icon tile
  label: string;
  description?: string;
  value?: React.ReactNode; // right-aligned detail text
  trailing?: React.ReactNode; // e.g. a Switch
  onClick?: () => void;
  href?: string;
  chevron?: boolean;
  destructive?: boolean;
  disabled?: boolean;
  badge?: string;
}

export const ListRow: React.FC<ListRowProps> = ({
  icon: Icon,
  iconBg = 'bg-neutral-600',
  label,
  description,
  value,
  trailing,
  onClick,
  href,
  chevron,
  destructive,
  disabled,
  badge,
}) => {
  const interactive = !!(onClick || href) && !disabled;
  const body = (
    <>
      {Icon && (
        <span className={`w-[30px] h-[30px] rounded-[8px] flex items-center justify-center shrink-0 text-[#ffffff] ${iconBg}`}>
          <Icon className="w-[17px] h-[17px]" />
        </span>
      )}
      <span className="flex-1 min-w-0 text-left">
        <span className={`flex items-center gap-2 text-[16px] ${destructive ? 'text-[#ff453a]' : 'text-white'}`}>
          <span className="truncate">{label}</span>
          {badge && (
            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-400">
              {badge}
            </span>
          )}
        </span>
        {description && <span className="block text-[13px] leading-snug text-neutral-500 mt-0.5">{description}</span>}
      </span>
      {value !== undefined && <span className="text-[15px] text-neutral-500 shrink-0 max-w-[45%] truncate">{value}</span>}
      {trailing}
      {(chevron ?? interactive) && !trailing && <ChevronRight className="w-4 h-4 text-neutral-600 shrink-0" />}
    </>
  );
  const cls = `w-full min-h-[48px] flex items-center gap-3 px-4 py-2.5 ${
    interactive ? 'cursor-pointer active:bg-white/[0.06] hover:bg-white/[0.03]' : ''
  } ${disabled ? 'opacity-50' : ''}`;

  if (href && !disabled) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={cls}>
        {body}
      </a>
    );
  }
  if (interactive) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {body}
      </button>
    );
  }
  return <div className={cls}>{body}</div>;
};

/* ---------- Theme picker (System / Light / Dark preview cards) ---------- */

type ThemeValue = 'system' | 'light' | 'dark';

const MiniPhone: React.FC<{ mode: 'light' | 'dark' }> = ({ mode }) => {
  const bg = mode === 'dark' ? '#0c0c10' : '#f2f2f7';
  const card = mode === 'dark' ? '#23232b' : '#ffffff';
  const line = mode === 'dark' ? '#3a3a44' : '#d8d8de';
  return (
    <div className="w-full h-full p-1.5 flex flex-col gap-1" style={{ background: bg }}>
      <div className="h-1.5 w-1/2 rounded-full" style={{ background: line }} />
      <div className="grid grid-cols-2 gap-1 flex-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-[3px]" style={{ background: i === 0 ? '#d1fe17' : card }} />
        ))}
      </div>
      <div className="h-2 rounded-[3px]" style={{ background: card }} />
    </div>
  );
};

export const ThemePicker: React.FC<{ value: ThemeValue; onChange: (v: ThemeValue) => void }> = ({ value, onChange }) => {
  const opts: { value: ThemeValue; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ];
  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-3 px-4 py-4">
      {opts.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <span
              className={`relative w-full aspect-[3/4] max-w-[88px] rounded-[12px] overflow-hidden border-2 transition-colors theme-dark ${
                active ? 'border-[#d1fe17]' : 'border-transparent ring-1 ring-black/10'
              }`}
            >
              {o.value === 'system' ? (
                <span className="absolute inset-0 flex">
                  <span className="w-1/2 overflow-hidden">
                    <span className="block w-[200%] h-full">
                      <MiniPhone mode="light" />
                    </span>
                  </span>
                  <span className="w-1/2 overflow-hidden relative">
                    <span className="block w-[200%] h-full -ml-[100%]">
                      <MiniPhone mode="dark" />
                    </span>
                  </span>
                </span>
              ) : (
                <MiniPhone mode={o.value} />
              )}
            </span>
            <span className="text-[14px] text-white">{o.label}</span>
            <span
              className={`w-[22px] h-[22px] rounded-full flex items-center justify-center border-2 transition-colors ${
                active ? 'bg-[#d1fe17] border-[#d1fe17] text-black' : 'border-neutral-600'
              }`}
              aria-hidden="true"
            >
              {active && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
};

/* ---------- Sheet (bottom sheet on mobile, dialog on desktop) ---------- */

interface SheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ open, title, onClose, children, footer }) => {
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full sm:max-w-md bg-base sm:rounded-2xl rounded-t-[22px] shadow-2xl animate-sheet-up flex flex-col max-h-[90dvh]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="sm:hidden pt-2 flex justify-center" aria-hidden="true">
          <div className="w-9 h-[5px] rounded-full bg-neutral-600" />
        </div>
        <div className="h-12 px-4 grid grid-cols-[40px_1fr_40px] items-center shrink-0">
          <span />
          <h2 id={titleId} className="text-center text-[17px] font-semibold text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 justify-self-end rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 active:opacity-60 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-4 pb-4 overflow-y-auto">{children}</div>
        {footer && <div className="px-4 pb-4 pt-1 shrink-0">{footer}</div>}
      </div>
    </div>
  );
};

/* ---------- Buttons ---------- */

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...p }) => (
  <button
    {...p}
    className={`w-full h-[50px] rounded-[14px] bg-[#d1fe17] hover:bg-[#bfee00] text-black font-semibold text-[16px] active:scale-[0.98] transition-transform disabled:opacity-40 cursor-pointer ${className}`}
  />
);

export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', ...p }) => (
  <button
    {...p}
    className={`w-full h-[50px] rounded-[14px] bg-neutral-800 text-white font-semibold text-[16px] active:scale-[0.98] transition-transform cursor-pointer ${className}`}
  />
);

/* ---------- Toast ---------- */

let pushToast: ((msg: string) => void) | null = null;
export const toast = (msg: string) => pushToast?.(msg);

export const ToastHost: React.FC = () => {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    pushToast = (m) => {
      setMsg(m);
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 2200);
    };
    return () => {
      pushToast = null;
      clearTimeout(t);
    };
  }, []);
  return (
    <div
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 z-[80] pointer-events-none bottom-[calc(var(--m-tab-h)+16px)] md:bottom-8"
    >
      {msg && (
        <div className="animate-sheet-up px-4 py-2.5 rounded-full bg-neutral-100 text-neutral-900 text-[14px] font-medium shadow-xl whitespace-nowrap">
          {msg}
        </div>
      )}
    </div>
  );
};
