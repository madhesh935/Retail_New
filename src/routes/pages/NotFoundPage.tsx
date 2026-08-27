import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4 font-sans select-none">
      <div className="h-12 w-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shadow-2xs">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          404 - Page Not Found
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          The requested retail operations stream or viewpoint does not exist in this Edge OS profile.
        </p>
      </div>
      <Link to="/command-center">
        <Button variant="action" size="sm" className="gap-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold">
          <Home className="h-4 w-4" /> Return to Command Center
        </Button>
      </Link>
    </div>
  )
}
