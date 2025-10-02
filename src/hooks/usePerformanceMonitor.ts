import { useEffect } from "react";

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  useEffect(() => {
    // Web Vitals monitoring
    const observeWebVitals = () => {
      // Largest Contentful Paint (LCP) - Log only if > 2.5s (poor performance)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (
            entry.entryType === "largest-contentful-paint" &&
            entry.startTime > 2500
          ) {
            console.warn("Poor LCP performance:", entry.startTime + "ms");
          }
        }
      }).observe({ entryTypes: ["largest-contentful-paint"] });

      // First Input Delay (FID) - Log only if > 100ms (poor performance)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === "first-input") {
            const fidEntry = entry as PerformanceEntry & {
              processingStart: number;
              startTime: number;
            };
            const fid = fidEntry.processingStart - fidEntry.startTime;
            if (fid > 100) {
              console.warn("Poor FID performance:", fid + "ms");
            }
          }
        }
      }).observe({ entryTypes: ["first-input"] });

      // Cumulative Layout Shift (CLS) - Log only if > 0.1 (poor performance)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const clsEntry = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (
            entry.entryType === "layout-shift" &&
            !clsEntry.hadRecentInput &&
            clsEntry.value > 0.1
          ) {
            console.warn("Poor CLS performance:", clsEntry.value);
          }
        }
      }).observe({ entryTypes: ["layout-shift"] });
    };

    // Only run in production
    if (import.meta.env.PROD) {
      observeWebVitals();
    }

    // Resource loading performance
    const monitorResources = () => {
      const resources = performance.getEntriesByType("resource");
      const slowResources = resources.filter(
        (resource) => resource.duration > 1000
      );

      if (slowResources.length > 0) {
        console.warn(
          "Slow loading resources detected:",
          slowResources.length + " files > 1s"
        );
      }
    };

    // Monitor after page load
    window.addEventListener("load", monitorResources);

    return () => {
      window.removeEventListener("load", monitorResources);
    };
  }, []);
};

// Cache management utilities
export const cacheManager = {
  // Clear old caches
  clearOldCaches: async () => {
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      const oldCaches = cacheNames.filter(
        (name) => name.includes("v1") || name.includes("old")
      );

      await Promise.all(oldCaches.map((cacheName) => caches.delete(cacheName)));
    }
  },

  // Preload critical resources
  preloadCriticalResources: () => {
    const criticalResources = [
      "/src/main.tsx",
      "/src/App.tsx",
    ];

    criticalResources.forEach((resource) => {
      const link = document.createElement("link");
      link.rel = "modulepreload";
      link.href = resource;
      document.head.appendChild(link);
    });
  },
};
