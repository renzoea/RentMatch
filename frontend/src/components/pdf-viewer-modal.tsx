'use client'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PDFViewerModalProps {
  open: boolean
  pdfUrl: string | null
  onClose: () => void
  title?: string
}

export default function PDFViewerModal({ open, pdfUrl, onClose, title = "Contrato PDF" }: PDFViewerModalProps) {
  if (!open || !pdfUrl) return null

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = 'contrato.pdf'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 px-6 py-4 flex items-center justify-between rounded-t-2xl flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownload}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Download className="w-5 h-5 mr-2" />
              Descargar
            </Button>
            <button
              onClick={onClose}
              className="text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-100 rounded-b-2xl">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Viewer"
          />
        </div>
      </div>
    </div>
  )
}
