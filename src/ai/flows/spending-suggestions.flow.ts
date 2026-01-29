'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing spending insights to users based on their transaction history.
 *
 * It exports:
 * - `getSpendingInsights`: An async function that takes a user's transaction data and returns personalized spending insights.
 * - `SpendingInsightsInput`: The input type for the `getSpendingInsights` function, defining the expected structure of the transaction data.
 * - `SpendingInsightsOutput`: The output type for the `getSpendingInsights` function, defining the structure of the spending insights returned.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TransactionSchema = z.object({
  date: z.string(),
  category: z.string().optional(),
  amount: z.number(),
  description: z.string().optional(),
});

const SpendingInsightsInputSchema = z.object({
  transactions: z.array(TransactionSchema).describe('An array of the user transactions.'),
  monthlyBudget: z.number().describe('The user\'s current monthly budget'),
});
export type SpendingInsightsInput = z.infer<typeof SpendingInsightsInputSchema>;

const SpendingInsightsOutputSchema = z.object({
  summary: z.string().describe("A one-paragraph summary of the user's spending habits."),
  topSpendingCategories: z.array(
    z.object({
      category: z.string().describe("The name of the spending category."),
      amount: z.number().describe("The total amount spent in this category."),
    })
  ).describe('A list of the top 3-5 spending categories.'),
  suggestions: z.array(
    z.object({
      category: z.string().describe('The category to which the suggestion applies.'),
      suggestion: z.string().describe('A suggestion for reducing spending in this category.'),
      potentialSavings: z.number().optional().describe('The potential savings from implementing this suggestion, or null if not quantifiable.'),
    })
  ).describe('An array of spending suggestions.'),
});
export type SpendingInsightsOutput = z.infer<typeof SpendingInsightsOutputSchema>;

export async function getSpendingInsights(input: SpendingInsightsInput): Promise<SpendingInsightsOutput> {
  return spendingInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'spendingInsightsPrompt',
  input: {schema: SpendingInsightsInputSchema},
  output: {schema: SpendingInsightsOutputSchema},
  prompt: `You are a friendly and helpful personal finance advisor.
Analyze the user's transaction history and monthly budget to provide a clear, concise summary of their spending habits, identify their top 3-5 spending categories, and offer personalized, actionable suggestions for improvement.

**Analysis requirements:**

1.  **Spending Summary:** Write a brief, one-paragraph summary of the user's financial activity for the period. Mention if they are within their overall budget and highlight any notable patterns (e.g., high spending on weekends, consistent savings).
2.  **Top Spending Categories:** List the top 3 to 5 categories where the user has spent the most money.
3.  **Actionable Suggestions:** Provide a few specific, easy-to-understand suggestions for reducing expenses or better managing their budget. For each suggestion, provide the category it applies to. If a suggestion could result in a quantifiable amount of savings, include the potentialSavings field.

Here is the user's transaction history:
{{#each transactions}}
- Date: {{date}}, {{#if category}}Category: {{category}}, {{/if}}Amount: {{amount}}{{#if description}}, Description: {{description}}{{/if}}
{{/each}}

The user's monthly budget is: {{monthlyBudget}}

Please provide the response in the structured format requested.`,
});

const spendingInsightsFlow = ai.defineFlow(
  {
    name: 'spendingInsightsFlow',
    inputSchema: SpendingInsightsInputSchema,
    outputSchema: SpendingInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
