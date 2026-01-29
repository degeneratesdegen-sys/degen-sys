'use client';

import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

export function ThemeSetting() {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a skeleton loader
  }
  
  const isDarkMode = resolvedTheme === 'dark';

  return (
    <div className="flex items-center space-x-2 pt-2">
      <Switch
        id="dark-mode"
        checked={isDarkMode}
        onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
      />
      <Label htmlFor="dark-mode">Dark Mode</Label>
    </div>
  );
}
