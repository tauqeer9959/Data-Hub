// Mobile optimization utilities and hooks
import { useState, useEffect } from 'react';

export interface BreakpointValues {
  sm: number;  // 640px
  md: number;  // 768px
  lg: number;  // 1024px
  xl: number;  // 1280px
  '2xl': number; // 1536px
}

export const BREAKPOINTS: BreakpointValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536
};

export type BreakpointKey = keyof BreakpointValues;

// Hook to detect screen size and breakpoints
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

// Hook to check if screen is at or above a certain breakpoint
export function useMediaQuery(breakpoint: BreakpointKey) {
  const { width } = useScreenSize();
  return width >= BREAKPOINTS[breakpoint];
}

// Hook for mobile detection
export function useIsMobile() {
  return !useMediaQuery('md');
}

// Hook for tablet detection
export function useIsTablet() {
  const { width } = useScreenSize();
  return width >= BREAKPOINTS.md && width < BREAKPOINTS.lg;
}

// Hook for desktop detection
export function useIsDesktop() {
  return useMediaQuery('lg');
}

// Touch device detection
export function useIsTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    const checkTouchDevice = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-ignore
        navigator.msMaxTouchPoints > 0
      );
    };

    setIsTouchDevice(checkTouchDevice());
  }, []);

  return isTouchDevice;
}

// Responsive grid columns utility
export function useResponsiveColumns(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3,
  wide: number = 4
) {
  const { width } = useScreenSize();
  
  if (width >= BREAKPOINTS['2xl']) return wide;
  if (width >= BREAKPOINTS.lg) return desktop;
  if (width >= BREAKPOINTS.md) return tablet;
  return mobile;
}

// Optimized scroll behavior for mobile
export function useOptimizedScroll() {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrolling(true);
      setScrollDirection(currentScrollY > lastScrollY ? 'down' : 'up');
      setLastScrollY(currentScrollY);

      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

  return { isScrolling, scrollDirection, lastScrollY };
}

// Virtual scrolling for large lists
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = useState(0);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  return {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    startIndex,
    endIndex
  };
}

// Performance optimization utilities
export class MobilePerformanceOptimizer {
  private static instance: MobilePerformanceOptimizer;
  private imageObserver: IntersectionObserver | null = null;
  private preloadQueue: string[] = [];

  static getInstance(): MobilePerformanceOptimizer {
    if (!MobilePerformanceOptimizer.instance) {
      MobilePerformanceOptimizer.instance = new MobilePerformanceOptimizer();
    }
    return MobilePerformanceOptimizer.instance;
  }

  // Lazy load images
  initLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              this.imageObserver?.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        this.imageObserver?.observe(img);
      });
    }
  }

  // Preload critical resources
  preloadResource(url: string, type: 'image' | 'script' | 'style' = 'image') {
    if (this.preloadQueue.includes(url)) return;
    
    this.preloadQueue.push(url);
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'image':
        link.as = 'image';
        break;
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
    }
    
    document.head.appendChild(link);
  }

  // Optimize animations for mobile
  enableReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    if (mediaQuery.matches) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
      document.documentElement.style.setProperty('--transition-duration', '0.01ms');
    }
  }

  // Battery-aware optimizations
  enableBatteryOptimizations() {
    // @ts-ignore
    if ('getBattery' in navigator) {
      // @ts-ignore
      navigator.getBattery().then((battery) => {
        if (battery.level < 0.2) {
          // Reduce animations and background tasks when battery is low
          document.documentElement.classList.add('low-battery');
        }
        
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2) {
            document.documentElement.classList.add('low-battery');
          } else {
            document.documentElement.classList.remove('low-battery');
          }
        });
      });
    }
  }
}

// Mobile-specific gesture handlers
export function useTouchGestures() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    return {
      isLeftSwipe,
      isRightSwipe,
      isUpSwipe,
      isDownSwipe,
      distanceX,
      distanceY
    };
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    touchStart,
    touchEnd
  };
}

// Responsive text utilities
export function getResponsiveTextSize(
  mobile: string = 'text-sm',
  tablet: string = 'text-base',
  desktop: string = 'text-lg'
) {
  return `${mobile} md:${tablet} lg:${desktop}`;
}

export function getResponsiveSpacing(
  mobile: string = 'p-4',
  tablet: string = 'p-6',
  desktop: string = 'p-8'
) {
  return `${mobile} md:${tablet} lg:${desktop}`;
}

// Mobile-first grid system
export function getResponsiveGrid(
  mobile: number = 1,
  tablet: number = 2,
  desktop: number = 3,
  wide: number = 4
) {
  const gridClasses = [
    `grid-cols-${mobile}`,
    `md:grid-cols-${tablet}`,
    `lg:grid-cols-${desktop}`,
    `xl:grid-cols-${wide}`
  ];
  
  return `grid ${gridClasses.join(' ')} gap-4`;
}

// Initialize mobile optimizations
export function initMobileOptimizations() {
  const optimizer = MobilePerformanceOptimizer.getInstance();
  
  // Initialize all optimizations
  optimizer.initLazyLoading();
  optimizer.enableReducedMotion();
  optimizer.enableBatteryOptimizations();
  
  // Add viewport meta tag if not present
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
    document.head.appendChild(viewportMeta);
  }
  
  // Add touch-action optimizations
  document.body.style.touchAction = 'manipulation';
  
  // Prevent zoom on input focus (iOS)
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach((input) => {
    (input as HTMLElement).style.fontSize = '16px';
  });
}