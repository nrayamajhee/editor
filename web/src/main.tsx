import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import App from "./App.tsx";
import { ClerkProvider } from "@clerk/clerk-react";
import { IconContext } from "react-icons";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk publishable key to the .env.local file");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <IconContext.Provider value={{ className: "text-zinc-100 text-xl" }}>
        <App />
      </IconContext.Provider>
    </ClerkProvider>
  </StrictMode>,
);
