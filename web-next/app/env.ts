const envVar = (variable: string) => {
  const value = import.meta.env[variable];
  if (!value) {
    throw new Error(`Environment variable ${variable} not set!`);
  }
  return value;
};

export const env = {
  R2_URL: envVar("VITE_R2_URL"),
  API_URL: envVar("VITE_API_URL"),
  CLERK_PUBLISHABLE_KEY: envVar("VITE_CLERK_PUBLISHABLE_KEY"),
};
