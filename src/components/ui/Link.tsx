import React from "react";
import { Link as RouterLink } from "react-router-dom";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  replace?: boolean;
}

/**
 * Client-side navigation link component
 * Uses React Router for proper SPA navigation
 *
 * @example
 * // Basic link with Tailwind styling
 * <Link href="/about" className="text-blue-600 hover:text-blue-800 underline">
 *   About Us
 * </Link>
 *
 * // Button-styled link
 * <Link href="/contact" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
 *   Contact
 * </Link>
 */
export const Link: React.FC<LinkProps> = ({
  href,
  children,
  onClick,
  replace = false,
  className,
  ...props
}) => {
  // Handle external links with regular anchor tags
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return (
      <a href={href} onClick={onClick} className={className} {...props}>
        {children}
      </a>
    );
  }

  // Use React Router Link for internal navigation
  return (
    <RouterLink
      to={href}
      replace={replace}
      onClick={onClick}
      className={className}
      {...(props as any)}
    >
      {children}
    </RouterLink>
  );
};
