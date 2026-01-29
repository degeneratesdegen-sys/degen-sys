# Styling Guide

This file contains the core styling configuration for the application.

## `src/app/globals.css`

This file defines the color palette, border radius, and other core CSS variables for both light and dark themes.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 220 20% 97%;
    --foreground: 220 10% 15%;
    --card: 220 20% 100%;
    --card-foreground: 220 10% 15%;
    --popover: 220 20% 100%;
    --popover-foreground: 220 10% 15%;
    --primary: 250 80% 60%;
    --primary-foreground: 0 0% 100%;
    --secondary: 220 15% 90%;
    --secondary-foreground: 220 10% 25%;
    --muted: 220 15% 94%;
    --muted-foreground: 220 10% 45%;
    --accent: 200 100% 50%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 15% 85%;
    --input: 220 15% 90%;
    --ring: 250 80% 60%;
    --chart-1: 250 80% 60%;
    --chart-2: 200 100% 50%;
    --chart-3: 250 70% 70%;
    --chart-4: 200 80% 65%;
    --chart-5: 250 50% 80%;
    --radius: 0.5rem;
    --sidebar-background: 220 15% 20%;
    --sidebar-foreground: 220 15% 90%;
    --sidebar-primary: 200 100% 50%;
    --sidebar-primary-foreground: 220 10% 15%;
    --sidebar-accent: 220 15% 30%;
    --sidebar-accent-foreground: 220 15% 95%;
    --sidebar-border: 220 15% 30%;
    --sidebar-ring: 200 100% 50%;
  }

  .dark {
    --background: 220 15% 10%;
    --foreground: 220 15% 90%;
    --card: 220 15% 15%;
    --card-foreground: 220 15% 90%;
    --popover: 220 15% 15%;
    --popover-foreground: 220 15% 90%;
    --primary: 250 80% 60%;
    --primary-foreground: 0 0% 100%;
    --secondary: 220 15% 25%;
    --secondary-foreground: 220 15% 95%;
    --muted: 220 15% 25%;
    --muted-foreground: 220 15% 65%;
    --accent: 200 100% 50%;
    --accent-foreground: 220 10% 15%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 15% 25%;
    --input: 220 15% 25%;
    --ring: 250 80% 60%;
    --chart-1: 250 80% 60%;
    --chart-2: 200 100% 50%;
    --chart-3: 250 70% 70%;
    --chart-4: 200 80% 65%;
    --chart-5: 250 50% 80%;
    --sidebar-background: 220 15% 15%;
    --sidebar-foreground: 220 15% 90%;
    --sidebar-primary: 200 100% 50%;
    --sidebar-primary-foreground: 220 10% 15%;
    --sidebar-accent: 220 15% 25%;
    --sidebar-accent-foreground: 220 15% 95%;
    --sidebar-border: 220 15% 25%;
    --sidebar-ring: 200 100% 50%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

## `tailwind.config.ts`

This file configures Tailwind CSS, defining the fonts, colors, and animations used throughout the application.

```typescript
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['"Inter"', 'sans-serif'],
        headline: ['"Poppins"', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```

# Project Design System Overview

This project is a Next.js application built with React and TypeScript. Its visual design and styling are managed through a combination of **Tailwind CSS** for utility-first styling, **ShadCN UI** for the base component library, and a custom theming system using CSS variables for colors and fonts.

## 1. Color System

The color palette is the core of the design and is defined in `src/app/globals.css`. It supports both **light and dark themes** by using HSL (Hue, Saturation, Lightness) values assigned to CSS variables. This makes it easy to maintain consistency and apply global color changes.

### Core Color Variables:

*   `--background` / `--foreground`: The main page background and text color.
*   `--card` / `--card-foreground`: The background and text color for card-like components.
*   `--primary` / `--primary-foreground`: The main brand color for buttons, links, and highlights, along with its corresponding text color.
*   `--secondary`: A color for less prominent elements.
*   `--accent`: An alternative highlight color, often used for interactive states or special elements.
*   `--destructive`: A color used to indicate dangerous actions (e.g., delete buttons).
*   `--border`: The default color for borders on components.

### Light Theme Palette

*   **Background**: `hsl(220 20% 97%)` - A very light, cool gray.
*   **Foreground (Text)**: `hsl(220 10% 15%)` - A dark, desaturated blue.
*   **Card**: `hsl(220 20% 100%)` - Pure white.
*   **Primary**: `hsl(250 80% 60%)` - A vibrant purple-blue.
*   **Primary Foreground**: `hsl(0 0% 100%)` - White (for text on primary backgrounds).
*   **Accent**: `hsl(200 100% 50%)` - A bright, pure cyan.
*   **Destructive**: `hsl(0 72% 51%)` - A strong red.
*   **Border**: `hsl(220 15% 85%)` - A light gray.

### Dark Theme Palette

*   **Background**: `hsl(220 15% 10%)` - A deep, dark blue.
*   **Foreground (Text)**: `hsl(220 15% 90%)` - A very light gray.
*   **Card**: `hsl(220 15% 15%)` - A dark gray, slightly lighter than the background.
*   **Primary**: `hsl(250 80% 60%)` - The same vibrant purple-blue.
*   **Accent**: `hsl(200 100% 50%)` - The same bright cyan.
*   **Destructive**: `hsl(0 63% 31%)` - A darker, less saturated red.
*   **Border**: `hsl(220 15% 25%)` - A dark gray.


## 2. Typography

The application uses two primary fonts, configured in `tailwind.config.ts`:

*   **Headline Font (`font-headline`):** "Poppins" (bold weight) is used for major headings (`<h1>`, `<h2>`) to give the app a modern and strong visual identity.
*   **Body Font (`font-body`):** "Inter" is used for all other text, including paragraphs, labels, and buttons, ensuring high readability.

## 3. Layout and Structure

The application uses a main layout file (`src/app/(app)/layout.tsx`) that wraps most pages. This layout provides a consistent structure with a header and bottom navigation.

### Main Application Layout (`AppLayout`)

*   **File:** `src/app/(app)/layout.tsx`
*   **Components:**
    *   `<Header>`: A sticky navigation bar at the top, containing the app logo and the `<UserSwitcher>` component.
    *   `<main>`: The central content area where the specific page's content is rendered. It has default padding.
    *   `<BottomNav>`: A fixed navigation bar at the bottom of the screen for mobile users, providing quick access to major sections. The central button is a "fab" (floating action button) style for adding new transactions quickly.

### Page Layouts & Component Structure

#### Dashboard (`/dashboard`)

*   **File:** `src/app/(app)/dashboard/page.tsx`
*   **Structure:** This is the main landing page.
    *   It starts with a page `<h1>` ("Dashboard") and a description.
    *   An action button group is aligned to the right, containing "Get Insights" and "Download Project".
    *   `<OverviewCards>`: A row of three cards displaying key stats: Total Balance, Monthly Income, and Monthly Expenses.
    *   A two-column grid contains:
        *   `<BudgetStatus>` (2/3 width): Shows progress bars for each budget category.
        *   `<RecentTransactions>` (1/3 width): Displays the last 5 transactions.

#### Transactions Page (`/transactions`)

*   **File:** `src/app/(app)/transactions/page.tsx`
*   **Structure:**
    *   A header with a title and an "Add Transaction" button, which opens the `<AddTransactionDialog>`.
    *   `<DataTable>`: The main component, which renders a full-page, interactive table of all transactions. It includes features for sorting, filtering (by description), and pagination. Each row is clickable to view details in the `<TransactionReceiptDialog>`.

#### Budgets Page (`/budgets`)

*   **File:** `src/app/(app)/budgets/page.tsx`
*   **Structure:**
    *   A simple page heading.
    *   `<BudgetManager>`: A single `Card` component that contains a scrollable list of all expense categories. Each list item has an input field to set the monthly budget amount for that category. A "Save Changes" button persists the updates.

#### Reports Page (`/reports`)

*   **File:** `src/app/(app)/reports/page.tsx`
*   **Structure:**
    *   A page heading.
    *   A `<Tabs>` component dominates the page, allowing users to switch between two different reports:
        *   **Spending by Category:** Contains the `<SpendingByCategoryChart>`, a vertical bar chart.
        *   **Income vs. Expense:** Contains the `<IncomeVsExpenseChart>`, a line chart showing trends over the last 6 months.

#### Tools Page (`/tools`)

*   **File:** `src/app/(app)/tools/page.tsx`
*   **Structure:**
    *   A page heading.
    *   This page acts as a navigation hub. It displays a vertical list of `Card` components. Each card links to a specific financial tool (e.g., Budgets, Recurring Payments, Retirement Planner) and includes an icon, title, and description.

#### Login Page (`/login`)

*   **File:** `src/app/login/page.tsx`
*   **Structure:** This page does **not** use the main `AppLayout`.
    *   It's a centered, full-screen layout with a single `Card`.
    *   The card contains the app logo, a welcome title, and a list of `Button` components, one for each "developer" user, allowing for quick authentication during development.


## 4. Component Library & Styling

*   **ShadCN UI:** The project leverages ShadCN UI for its set of unstyled, accessible, and composable components (e.g., `Button`, `Card`, `Dialog`, `Input`).
*   **Tailwind CSS:** All styling is applied using Tailwind's utility classes. This allows for rapid development and avoids the need for separate CSS files for individual components.
*   **Theming:** The `tailwind.config.ts` file is configured to use the CSS variables from `globals.css`. For example, instead of writing `bg-blue-500`, the code uses semantic classes like `bg-primary`, which automatically adapts to the current theme (light or dark).
*   **Border Radius:** A consistent corner rounding (`--radius: 0.5rem`) is defined as a CSS variable and applied to most components like cards and buttons, creating a soft and modern look.
