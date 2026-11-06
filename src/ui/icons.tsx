// Line icons, 20px grid, 1.5 stroke, currentColor. Decorative by default (aria-hidden).
import { useId, type SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
})

export const IconPlan = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 5.5h12M4 10h12M4 14.5h12" opacity=".45" />
    <circle cx="7.5" cy="5.5" r="1.9" fill="var(--icon-fill, none)" />
    <circle cx="12.5" cy="10" r="1.9" fill="var(--icon-fill, none)" />
    <circle cx="9" cy="14.5" r="1.9" fill="var(--icon-fill, none)" />
  </svg>
)
export const IconOutlook = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3 15.5L17 5v7.5z" fill="var(--icon-fill, none)" fillOpacity=".25" opacity=".55" />
    <path d="M3 15.5C8 13.6 12 10.8 17 7.6" />
    <path d="M3 17h14" opacity=".45" />
  </svg>
)
export const IconAtlas = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="10" cy="10" r="6.75" />
    <path d="M3.5 10h13M10 3.25c2 2.1 2.9 4.4 2.9 6.75S12 14.65 10 16.75C8 14.65 7.1 12.35 7.1 10S8 5.35 10 3.25z" opacity=".6" />
  </svg>
)
export const IconMethod = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 4.5c2.2-.6 4.2-.3 6 1.2 1.8-1.5 3.8-1.8 6-1.2v10.5c-2.2-.6-4.2-.3-6 1.2-1.8-1.5-3.8-1.8-6-1.2z" />
    <path d="M10 5.7v10.5" opacity=".55" />
  </svg>
)
export const IconShare = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M10 12.5V3.5M6.75 6.5L10 3.25l3.25 3.25" />
    <path d="M6 9H5a1.5 1.5 0 0 0-1.5 1.5v4.75A1.5 1.5 0 0 0 5 16.75h10a1.5 1.5 0 0 0 1.5-1.5V10.5A1.5 1.5 0 0 0 15 9h-1" />
  </svg>
)
export const IconSun = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="10" cy="10" r="3.25" />
    <path d="M10 2.75v1.5M10 15.75v1.5M2.75 10h1.5M15.75 10h1.5M4.9 4.9l1.05 1.05M14.05 14.05l1.05 1.05M4.9 15.1l1.05-1.05M14.05 5.95l1.05-1.05" />
  </svg>
)
export const IconMoon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M15.75 12.2A6.5 6.5 0 0 1 7.8 4.25a6.5 6.5 0 1 0 7.95 7.95z" />
  </svg>
)
export const IconSystem = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="10" cy="10" r="6.5" />
    <path d="M10 3.5a6.5 6.5 0 0 1 0 13z" fill="currentColor" stroke="none" />
  </svg>
)
export const IconMenu = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M3.5 6.5h13M3.5 13.5h8" />
  </svg>
)
export const IconArrowRight = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 10h12M11.5 5.5L16 10l-4.5 4.5" />
  </svg>
)
export const IconReset = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 10a6 6 0 1 0 1.8-4.3M4 3.75V6.5h2.75" />
  </svg>
)

/** The eVelo mark: a widening cone of futures with the median arc rising through it. */
export function Mark({ size = 28, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={`${id}-c`} x1="4" y1="22" x2="24" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.38" />
        </linearGradient>
      </defs>
      <path d="M4 22L24 4.5V17.5Z" fill={`url(#${id}-c)`} />
      <path d="M4 22L24 4.5M4 22L24 17.5" stroke="var(--accent)" strokeOpacity="0.35" strokeWidth="1" />
      <path d="M4 22C11 20 17.5 15 24 9" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="9" r="2.25" fill="var(--accent)" />
      <path d="M4 24.5h20" stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" strokeLinecap="round" />
    </svg>
  )
}
