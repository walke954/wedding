type IconProps = { size?: number }

const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function ExpandIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
      <path d="M4 9V5a1 1 0 0 1 1-1h4M4 15v4a1 1 0 0 0 1 1h4M20 9V5a1 1 0 0 0-1-1h-4M20 15v4a1 1 0 0 1-1 1h-4" />
    </svg>
  )
}

export function DownloadIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
    </svg>
  )
}

export function ChevronLeftIcon({ size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  )
}

export function ChevronRightIcon({ size = 36 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...common}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}
