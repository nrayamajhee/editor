import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  useUser,
} from "@clerk/clerk-react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { FiUser } from "react-icons/fi";

type ProfileProps = {
  variant?: "big" | "small";
};

export default function Profile({ variant }: ProfileProps) {
  const { user } = useUser();
  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <FiUser className="cursor-pointer" />
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <Popover className="relative">
          <PopoverButton className="outline-none border-2 border-transparent active:border-zinc-800 flex items-center">
            {user?.hasImage ? (
              <img
                alt="profile-picture"
                src={user?.imageUrl}
                className={
                  "block rounded-full " +
                  (variant === "big" ? "w-16 h-16" : "w-8 h-8")
                }
              />
            ) : (
              <FiUser />
            )}
          </PopoverButton>
          <PopoverPanel
            anchor={{
              to: "bottom",
              gap: "10px",
              padding: "12px",
            }}
            className="flex flex-col items-stretch bg-zinc-700 shadow-md rounded-md p-2 gap-2 min-w-32"
          >
            <p className="px-2 py-1">{user?.firstName}</p>
            <SignOutButton
              redirectUrl={import.meta.env.PROD ? "/editor" : undefined}
            >
              <p className="px-2 py-1 rounded-md hover:bg-zinc-800 cursor-pointer">
                Sign out
              </p>
            </SignOutButton>
          </PopoverPanel>
        </Popover>
      </SignedIn>
    </>
  );
}
