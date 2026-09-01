import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = "error") => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => remove(id), 4200);
    },
    [remove]
  );

  const value = useMemo(
    () => ({
      toast: {
        error: (message) => push(message, "error"),
        success: (message) => push(message, "success"),
        info: (message) => push(message, "info"),
      },
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-[min(92vw,380px)] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-2xl backdrop-blur",
              t.type === "success"
                ? "border-emerald-500/30 bg-emerald-950/80 text-emerald-100"
                : t.type === "info"
                ? "border-cyan-500/30 bg-slate-900/90 text-slate-100"
                : "border-red-500/30 bg-red-950/80 text-red-100",
            ].join(" ")}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: {
        error: (message) => window.alert(message),
        success: (message) => window.alert(message),
        info: (message) => window.alert(message),
      },
    };
  }
  return ctx;
}