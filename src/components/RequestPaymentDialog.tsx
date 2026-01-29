import { useState, type FC } from 'react'
import { usePaymentRequests } from '@/hooks/usePaymentRequests'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Upload, FileText, X } from 'lucide-react'

interface RequestPaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  debtId: string
  debtTitle: string
  debtAmount: number
}

const RequestPaymentDialog: FC<RequestPaymentDialogProps> = ({
  isOpen,
  onClose,
  debtId,
  debtTitle,
  debtAmount
}) => {
  const { createRequest } = usePaymentRequests()
  const [message, setMessage] = useState('')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      alert('Por favor, adicione uma mensagem')
      return
    }

    setIsSubmitting(true)
    
    try {
      await createRequest({
        debt_id: debtId,
        user_id: '', // Será preenchido no hook
        message: message.trim(),
        status: 'open'
      }, receiptFile || undefined)

      setMessage('')
      setReceiptFile(null)
      onClose()
    } catch (error: any) {
      alert('Erro ao enviar solicitação: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo do arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        alert('Apenas arquivos PDF, JPG e PNG são permitidos')
        return
      }

      // Validar tamanho (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo deve ter no máximo 5MB')
        return
      }

      setReceiptFile(file)
    }
  }

  const removeFile = () => {
    setReceiptFile(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Confirmação de Pagamento</DialogTitle>
          <DialogDescription>
            Envie uma solicitação para confirmar o pagamento da dívida "{debtTitle}"
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="font-medium">{debtTitle}</p>
            <p className="text-sm text-gray-600">
              Valor: {(debtAmount / 100).toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
            </p>
          </div>

          <div>
            <Label htmlFor="message">Mensagem</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva como foi feito o pagamento..."
              className="w-full p-2 border rounded-md min-h-[80px] resize-none"
              required
            />
          </div>

          <div>
            <Label htmlFor="receipt">Comprovante de Pagamento (Opcional)</Label>
            <div className="mt-2">
              {receiptFile ? (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-700 truncate max-w-[200px]">
                      {receiptFile.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(receiptFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Clique para upload</span> ou arraste o arquivo
                    </p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG (MAX. 5MB)</p>
                  </div>
                  <input
                    id="receipt"
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !message.trim()}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RequestPaymentDialog
