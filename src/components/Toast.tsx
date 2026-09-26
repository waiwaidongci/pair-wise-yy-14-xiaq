export type ToastTone = "info" | "warn" | "error";

export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

export function ToastHost({ toasts }: { toasts: ToastItem[] }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-host" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.tone}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}
