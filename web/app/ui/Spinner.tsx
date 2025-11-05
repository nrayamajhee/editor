const variants = {
  small: "w-3 h-3",
  large: "w-8 h-8",
  default: "w-6 h-6",
};
type SpinnerProps = {
  size?: keyof typeof variants;
};
export default function Spinner({ size: variant }: SpinnerProps) {
  const size = variants[variant ?? "default"];
  return (
    <i
      className={
        size +
        " border-2 border-orange border-t-transparent rounded-full animate-spin"
      }
    />
  );
}
