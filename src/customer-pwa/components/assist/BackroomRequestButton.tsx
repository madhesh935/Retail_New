import React from 'react'
import { Inbox, ArrowRight } from 'lucide-react'
import { CustomerProduct } from '../../context/CustomerShoppingContext'
import { useCustomerAssist } from '../../context/CustomerAssistContext'

interface BackroomRequestButtonProps {
  product: CustomerProduct
  className?: string
}

export const BackroomRequestButton: React.FC<BackroomRequestButtonProps> = ({
  product,
  className = '',
}) => {
  const { openHelpSheet } = useCustomerAssist()

  const handleRequestBackroom = (e: React.MouseEvent) => {
    e.stopPropagation()
    openHelpSheet({
      requestType: 'BACKROOM_REQUEST',
      product,
      shelfCode: product.shelf,
      zoneName: product.category,
    })
  }

  return (
    <button
      onClick={handleRequestBackroom}
      className={`w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 transition-all active:scale-[0.98] cursor-pointer shadow-2xs ${className}`}
    >
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-600 text-white shrink-0 shadow-2xs">
          <Inbox className="h-3.5 w-3.5" />
        </div>
        <div className="text-left">
          <div className="text-[11px] font-bold flex items-center gap-1">
            <span>Request From Backroom</span>
            <span className="text-[9px] font-extrabold text-blue-700 bg-blue-100 px-1 py-0.2 rounded border border-blue-300">
              In Stock
            </span>
          </div>
          <span className="text-[10px] text-blue-700/80 font-medium">
            Associate can fetch item for you
          </span>
        </div>
      </div>
      <ArrowRight className="h-3.5 w-3.5 text-blue-700 shrink-0" />
    </button>
  )
}
