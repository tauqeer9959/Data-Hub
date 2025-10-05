/**
 * Navigation utilities for managing browser history and back button behavior
 */
import React from 'react';

interface NavigationState {
  view: string;
  timestamp: number;
  data?: any;
}

class NavigationManager {
  private history: NavigationState[] = [];
  private currentIndex = -1;
  private maxHistorySize = 50;

  constructor() {
    // Listen for browser back/forward events
    window.addEventListener('popstate', this.handlePopState);
    
    // Prevent the default browser behavior of going back to previous page
    this.preventDefaultBackBehavior();
  }

  private handlePopState = (event: PopStateEvent) => {
    const state = event.state as NavigationState;
    if (state) {
      // Dispatch custom navigation event to update the app
      window.dispatchEvent(new CustomEvent('navigate-back', { 
        detail: { view: state.view, data: state.data }
      }));
    }
  };

  private preventDefaultBackBehavior() {
    // Add a state to prevent completely exiting the site
    window.history.pushState({ view: 'app-entry', timestamp: Date.now() }, '', window.location.href);
    
    // Prevent the browser from navigating away from the app
    window.addEventListener('beforeunload', (e) => {
      // Only show confirmation if user hasn't explicitly signed out and has been active
      const isSigningOut = sessionStorage.getItem('signing-out');
      const hasBeenActive = sessionStorage.getItem('user-active');
      
      if (!isSigningOut && hasBeenActive) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave Data Hub?';
        return 'Are you sure you want to leave Data Hub?';
      }
    });

    // Mark user as active after a short delay
    setTimeout(() => {
      sessionStorage.setItem('user-active', 'true');
    }, 3000);
  }

  navigateTo(view: string, data?: any, replaceHistory = false) {
    const state: NavigationState = {
      view,
      timestamp: Date.now(),
      data
    };

    if (replaceHistory) {
      // Replace current history entry
      window.history.replaceState(state, '', window.location.href);
      if (this.currentIndex >= 0) {
        this.history[this.currentIndex] = state;
      }
    } else {
      // Add new history entry
      this.history = this.history.slice(0, this.currentIndex + 1);
      this.history.push(state);
      this.currentIndex = this.history.length - 1;
      
      // Limit history size
      if (this.history.length > this.maxHistorySize) {
        this.history = this.history.slice(-this.maxHistorySize);
        this.currentIndex = this.history.length - 1;
      }
      
      window.history.pushState(state, '', window.location.href);
    }
  }

  goBack(): boolean {
    if (this.canGoBack()) {
      this.currentIndex--;
      const previousState = this.history[this.currentIndex];
      
      window.dispatchEvent(new CustomEvent('navigate-back', { 
        detail: { view: previousState.view, data: previousState.data }
      }));
      
      window.history.back();
      return true;
    }
    return false;
  }

  goForward(): boolean {
    if (this.canGoForward()) {
      this.currentIndex++;
      const nextState = this.history[this.currentIndex];
      
      window.dispatchEvent(new CustomEvent('navigate-forward', { 
        detail: { view: nextState.view, data: nextState.data }
      }));
      
      window.history.forward();
      return true;
    }
    return false;
  }

  canGoBack(): boolean {
    return this.currentIndex > 0;
  }

  canGoForward(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  getCurrentView(): string | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex].view;
    }
    return null;
  }

  getPreviousView(): string | null {
    if (this.currentIndex > 0) {
      return this.history[this.currentIndex - 1].view;
    }
    return null;
  }

  getHistory(): NavigationState[] {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
    this.currentIndex = -1;
  }

  destroy() {
    window.removeEventListener('popstate', this.handlePopState);
  }
}

// Create singleton instance
export const navigationManager = new NavigationManager();

// Hook for React components
export function useNavigation() {
  const [canGoBack, setCanGoBack] = React.useState(navigationManager.canGoBack());
  const [canGoForward, setCanGoForward] = React.useState(navigationManager.canGoForward());
  const [currentView, setCurrentView] = React.useState(navigationManager.getCurrentView());

  React.useEffect(() => {
    const handleNavigationChange = () => {
      setCanGoBack(navigationManager.canGoBack());
      setCanGoForward(navigationManager.canGoForward());
      setCurrentView(navigationManager.getCurrentView());
    };

    window.addEventListener('navigate-back', handleNavigationChange);
    window.addEventListener('navigate-forward', handleNavigationChange);

    return () => {
      window.removeEventListener('navigate-back', handleNavigationChange);
      window.removeEventListener('navigate-forward', handleNavigationChange);
    };
  }, []);

  return {
    navigateTo: navigationManager.navigateTo.bind(navigationManager),
    goBack: navigationManager.goBack.bind(navigationManager),
    goForward: navigationManager.goForward.bind(navigationManager),
    canGoBack,
    canGoForward,
    currentView,
    previousView: navigationManager.getPreviousView()
  };
}