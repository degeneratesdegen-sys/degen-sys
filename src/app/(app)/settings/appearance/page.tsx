import { ThemeSetting } from '@/components/settings/theme-setting';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AppearanceSettingsPage() {
  return (
    <Card>
        <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>
            Choose how you want the application to look.
        </CardDescription>
        </CardHeader>
        <CardContent>
        <ThemeSetting />
        </CardContent>
    </Card>
  );
}
