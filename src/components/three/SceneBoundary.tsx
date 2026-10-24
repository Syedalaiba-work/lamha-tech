"use client";

import { Component, type ReactNode } from "react";

/**
 * Keeps a 3D failure local. If a scene throws (context creation fails, a driver error, a lost context
 * that cannot recover), the page keeps working: the boundary renders its fallback (usually the SVG
 * composition, or nothing) instead of letting the error reach the route's error page.
 */
export class SceneBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // Diagnostic only; never surfaced to visitors.
    console.warn("[3d] scene disabled:", error instanceof Error ? error.message : String(error));
  }

  render() {
    return this.state.failed ? (this.props.fallback ?? null) : this.props.children;
  }
}
