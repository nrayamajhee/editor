import { SignOutButton, useClerk } from "@clerk/react-router";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { FiUser } from "react-icons/fi";
import { Link } from "react-router";

export type ProfileProps = {
  user: {
    hasImage: boolean;
    imageUrl?: string;
    firstName: string | null;
  };
  variant?: "big" | "small";
};

export default function Profile({ user, variant }: ProfileProps) {
  const clerk = useClerk();
  const gotoProfile = async () => {
    await clerk.redirectToUserProfile();
  };
  return (
    <Popover className="relative">
      <PopoverButton className="outline-none border-2 border-transparent focus:border-zinc-800 active:border-zinc-800 flex items-center rounded-full cursor-pointer">
        {user.hasImage ? (
          <img
            alt="profile-picture"
            src={user.imageUrl}
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
        <button
          className="px-2 py-1 rounded-md hover:bg-zinc-800 cursor-pointer text-left"
          onClick={gotoProfile}
        >
          {user.firstName}
        </button>
        <SignOutButton>
          <button className="px-2 py-1 rounded-md hover:bg-zinc-800 cursor-pointer text-left">
            Sign out
          </button>
        </SignOutButton>
      </PopoverPanel>
    </Popover>
  );
}
