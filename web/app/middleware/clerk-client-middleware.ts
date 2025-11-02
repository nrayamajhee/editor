import { createClerkClient } from "@clerk/react-router/server";
import { createContext } from "react-router";

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

export const clerkClientContext = createContext<ReturnType<
  typeof createClerkClient
> | null>(null);

export async function clerkClientMiddleware(
  { context }: any,
  next: () => Promise<Response>,
) {
  context.set(clerkClientContext, clerkClient);
  return next();
}
