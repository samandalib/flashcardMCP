'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useLocale } from '@/components/LocaleContext';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  isLoading?: boolean;
}

// Translations for delete confirmation dialog
const translations = {
  en: {
    confirmDelete: 'Delete Project',
    confirmMessage: 'Are you sure you want to delete this project?',
    projectName: 'Project:',
    warning: 'This action cannot be undone.',
    cancel: 'Cancel',
    delete: 'Delete',
    deleting: 'Deleting...'
  },
  fa: {
    confirmDelete: 'حذف پروژه',
    confirmMessage: 'آیا مطمئن هستید که می‌خواهید این پروژه را حذف کنید؟',
    projectName: 'پروژه:',
    warning: 'این عمل قابل بازگشت نیست.',
    cancel: 'لغو',
    delete: 'حذف',
    deleting: 'در حال حذف...'
  }
};

export function DeleteConfirmDialog({ 
  isOpen, 
  onClose, 
  onConfirm, 
  projectName, 
  isLoading = false 
}: DeleteConfirmDialogProps) {
  const { locale } = useLocale();
  const t = translations[locale as keyof typeof translations];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t.confirmDelete}
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          <p className="text-gray-700">
            {t.confirmMessage}
          </p>
          
          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              {t.projectName} <span className="font-semibold">"{projectName}"</span>
            </p>
          </div>
          
          <p className="text-sm text-red-600 font-medium">
            {t.warning}
          </p>
          
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? t.deleting : t.delete}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
