import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Component, type ReactNode } from "react";

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean}> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <div className="error-screen"><div className="error-card"><div className="error-icon">!</div><h1>Something went wrong</h1><p>Nestly could not render this workspace. Your saved local data is still protected.</p><button onClick={() => window.location.reload()}>Retry workspace</button></div></div>;
    return this.props.children;
  }
}
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ErrorBoundary><App /></ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);