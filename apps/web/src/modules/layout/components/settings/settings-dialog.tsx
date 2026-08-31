'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import { SettingsDialogProps, TabId, TABS } from './types';
import { GeneralTab } from './general-tab';
import { ProfileTab } from './profile-tab';
import { DataControlsTab } from './data-controls-tab';
import { AboutTab } from './about-tab';

export default function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<TabId>('profile');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] md:w-full md:max-w-4xl p-0 gap-0 overflow-hidden bg-background border-border/40 shadow-2xl rounded-2xl h-[85vh] md:h-1/2 max-h-3/4 flex flex-col md:flex-row sm:rounded-2xl scrollbar-hide">
        <DialogTitle className="sr-only">Settings</DialogTitle>

        {/* Sidebar Navigation */}
        <div className="w-full md:w-70 bg-secondary/30 flex flex-col border-b md:border-b-0 md:border-r border-border/40 shrink-0">
          <div className="p-4 md:p-5 md:pb-4">
            <h2 className="font-semibold text-lg tracking-tight">Settings</h2>
          </div>

          <div className="overflow-x-auto md:overflow-y-auto p-2 md:p-3 flex md:flex-col gap-1 md:space-y-1 scrollbar-hide!">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-3 py-2 md:py-2.5 rounded-xl text-sm transition-all duration-200 whitespace-nowrap cursor-pointer',
                    isActive
                      ? 'bg-secondary text-foreground font-medium shadow-sm'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
                  )}
                >
                  <HugeiconsIcon
                    icon={tab.icon}
                    className={cn('size-4', isActive ? 'text-foreground' : 'text-muted-foreground')}
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 flex flex-col bg-background overflow-hidden scrollbar-hide">
          <div className="flex items-center px-4 md:px-8 py-4 md:py-5 border-b border-border/10">
            <h3 className="font-semibold text-lg">{TABS.find((t) => t.id === activeTab)?.label}</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-hide scroll-smooth">
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'profile' && <ProfileTab open={open} />}
            {activeTab === 'data' && <DataControlsTab onOpenChange={onOpenChange} />}
            {activeTab === 'about' && <AboutTab />}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
