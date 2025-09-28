import React from "react";
import { navigateTo } from "../../hooks/useNavigation";

interface LinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  replace?: boolean;
  "aria-current"?:
    | "page"
    | "step"
    | "location"
    | "date"
    | "time"
    | "true"
    | "false"
    | boolean;
}

/**
 * Client-side navigation link component
 * Provides smooth SPA navigation without full page reloads
 */
export const Link: React.FC<LinkProps> = ({
  href,
  children,
  className,
  onClick,
  replace = false,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow normal navigation for external links
    if (
      href.startsWith("http") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:")
    ) {
      return;
    }

    // Prevent default link behavior for internal navigation
    e.preventDefault();

    // Call custom onClick if provided
    onClick?.();

    // Navigate programmatically
    navigateTo(href, replace);
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </a>
  );
};
