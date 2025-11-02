import { cn } from '../ui/utils';
import { Button } from '../ui/button';
import { LucideIcon } from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ items, currentView, onViewChange }: SidebarProps) {
  return (
    <div className="fixed left-0 top-14 h-[calc(100vh-3.5rem)] w-64 flex flex-col bg-card border-r">
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentView === item.id ? 'secondary' : 'ghost'}
              className={cn(
                'w-full justify-start',
                currentView === item.id && 'bg-secondary'
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </div>
  );
}