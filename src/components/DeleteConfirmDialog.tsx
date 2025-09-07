'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-lg text-red-600">
                {t.confirmDelete}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            {t.confirmMessage}
          </p>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm font-medium text-gray-900">
              {t.projectName} <span className="font-semibold">"{projectName}"</span>
            </p>
          </div>
          
          <p className="text-sm text-red-600 font-medium">
            {t.warning}
          </p>
          
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {t.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? t.deleting : t.delete}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
