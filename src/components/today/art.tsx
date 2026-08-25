/* Soft inline illustrations for the Today screen. */

export type CardKind = "subsidies" | "questions" | "moment" | "breath" | "talk" | "visitSteps";

const STROKE = "#5E4636";
const SAGE = "#8FA88A";
const SAGE_SOFT = "#C7D8C4";
const CLAY = "#D8B6A4";
const PAPER = "#FAF8F5";

export function FloralBlur() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-16 -right-10 h-64 w-64 rounded-full bg-clay-soft/55 blur-3xl" />
      <div className="absolute -bottom-20 -left-12 h-72 w-72 rounded-full bg-sage-soft/70 blur-3xl" />
      <div className="absolute top-6 right-24 h-24 w-24 rounded-full bg-secondary/80 blur-2xl" />
    </div>
  );
}

export function CardVignette({ kind }: { kind: CardKind }) {
  return (
    <div className="hidden sm:flex flex-shrink-0 h-20 w-20 rounded-2xl bg-gradient-warm border border-border items-center justify-center overflow-hidden">
      {kind === "subsidies" && <EnvelopeArt />}
      {kind === "questions" && <NotebookArt />}
      {kind === "moment" && <PolaroidArt />}
      {kind === "breath" && <BreathArt />}
      {kind === "talk" && <TalkArt />}
      {kind === "visitSteps" && <ChecklistArt />}
    </div>
  );
}

function EnvelopeArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <rect
        x="10"
        y="20"
        width="44"
        height="30"
        rx="4"
        fill={PAPER}
        stroke={STROKE}
        strokeWidth="1.2"
      />
      <path
        d="M10 22 L32 38 L54 22"
        fill="none"
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="18" r="6" fill={CLAY} opacity="0.7" />
    </svg>
  );
}

function NotebookArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <rect
        x="14"
        y="12"
        width="36"
        height="44"
        rx="3"
        fill={PAPER}
        stroke={STROKE}
        strokeWidth="1.2"
      />
      <line x1="14" y1="22" x2="50" y2="22" stroke={SAGE} strokeWidth="1" />
      <line x1="20" y1="32" x2="44" y2="32" stroke={STROKE} strokeWidth="0.8" opacity="0.5" />
      <line x1="20" y1="38" x2="40" y2="38" stroke={STROKE} strokeWidth="0.8" opacity="0.5" />
      <line x1="20" y1="44" x2="42" y2="44" stroke={STROKE} strokeWidth="0.8" opacity="0.5" />
      <circle cx="46" cy="48" r="4" fill={CLAY} opacity="0.7" />
    </svg>
  );
}

function PolaroidArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <g transform="rotate(-6 32 32)">
        <rect
          x="14"
          y="12"
          width="36"
          height="40"
          rx="2"
          fill={PAPER}
          stroke={STROKE}
          strokeWidth="1.2"
        />
        <rect x="18" y="16" width="28" height="22" fill={SAGE_SOFT} />
        <circle cx="32" cy="27" r="5" fill={CLAY} opacity="0.8" />
      </g>
    </svg>
  );
}

function BreathArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <circle cx="32" cy="32" r="18" fill="none" stroke={SAGE} strokeWidth="1" opacity="0.5" />
      <circle cx="32" cy="32" r="12" fill={SAGE_SOFT} opacity="0.7" />
      <circle cx="32" cy="32" r="6" fill={SAGE} opacity="0.6" />
    </svg>
  );
}

function TalkArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <rect
        x="10"
        y="16"
        width="34"
        height="24"
        rx="8"
        fill={PAPER}
        stroke={STROKE}
        strokeWidth="1.2"
      />
      <path
        d="M20 40 l-2 8 8 -8"
        fill={PAPER}
        stroke={STROKE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <rect
        x="30"
        y="30"
        width="24"
        height="18"
        rx="7"
        fill={SAGE_SOFT}
        stroke={STROKE}
        strokeWidth="1"
        opacity="0.9"
      />
      <circle cx="24" cy="28" r="1.6" fill={STROKE} opacity="0.6" />
      <circle cx="30" cy="28" r="1.6" fill={STROKE} opacity="0.6" />
    </svg>
  );
}

function ChecklistArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <rect
        x="14"
        y="10"
        width="36"
        height="46"
        rx="4"
        fill={PAPER}
        stroke={STROKE}
        strokeWidth="1.2"
      />
      <circle cx="22" cy="24" r="3" fill={SAGE} opacity="0.8" />
      <path
        d="M20.5 24 l1.2 1.4 2 -2.6"
        stroke={PAPER}
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
      />
      <line x1="29" y1="24" x2="44" y2="24" stroke={STROKE} strokeWidth="0.9" opacity="0.55" />
      <circle cx="22" cy="35" r="3" fill="none" stroke={SAGE} strokeWidth="1.1" />
      <line x1="29" y1="35" x2="42" y2="35" stroke={STROKE} strokeWidth="0.9" opacity="0.55" />
      <circle cx="22" cy="46" r="3" fill="none" stroke={CLAY} strokeWidth="1.1" />
      <line x1="29" y1="46" x2="40" y2="46" stroke={STROKE} strokeWidth="0.9" opacity="0.55" />
    </svg>
  );
}

export function TeaCupArt({ className = "h-16 w-24" }: { className?: string }) {
  return (
    <svg viewBox="22 26 68 46" className={className}>
      <path
        d="M30 50 q4 -4 8 -8 M40 46 q3 -5 6 -10 M50 48 q2 -4 4 -8"
        stroke={STROKE}
        strokeWidth="0.9"
        fill="none"
        opacity="0.5"
        strokeLinecap="round"
      />
      <path
        d="M28 38 h44 v14 a14 14 0 0 1 -14 14 h-16 a14 14 0 0 1 -14 -14 z"
        fill={PAPER}
        stroke={STROKE}
        strokeWidth="1.2"
      />
      <path d="M72 42 q10 0 10 8 t-10 8" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <ellipse cx="50" cy="40" rx="22" ry="3" fill={CLAY} opacity="0.5" />
    </svg>
  );
}

export function BlanketArt() {
  return (
    <svg
      viewBox="0 0 200 120"
      aria-hidden
      className="absolute -bottom-2 -right-2 h-32 w-44 opacity-70"
    >
      <path
        d="M20 80 q40 -30 80 -10 t80 -5 v40 h-160z"
        fill={PAPER}
        stroke={STROKE}
        strokeWidth="1"
        opacity="0.7"
      />
      <path
        d="M40 92 q40 -20 80 -5 t60 -2"
        fill="none"
        stroke={CLAY}
        strokeWidth="1.2"
        opacity="0.7"
      />
      <path
        d="M30 100 q40 -16 80 -4 t70 -3"
        fill="none"
        stroke={SAGE}
        strokeWidth="1.2"
        opacity="0.7"
      />
    </svg>
  );
}
