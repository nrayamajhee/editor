type SpinnerProps = {
  size?: "small";
};
export default function Spinner({ size: variant }: SpinnerProps) {
  const size = variant === "small" ? "w-3 h-3" : "w-6 h-6";
  return (
    <i
      className={
        size +
        " border-2 border-orange border-t-transparent rounded-full animate-spin"
      }
    />
  );
}
