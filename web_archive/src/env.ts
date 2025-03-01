const envVar = (variable: string) => {
  const value = import.meta.env[variable];
  if (!value) {
    throw new Error(`Environment variable ${variable} not set!`);
  }
  return value;
};

export const env = {
  VITE_R2_URL: envVar("VITE_R2_URL"),
  VITE_API_URL: envVar("VITE_API_URL"),
  VITE_CLERK_PUBLISHABLE_KEY: envVar("VITE_CLERK_PUBLISHABLE_KEY"),
};
