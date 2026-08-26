import React, { useState } from 'react'
import * as THREE from 'three'
import { TooltipData } from '../controls/TwinTooltip'

interface IncidentBeacons3DProps {
  showIncidents: boolean
  onSelectIncident?: (incident: any) => void
  onHoverIncident?: (data: TooltipData | null) => void
}

export const IncidentBeacons3D: React.FC<IncidentBeacons3DProps> = ({
  showIncidents,
  onSelectIncident,
  onHoverIncident,
}) => {
  const [hoveredIncident, setHoveredIncident] = useState<string | null>(null)

  const incidents = [
    {
      id: 'inc-01',
      title: 'Cooler 2 Floor Spill',
      location: 'Cold Beverages Aisle (near Cooler 2)',
      severity: 'HIGH',
      assignedTo: 'Sarah Jenkins',
      status: 'In Progress (Cone Deployed)',
      position: [11.5, 0, -6.5] as [number, number, number],
      actionRequired: 'Mop & floor dry in progress',
    },
  ]

  const handlePointerOver = (inc: typeof incidents[0], e: any) => {
    e.stopPropagation()
    setHoveredIncident(inc.id)
    if (onHoverIncident) {
      onHoverIncident({
        type: 'incident',
        title: inc.title,
        subtitle: inc.location,
        status: inc.severity,
        statusColor: 'amber',
        metrics: [
          { label: 'Severity', value: inc.severity, highlight: true },
          { label: 'Assigned Associate', value: inc.assignedTo },
          { label: 'Status', value: inc.status },
        ],
        alert: inc.actionRequired,
        actionHint: 'Click to open safety workspace',
        screenX: e.clientX,
        screenY: e.clientY,
      })
    }
  }

  const handlePointerOut = () => {
    setHoveredIncident(null)
    if (onHoverIncident) onHoverIncident(null)
  }

  if (!showIncidents) return null

  return (
    <group>
      {incidents.map((inc) => {
        const isHovered = hoveredIncident === inc.id

        return (
          <group
            key={inc.id}
            position={inc.position}
            onClick={(e) => {
              e.stopPropagation()
              if (onSelectIncident) onSelectIncident(inc)
            }}
            onPointerOver={(e) => handlePointerOver(inc, e)}
            onPointerOut={handlePointerOut}
          >
            {/* 1. Liquid Floor Spill Puddle Graphic */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
              <ringGeometry args={[0, 0.65, 16]} />
              <meshStandardMaterial
                color="#38BDF8"
                roughness={0.05}
                metalness={0.9}
                transparent
                opacity={0.4}
              />
            </mesh>

            {/* 2. High-Visibility Safety Caution Wet Floor Cone */}
            <group position={[0.2, 0, 0.2]}>
              {/* Yellow Cone Base */}
              <mesh position={[0, 0.02, 0]} castShadow>
                <boxGeometry args={[0.3, 0.04, 0.3]} />
                <meshStandardMaterial color="#EAB308" roughness={0.6} />
              </mesh>
              {/* Yellow Cone Body */}
              <mesh position={[0, 0.3, 0]} castShadow>
                <coneGeometry args={[0.12, 0.55, 12]} />
                <meshStandardMaterial color="#FACC15" roughness={0.5} />
              </mesh>
              {/* Black Hazard Warning Stripe */}
              <mesh position={[0, 0.28, 0]}>
                <cylinderGeometry args={[0.075, 0.085, 0.1, 12]} />
                <meshStandardMaterial color="#0F172A" roughness={0.8} />
              </mesh>
              {/* Cone Top Ring */}
              <mesh position={[0, 0.56, 0]}>
                <torusGeometry args={[0.025, 0.008, 8, 12]} />
                <meshStandardMaterial color="#EAB308" />
              </mesh>
            </group>

            {/* Subtle Selection Aura on Hover */}
            {isHovered && (
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[0.7, 0.76, 16]} />
                <meshBasicMaterial color="#F59E0B" transparent opacity={0.7} />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}
