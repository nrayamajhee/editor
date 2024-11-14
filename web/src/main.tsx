import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./main.css";
import "./markdown.css";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { IconContext } from "react-icons";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  useQuery as useReactQuery,
  useMutation as useReactMutation,
} from "@tanstack/react-query";
import Wrapper from "./components/Wrapper";
import { resolveValue, Toaster } from "react-hot-toast";
import { FiXOctagon } from "react-icons/fi";
import Spinner from "./components/Spinner";

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
      return await parseResponse<T>(res);
    },
    retry: false,
    refetchOnWindowFocus: false,
    enabled: enabled ?? true,
  });
};

async function parseResponse<T>(res: Response) {
  if (!res.ok) {
    throw {
      status: res.status,
      error: await res.text(),
    };
  } else {
    let json = await res.json();
    return json as T;
  }
}

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

export function useDelete<T>(key: string | string[], path: string) {
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
      return await parseResponse<T>(res);
    },
  });
}

export function useFile<T>(key: string | string[], path: string) {
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
      return await parseResponse<T>(res);
    },
  });
}

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Wrapper />,
      children: [
        {
          index: true,
          lazy: () => import("./pages/Dashboard"),
        },
        {
          path: "pictures",
          lazy: () => import("./pages/Pictures"),
        },
      ],
    },
    {
      path: "/login",
      lazy: () => import("./pages/Login"),
    },
    {
      path: "/document/:id",
      lazy: () => import("./pages/Editor"),
    },
    {
      path: "*",
      lazy: () => import("./pages/NotFound"),
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
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <IconContext.Provider value={{ className: "text-zinc-100 text-xl" }}>
          <RouterProvider router={router}></RouterProvider>
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster>
            {(t) => (
              <div className="bg-zinc-800 text-zinc-50 p-4 rounded-md shadow-md flex gap-4 items-center max-w-96">
                {t.type === "error" && (
                  <FiXOctagon color="#d32" className="shrink-0" />
                )}
                {t.type === "loading" && <Spinner />}
                {resolveValue(t.message, t)}
              </div>
            )}
          </Toaster>
        </IconContext.Provider>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
);
