'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Type, 
  List, 
  Image, 
  Mic, 
  Paperclip, 
  Search,
  Settings,
  Lock,
  Upload,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight
} from 'lucide-react';
import { useLocale } from '@/components/LocaleContext';

// Translations for the rich text editor
const translations = {
  en: {
    newNote: "New Note",
    searchPlaceholder: "Search notes...",
    insertImage: "Insert Image",
    recordAudio: "Record Audio",
    attachFile: "Attach File",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    alignLeft: "Align Left",
    alignCenter: "Align Center",
    alignRight: "Align Right",
    bulletList: "Bullet List",
    numberedList: "Numbered List",
    insertTable: "Insert Table",
    saveNote: "Save Note",
    saved: "Saved",
    saving: "Saving...",
    lastSaved: "Last saved"
  },
  fa: {
    newNote: "یادداشت جدید",
    searchPlaceholder: "جستجو در یادداشت‌ها...",
    insertImage: "درج تصویر",
    recordAudio: "ضبط صدا",
    attachFile: "ضمیمه فایل",
    bold: "پررنگ",
    italic: "مایل",
    underline: "زیرخط",
    alignLeft: "تراز چپ",
    alignCenter: "تراز وسط",
    alignRight: "تراز راست",
    bulletList: "فهرست نقطه‌ای",
    numberedList: "فهرست شماره‌دار",
    insertTable: "درج جدول",
    saveNote: "ذخیره یادداشت",
    saved: "ذخیره شد",
    saving: "در حال ذخیره...",
    lastSaved: "آخرین ذخیره"
  }
};

interface RichTextEditorProps {
  onSave: (content: string) => Promise<void>;
  initialContent?: string;
  placeholder?: string;
}

export function RichTextEditor({ onSave, initialContent = '', placeholder }: RichTextEditorProps) {
  const { locale, dir } = useLocale();
  const t = translations[locale as keyof typeof translations];

  // Ensure direction is correctly set
  const editorDirection = locale === 'fa' ? 'rtl' : 'ltr';

  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  // Update content when initialContent changes
  useEffect(() => {
    if (editorRef.current && !isDirty) {
      editorRef.current.innerHTML = initialContent || '';
      setContent(initialContent);
    }
  }, [initialContent, isDirty]);

  // Set initial content on mount
  useEffect(() => {
    if (editorRef.current && !content && initialContent) {
      editorRef.current.innerHTML = initialContent;
    }
  }, []);

  const handleInput = useCallback(() => {
    if (editorRef.current && !isComposing) {
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      setIsDirty(true);
    }
  }, [isComposing]);

  const handleCompositionStart = useCallback(() => {
    setIsComposing(true);
  }, []);

  const handleCompositionEnd = useCallback(() => {
    setIsComposing(false);
    handleInput();
  }, [handleInput]);

  const handleSave = async () => {
    if (!isDirty) return;
    
    setIsSaving(true);
    try {
      await onSave(content);
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const execCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      // Use setTimeout to ensure DOM is updated before we read it
      setTimeout(handleInput, 0);
    }
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target?.result as string;
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.margin = '10px 0';
          img.style.borderRadius = '8px';
          
          if (editorRef.current) {
            editorRef.current.focus();
            document.execCommand('insertHTML', false, img.outerHTML);
            setTimeout(handleInput, 0);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const insertTable = () => {
    const tableHTML = `
      <table style="border: 1px solid #ccc; border-collapse: collapse; margin: 10px 0; width: 100%;">
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px; min-height: 30px;" contenteditable="true"></td>
          <td style="border: 1px solid #ccc; padding: 8px; min-height: 30px;" contenteditable="true"></td>
          <td style="border: 1px solid #ccc; padding: 8px; min-height: 30px;" contenteditable="true"></td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px; min-height: 30px;" contenteditable="true"></td>
          <td style="border: 1px solid #ccc; padding: 8px; min-height: 30px;" contenteditable="true"></td>
          <td style="border: 1px solid #ccc; padding: 8px; min-height: 30px;" contenteditable="true"></td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 8px; min-height: 30px;" contenteditable="true"></td>
          <td style="border: 1px solid #ccc; padding: 8px; min-height: 30px;" contenteditable="true"></td>
          <td style="border: 1px solid #ccc; padding: 8px; min-height: 30px;" contenteditable="true"></td>
        </tr>
      </table>
    `;
    
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand('insertHTML', false, tableHTML);
      setTimeout(handleInput, 0);
    }
  };

  const insertList = (type: 'ul' | 'ol') => {
    execCommand(type === 'ul' ? 'insertUnorderedList' : 'insertOrderedList');
  };

  return (
    <div className="h-full flex flex-col bg-white" dir={dir}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          {/* Text Formatting */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('bold')}
              className="h-8 w-8 p-0"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('italic')}
              className="h-8 w-8 p-0"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('underline')}
              className="h-8 w-8 p-0"
            >
              <Underline className="h-4 w-4" />
            </Button>
          </div>

          {/* Alignment */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('justifyLeft')}
              className="h-8 w-8 p-0"
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('justifyCenter')}
              className="h-8 w-8 p-0"
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => execCommand('justifyRight')}
              className="h-8 w-8 p-0"
            >
              <AlignRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertList('ul')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertList('ol')}
              className="h-8 w-8 p-0"
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>

          {/* Media */}
          <div className="flex items-center gap-1 border-r border-gray-300 pr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={insertImage}
              className="h-8 w-8 p-0"
              title={t.insertImage}
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* TODO: Implement audio recording */}}
              className="h-8 w-8 p-0"
              title={t.recordAudio}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* TODO: Implement file attachment */}}
              className="h-8 w-8 p-0"
              title={t.attachFile}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={insertTable}
              className="h-8 w-8 p-0"
              title={t.insertTable}
            >
              <Type className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Save Status */}
          <div className="text-sm text-gray-500">
            {isSaving ? (
              <span className="flex items-center gap-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                {t.saving}
              </span>
            ) : lastSaved ? (
              <span>{t.lastSaved}: {lastSaved.toLocaleTimeString(locale === 'fa' ? 'fa-IR' : 'en-US')}</span>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* TODO: Implement settings */}}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* TODO: Implement sharing */}}
              className="h-8 w-8 p-0"
            >
              <Lock className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {/* TODO: Implement export */}}
              className="h-8 w-8 p-0"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-6" dir={editorDirection}>
        <div
          ref={editorRef}
          contentEditable
          dir={editorDirection}
          className={`min-h-full outline-none text-gray-800 leading-relaxed ${editorDirection === 'ltr' ? 'text-left' : 'text-right'}`}
          style={{
            fontFamily: locale === 'fa' ? 'Vazir, Arial, sans-serif' : 'system-ui, -apple-system, sans-serif',
            fontSize: '16px',
            lineHeight: '1.6',
            direction: editorDirection,
            textAlign: editorDirection === 'rtl' ? 'right' : 'left',
            unicodeBidi: 'embed',
            writingMode: 'horizontal-tb',
            // Force direction override
            WebkitUserSelect: 'text',
            userSelect: 'text'
          }}
          onInput={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onKeyDown={(e) => {
            // Auto-save on Ctrl+S (Cmd+S on Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
              e.preventDefault();
              handleSave();
            }
          }}
          onBlur={handleSave}
          suppressContentEditableWarning={true}
          data-placeholder={placeholder || (locale === 'fa' ? 'اینجا شروع به نوشتن کنید...' : 'Start writing here...')}
        />
      </div>
    </div>
  );
}
