import React, { useState } from 'react'
import { CommandCenterHeader } from '@/components/command-center/CommandCenterHeader'
import { KpiSummaryRow } from '@/components/command-center/KpiSummaryRow'
import {
  StoreMapDigitalTwin,
  SelectedEntity,
} from '@/components/command-center/StoreMapDigitalTwin'
import { EntityDetailDrawer } from '@/components/command-center/EntityDetailDrawer'
import { AiActionCenter } from '@/components/command-center/AiActionCenter'
import {
  WhyRecommendationDialog,
  WhyDialogData,
} from '@/components/command-center/WhyRecommendationDialog'
import { LiveCameraStrip } from '@/components/command-center/LiveCameraStrip'
import { BottomIntelligenceGrid } from '@/components/command-center/BottomIntelligenceGrid'

export const CommandCenterPage: React.FC = () => {
  // Entity inspection drawer state
  const [selectedEntity, setSelectedEntity] = useState<SelectedEntity | null>(null)

  // Explainability "Why?" dialog state
  const [whyDialogData, setWhyDialogData] = useState<WhyDialogData | null>(null)
  const [isWhyDialogOpen, setIsWhyDialogOpen] = useState(false)

  const handleOpenWhy = (data: WhyDialogData) => {
    setWhyDialogData(data)
    setIsWhyDialogOpen(true)
  }

  const handleSelectEntity = (entity: SelectedEntity) => {
    setSelectedEntity(entity)
  }

  return (
    <div className="space-y-4">
      {/* 1. Page Header (Title, LIVE pulse, last updated timestamp) */}
      <CommandCenterHeader />

      {/* 2. Top KPI Row (Exactly 6 primary KPI cards) */}
      <KpiSummaryRow />

      {/* 3. Main Content: 65% Digital Twin Store Map / 35% AI Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        {/* Left 65% (Approx. 8 of 12 cols on desktop) - Interactive Digital Twin */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <StoreMapDigitalTwin onSelectEntity={handleSelectEntity} />
        </div>

        {/* Right 35% (Approx. 4 of 12 cols on desktop) - AI Action Center */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
          <AiActionCenter
            onOpenWhy={handleOpenWhy}
            onViewEntity={handleSelectEntity}
          />
        </div>
      </div>

      {/* 4. Live Camera Strip (Entrance C01, Beverage C03, Checkout C05, Aisle C04) */}
      <LiveCameraStrip />

      {/* 5. Bottom Intelligence Section (4 compact analytics widgets) */}
      <BottomIntelligenceGrid />

      {/* Interactive Entity Inspection Drawer (Shelf, Checkout, Zone) */}
      <EntityDetailDrawer
        entity={selectedEntity}
        onClose={() => setSelectedEntity(null)}
        onOpenWhy={handleOpenWhy}
      />

      {/* Transparent AI Decision Explainability ("Why?") Dialog */}
      <WhyRecommendationDialog
        data={whyDialogData}
        open={isWhyDialogOpen}
        onOpenChange={setIsWhyDialogOpen}
      />
    </div>
  )
}
