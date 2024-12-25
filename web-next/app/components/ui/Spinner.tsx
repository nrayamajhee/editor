type SpinnerProps = {
  size?: "small";
};
export default function Spinner({ size: variant }: SpinnerProps) {
  const size = variant === "small" ? "w-4 h-4" : "w-8 h-8";
  return (
    <i
      className={
        size +
        " border-2 border-orange border-t-transparent rounded-full animate-spin"
      }
    />
  );
}
