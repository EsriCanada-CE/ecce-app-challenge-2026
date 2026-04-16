"use client";

import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "rgba(16, 24, 40, 0.92)",
          color: "#f8fafc",
          border: "1px solid rgba(148, 163, 184, 0.28)",
          borderRadius: "16px",
          padding: "12px 16px",
          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.28)",
        },
      }}
    />
  );
}
