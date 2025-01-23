import { useAuth } from "@clerk/remix";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    API_URL: string;
  }
}

type Method = "GET" | "POST" | "DELETE" | "PATCH" | "PUT";

async function fetchInternal<T>(
  path: string,
  token: string,
  method: Method,
  body?: T
) {
  const res = await fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return await res.json();
}

export async function get(path: string, token: string) {
  return await fetchInternal(`${process.env.API_URL}${path}`, token, "GET");
}

export async function post<T>(path: string, token: string, body: T) {
  return await fetchInternal(
    `${process.env.API_URL}${path}`,
    token,
    "POST",
    body
  );
}

export async function del(path: string, token: string) {
  return await fetchInternal(`${process.env.API_URL}${path}`, token, "DELETE");
}

type QueryState<T> =
  | {
      status: "error";
      error: unknown;
    }
  | {
      status: "fetched";
      data: T;
    }
  | {
      status: "idle" | "loading";
    };

export function queryIsLoading<T>(query: QueryState<T>) {
  return query.status === "idle" || query.status === "loading";
}

export function queryErrored<T>(query: QueryState<T>) {
  return query.status !== "fetched";
}

export function useGet<T>(url: string, enabled: boolean = true) {
  const { getToken } = useAuth();
  const [data, setData] = useState<QueryState<T>>({ status: "idle" });
  useEffect(() => {
    if (enabled) {
      (async () => {
        setData({ status: "loading" });
        const token = await getToken();
        if (!token) {
          setData({
            status: "error",
            error: "No token",
          });
        } else {
          const onSuccess = (data: T) => {
            setData({
              data,
              status: "fetched",
            });
          };
          const onError = (err: unknown) => {
            setData({
              error: err,
              status: "error",
            });
          };
          fetchInternal(`${window["API_URL"]}${url}`, token, "GET")
            .then(onSuccess)
            .catch(onError);
        }
      })();
    }
  }, [url, enabled, getToken]);
  return data;
}

// export function usePost<T, R>(url: string) {
//   const { getToken } = useAuth();
//   const [data, setData] = useState<QueryState<T>>({ status: "idle" });
//   const trigger = useCallback(async (data: R) => {
//     setData({ status: "loading" });
//     const token = await getToken();
//     if (!token) {
//       setData({
//         status: "error",
//         error: "No token",
//       });
//     } else {
//       const onSuccess = (data: T) => {
//         setData({
//           data,
//           status: "fetched",
//         });
//       };
//       const onError = (err: any) => {
//         setData({
//           error: err,
//           status: "error",
//         });
//       };
//       post(url, token, data).then(onSuccess).catch(onError);
//     }
//   }, []);
//   return { ...data, trigger };
// }
//
// export function useDel<T>(url: string) {
//   const { getToken } = useAuth();
//   const [data, setData] = useState<QueryState<T>>({ status: "idle" });
//   const trigger = useCallback(async () => {
//     setData({ status: "loading" });
//     const token = await getToken();
//     if (!token) {
//       setData({
//         status: "error",
//         error: "No token",
//       });
//     } else {
//       const onSuccess = (data: T) => {
//         setData({
//           data,
//           status: "fetched",
//         });
//       };
//       const onError = (err: any) => {
//         setData({
//           error: err,
//           status: "error",
//         });
//       };
//       del(url, token).then(onSuccess).catch(onError);
//     }
//   }, []);
//   return { ...data, trigger };
// }
