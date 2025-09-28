import { useCallback, useEffect, useRef } from "react";

interface UseKeyboardNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  onEscape?: () => void;
  trapFocus?: boolean;
}

export const useKeyboardNavigation = ({
  isOpen,
  onClose,
  onEscape,
  trapFocus = true,
}: UseKeyboardNavigationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const focusableSelectors = [
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      "a[href]",
      '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(
      containerRef.current.querySelectorAll(focusableSelectors.join(", "))
    ) as HTMLElement[];
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          event.preventDefault();
          if (onEscape) {
            onEscape();
          } else {
            onClose();
          }
          break;

        case "Tab":
          if (!trapFocus) return;

          const focusableElements = getFocusableElements();
          if (focusableElements.length === 0) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (event.shiftKey) {
            if (document.activeElement === firstElement) {
              event.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              event.preventDefault();
              firstElement.focus();
            }
          }
          break;
      }
    },
    [isOpen, onClose, onEscape, trapFocus, getFocusableElements]
  );

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the first focusable element
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      // Add event listener
      document.addEventListener("keydown", handleKeyDown);
    } else {
      // Restore focus when closing
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown, getFocusableElements]);

  return containerRef;
};
