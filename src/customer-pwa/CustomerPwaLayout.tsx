import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Home,
  Search,
  Sparkles,
  ShoppingBag,
  Navigation,
  MapPin,
  HandHelping,
} from 'lucide-react'
import {
  CustomerShoppingProvider,
  useCustomerShopping,
  CustomerPwaTab,
} from './context/CustomerShoppingContext'
import {
  CustomerAssistProvider,
  useCustomerAssist,
} from './context/CustomerAssistContext'
import { CustomerHomePage } from './pages/CustomerHomePage'
import { CustomerSearchPage } from './pages/CustomerSearchPage'
import { CustomerCopilotPage } from './pages/CustomerCopilotPage'
import { ShoppingListPage } from './pages/ShoppingListPage'
import { SmartMapRoutePage } from './pages/SmartMapRoutePage'
import { CustomerAssistStatusPage } from './pages/CustomerAssistStatusPage'
import { CustomerFloatingCopilot } from './components/CustomerFloatingCopilot'
import { CustomerCopilotQuickDrawer } from './components/CustomerCopilotQuickDrawer'
import { HelpRequestSheet } from './components/assist/HelpRequestSheet'

const CustomerPwaContent: React.FC = () => {
  const { activeTab, setActiveTab, shoppingList, storeName } = useCustomerShopping()
  const { activeRequest, viewActiveRequest } = useCustomerAssist()
  const totalUnits = shoppingList.reduce((sum, item) => sum + item.quantity, 0)
  const hasActiveHelp =
    activeRequest && activeRequest.status !== 'COMPLETED' && activeRequest.status !== 'CANCELLED'

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 flex justify-center font-sans antialiased select-none">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md bg-white min-h-screen flex flex-col relative shadow-xl border-x border-slate-200">
        {/* Compact Mobile Header (~52px tall, No Manager Link) */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 h-13 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            {/* RE Logo */}
            <div className="h-7 w-7 min-w-7 rounded-xl bg-gradient-to-tr from-teal-700 to-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-sm font-mono">
              RE
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-xs font-bold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                <span>Retail Edge</span>
                <span className="text-[9px] text-cyan-800 font-extrabold bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
                  Shopper
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 text-cyan-600 shrink-0" />
                <span>{storeName}</span>
              </span>
            </div>
          </div>

          {/* Active Help Request Status Pill in Header */}
          {hasActiveHelp && activeTab !== 'HELP' && (
            <button
              onClick={viewActiveRequest}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-50 border border-cyan-300 text-cyan-800 text-[11px] font-bold animate-pulse hover:bg-cyan-100 transition-all cursor-pointer"
            >
              <HandHelping className="h-3.5 w-3.5 text-cyan-700" />
              <span>Staff En Route</span>
            </button>
          )}
        </header>

        {/* Dynamic Mobile Viewport Content */}
        <main className="flex-1 p-4 overflow-y-auto bg-[#F4F6F8]/60">
          {activeTab === 'HOME' && <CustomerHomePage />}
          {activeTab === 'SEARCH' && <CustomerSearchPage />}
          {(activeTab === 'COPILOT' || activeTab === 'ASSISTANT') && <CustomerCopilotPage />}
          {activeTab === 'LIST' && <ShoppingListPage />}
          {(activeTab === 'ROUTE' || activeTab === 'MAP') && <SmartMapRoutePage />}
          {activeTab === 'HELP' && <CustomerAssistStatusPage />}
        </main>

        {/* Floating Shopping Copilot Button & Quick Drawer */}
        <CustomerFloatingCopilot />
        <CustomerCopilotQuickDrawer />

        {/* Global Contextual Help Request Bottom Sheet */}
        <HelpRequestSheet />

        {/* Bottom Mobile Tab Bar (5-item bar with min 48px touch targets) */}
        <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-1.5 flex items-center justify-between shadow-lg pb-[max(0.375rem,env(safe-area-inset-bottom))]">
          {/* 1. Home */}
          <button
            onClick={() => setActiveTab('HOME')}
            className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'HOME'
                ? 'text-cyan-700 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="h-4.5 w-4.5" />
            <span className="text-[10px] leading-none">Home</span>
          </button>

          {/* 2. Search */}
          <button
            onClick={() => setActiveTab('SEARCH')}
            className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'SEARCH'
                ? 'text-cyan-700 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Search className="h-4.5 w-4.5" />
            <span className="text-[10px] leading-none">Search</span>
          </button>

          {/* 3. Copilot (Dedicated Planning Tab) */}
          <button
            onClick={() => setActiveTab('COPILOT')}
            className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'COPILOT' || activeTab === 'ASSISTANT'
                ? 'text-cyan-700 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sparkles className="h-4.5 w-4.5" />
            <span className="text-[10px] leading-none">Copilot</span>
          </button>

          {/* 4. Route */}
          <button
            onClick={() => setActiveTab('ROUTE')}
            className={`flex-1 min-h-[48px] flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'ROUTE' || activeTab === 'MAP'
                ? 'text-cyan-700 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Navigation className="h-4.5 w-4.5" />
            <span className="text-[10px] leading-none">Route</span>
          </button>

          {/* 5. List (with count badge) */}
          <button
            onClick={() => setActiveTab('LIST')}
            className={`flex-1 min-h-[48px] relative flex flex-col items-center justify-center gap-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'LIST'
                ? 'text-cyan-700 font-bold'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="h-4.5 w-4.5" />
              {totalUnits > 0 && (
                <span className="absolute -top-1.5 -right-2.5 h-3.5 min-w-3.5 px-0.5 rounded-full bg-cyan-600 text-white text-[8.5px] font-bold flex items-center justify-center shadow-sm">
                  {totalUnits}
                </span>
              )}
            </div>
            <span className="text-[10px] leading-none">List</span>
          </button>
        </nav>
      </div>
    </div>
  )
}

export const CustomerPwaLayout: React.FC<{ defaultTab?: CustomerPwaTab }> = ({ defaultTab }) => {
  const { storeId } = useParams<{ storeId?: string }>()

  return (
    <CustomerShoppingProvider storeId={storeId} defaultTab={defaultTab}>
      <CustomerAssistProvider storeId={storeId}>
        <CustomerPwaContent />
      </CustomerAssistProvider>
    </CustomerShoppingProvider>
  )
}

