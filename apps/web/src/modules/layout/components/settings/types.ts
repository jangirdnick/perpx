import {
  Settings02Icon,
  UserCircleIcon,
  DatabaseIcon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';

export type TabId = 'general' | 'profile' | 'data' | 'about';

export interface TabItem {
  id: TabId;
  label: string;
  icon: typeof Settings02Icon;
}

export const TABS: readonly TabItem[] = [
  { id: 'general', label: 'General', icon: Settings02Icon },
  { id: 'profile', label: 'Profile', icon: UserCircleIcon },
  { id: 'data', label: 'Data controls', icon: DatabaseIcon },
  { id: 'about', label: 'About', icon: InformationCircleIcon },
] as const;

export interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
