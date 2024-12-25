import { User } from "@clerk/remix/ssr.server";
import Weather from "./Weather";
import Profile from "./Profile";
import { Link } from "@remix-run/react";

type HeaderProps = {
  user: User;
};

const linkStyle = `
  py-4 px-4 md:px-8 border-b-4 border-b-sky-400/20 outline-none
  active:border-b-sky-400/50 focus:border-b-sky-400/50 hover:border-b-sky-400/50
  transition-colors
`;

export default function Header({ user }: HeaderProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between px-16">
        <Weather />
        <Profile variant="big" user={user} />
      </div>
      <nav className="flex gap-1 mx-6 md:mx-8 ">
        <Link className={linkStyle} to="/">
          Documents
        </Link>
        <Link className={linkStyle} to="/pictures">
          Pictures
        </Link>
      </nav>
    </div>
  );
}
