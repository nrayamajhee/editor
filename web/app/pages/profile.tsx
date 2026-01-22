import { getAuth } from "@clerk/react-router/server";
import { redirect, useLoaderData, Form } from "react-router";
import { clerkClientContext } from "~/middleware/clerk-client-middleware";
import type { Route } from "./+types/profile";
import Card from "~/components/Card";
import Badge from "~/components/Badge";
import { formatRelativeDateTime } from "~/utils/formatter";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { FiMoreVertical } from "react-icons/fi";

export async function loader(args: Route.LoaderArgs) {
  const { userId, getToken } = await getAuth(args);
  const token = await getToken();
  if (!token || !userId) {
    throw redirect("/");
  }

  const clerkClient = args.context.get(clerkClientContext);
  if (!clerkClient) {
    throw new Error("Clerk client not found");
  }

  const user = await clerkClient.users.getUser(userId);
  const sessions = await clerkClient.sessions.getSessionList({ userId });

  if (!user) {
    throw redirect("/");
  }
  return { user, sessions: sessions.data };
}

export async function action(args: Route.ActionArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  if (!token) {
    throw redirect("/");
  }

  const formData = await args.request.formData();
  const sessionId = formData.get("sessionId") as string;

  if (!sessionId) {
    throw new Error("Session ID is required");
  }

  const clerkClient = args.context.get(clerkClientContext);
  if (!clerkClient) {
    throw new Error("Clerk client not found");
  }

  try {
    await clerkClient.sessions.revokeSession(sessionId);
    return { success: true };
  } catch (error) {
    console.error("Failed to revoke session:", error);
    throw new Error("Failed to revoke session");
  }
}

export default function ProfilePage() {
  const { user, sessions } = useLoaderData<typeof loader>();

  return (
    <div className="p-4 md:p-6 flex flex-col gap-6 w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1">
              <div className="flex flex-col">
                <span className="text-zinc-400 text-sm uppercase tracking-wider font-semibold">
                  Username
                </span>
                <span className="text-xl font-medium">{user.username}</span>
              </div>
              {user.firstName && (
                <div className="flex flex-col mt-2">
                  <span className="text-zinc-400 text-sm uppercase tracking-wider font-semibold">
                    Name
                  </span>
                  <span className="text-lg">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card title="Connected Accounts">
          <div className="flex flex-col gap-3">
            {user.externalAccounts.length > 0 ? (
              user.externalAccounts.map((account) => (
                <div
                  key={account.id}
                  className="bg-zinc-800/50 p-4 rounded-xl flex justify-between items-center border border-zinc-700/50"
                >
                  <div className="flex flex-col">
                    <span className="capitalize font-semibold text-zinc-200">
                      {account.provider.replace("oauth_", "")}
                    </span>
                    <span className="text-zinc-400 text-sm">
                      {account.emailAddress || account.username || account.id}
                    </span>
                  </div>
                  {account.verification?.status === "verified" && (
                    <Badge variant="success">Verified</Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-zinc-500 italic p-2">No connected accounts</p>
            )}
          </div>
        </Card>
      </div>

      <Card title="Active Devices">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sessions
            ?.filter((session) => session.status === "active")
            .map((session) => (
              <div
                key={session.id}
                className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 flex flex-col gap-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-200">
                      {session.latestActivity?.deviceType}
                    </span>
                    <span className="text-sm text-zinc-400">
                      {session.latestActivity?.browserName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        session.status === "active" ? "success" : "neutral"
                      }
                    >
                      {session.status === "active" ? "Active Now" : "Inactive"}
                    </Badge>
                    <Popover className="relative">
                      <PopoverButton className="cursor-pointer outline-none hover:bg-zinc-700 p-1 rounded-md">
                        <FiMoreVertical />
                      </PopoverButton>
                      <PopoverPanel
                        anchor={{
                          to: "bottom",
                          gap: "10px",
                          padding: "12px",
                        }}
                        className="flex flex-col items-stretch bg-zinc-700 shadow-md rounded-md p-2 gap-2 min-w-32"
                      >
                        <Form method="post">
                          <input
                            type="hidden"
                            name="sessionId"
                            value={session.id}
                          />
                          <button
                            className="px-2 py-1 rounded-sm hover:bg-zinc-800 cursor-pointer"
                            type="submit"
                          >
                            Sign out of device
                          </button>
                        </Form>
                      </PopoverPanel>
                    </Popover>
                  </div>
                </div>
                <div className="text-sm text-zinc-400 mt-2">
                  {formatRelativeDateTime(session.lastActiveAt)}
                </div>
              </div>
            ))}
          {(!sessions ||
            sessions.filter((session) => session.status === "active").length ===
              0) && (
            <p className="text-zinc-500 italic p-2 col-span-full">
              No active devices found
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
