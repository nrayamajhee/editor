import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import "./markdown.css";
import Editor from "./Editor";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { IconContext } from "react-icons";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "./Dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  useQuery as useReactQuery,
  useMutation as useReactMutation,
} from "@tanstack/react-query";
import Login from "./Login";
import NotFound from "./NotFound";

const BASE_URL = import.meta.env.VITE_API_URL;

const queryClient = new QueryClient();

export type QueryErr = {
  status: number;
  error: string;
} & Error;

export const useQuery = <T extends unknown>(
  key: string | string[],
  path: string,
) => {
  const { getToken } = useAuth();
  return useReactQuery({
    queryKey: typeof key === "string" ? [key] : key,
    queryFn: async () => {
      let token = await getToken();
      let res = await fetch(`${BASE_URL}${path}`, {
        headers: {
          Authorization: token ?? "",
        },
      });
      if (!res.ok) {
        throw {
          status: res.status,
          error: res.body,
        };
      } else {
        let json = await res.json();
        return json as T;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useMutation = <T extends unknown>(
  key: string | string[],
  path: string,
) => {
  const { getToken } = useAuth();
  return useReactMutation({
    mutationKey: typeof key === "string" ? [key] : key,
    mutationFn: async (body: T) => {
      let token = await getToken();
      let res = await fetch(`${BASE_URL}${path}`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ?? "",
        },
        body: JSON.stringify(body),
      });
      let json = await res.json();
      return json;
    },
  });
};

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/document/:id",
      element: <Editor />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ],
  {
    basename: import.meta.env.PROD ? "/editor" : "",
  },
);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("No clerk key in env");
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
