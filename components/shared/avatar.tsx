import { cn } from '@/lib/utils'

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-20 w-20 text-2xl',
} as const

interface AvatarProps {
  src?: string | null
  name: string
  size?: keyof typeof SIZE_CLASSES
  className?: string
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

// implements FR-10
export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  if (src) {
    // Plain <img>: Supabase Storage URLs are external and not yet configured as a next/image remote pattern.
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', SIZE_CLASSES[size], className)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary',
        SIZE_CLASSES[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  )
}
