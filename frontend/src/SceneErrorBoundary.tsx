import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { failed: boolean }

class SceneErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="live-macintosh scene-module-error" data-state="error">
        <img
          className="macintosh scene-fallback"
          src="/images/macintosh-render.png"
          alt="Classic Macintosh with keyboard and mouse"
          width="1536"
          height="1024"
        />
        <div className="model-status">
          <p role="status">The 3D scene could not load. Showing the still preview.</p>
          <button
            className="motion-button"
            type="button"
            onClick={() => window.location.reload()}
          >
            Reload 3D scene
          </button>
        </div>
      </div>
    )
  }
}

export default SceneErrorBoundary
