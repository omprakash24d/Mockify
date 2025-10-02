/**
 * Auto-fill Detection Hook
 *
 * Detects when browser auto-fills form fields and triggers validation
 * Uses a more reliable approach with event listeners and mutation observers
 */

import { useEffect, useRef } from "react";

interface UseAutoFillDetectionProps {
  onAutoFillDetected: () => void;
  targetSelectors?: string[];
}

export const useAutoFillDetection = ({
  onAutoFillDetected,
  targetSelectors = ['input[type="email"]', 'input[type="password"]'],
}: UseAutoFillDetectionProps) => {
  const detectionTimeoutRef = useRef<number | undefined>(undefined);
  const lastValuesRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    const checkForAutoFill = () => {
      let hasAutoFill = false;

      targetSelectors.forEach((selector) => {
        const elements = document.querySelectorAll(
          selector
        ) as NodeListOf<HTMLInputElement>;
        elements.forEach((element) => {
          const currentValue = element.value;
          const lastValue =
            lastValuesRef.current.get(element.name || element.id || selector) ||
            "";

          // If value changed without user input (auto-fill), and it's not empty
          if (currentValue !== lastValue && currentValue.length > 0) {
            // Check if the element has auto-fill styling (Chrome/Safari)
            const computedStyle = window.getComputedStyle(element);
            const isAutoFilled =
              computedStyle.getPropertyValue("-webkit-autofill") ||
              element.matches(":-webkit-autofill") ||
              element.matches(":autofill");

            if (isAutoFilled || currentValue.length > lastValue.length + 3) {
              hasAutoFill = true;
            }
          }

          // Update last known value
          lastValuesRef.current.set(
            element.name || element.id || selector,
            currentValue
          );
        });
      });

      if (hasAutoFill) {
        onAutoFillDetected();
      }
    };

    // Multiple detection strategies
    const strategies = [
      // Strategy 1: Periodic checking (fallback)
      () => {
        const interval = setInterval(checkForAutoFill, 100);
        return () => clearInterval(interval);
      },

      // Strategy 2: Animation detection (Chrome's auto-fill animation)
      () => {
        const style = document.createElement("style");
        style.textContent = `
          @keyframes autoFillStart { from { background: transparent; } }
          @keyframes autoFillCancel { from { background: transparent; } }
          input:-webkit-autofill {
            animation: autoFillStart 0.1s;
          }
        `;
        document.head.appendChild(style);

        const handleAnimationStart = (e: AnimationEvent) => {
          if (e.animationName === "autoFillStart") {
            setTimeout(onAutoFillDetected, 0);
          }
        };

        document.addEventListener("animationstart", handleAnimationStart, true);

        return () => {
          document.removeEventListener(
            "animationstart",
            handleAnimationStart,
            true
          );
          if (style.parentNode) {
            style.parentNode.removeChild(style);
          }
        };
      },

      // Strategy 3: Input event listener
      () => {
        const handleInput = () => {
          // Small delay to allow auto-fill to complete
          if (detectionTimeoutRef.current) {
            clearTimeout(detectionTimeoutRef.current);
          }
          detectionTimeoutRef.current = window.setTimeout(checkForAutoFill, 50);
        };

        targetSelectors.forEach((selector) => {
          const elements = document.querySelectorAll(selector);
          elements.forEach((element) => {
            element.addEventListener("input", handleInput);
            element.addEventListener("change", handleInput);
          });
        });

        return () => {
          targetSelectors.forEach((selector) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element) => {
              element.removeEventListener("input", handleInput);
              element.removeEventListener("change", handleInput);
            });
          });
        };
      },
    ];

    // Initialize all strategies
    const cleanupFunctions = strategies.map((strategy) => strategy());

    // Initial check
    setTimeout(checkForAutoFill, 100);

    // Cleanup
    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup());
      if (detectionTimeoutRef.current) {
        clearTimeout(detectionTimeoutRef.current);
      }
    };
  }, [onAutoFillDetected, targetSelectors]);
};
