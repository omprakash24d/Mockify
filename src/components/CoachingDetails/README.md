# Coaching Details Module

A modular component system for handling coaching institute profile setup. This module is broken down into smaller, maintainable components that work together to provide a comprehensive form experience.

## 📁 Module Structure

```
CoachingDetails/
├── components/           # UI Components
│   ├── CoachingDetailsModal.tsx    # Main modal wrapper
│   ├── ModalHeader.tsx             # Header with title and icon
│   ├── ModalContent.tsx            # Main content wrapper
│   ├── FormFields.tsx              # Form input fields
│   ├── ProgressCard.tsx            # Progress tracking display
│   ├── InfoCards.tsx               # Information and help cards
│   ├── StatusMessages.tsx          # Validation status messages
│   ├── ActionButtons.tsx           # Submit/action buttons
│   └── Sidebar.tsx                 # Right sidebar wrapper
├── hooks/                # Custom Hooks
│   └── useCoachingDetailsForm.ts   # Form state management
├── utils/                # Utility Functions
│   ├── validation.ts               # Form validation logic
│   └── progress.ts                 # Progress calculation utilities
├── types/                # TypeScript Types
│   └── index.ts                    # All type definitions
├── index.ts              # Module exports
└── README.md             # This documentation
```

## 🔧 Components

### Main Components

#### `CoachingDetailsModal`
The root component that orchestrates the entire modal experience.
- **Props**: `CoachingDetailsModalProps`
- **Features**: Modal overlay, keyboard handling, form state management

#### `ModalHeader`
Displays the modal title, subtitle, and coaching icon.
- **Props**: `ModalHeaderProps`
- **Features**: Gradient background, icon display, responsive text

#### `ModalContent`
Main content area that organizes form fields and sidebar.
- **Props**: Extends `CoachingDetailsFormState` with event handlers
- **Features**: Responsive grid layout, form organization

### Form Components

#### `FormFields`
Contains all the input fields for the coaching details form.
- **Props**: `FormFieldsProps`
- **Includes**: Institute name, phone number, logo upload
- **Features**: Validation display, responsive layout

#### `ProgressCard`
Shows the completion status of required and optional fields.
- **Props**: `ProgressCardProps`
- **Features**: Progress bar, completion indicators, dynamic updates

#### `InfoCards`
Provides contextual information and help text.
- **Features**: Profile requirements info, logo upload notes

#### `StatusMessages`
Displays validation status and form completion messages.
- **Props**: `StatusMessageProps`
- **Features**: Success/warning states, contextual messaging

#### `ActionButtons`
Submit button with loading states and validation-based enabling.
- **Props**: `ActionButtonsProps`
- **Features**: Loading states, gradient styling, form validation

#### `Sidebar`
Combines progress card and info cards into a cohesive sidebar.
- **Props**: `ProgressCardProps`
- **Features**: Responsive layout, consistent spacing

## 🎣 Hooks

### `useCoachingDetailsForm`
Manages all form state, validation, and submission logic.

**Parameters:**
- `initialData`: Optional pre-filled form data
- `onComplete`: Callback for successful form submission

**Returns:**
- Form state values (coachingName, phoneNumber, coachingLogo, loading, validationErrors)
- State update functions (updateField, setLoading, setValidationErrors)
- Form handlers (handleSubmit)

**Features:**
- Automatic validation
- Error handling
- Loading state management
- Field updates with proper typing

## 🛠 Utilities

### `validation.ts`
Form validation and data preparation utilities.

**Functions:**
- `validateCoachingDetailsForm()`: Schema-based validation
- `validateRequiredFields()`: Custom required field validation
- `isFormValid()`: Quick form validity check
- `calculateCompletionPercentage()`: Progress calculation
- `prepareFormData()`: Data sanitization for submission

### `progress.ts`
Progress tracking and calculation utilities.

**Functions:**
- `getProgressItems()`: Get all progress items with completion status
- `calculateProgress()`: Calculate overall completion percentage
- `getCompletedRequiredCount()`: Count completed required fields
- `getTotalRequiredCount()`: Get total required field count

## 📝 Types

### Core Interfaces

- `CoachingDetailsModalProps`: Main modal component props
- `CoachingDetailsFormState`: Form state shape
- `ProgressItem`: Individual progress item structure
- Component-specific prop types for all UI components

## 🚀 Usage

### Basic Usage
```tsx
import { CoachingDetailsModal } from './components/CoachingDetails';

const App = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleComplete = (details: CoachingDetailsFormData) => {
    console.log('Form completed:', details);
    setIsOpen(false);
  };

  return (
    <CoachingDetailsModal
      isOpen={isOpen}
      onComplete={handleComplete}
      title="Complete Your Profile"
      subtitle="Fill in the required information"
    />
  );
};
```

### With Initial Data
```tsx
<CoachingDetailsModal
  isOpen={isOpen}
  onComplete={handleComplete}
  initialData={{
    coachingName: "ABC Coaching",
    phoneNumber: "9876543210"
  }}
/>
```

### Using Individual Components
```tsx
import { 
  FormFields, 
  ProgressCard, 
  useCoachingDetailsForm 
} from './components/CoachingDetails';

const CustomForm = () => {
  const formState = useCoachingDetailsForm({
    onComplete: handleSubmit
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormFields {...formState} />
      <ProgressCard 
        coachingName={formState.coachingName}
        phoneNumber={formState.phoneNumber}
        coachingLogo={formState.coachingLogo}
      />
    </div>
  );
};
```

## 🎨 Styling

All components use **pure Tailwind CSS** with:
- Dark/light mode support via `dark:` variants
- Responsive design with mobile-first approach
- Consistent color palette using Tailwind's color system
- Smooth animations and transitions
- Accessibility-focused styling

## 🔄 State Management

The module uses a centralized state management approach:
1. **Form State**: Managed by `useCoachingDetailsForm` hook
2. **Validation**: Real-time validation with error display
3. **Progress**: Dynamic progress calculation based on field completion
4. **Loading**: Proper loading states during submission

## 🧪 Testing

Each component is designed to be easily testable:
- Pure functions for utilities
- Isolated components with clear props
- Hooks that can be tested independently
- Predictable state management

## 📈 Future Enhancements

The modular structure makes it easy to add:
- Additional form steps
- More validation rules
- Custom progress indicators
- Different form layouts
- Integration with different data sources
- Accessibility improvements
- Animation enhancements

## 🤝 Contributing

When adding new features:
1. Keep components small and focused
2. Add proper TypeScript types
3. Follow the existing file structure
4. Update this README with new components/utilities
5. Ensure Tailwind-only styling
6. Test responsive behavior
7. Maintain accessibility standards