import { useAuth } from "@clerk/remix";
import { useEffect, useState } from "react";
import { env } from "./env";

async function fetchInternal<T>(
  path: string,
  token: string,
  method: "GET" | "POST" | "DELETE" | "PATCH",
  body?: T
) {
  const res = await fetch(`${env.API_URL}${path}`, {
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
  return await fetchInternal(path, token, "GET");
}

export async function post<T>(path: string, token: string, body: T) {
  return await fetchInternal(path, token, "POST", body);
}

type Data<T> =
  | {
      status: "error";
      error: any;
    }
  | {
      status: "fetched";
      data: T;
    }
  | {
      status: "idle" | "loading";
    };

export function useGet<T>(url: string, enabled: boolean = true) {
  const { getToken } = useAuth();
  const [data, setData] = useState<Data<T>>({ status: "idle" });
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
          get(url, token)
            .then((data) => {
              setData({
                data,
                status: "fetched",
              });
            })
            .catch((err) => {
              setData({
                error: err,
                status: "error",
              });
            });
        }
      })();
    }
  }, [url, enabled]);
  return data;
}
