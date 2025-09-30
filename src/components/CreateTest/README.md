# CreateTest Module - Refactored Structure

This document outlines the new modular structure of the CreateTestWizard component, which has been broken down into smaller, maintainable, and reusable pieces.

## Overview

The original `CreateTestWizard.tsx` (1400+ lines) has been refactored into a modular architecture with the following benefits:
- **Better maintainability**: Each component has a single responsibility
- **Improved reusability**: Components can be used independently
- **Enhanced testability**: Smaller components are easier to test
- **Cleaner code organization**: Related functionality is grouped together
- **Easier future development**: New features can be added with minimal impact

## Folder Structure

```
src/components/CreateTest/
├── CreateTestWizard.tsx          # Main orchestrator component
├── index.ts                      # Central export file
├── components/                   # Reusable UI components
│   ├── ErrorBanner.tsx
│   ├── LoadingState.tsx
│   ├── Navigation.tsx
│   └── ProgressSteps.tsx
├── hooks/                        # Custom React hooks
│   ├── useTestData.ts
│   ├── useTestSelection.ts
│   └── usePDFGeneration.ts
├── steps/                        # Individual wizard step components
│   ├── SubjectSelectionStep.tsx
│   ├── ChapterSelectionStep.tsx
│   ├── TestConfigurationStep.tsx
│   └── PreviewGenerateStep.tsx
├── types/                        # TypeScript type definitions
│   └── index.ts
└── utils/                        # Utility functions and constants
    ├── constants.ts
    └── helpers.ts
```

## Component Breakdown

### Main Components

#### `CreateTestWizard.tsx`
- **Purpose**: Main orchestrator that manages the entire wizard flow
- **Responsibilities**: 
  - State management coordination
  - Step navigation
  - Data loading orchestration
  - Passing props to step components

#### `index.ts`
- **Purpose**: Central export file for the entire module
- **Exports**: All components, hooks, utils, and types

### Step Components (`steps/`)

#### `SubjectSelectionStep.tsx`
- **Purpose**: Handles subject selection (Step 1)
- **Features**: 
  - Subject grid display
  - Multi-selection support
  - Loading states
  - Selection summary

#### `ChapterSelectionStep.tsx`
- **Purpose**: Manages chapter selection (Step 2)
- **Features**:
  - Chapters organized by subject
  - Bulk selection controls
  - Chapter statistics
  - Selection summary with metrics

#### `TestConfigurationStep.tsx`
- **Purpose**: Test parameter configuration (Step 3)
- **Features**:
  - Test title input
  - Question count slider
  - Difficulty level selection
  - Additional options (images, PYQs)
  - Live preview

#### `PreviewGenerateStep.tsx`
- **Purpose**: Test preview and PDF generation (Step 4)
- **Features**:
  - Configuration summary
  - Question preview
  - PDF generation buttons
  - Loading states for generation

### Reusable Components (`components/`)

#### `ErrorBanner.tsx`
- **Purpose**: Displays error messages with dismiss functionality
- **Props**: `error: string | null`, `onDismiss: () => void`

#### `LoadingState.tsx`
- **Purpose**: Shows loading spinner with contextual messages
- **Props**: `currentStep: number`

#### `Navigation.tsx`
- **Purpose**: Step navigation footer with progress indicators
- **Props**: Navigation state and handler functions

#### `ProgressSteps.tsx`
- **Purpose**: Visual progress indicator at the top
- **Props**: Steps configuration and current state

### Custom Hooks (`hooks/`)

#### `useTestData.ts`
- **Purpose**: Manages data fetching (subjects, chapters, questions)
- **Returns**: Data state, loading states, and fetch functions
- **Features**:
  - Parallel data loading
  - Error handling
  - Loading state management

#### `useTestSelection.ts`
- **Purpose**: Manages user selections and test configuration
- **Returns**: Selection state and handler functions
- **Features**:
  - Multi-selection logic
  - Auto-generated test titles
  - Filter management

#### `usePDFGeneration.ts`
- **Purpose**: Handles PDF generation logic
- **Returns**: PDF generation functions and loading state
- **Features**:
  - Test paper generation
  - Answer key generation
  - Loading state management

### Utilities (`utils/`)

#### `constants.ts`
- **Purpose**: Centralized constants and configuration
- **Exports**:
  - `WIZARD_STEPS`: Step configuration
  - `DIFFICULTY_LEVELS`: Difficulty options
  - `QUESTION_COUNT_PRESETS`: Quick question count options
  - `DEFAULT_TEST_FILTERS`: Default filter values

#### `helpers.ts`
- **Purpose**: Pure utility functions
- **Functions**:
  - `canProceedToNextStep()`: Navigation validation
  - `generateTestTitle()`: Auto-title generation
  - `calculateEstimatedQuestions()`: Question estimation
  - `calculateTotalTopics()`: Topic counting
  - `calculateTotalMarks()`: Mark calculation

### Types (`types/`)

#### `index.ts`
- **Purpose**: TypeScript type definitions for the module
- **Types**:
  - `WizardStep`: Step configuration interface
  - `CreateTestState`: Complete state interface
  - `StepComponentProps`: Props for step components
  - `NavigationProps`: Navigation component props
  - And more...

## Key Design Patterns

### 1. **Props Down, Events Up**
- State is managed at the top level (CreateTestWizard)
- Step components receive state and action handlers as props
- Events bubble up through action handlers

### 2. **Custom Hooks for Logic**
- Business logic is extracted into custom hooks
- Hooks are testable in isolation
- State management is separated from UI components

### 3. **Composition over Inheritance**
- Small, focused components that can be composed
- Reusable UI components with clear interfaces
- Step components that focus on their specific functionality

### 4. **TypeScript for Safety**
- Strong typing throughout the module
- Interface-driven development
- Better IDE support and error catching

## Usage

The refactored component maintains the same external API:

```tsx
import { CreateTestWizard } from './components/CreateTestWizard';

// Usage remains the same
<CreateTestWizard />
```

Internally, it now uses the modular structure:

```tsx
// Original component now imports the modular version
import { CreateTestWizard as ModularCreateTestWizard } from "./CreateTest";

export const CreateTestWizard: React.FC = () => {
  return <ModularCreateTestWizard />;
};
```

## Benefits of This Architecture

1. **Maintainability**: Each file has a clear purpose and is easier to understand
2. **Testability**: Components and hooks can be tested in isolation
3. **Reusability**: Components can be reused in other parts of the application
4. **Scalability**: New features can be added without affecting existing code
5. **Developer Experience**: Better IDE support, easier debugging, cleaner git diffs
6. **Performance**: Smaller components can be optimized individually
7. **Collaboration**: Multiple developers can work on different parts simultaneously

## Future Enhancements

With this modular structure, future enhancements become easier:

- **New Step**: Add a new step by creating a component in `steps/`
- **New Feature**: Add functionality through new hooks or utilities
- **UI Improvements**: Modify individual components without affecting others
- **Testing**: Add comprehensive test coverage for each module
- **Performance**: Implement lazy loading for step components
- **Accessibility**: Enhance individual components with better a11y support

## Migration Notes

- **No Breaking Changes**: External API remains identical
- **Backward Compatibility**: Existing imports continue to work
- **Incremental Adoption**: Individual components can be imported separately if needed
- **Type Safety**: All existing TypeScript interfaces are preserved and enhanced