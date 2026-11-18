import { createContext, useCallback, useContext, useRef, useState } from "react";
import ConfirmDialog from "../components/confirmDialog/ConfirmDialog";
import "./Feedback.css";

const FeedbackContext = createContext(null);

export function FeedbackProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  // Usage: const ok = await confirm({ title, message }); if (!ok) return;
  const confirm = useCallback((options) => new Promise((resolve) => setDialog({ ...options, resolve })), []);

  const answer = (result) => {
    dialog.resolve(result);
    setDialog(null);
  };

  // Usage: toast("Edited Successfully")   or   toast("Something failed", "error")
  const toast = useCallback((message, type = "success") => {
    const id = ++nextId.current;
    setToasts((list) => [...list, { id, message, type }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <FeedbackContext.Provider value={{ confirm, toast }}>
      {children}
      {dialog && <ConfirmDialog {...dialog} onResult={answer} />}
      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <p key={t.id} className={`toast toast-${t.type}`}>
            {t.message}
          </p>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export const useFeedback = () => useContext(FeedbackContext);