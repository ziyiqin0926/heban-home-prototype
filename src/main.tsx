import React, { Component, ReactNode, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("GlobalErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
          color: "#0f172a",
          padding: "24px 16px",
          fontFamily: "system-ui, -apple-system, sans-serif"
        }}>
          <div style={{
            maxWidth: "480px",
            margin: "40px auto",
            backgroundColor: "#ffffff",
            padding: "24px",
            borderRadius: "20px",
            boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
            border: "1px solid #e2e8f0"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "16px",
              backgroundColor: "#fee2e2",
              color: "#ef4444",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: "bold",
              marginBottom: "16px"
            }}>!</div>
            <h2 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: "0 0 8px" }}>
              页面加载遇到了一点小问题
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px", lineHeight: 1.6 }}>
              为了保障您的体验，和伴已自动保护现场。您可以点击下方按钮快速重载，或一键清理缓存恢复默认状态。
            </p>
            <div style={{
              padding: "12px",
              backgroundColor: "#f1f5f9",
              borderRadius: "12px",
              fontSize: "11px",
              color: "#dc2626",
              fontFamily: "monospace",
              wordBreak: "break-all",
              marginBottom: "16px",
              maxHeight: "120px",
              overflowY: "auto"
            }}>
              {this.state.error?.toString() || "未知错误"}
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  try {
                    localStorage.clear();
                    sessionStorage.clear();
                  } catch (e) {}
                  window.location.href = window.location.pathname;
                }}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "12px",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  fontWeight: "bold",
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                清理缓存并重试
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "12px 18px",
                  borderRadius: "12px",
                  backgroundColor: "#f1f5f9",
                  color: "#334155",
                  fontWeight: "bold",
                  fontSize: "13px",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                直接刷新
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
);
