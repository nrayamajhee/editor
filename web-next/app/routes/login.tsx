import { SignIn } from "@clerk/remix";
import { dark } from "@clerk/themes";

export default function Login() {
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
