import { InsightsView } from '@/components/insights/insights-view';

export default function InsightsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-headline">Insights</h1>
        <p className="text-muted-foreground text-sm">
          Let our AI analyze your recent spending and provide personalized tips to help you save money.
        </p>
      </div>
      <InsightsView />
    </div>
  );
}
