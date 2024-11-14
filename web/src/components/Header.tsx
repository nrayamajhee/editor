import { Link } from "react-router-dom";
import Profile from "./Profile";
import Weather from "./Weather";

export default function Header() {
  const linkStyle =
    "py-4 px-8 border-b-4 border-b-sky-400/20 outline-none active:border-b-sky-400/50 focus:border-b-sky-400/50 hover:border-b-sky-400/50 transition-colors";
  return (
    <div>
      <div className="flex justify-between px-16">
        <Weather />
        <Profile variant="big" />
      </div>
      <nav className="flex gap-1 px-8">
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
