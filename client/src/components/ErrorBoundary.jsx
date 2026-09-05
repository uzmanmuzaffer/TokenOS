import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Something went wrong.",
    };
  }

  componentDidCatch(error) {
    console.error("TokenOS UI crash:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center p-6">
          <div className="max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-white">
            <h2 className="text-lg font-semibold">Page failed to render</h2>
            <p className="mt-2 text-sm text-slate-400">{this.state.message}</p>
            <button
              className="mt-4 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}