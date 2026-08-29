import React from 'react'
import { Html } from '@react-three/drei'
import type { LucideIcon } from 'lucide-react'

export interface TwinIconBadgeProps {
  icon: LucideIcon
  color: string
  hovered?: boolean
}

/**
 * Small flat circular icon badge, billboarded above a 3D anchor point via
 * @react-three/drei's Html — renders as a real DOM element so it stays a
 * crisp fixed pixel size regardless of camera zoom/rotation, instead of a
 * 3D mesh that shrinks with distance.
 */
export const TwinIconBadge: React.FC<TwinIconBadgeProps> = ({ icon: Icon, color, hovered }) => {
  return (
    <Html center zIndexRange={[10, 0]} sprite occlude={false} style={{ pointerEvents: 'none' }}>
      <div
        style={{
          width: hovered ? 30 : 26,
          height: hovered ? 30 : 26,
          borderRadius: '9999px',
          background: color,
          border: '2px solid white',
          boxShadow: '0 2px 6px rgba(15,23,42,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'width 0.12s ease, height 0.12s ease',
        }}
      >
        <Icon size={hovered ? 16 : 14} color="white" strokeWidth={2.5} />
      </div>
    </Html>
  )
}
