import React from 'react'

export const CopilotRobotIcon: React.FC<{ className?: string; stroke?: string }> = ({
  className = 'w-5 h-5',
  stroke = 'currentColor',
}) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    stroke={stroke}
    strokeWidth="3.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Top Periscope Antenna: goes up from top-center, then bends left */}
    <path d="M 18 13.5 H 23.5 V 19" />

    {/* Rounded Head Frame */}
    <rect x="13" y="19" width="22" height="16" rx="4.5" />

    {/* Left Ear */}
    <line x1="8" y1="27" x2="13" y2="27" />

    {/* Right Ear */}
    <line x1="35" y1="27" x2="40" y2="27" />

    {/* Two Vertical Capsule Eyes */}
    <line x1="20" y1="25" x2="20" y2="29" strokeWidth="3.6" />
    <line x1="28" y1="25" x2="28" y2="29" strokeWidth="3.6" />
  </svg>
)
