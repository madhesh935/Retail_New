import React, { useState, useEffect } from 'react'
import {
  X,
  Package,
  ShoppingCart,
  Inbox,
  Tag,
  MessageSquare,
  Accessibility,
  Receipt,
  HelpCircle,
  MapPin,
  ArrowRight,
  Check,
  AlertTriangle,
  ChevronLeft,
} from 'lucide-react'
import {
  CustomerAssistRequestType,
  CANONICAL_STORE_ZONES,
  ASSIST_TYPE_CONFIGS,
} from '../../types/customerAssist.types'
import { useCustomerAssist } from '../../context/CustomerAssistContext'

const ACCESSIBILITY_OPTIONS = [
  'Help reaching a product on high shelf',
  'Store navigation assistance',
  'Checkout & bag carrying help',
  'Other mobility or sensory assistance',
]

export const HelpRequestSheet: React.FC = () => {
  const {
    isHelpSheetOpen,
    closeHelpSheet,
    activePrefill,
    createRequest,
    isCreating,
    activeRequest,
    viewActiveRequest,
  } = useCustomerAssist()

  const [step, setStep] = useState<'SELECT_TYPE' | 'DETAILS'>('SELECT_TYPE')
  const [selectedType, setSelectedType] = useState<CustomerAssistRequestType>('PRODUCT_ASSISTANCE')
  const [selectedZoneId, setSelectedZoneId] = useState('zone-dairy')
  const [showZonePicker, setShowZonePicker] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [accessibilityNeed, setAccessibilityNeed] = useState(ACCESSIBILITY_OPTIONS[0])

  useEffect(() => {
    if (activePrefill) {
      if (activePrefill.requestType) {
        setSelectedType(activePrefill.requestType)
        setStep('DETAILS')
      } else {
        setStep('SELECT_TYPE')
      }
      if (activePrefill.zoneId) {
        setSelectedZoneId(activePrefill.zoneId)
      } else if (activePrefill.product) {
        const cat = activePrefill.product.category.toLowerCase()
        if (cat.includes('dairy')) setSelectedZoneId('zone-dairy')
        else if (cat.includes('bev')) setSelectedZoneId('zone-beverages')
        else if (cat.includes('produce') || cat.includes('fruit')) setSelectedZoneId('zone-produce')
        else if (cat.includes('bakery') || cat.includes('bread')) setSelectedZoneId('zone-bakery')
        else if (cat.includes('snack')) setSelectedZoneId('zone-snacks')
        else if (cat.includes('care')) setSelectedZoneId('zone-care')
      }
      if (activePrefill.message) {
        setCustomMessage(activePrefill.message)
      }
    } else {
      setStep('SELECT_TYPE')
      setCustomMessage('')
    }
  }, [activePrefill, isHelpSheetOpen])

  if (!isHelpSheetOpen) return null

  const selectedZone =
    CANONICAL_STORE_ZONES.find((z) => z.id === selectedZoneId) || CANONICAL_STORE_ZONES[1]
  const product = activePrefill?.product
  const shelf = activePrefill?.shelfCode || product?.shelf

  const handleSelectType = (type: CustomerAssistRequestType) => {
    setSelectedType(type)
    setStep('DETAILS')
  }

  const handleSubmit = async () => {
    // Safety check for dangerous keywords
    const msgLower = customMessage.toLowerCase()
    if (
      msgLower.includes('emergency') ||
      msgLower.includes('fire') ||
      msgLower.includes('injury') ||
      msgLower.includes('medical')
    ) {
      alert('For immediate medical emergencies or danger, please alert store staff in person or contact local emergency services immediately.')
    }

    await createRequest({
      requestType: selectedType,
      product,
      zoneId: selectedZone.id,
      zoneName: selectedZone.name,
      shelfCode: shelf,
      message: customMessage.trim() || undefined,
      accessibilityNeed: selectedType === 'ACCESSIBILITY_ASSISTANCE' ? accessibilityNeed : undefined,
    })
  }

  const hasActiveRequest =
    activeRequest && activeRequest.status !== 'COMPLETED' && activeRequest.status !== 'CANCELLED'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 max-h-[90dvh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {step === 'DETAILS' && !activePrefill?.requestType && (
              <button
                onClick={() => setStep('SELECT_TYPE')}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                aria-label="Back to type selection"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {step === 'SELECT_TYPE' ? 'How can we help?' : 'Request Staff Help'}
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {step === 'SELECT_TYPE'
                  ? 'Choose what you need assistance with'
                  : 'An associate will come directly to your location'}
              </p>
            </div>
          </div>

          <button
            onClick={closeHelpSheet}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Existing Active Request Banner Warning */}
        {hasActiveRequest && (
          <div className="mx-4 mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-amber-900 font-semibold">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>You already have an active request in progress.</span>
            </div>
            <button
              onClick={() => {
                closeHelpSheet()
                viewActiveRequest()
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold shrink-0 cursor-pointer shadow-2xs"
            >
              View
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {step === 'SELECT_TYPE' ? (
            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. Find a Product */}
              <button
                onClick={() => handleSelectType('PRODUCT_ASSISTANCE')}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-cyan-50/70 hover:border-cyan-300 text-left transition-all active:scale-[0.98] cursor-pointer group shadow-2xs"
              >
                <div className="h-9 w-9 rounded-xl bg-cyan-600 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-all">
                  <Package className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug">Find a Product</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Locate item on shelves</div>
              </button>

              {/* 2. Product Not on Shelf */}
              <button
                onClick={() => handleSelectType('SHELF_ASSISTANCE')}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-amber-50/70 hover:border-amber-300 text-left transition-all active:scale-[0.98] cursor-pointer group shadow-2xs"
              >
                <div className="h-9 w-9 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-all">
                  <ShoppingCart className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug">Not on Shelf</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Empty shelf or facing</div>
              </button>

              {/* 3. Bring From Backroom */}
              <button
                onClick={() => handleSelectType('BACKROOM_REQUEST')}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-blue-50/70 hover:border-blue-300 text-left transition-all active:scale-[0.98] cursor-pointer group shadow-2xs"
              >
                <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-all">
                  <Inbox className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug">From Backroom</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Fetch reserve stock</div>
              </button>

              {/* 4. Price or Offer Question */}
              <button
                onClick={() => handleSelectType('PRICE_ASSISTANCE')}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 text-left transition-all active:scale-[0.98] cursor-pointer group shadow-2xs"
              >
                <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-all">
                  <Tag className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug">Price & Offers</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Check price or discount</div>
              </button>

              {/* 5. Product Advice */}
              <button
                onClick={() => handleSelectType('PRODUCT_GUIDANCE')}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-purple-50/70 hover:border-purple-300 text-left transition-all active:scale-[0.98] cursor-pointer group shadow-2xs"
              >
                <div className="h-9 w-9 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-all">
                  <MessageSquare className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug">Product Advice</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Recommendations & info</div>
              </button>

              {/* 6. Accessibility Assistance */}
              <button
                onClick={() => handleSelectType('ACCESSIBILITY_ASSISTANCE')}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-indigo-50/70 hover:border-indigo-300 text-left transition-all active:scale-[0.98] cursor-pointer group shadow-2xs"
              >
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-all">
                  <Accessibility className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug">Accessibility</div>
                <div className="text-[10px] text-slate-500 mt-0.5">High reach or mobility</div>
              </button>

              {/* 7. Checkout Help */}
              <button
                onClick={() => handleSelectType('CHECKOUT_ASSISTANCE')}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-rose-50/70 hover:border-rose-300 text-left transition-all active:scale-[0.98] cursor-pointer group shadow-2xs"
              >
                <div className="h-9 w-9 rounded-xl bg-rose-600 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-all">
                  <Receipt className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug">Checkout Help</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Billing or self-checkout</div>
              </button>

              {/* 8. Something Else */}
              <button
                onClick={() => handleSelectType('GENERAL_ASSISTANCE')}
                className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-left transition-all active:scale-[0.98] cursor-pointer group shadow-2xs"
              >
                <div className="h-9 w-9 rounded-xl bg-slate-700 text-white flex items-center justify-center mb-2 shadow-2xs group-hover:scale-105 transition-all">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <div className="text-xs font-bold text-slate-900 leading-snug">Something Else</div>
                <div className="text-[10px] text-slate-500 mt-0.5">General store support</div>
              </button>
            </div>
          ) : (
            /* STEP 2: CONFIRMATION & DETAILS */
            <div className="space-y-4">
              {/* Type Summary Badge */}
              <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-cyan-800 tracking-wider">
                    Need Category
                  </span>
                  <div className="text-xs font-bold text-slate-900 mt-0.5">
                    {ASSIST_TYPE_CONFIGS[selectedType]?.label || 'General Assistance'}
                  </div>
                </div>
                <button
                  onClick={() => setStep('SELECT_TYPE')}
                  className="text-xs font-bold text-cyan-700 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Product Context (if present) */}
              {product && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                    Related Product
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{product.name}</span>
                    <span className="text-xs font-extrabold text-cyan-800">{product.price}</span>
                  </div>
                  {shelf && (
                    <div className="text-[11px] text-slate-500 font-medium">
                      Location: {product.aisle} • Shelf {shelf}
                    </div>
                  )}
                </div>
              )}

              {/* Accessibility Specific Option */}
              {selectedType === 'ACCESSIBILITY_ASSISTANCE' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800">
                    What assistance do you need?
                  </label>
                  <div className="space-y-1.5">
                    {ACCESSIBILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAccessibilityNeed(opt)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                          accessibilityNeed === opt
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt}</span>
                        {accessibilityNeed === opt && <Check className="h-4 w-4 text-indigo-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Location Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <MapPin className="h-4 w-4 text-cyan-700" />
                    <span>Your Store Location</span>
                  </div>
                  <button
                    onClick={() => setShowZonePicker(!showZonePicker)}
                    className="text-xs font-bold text-cyan-700 hover:underline cursor-pointer"
                  >
                    {showZonePicker ? 'Done' : 'Change Area'}
                  </button>
                </div>

                <div className="text-xs font-semibold text-slate-800">
                  {selectedZone.name} <span className="text-slate-500 font-normal">({selectedZone.aisle})</span>
                </div>

                {/* Zone Picker Grid */}
                {showZonePicker && (
                  <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200">
                    {CANONICAL_STORE_ZONES.map((zone) => (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => {
                          setSelectedZoneId(zone.id)
                          setShowZonePicker(false)
                        }}
                        className={`p-2 rounded-xl text-left text-xs transition-all border cursor-pointer ${
                          selectedZoneId === zone.id
                            ? 'bg-cyan-700 text-white font-bold border-cyan-700'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>{zone.name}</div>
                        <div className={`text-[10px] ${selectedZoneId === zone.id ? 'text-cyan-200' : 'text-slate-400'}`}>
                          {zone.aisle}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Optional Short Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-800">
                    Add a Note <span className="font-normal text-slate-400">(Optional)</span>
                  </label>
                  {customMessage.length > 150 && (
                    <span className="text-[10px] text-slate-400">{customMessage.length}/200</span>
                  )}
                </div>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="e.g. I checked the shelf but could not find the 1L pack..."
                  maxLength={200}
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white">
          {step === 'SELECT_TYPE' ? (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-700 shrink-0" />
                <div className="text-xs">
                  <span className="text-slate-400 font-medium">Assistance point: </span>
                  <span className="font-bold text-slate-900">{selectedZone.name}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setStep('DETAILS')
                  setShowZonePicker(true)
                }}
                className="text-xs font-bold text-cyan-700 hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isCreating}
              className="w-full py-3.5 rounded-2xl bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-sm shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCreating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Requesting Associate...</span>
                </>
              ) : (
                <>
                  <span>Request Store Staff Help</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
