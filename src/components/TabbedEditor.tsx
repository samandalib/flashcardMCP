'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Plus, X, Save } from 'lucide-react';
import { useLocale } from '@/components/LocaleContext';
import { NoteTabs } from '@/lib/supabase';

interface TabbedEditorProps {
  noteId: string;
  initialTabs?: NoteTabs;
  initialActiveTab?: string;
  onSave: (noteId: string, tabs: NoteTabs, activeTab: string) => Promise<void>;
  isSaving?: boolean;
}

// Translations for tabbed editor
const translations = {
  en: {
    finding: 'Finding',
    evidence: 'Evidence', 
    details: 'Details',
    addTab: 'Add Tab',
    tabName: 'Tab Name',
    save: 'Save',
    saving: 'Saving...',
    unsavedChanges: 'Unsaved changes',
    saved: 'Saved',
    deleteTab: 'Delete Tab',
    confirmDeleteTab: 'Are you sure you want to delete this tab?'
  },
  fa: {
    finding: 'یافته',
    evidence: 'شواهد',
    details: 'جزئیات',
    addTab: 'افزودن تب',
    tabName: 'نام تب',
    save: 'ذخیره',
    saving: 'در حال ذخیره...',
    unsavedChanges: 'تغییرات ذخیره نشده',
    saved: 'ذخیره شده',
    deleteTab: 'حذف تب',
    confirmDeleteTab: 'آیا مطمئن هستید که می‌خواهید این تب را حذف کنید؟'
  }
};

export function TabbedEditor({ 
  noteId, 
  initialTabs = {}, 
  initialActiveTab = 'finding',
  onSave,
  isSaving = false 
}: TabbedEditorProps) {
  const { locale } = useLocale();
  const t = translations[locale as keyof typeof translations];
  
  const [tabs, setTabs] = useState<NoteTabs>(initialTabs);
  const [activeTab, setActiveTab] = useState<string>(initialActiveTab);
  const [hasChanges, setHasChanges] = useState(false);
  const [newTabName, setNewTabName] = useState('');
  const [showAddTab, setShowAddTab] = useState(false);

  // Initialize with default tabs if none exist
  useEffect(() => {
    if (Object.keys(tabs).length === 0) {
      const defaultTabs: NoteTabs = {
        finding: {
          content: '',
          order: 1,
          created_at: new Date().toISOString()
        },
        evidence: {
          content: '',
          order: 2,
          created_at: new Date().toISOString()
        },
        details: {
          content: '',
          order: 3,
          created_at: new Date().toISOString()
        }
      };
      setTabs(defaultTabs);
      setActiveTab('finding');
    }
  }, [tabs]);

  const handleTabContentChange = (tabName: string, content: string) => {
    setTabs(prev => ({
      ...prev,
      [tabName]: {
        ...prev[tabName],
        content
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await onSave(noteId, tabs, activeTab);
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving tabs:', error);
    }
  };

  const addCustomTab = () => {
    if (newTabName.trim()) {
      const tabName = newTabName.trim().toLowerCase().replace(/\s+/g, '_');
      const maxOrder = Math.max(...Object.values(tabs).map(tab => tab.order));
      
      setTabs(prev => ({
        ...prev,
        [tabName]: {
          content: '',
          order: maxOrder + 1,
          created_at: new Date().toISOString()
        }
      }));
      
      setActiveTab(tabName);
      setNewTabName('');
      setShowAddTab(false);
      setHasChanges(true);
    }
  };

  const deleteTab = (tabName: string) => {
    if (Object.keys(tabs).length <= 1) return; // Don't delete the last tab
    
    const newTabs = { ...tabs };
    delete newTabs[tabName];
    setTabs(newTabs);
    
    if (activeTab === tabName) {
      const remainingTabs = Object.keys(newTabs);
      setActiveTab(remainingTabs[0]);
    }
    
    setHasChanges(true);
  };

  const getTabDisplayName = (tabName: string) => {
    const displayNames: Record<string, string> = {
      finding: t.finding,
      evidence: t.evidence,
      details: t.details
    };
    return displayNames[tabName] || tabName.replace(/_/g, ' ');
  };

  const getTabBackgroundColor = (tabName: string) => {
    const colors: Record<string, string> = {
      finding: 'bg-blue-50 border-blue-200', // Light blue
      evidence: 'bg-green-50 border-green-200', // Light green
      details: 'bg-purple-50 border-purple-200', // Light purple
    };
    
    // For custom tabs, use a cycling pattern
    if (!colors[tabName]) {
      const customTabIndex = Object.keys(tabs).filter(key => !colors[key]).indexOf(tabName);
      const customColors = [
        'bg-orange-50 border-orange-200', // Light orange
        'bg-pink-50 border-pink-200', // Light pink
        'bg-indigo-50 border-indigo-200', // Light indigo
        'bg-teal-50 border-teal-200', // Light teal
        'bg-yellow-50 border-yellow-200', // Light yellow
        'bg-red-50 border-red-200', // Light red
      ];
      return customColors[customTabIndex % customColors.length];
    }
    
    return colors[tabName];
  };

  const getTabTextColor = (tabName: string) => {
    const colors: Record<string, string> = {
      finding: 'text-blue-700',
      evidence: 'text-green-700',
      details: 'text-purple-700',
    };
    
    if (!colors[tabName]) {
      const customTabIndex = Object.keys(tabs).filter(key => !colors[key]).indexOf(tabName);
      const customColors = [
        'text-orange-700',
        'text-pink-700',
        'text-indigo-700',
        'text-teal-700',
        'text-yellow-700',
        'text-red-700',
      ];
      return customColors[customTabIndex % customColors.length];
    }
    
    return colors[tabName];
  };

  const sortedTabs = Object.entries(tabs).sort(([,a], [,b]) => a.order - b.order);

  return (
    <div className="flex flex-col h-full">
      {/* Tab Header */}
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2 overflow-x-auto">
            {sortedTabs.map(([tabName]) => (
              <div key={tabName} className="flex items-center">
                <Button
                  variant={activeTab === tabName ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tabName)}
                  className={`whitespace-nowrap transition-all duration-200 ${
                    activeTab === tabName 
                      ? `${getTabBackgroundColor(tabName)} ${getTabTextColor(tabName)} border-2` 
                      : `text-gray-900 hover:${getTabBackgroundColor(tabName)} hover:${getTabTextColor(tabName)}`
                  }`}
                >
                  {getTabDisplayName(tabName)}
                </Button>
                {tabName !== 'finding' && tabName !== 'evidence' && tabName !== 'details' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTab(tabName)}
                    className="ml-1 p-1 h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
            
            {showAddTab ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  placeholder={t.tabName}
                  className="w-32 h-8"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addCustomTab();
                    if (e.key === 'Escape') setShowAddTab(false);
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={addCustomTab} className="h-8">
                  <Plus className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setShowAddTab(false)}
                  className="h-8"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddTab(true)}
                  className="text-blue-600 hover:text-blue-700 text-gray-900"
                >
                <Plus className="h-3 w-3 mr-1" />
                {t.addTab}
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {hasChanges && (
              <span className="text-sm text-orange-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                {t.unsavedChanges}
              </span>
            )}
            {!hasChanges && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {t.saved}
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-3 w-3 mr-1" />
              {isSaving ? t.saving : t.save}
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4">
        <Card className={`h-full ${getTabBackgroundColor(activeTab)}`}>
          <CardContent className="p-4 h-full">
            <textarea
              value={tabs[activeTab]?.content || ''}
              onChange={(e) => handleTabContentChange(activeTab, e.target.value)}
              placeholder={`${getTabDisplayName(activeTab)} content...`}
              className="w-full h-full resize-none border-none outline-none text-sm leading-relaxed bg-transparent"
              style={{ minHeight: '400px' }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
