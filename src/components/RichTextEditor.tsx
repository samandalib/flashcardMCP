'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useLocale } from '@/components/LocaleContext';

interface RichTextEditorProps {
  onSave: (content: string) => Promise<void>;
  initialContent?: string;
  placeholder?: string;
}

export function RichTextEditor({ onSave, initialContent = '', placeholder }: RichTextEditorProps) {
  const { locale, dir } = useLocale();
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setContent(initialContent);
    setHasChanges(false);
  }, [initialContent]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasChanges(value !== initialContent);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    try {
      await onSave(content);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const defaultPlaceholder = locale === 'fa' 
    ? 'اینجا شروع به نوشتن کنید...' 
    : 'Start writing here...';

  return (
    <div className="flex flex-col h-full" dir={dir}>
      {/* Editor Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {locale === 'fa' ? 'ویرایشگر متن' : 'Text Editor'}
          </h2>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-sm text-orange-600">
                {locale === 'fa' ? 'تغییرات ذخیره نشده' : 'Unsaved changes'}
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving 
                ? (locale === 'fa' ? 'در حال ذخیره...' : 'Saving...')
                : (locale === 'fa' ? 'ذخیره' : 'Save')
              }
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 p-4">
        <Textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder={placeholder || defaultPlaceholder}
          className="min-h-[400px] resize-none border-0 focus:ring-0 text-base leading-relaxed"
          dir={dir}
        />
      </div>
    </div>
  );
}
