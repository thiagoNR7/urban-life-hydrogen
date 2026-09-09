/**
 * Porte de snippets/ul-icon.liquid.
 * Mesmos paths SVG, mesmo viewBox, mesmo stroke — 1:1 com o tema.
 */

const PATHS = {
  leaf: (
    <>
      <path d="M4 20c8 0 14-6 14-14V4h-2C8 4 4 10 4 18v2Z" />
      <path d="M4 20c4-4 8-8 14-14" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 20v-8" />
      <path d="M12 12c0-4-3-6-7-6 0 4 3 7 7 6Z" />
      <path d="M12 12c0-4 3-6 7-6 0 4-3 7-7 6Z" />
    </>
  ),
  truck: (
    <>
      <rect x="1" y="8" width="13" height="9" rx="1" />
      <path d="M14 11h4l3 3v3h-7z" />
      <circle cx="6" cy="19" r="1.6" />
      <circle cx="17.5" cy="19" r="1.6" />
    </>
  ),
  home: (
    <>
      <path d="M4 11 12 4l8 7" />
      <path d="M6 10v9h12v-9" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M15.2 13.6c2.6.3 4.3 2.3 4.3 5.1" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M12 21s7-6.3 7-11.5A7 7 0 0 0 5 9.5C5 14.7 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  'arrow-right': (
    <>
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </>
  ),
  cart: (
    <>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </>
  ),
};

export function UlIcon({name, size = 24, className = ''}) {
  const paths = PATHS[name];
  if (!paths) return null;

  return (
    <svg
      className={`ul-icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {paths}
    </svg>
  );
}
