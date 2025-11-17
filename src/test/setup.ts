/**
 * Vitest setup file
 * - Extends jest-dom matchers
 * - Ensures cleanup after each test
 * - Provides common JSDOM/browser API mocks
 * - Sets up safe defaults for app-specific modules
 */

import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// -----------------------------------------------------------------------------
// Global cleanup after each test
// -----------------------------------------------------------------------------
afterEach(() => {
  cleanup();
});

// -----------------------------------------------------------------------------
// Browser API polyfills/mocks for JSDOM
// -----------------------------------------------------------------------------

// matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn().mockReturnValue(false),
  }),
});

// IntersectionObserver
if (!(globalThis as any).IntersectionObserver) {
  (globalThis as any).IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    takeRecords() {
      return [];
    }
    unobserve() {}
  } as unknown as typeof IntersectionObserver;
}

// ResizeObserver
if (!(globalThis as any).ResizeObserver) {
  (globalThis as any).ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as unknown as typeof ResizeObserver;
}

// navigator.clipboard (used by copy to clipboard)
if (!("clipboard" in navigator)) {
  Object.defineProperty(navigator, "clipboard", {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(""),
    },
    configurable: true,
  });
}

// window.scrollTo
if (!("scrollTo" in window)) {
  // @ts-expect-error adding missing function to JSDOM window
  window.scrollTo = vi.fn();
}

// -----------------------------------------------------------------------------
// App-specific safe mocks
// -----------------------------------------------------------------------------

// Silence sounds during tests to avoid side effects
vi.mock("@/hooks/use-sounds", () => ({
  useSounds: () => ({
    playSound: () => {},
  }),
}));

// Provide a minimal Supabase client mock to avoid network/realtime in tests
vi.mock("@/lib/supabaseClient", () => {
  const chain = {
    on: () => chain,
    subscribe: () => ({ status: "SUBSCRIBED" }),
  };

  return {
    supabase: {
      channel: () => ({
        on: () => chain,
        send: () => {},
        unsubscribe: () => {},
      }),
      removeChannel: () => {},
    },
  };
});

// Mock framer-motion to avoid AnimatePresence/motion adding aria-hidden wrappers
// and interfering with Testing Library queries during animations.
// This mock renders children directly and no-ops motion components.
vi.mock("framer-motion", () => {
  const Mock = (props: any) => props.children ?? null;
  return {
    AnimatePresence: ({ children }: any) => children,
    motion: new Proxy({}, { get: () => Mock }),
  };
});

vi.mock("@/components/Tutorial", () => ({
  Tutorial: () => null,
}));

export {};
