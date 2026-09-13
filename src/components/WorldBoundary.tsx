import { Component, type ReactNode } from 'react';

export class WorldBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="error-boundary"><span className="eyebrow">AIRS City / System paused</span><h1>Let's get you back to the city.</h1><p>This scene could not open. Your saved discoveries are safe. Return to the map to try another destination.</p><button className="primary-action" onClick={() => { try { history.replaceState(null, '', '#/city'); } catch { /* History can be restricted in embedded previews. */ } this.setState({ failed: false }); }}>Return to city</button></main>;
  }
}
