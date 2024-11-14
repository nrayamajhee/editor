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
import Pictures from "./Pictures";
import Wrapper from "./components/Wrapper";

const queryClient = new QueryClient();

export type QueryErr = {
  status: number;
  error: string;
} & Error;

export const useQuery = <T extends unknown>(
  key: string | string[],
  path: string,
  enabled?: boolean,
) => {
  const { getToken } = useAuth();
  return useReactQuery({
    queryKey: typeof key === "string" ? [key] : key,
    queryFn: async () => {
      let token = await getToken();
      let res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
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
    enabled: enabled ?? true,
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
      let res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
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

export const useDelete = (key: string | string[], path: string) => {
  const { getToken } = useAuth();
  return useReactMutation({
    mutationKey: typeof key === "string" ? [key] : key,
    mutationFn: async () => {
      let token = await getToken();
      let res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ?? "",
        },
      });
      let json = await res.json();
      return json;
    },
  });
};

export const useFile = (key: string | string[], path: string) => {
  const { getToken } = useAuth();
  return useReactMutation({
    mutationKey: typeof key === "string" ? [key] : key,
    mutationFn: async (file: File) => {
      let token = await getToken();
      let body = new FormData();
      body.append("file", file);
      let res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
        method: "post",
        headers: {
          Authorization: token ?? "",
        },
        body,
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
      element: <Wrapper />,
      children: [
        {
          index: true,
          element: <Dashboard />,
        },
        {
          path: "pictures",
          element: <Pictures />,
        },
      ],
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/document/:id",
      element: <Editor />,
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
