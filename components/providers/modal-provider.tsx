"use client"

import { createContext, useContext, useState, type ReactNode } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '../ui/drawer'
import { useMediaQuery } from '@/hooks'

export interface ModalConfig {
  id: string
  title?: string
  description?: string
  content: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closable?: boolean
  onClose?: () => void
}

interface ModalContextType {
  modals: ModalConfig[]
  openModal: (config: Omit<ModalConfig, 'id'>) => string
  closeModal: (id: string) => void
  closeAll: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

interface ModalProviderProps {
  children: ReactNode
}

export function ModalProvider({ children }: ModalProviderProps) {
  const [modals, setModals] = useState<ModalConfig[]>([])
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const openModal = (config: Omit<ModalConfig, 'id'>): string => {
    const id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const modalConfig: ModalConfig = {
      ...config,
      id,
      closable: config.closable ?? true
    }

    setModals(prev => [...prev, modalConfig])
    return id
  }

  const closeModal = (id: string) => {
    setModals(prev => {
      const modal = prev.find(m => m.id === id)
      if (modal?.onClose) {
        modal.onClose()
      }
      return prev.filter(m => m.id !== id)
    })
  }

  const closeAll = () => {
    modals.forEach(modal => {
      if (modal.onClose) {
        modal.onClose()
      }
    })
    setModals([])
  }

  const getSizeClasses = (size: ModalConfig['size'] = 'md') => {
    switch (size) {
      case 'sm':
        return 'max-w-md'
      case 'lg':
        return 'max-w-2xl'
      case 'xl':
        return 'max-w-4xl'
      case 'full':
        return 'max-w-[95vw] max-h-[95vh]'
      default:
        return 'max-w-lg'
    }
  }

  const value: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAll
  }

  return (
    <ModalContext.Provider value={value}>
      {children}

      {/* Render modals */}
      {modals.map((modal) => {
        if (isDesktop) {
          return (
            <Dialog
              key={modal.id}
              open={true}
              onOpenChange={(open) => {
                if (!open && modal.closable !== false) {
                  closeModal(modal.id)
                }
              }}
            >
              <DialogContent className={getSizeClasses(modal.size)}>
                {(modal.title || modal.description) && (
                  <DialogHeader>
                    {modal.title && <DialogTitle>{modal.title}</DialogTitle>}
                    {modal.description && <DialogDescription>{modal.description}</DialogDescription>}
                  </DialogHeader>
                )}
                {modal.content}
              </DialogContent>
            </Dialog>
          )
        } else {
          return (
            <Drawer
              key={modal.id}
              open={true}
              onOpenChange={(open) => {
                if (!open && modal.closable !== false) {
                  closeModal(modal.id)
                }
              }}
            >
              <DrawerContent>
                {(modal.title || modal.description) && (
                  <DrawerHeader>
                    {modal.title && <DrawerTitle>{modal.title}</DrawerTitle>}
                    {modal.description && <DrawerDescription>{modal.description}</DrawerDescription>}
                  </DrawerHeader>
                )}
                {modal.content}
              </DrawerContent>
            </Drawer>
          )
        }
      })}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}

// Convenience hook for common modal patterns
export function useModalDialog() {
  const { openModal, closeModal } = useModal()

  const confirm = (config: {
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void
    onCancel?: () => void
  }) => {
    const modalId = openModal({
      title: config.title,
      description: config.description,
      content: (
        <div className="flex gap-3 pt-4">
          <button
            onClick={() => {
              config.onConfirm()
              closeModal(modalId)
            }}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            {config.confirmText || 'Confirm'}
          </button>
          <button
            onClick={() => {
              config.onCancel?.()
              closeModal(modalId)
            }}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            {config.cancelText || 'Cancel'}
          </button>
        </div>
      )
    })

    return modalId
  }

  const alert = (config: {
    title: string
    description: string
    buttonText?: string
    onClose?: () => void
  }) => {
    return openModal({
      title: config.title,
      description: config.description,
      content: (
        <div className="flex justify-end pt-4">
          <button
            onClick={() => {
              config.onClose?.()
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {config.buttonText || 'OK'}
          </button>
        </div>
      )
    })
  }

  return { confirm, alert }
}

