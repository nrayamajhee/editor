import { SignIn, useUser } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { dark } from "@clerk/themes";

export default function Login() {
  const { user } = useUser();
  if (user) {
    return <Navigate to="/" />;
  }
  return (
    <div className="grid place-items-center min-h-screen">
      <SignIn
        appearance={{
          baseTheme: dark,
        }}
        forceRedirectUrl={import.meta.env.PROD ? "/editor" : undefined}
      />
    </div>
  );
}
