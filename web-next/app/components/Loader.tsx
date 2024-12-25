import { Await } from "@remix-run/react";
import { ReactNode, Suspense } from "react";

type LoaderProps<T> = {
  scaffold: ReactNode;
  promise: Promise<T>;
  children: (data: T) => ReactNode;
};

export default function Loader<T>({
  scaffold,
  promise,
  children,
}: LoaderProps<T>) {
  return (
    <Suspense fallback={scaffold}>
      <Await resolve={promise}>{children}</Await>
    </Suspense>
  );
}
