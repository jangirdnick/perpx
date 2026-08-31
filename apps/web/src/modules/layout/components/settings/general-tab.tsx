'use client';

import { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { HugeiconsIcon } from '@hugeicons/react';
import { Sun03Icon, Moon02Icon, ComputerIcon } from '@hugeicons/core-free-icons';

export function GeneralTab() {
  const { theme, setTheme } = useTheme();

  const [defaultModel, setDefaultModel] = useState('perpx-pro');
  const [language, setLanguage] = useState('en');
  const [autoExecute, setAutoExecute] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex flex-col gap-6">
        {/* Theme Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">Theme</p>
            <p className="text-xs text-muted-foreground">Customize your application appearance</p>
          </div>
          <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-secondary/40 p-1">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
                theme === 'light'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <HugeiconsIcon icon={Sun03Icon} className="size-3.5" />
              Light
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
                theme === 'dark'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <HugeiconsIcon icon={Moon02Icon} className="size-3.5" />
              Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer',
                theme === 'system'
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              <HugeiconsIcon icon={ComputerIcon} className="size-3.5" />
              System
            </button>
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Primary AI Model */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">Default AI Model</p>
            <p className="text-xs text-muted-foreground">Model used for new conversations</p>
          </div>
          <Select value={defaultModel} onValueChange={setDefaultModel}>
            <SelectTrigger className="w-full sm:w-50 h-9 text-xs bg-secondary/40 border-border/40">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="perpx-flash">Perpx Flash v2 (Fastest)</SelectItem>
              <SelectItem value="perpx-pro">Perpx Pro (Recommended)</SelectItem>
              <SelectItem value="claude-35">Claude 3.5 Sonnet</SelectItem>
              <SelectItem value="gpt-4o">GPT-4o Omnimodal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-border/40" />

        {/* Language Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">Interface Language</p>
            <p className="text-xs text-muted-foreground">Select your preferred display language</p>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-full sm:w-50 h-9 text-xs bg-secondary/40 border-border/40">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English (US)</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator className="bg-border/40" />

        {/* Auto execute code toggle */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">Auto-run safe code</p>
            <p className="text-xs text-muted-foreground">
              Automatically execute harmless code blocks
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAutoExecute(!autoExecute)}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
              autoExecute ? 'bg-primary' : 'bg-muted',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out',
                autoExecute ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </button>
        </div>

        <Separator className="bg-border/40" />

        {/* Sound toggle */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-foreground">Sound effects</p>
            <p className="text-xs text-muted-foreground">
              Play a chime when AI finishes generating
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={cn(
              'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden',
              soundEnabled ? 'bg-primary' : 'bg-muted',
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block size-4 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out',
                soundEnabled ? 'translate-x-4' : 'translate-x-0',
              )}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
