import { Toaster } from "react-hot-toast";

export default function ToastViewport() {
  return (
    <Toaster
      position="top-center"
      gutter={8}
      toastOptions={{
        duration: 3_500,
        style: {
          maxWidth: "min(28rem, calc(100vw - 2rem))",
          padding: "0.75rem 1rem",
          color: "rgb(248 250 252)",
          background: "rgba(2, 6, 23, 0.92)",
          border: "1px solid rgba(125, 211, 252, 0.32)",
          borderRadius: "0.75rem",
          boxShadow: "0 12px 36px rgba(8, 145, 178, 0.24)",
          backdropFilter: "blur(16px)",
        },
        success: {
          iconTheme: { primary: "rgb(103 232 249)", secondary: "rgb(8 47 73)" },
        },
        error: {
          iconTheme: { primary: "rgb(251 191 36)", secondary: "rgb(69 26 3)" },
          style: {
            border: "1px solid rgba(251, 191, 36, 0.65)",
            boxShadow: "0 12px 40px rgba(245, 158, 11, 0.32)",
          },
        },
      }}
    />
  );
}