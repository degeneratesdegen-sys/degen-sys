'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/utils';
import { ProjectionChart } from '@/components/retirement-planner/projection-chart';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface ProjectionData {
  year: number;
  value: number;
}

export default function PlanForRetirementPage() {
  const [currentAge, setCurrentAge] = useState('30');
  const [retirementAge, setRetirementAge] = useState('65');
  const [currentSavings, setCurrentSavings] = useState('50000');
  const [monthlyContribution, setMonthlyContribution] = useState('500');
  const [annualReturn, setAnnualReturn] = useState([7]);
  const [investmentType, setInvestmentType] = useState('apy');
  const [gicRate, setGicRate] = useState('5');

  const [results, setResults] = useState<{ projectedValue: number; chartData: ProjectionData[] } | null>(null);

  const calculateRetirement = () => {
    const age = parseInt(currentAge);
    const retAge = parseInt(retirementAge);
    const principal = parseFloat(currentSavings);
    const pmt = parseFloat(monthlyContribution);
    
    const effectiveAnnualReturn = investmentType === 'apy' ? annualReturn[0] : parseFloat(gicRate);
    const rate = effectiveAnnualReturn / 100;

    const yearsToRetirement = retAge - age;

    if (isNaN(age) || isNaN(retAge) || isNaN(principal) || isNaN(pmt) || yearsToRetirement <= 0 || isNaN(rate)) {
      return;
    }

    const monthlyRate = rate / 12;
    const numMonths = yearsToRetirement * 12;

    let futureValue = principal * Math.pow(1 + monthlyRate, numMonths);
    futureValue += pmt * ((Math.pow(1 + monthlyRate, numMonths) - 1) / monthlyRate);

    const chartData: ProjectionData[] = [];
    let yearValue = principal;
    for (let i = 0; i <= yearsToRetirement; i++) {
      chartData.push({ year: age + i, value: yearValue });
      yearValue = (yearValue + pmt * 12) * (1 + rate);
    }
    
    setResults({
      projectedValue: futureValue,
      chartData,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-headline">Retirement Planner</h1>
        <p className="text-muted-foreground text-sm">
          How much do you want to have saved when you retire? Run your options to see how to get there, and when.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Retirement Calculator</CardTitle>
              <CardDescription>Enter your details to project your savings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="current-age">Current Age</Label>
                  <Input id="current-age" type="number" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="retirement-age">Retirement Age</Label>
                  <Input id="retirement-age" type="number" value={retirementAge} onChange={(e) => setRetirementAge(e.target.value)} />
                </div>
              </div>
               <div className="space-y-2">
                <Label htmlFor="current-savings">Current Savings ($)</Label>
                <Input id="current-savings" type="number" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-contribution">Monthly Contribution ($)</Label>
                <Input id="monthly-contribution" type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} />
              </div>
              
              <div className="space-y-3">
                <Label>Investment Strategy</Label>
                 <RadioGroup value={investmentType} onValueChange={setInvestmentType} className="flex gap-4 pt-1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="apy" id="apy" />
                    <Label htmlFor="apy" className="font-normal">Variable APY</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gic" id="gic" />
                    <Label htmlFor="gic" className="font-normal">Fixed GIC</Label>
                  </div>
                </RadioGroup>
              </div>

              {investmentType === 'apy' ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="annual-return">Estimated Annual Return</Label>
                    <span className="text-sm font-medium">{annualReturn[0]}%</span>
                  </div>
                  <Slider id="annual-return" min={0} max={15} step={0.5} value={annualReturn} onValueChange={setAnnualReturn} />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="gic-rate">GIC Rate (%)</Label>
                  <Input id="gic-rate" type="number" value={gicRate} onChange={(e) => setGicRate(e.target.value)} placeholder="e.g. 5" />
                </div>
              )}

            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={calculateRetirement}>Calculate</Button>
            </CardFooter>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Your Retirement Projection</CardTitle>
              <CardDescription>
                {results ? 'Here is how your savings could grow over time.' : 'Your results will be displayed here after calculation.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-4">
                   <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Projected Nest Egg at age {retirementAge}</p>
                      <p className="text-4xl font-bold font-headline">{formatCurrency(results.projectedValue)}</p>
                    </div>
                  <ProjectionChart data={results.chartData} />
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center text-muted-foreground text-center">
                  <p>Click "Calculate" to see your projection.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}