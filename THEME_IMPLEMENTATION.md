# Theme System Implementation

This document outlines the comprehensive dark/light mode theme implementation for the Mockify application.

## Overview

The theme system provides reliable, comprehensive, and industry-standard theme switching using **Tailwind CSS exclusively**. It follows best practices to prevent theme flashing and ensures consistent theming across all components.

## Architecture

### 1. Theme Context (`src/contexts/ThemeContext.tsx`)

The `ThemeProvider` manages the global theme state and provides:

- **Automatic theme detection** from system preferences
- **Persistent theme storage** in localStorage
- **Flash prevention** by applying theme before React hydration
- **System preference monitoring** for automatic updates
- **Loading state management** during initialization

```tsx
import { useTheme } from './contexts/ThemeContext';

const { theme, toggleTheme, setTheme, isLoading } = useTheme();
```

### 2. Theme Utilities (`src/utils/themeUtils.ts`)

Provides predefined theme-aware class combinations for consistent styling:

```tsx
import { themeClasses } from './utils/themeUtils';

// Background colors
className={themeClasses.background.primary} // bg-white dark:bg-gray-900
className={themeClasses.background.card}    // bg-white dark:bg-gray-800

// Text colors
className={themeClasses.text.primary}       // text-gray-900 dark:text-gray-100
className={themeClasses.text.secondary}     // text-gray-600 dark:text-gray-400

// Interactive states
className={themeClasses.interactive.hover}  // hover:bg-gray-100 dark:hover:bg-gray-700
```

### 3. Theme Toggle Component (`src/components/ui/ThemeToggle.tsx`)

A reusable theme switcher with:

- Multiple sizes (sm, md, lg)
- Proper accessibility (ARIA labels, keyboard support)
- Visual feedback during theme transitions
- Focus states and keyboard navigation

## Implementation Guidelines

### ✅ DO: Use Theme-Aware Classes

Always provide both light and dark variants:

```tsx
// ✅ Good
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  Content
</div>

// ✅ Better - Use theme utilities
<div className={`${themeClasses.background.card} ${themeClasses.text.primary}`}>
  Content
</div>
```

### ❌ DON'T: Use Hard-coded Colors

Avoid classes without dark mode variants:

```tsx
// ❌ Bad - Missing dark mode
<div className="bg-white text-gray-900">
  Content
</div>
```

### ✅ DO: Use Consistent Patterns

Follow the established theme class patterns:

```tsx
// Backgrounds
bg-white dark:bg-gray-800          // Cards, modals
bg-gray-50 dark:bg-gray-900        // Page backgrounds
bg-gray-100 dark:bg-gray-700       // Secondary backgrounds

// Text
text-gray-900 dark:text-gray-100   // Primary text
text-gray-600 dark:text-gray-400   // Secondary text
text-gray-500 dark:text-gray-500   // Muted text

// Borders
border-gray-200 dark:border-gray-700  // Standard borders
border-gray-300 dark:border-gray-600  // Form elements

// Interactive States
hover:bg-gray-50 dark:hover:bg-gray-800     // Hover states
focus:ring-blue-500 dark:focus:ring-blue-400 // Focus states
```

## Component Examples

### Basic Card Component

```tsx
export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        "rounded-lg border shadow-sm transition-colors",
        themeClasses.background.card,
        themeClasses.border.primary,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

### Button Component

```tsx
export const Button = ({ variant = "primary", children, ...props }) => {
  const variants = {
    primary: themeClasses.form.button.primary,
    secondary: themeClasses.form.button.secondary,
    outline: themeClasses.form.button.outline,
    ghost: themeClasses.form.button.ghost,
  };

  return (
    <button
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-colors",
        variants[variant],
        themeClasses.interactive.focus
      )}
      {...props}
    >
      {children}
    </button>
  );
};
```

### Form Input

```tsx
export const Input = ({ error, ...props }) => {
  return (
    <input
      className={cn(
        "w-full px-3 py-2 rounded-lg border transition-colors",
        themeClasses.form.input,
        themeClasses.interactive.focus,
        error && "border-red-500 dark:border-red-400"
      )}
      {...props}
    />
  );
};
```

## Status and Alert Components

Use the predefined status classes for consistency:

```tsx
// Success Alert
<div className={`
  rounded-lg p-4 border
  ${themeClasses.status.success.bg}
  ${themeClasses.status.success.border}
`}>
  <p className={themeClasses.status.success.text}>Success message</p>
</div>

// Error Alert
<div className={`
  rounded-lg p-4 border
  ${themeClasses.status.error.bg}
  ${themeClasses.status.error.border}
`}>
  <p className={themeClasses.status.error.text}>Error message</p>
</div>
```

## Special Cases

### Subject-Specific Colors

For NEET subjects, use the subject theme utility:

```tsx
import { getSubjectThemeClasses } from './utils/themeUtils';

const subjectColors = getSubjectThemeClasses('Physics');
// Returns: { bg: "bg-blue-100 dark:bg-blue-900/30", icon: "text-blue-600 dark:text-blue-400", ... }
```

### Difficulty Levels

For difficulty indicators:

```tsx
import { getDifficultyThemeClasses } from './utils/themeUtils';

const difficultyClasses = getDifficultyThemeClasses('Level 1');
// Returns theme-aware classes for difficulty badges
```

## Flash Prevention

The theme flash prevention is handled through:

1. **Inline script in `index.html`** - Applies theme before React loads
2. **Immediate theme application** in ThemeProvider initialization
3. **Color scheme property** for native elements

## Testing Theme Implementation

To test your theme implementation:

1. **Toggle between themes** and verify all elements change appropriately
2. **Check interactive states** (hover, focus, active) in both themes
3. **Test with system preference changes**
4. **Verify no flash** occurs on page load
5. **Use the ThemeDemo component** (`/src/components/ui/ThemeDemo.tsx`) for comprehensive testing

## Migration Checklist

When updating existing components:

- [ ] All background colors have dark variants
- [ ] All text colors have dark variants  
- [ ] All border colors have dark variants
- [ ] Interactive states (hover, focus) work in both themes
- [ ] Icons and images are theme-appropriate
- [ ] Status indicators use theme-aware colors
- [ ] Form elements have proper focus states
- [ ] No hard-coded color values remain

## Browser Support

The theme system supports:

- **Modern browsers** with CSS custom properties
- **System preference detection** via `prefers-color-scheme`
- **Accessibility features** including high contrast mode compatibility
- **Keyboard navigation** for theme toggle

## Performance Considerations

- Theme switching is optimized for performance
- CSS classes are pre-generated by Tailwind
- No runtime CSS-in-JS overhead
- Minimal JavaScript execution for theme changes

## Troubleshooting

### Theme Not Applying

- Check if component is wrapped in `ThemeProvider`
- Verify dark mode classes are included in component
- Ensure Tailwind's `darkMode: "class"` is configured

### Flash on Page Load

- Verify the inline script in `index.html` is present
- Check that theme is applied to `document.documentElement`
- Ensure no conflicting CSS is overriding theme classes

### Inconsistent Colors

- Use theme utility classes instead of custom color combinations
- Check that all components follow the same color patterns
- Verify Tailwind purging isn't removing required classes
