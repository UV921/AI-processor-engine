import type { ReactNode } from 'react'

type IconProps = {
  className?: string
  size?: number
}

const defaults = { size: 18 }

function Svg({ className, size, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width={size ?? defaults.size}
      height={size ?? defaults.size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function IconEngine({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  )
}

export function IconLink({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  )
}

export function IconSparkles({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <path d="M12 3l1.2 3.6L17 8l-3.8 1.4L12 13l-1.2-3.6L7 8l3.8-1.4L12 3z" />
      <path d="M5 15l.6 1.8L7.5 17l-1.9.7L5 19.5l-.6-1.8L2.5 17l1.9-.7L5 15z" />
      <path d="M19 13l.6 1.8L21.5 15l-1.9.7L19 17.5l-.6-1.8L16.5 15l1.9-.7L19 13z" />
    </Svg>
  )
}

export function IconLoader({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <path d="M12 2v4" />
      <path d="M12 18v4" opacity="0.3" />
      <path d="m4.93 4.93 2.83 2.83" opacity="0.5" />
      <path d="m16.24 16.24 2.83 2.83" opacity="0.7" />
      <path d="M2 12h4" opacity="0.9" />
      <path d="M18 12h4" opacity="0.2" />
    </Svg>
  )
}

export function IconSend({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <path d="m22 2-7 20-4-9-9-4 20-7z" />
      <path d="M22 2 11 13" />
    </Svg>
  )
}

export function IconQueue({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <rect x="3" y="5" width="18" height="4" rx="1" />
      <rect x="3" y="10" width="18" height="4" rx="1" />
      <rect x="3" y="15" width="18" height="4" rx="1" />
    </Svg>
  )
}

export function IconCpu({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </Svg>
  )
}

export function IconCheck({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <path d="M20 6 9 17l-5-5" />
    </Svg>
  )
}

export function IconAlert({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </Svg>
  )
}

export function IconActivity({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </Svg>
  )
}

export function IconClock({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </Svg>
  )
}

export function IconLightbulb({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <path d="M9 18h6M10 22h4M12 2a6 6 0 0 0-4 10.5V16h8v-3.5A6 6 0 0 0 12 2z" />
    </Svg>
  )
}

export function IconTarget({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </Svg>
  )
}

export function IconFileText({ className, size }: IconProps) {
  return (
    <Svg className={className} size={size}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </Svg>
  )
}

export const STEP_ICONS = {
  submitting: IconSend,
  pending: IconQueue,
  processing: IconCpu,
  completed: IconCheck,
  failed: IconAlert,
} as const

export const STATUS_ICONS = {
  pending: IconQueue,
  processing: IconCpu,
  completed: IconCheck,
  failed: IconAlert,
} as const
