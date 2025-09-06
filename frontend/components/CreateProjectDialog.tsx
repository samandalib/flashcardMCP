'use client';

import { useState } from 'react';
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

// Translations for the create project dialog
const translations = {
  en: {
    createProject: "Create New Project",
    projectName: "Project Name",
    projectDescription: "Description (optional)",
    projectNamePlaceholder: "Enter project name...",
    projectDescriptionPlaceholder: "Enter project description...",
    create: "Create Project",
    cancel: "Cancel",
    creating: "Creating...",
    nameRequired: "Project name is required",
    nameMinLength: "Project name must be at least 3 characters",
    nameMaxLength: "Project name must be less than 100 characters"
  },
  fa: {
    createProject: "ایجاد پروژه جدید",
    projectName: "نام پروژه",
    projectDescription: "توضیحات (اختیاری)",
    projectNamePlaceholder: "نام پروژه را وارد کنید...",
    projectDescriptionPlaceholder: "توضیحات پروژه را وارد کنید...",
    create: "ایجاد پروژه",
    cancel: "لغو",
    creating: "در حال ایجاد...",
    nameRequired: "نام پروژه الزامی است",
    nameMinLength: "نام پروژه باید حداقل ۳ کاراکتر باشد",
    nameMaxLength: "نام پروژه باید کمتر از ۱۰۰ کاراکتر باشد"
  }
};

interface CreateProjectDialogProps {
  onCreateProject: (projectData: { name: string; description?: string }) => Promise<void>;
}

export function CreateProjectDialog({ onCreateProject }: CreateProjectDialogProps) {
  const { locale, dir } = useLocale();
  const t = translations[locale as keyof typeof translations];
  
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string } = {};
    
    if (!name.trim()) {
      newErrors.name = t.nameRequired;
    } else if (name.trim().length < 3) {
      newErrors.name = t.nameMinLength;
    } else if (name.trim().length > 100) {
      newErrors.name = t.nameMaxLength;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      await onCreateProject({
        name: name.trim(),
        description: description.trim() || undefined
      });
      
      // Reset form and close dialog
      setName('');
      setDescription('');
      setErrors({});
      setOpen(false);
    } catch (error) {
      console.error('Error creating project:', error);
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
        setName('');
        setDescription('');
        setErrors({});
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg">
          {t.createProject}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md" dir={dir}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t.createProject}</DialogTitle>
            <DialogDescription>
              {locale === 'en' 
                ? "Create a new research project to organize your flashcards and findings."
                : "یک پروژه تحقیقاتی جدید ایجاد کنید تا فلش کارت‌ها و یافته‌های خود را سازماندهی کنید."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="project-name">{t.projectName}</Label>
              <Input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.projectNamePlaceholder}
                className={errors.name ? 'border-red-500' : ''}
                disabled={isLoading}
                dir={dir}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="project-description">{t.projectDescription}</Label>
              <Textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.projectDescriptionPlaceholder}
                rows={3}
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
              disabled={isLoading || !name.trim()}
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
