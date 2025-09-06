'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useLocale } from '@/components/LocaleContext';

// Translations for the create card dialog
const translations = {
  en: {
    createCard: "Create New Card",
    frontSide: "Front Side",
    backSide: "Back Side",
    tags: "Tags (optional)",
    frontPlaceholder: "Enter the question or prompt...",
    backPlaceholder: "Enter the answer or explanation...",
    tagsPlaceholder: "Enter tags separated by commas...",
    create: "Create Card",
    cancel: "Cancel",
    creating: "Creating...",
    frontRequired: "Front side is required",
    backRequired: "Back side is required",
    frontMinLength: "Front side must be at least 3 characters",
    backMinLength: "Back side must be at least 3 characters",
    frontMaxLength: "Front side must be less than 500 characters",
    backMaxLength: "Back side must be less than 1000 characters"
  },
  fa: {
    createCard: "ایجاد کارت جدید",
    frontSide: "روی کارت",
    backSide: "پشت کارت",
    tags: "برچسب‌ها (اختیاری)",
    frontPlaceholder: "سوال یا متن را وارد کنید...",
    backPlaceholder: "پاسخ یا توضیح را وارد کنید...",
    tagsPlaceholder: "برچسب‌ها را با کاما جدا کنید...",
    create: "ایجاد کارت",
    cancel: "لغو",
    creating: "در حال ایجاد...",
    frontRequired: "روی کارت الزامی است",
    backRequired: "پشت کارت الزامی است",
    frontMinLength: "روی کارت باید حداقل ۳ کاراکتر باشد",
    backMinLength: "پشت کارت باید حداقل ۳ کاراکتر باشد",
    frontMaxLength: "روی کارت باید کمتر از ۵۰۰ کاراکتر باشد",
    backMaxLength: "پشت کارت باید کمتر از ۱۰۰۰ کاراکتر باشد"
  }
};

interface CreateCardDialogProps {
  onCreateCard: (cardData: { front: string; back: string; tags?: string[] }) => Promise<void>;
}

export function CreateCardDialog({ onCreateCard }: CreateCardDialogProps) {
  const { locale, dir } = useLocale();
  const t = translations[locale as keyof typeof translations];
  
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ front?: string; back?: string }>({});

  const validateForm = () => {
    const newErrors: { front?: string; back?: string } = {};
    
    if (!front.trim()) {
      newErrors.front = t.frontRequired;
    } else if (front.trim().length < 3) {
      newErrors.front = t.frontMinLength;
    } else if (front.trim().length > 500) {
      newErrors.front = t.frontMaxLength;
    }
    
    if (!back.trim()) {
      newErrors.back = t.backRequired;
    } else if (back.trim().length < 3) {
      newErrors.back = t.backMinLength;
    } else if (back.trim().length > 1000) {
      newErrors.back = t.backMaxLength;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const tags = tagsInput.trim() 
        ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : undefined;

      await onCreateCard({
        front: front.trim(),
        back: back.trim(),
        tags
      });
      
      // Reset form and close dialog
      setFront('');
      setBack('');
      setTagsInput('');
      setErrors({});
      setOpen(false);
    } catch (error) {
      console.error('Error creating card:', error);
      // You could add a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isLoading) {
      setOpen(newOpen);
      if (!newOpen) {
        // Reset form when closing
        setFront('');
        setBack('');
        setTagsInput('');
        setErrors({});
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {t.createCard}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg" dir={dir}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t.createCard}</DialogTitle>
            <DialogDescription>
              {locale === 'en' 
                ? "Create a new flashcard with a question on the front and answer on the back."
                : "یک فلش کارت جدید با سوال در رو و پاسخ در پشت ایجاد کنید."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="card-front">{t.frontSide}</Label>
              <Textarea
                id="card-front"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                placeholder={t.frontPlaceholder}
                rows={3}
                className={errors.front ? 'border-red-500' : ''}
                disabled={isLoading}
                dir={dir}
              />
              {errors.front && (
                <p className="text-sm text-red-500">{errors.front}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="card-back">{t.backSide}</Label>
              <Textarea
                id="card-back"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                placeholder={t.backPlaceholder}
                rows={4}
                className={errors.back ? 'border-red-500' : ''}
                disabled={isLoading}
                dir={dir}
              />
              {errors.back && (
                <p className="text-sm text-red-500">{errors.back}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="card-tags">{t.tags}</Label>
              <Input
                id="card-tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder={t.tagsPlaceholder}
                disabled={isLoading}
                dir={dir}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              {t.cancel}
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !front.trim() || !back.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? t.creating : t.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
