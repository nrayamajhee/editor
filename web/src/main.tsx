import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import "./markdown.css";
import Editor from "./Editor";
import { ClerkProvider } from "@clerk/clerk-react";
import { IconContext } from "react-icons";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./Dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  useQuery as useReactQuery,
  useMutation as useReactMutation,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

export type QueryErr = {
  status: number;
  error: string;
};

export const useQuery = (key: string | string[], path: string) =>
  useReactQuery({
    queryKey: typeof key === "string" ? [key] : key,
    queryFn: async () => {
      let res = await fetch(`${import.meta.env.VITE_API_URL}${path}`);
      if (!res.ok) {
        throw {
          status: res.status,
          error: res.body,
        };
      } else {
        let json = await res.json();
        return json;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

export const useMutation = <T extends unknown>(
  key: string | string[],
  path: string,
) =>
  useReactMutation({
    mutationKey: typeof key === "string" ? [key] : key,
    mutationFn: async (body: T) => {
      let res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      let json = await res.json();
      return json;
    },
  });

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
  },
  {
    path: "/document/:slug",
    element: <Editor />,
  },
]);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Add your Clerk publishable key to the .env.local file");
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
        <IconContext.Provider value={{ className: "text-zinc-100 text-xl" }}>
          <RouterProvider router={router}></RouterProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </IconContext.Provider>
      </ClerkProvider>
    </QueryClientProvider>
  </StrictMode>,
);
