'use client';

import { Component, type ReactNode } from 'react';

/** Keeps a render error in one block from breaking the host page. */
export default class BlockBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
