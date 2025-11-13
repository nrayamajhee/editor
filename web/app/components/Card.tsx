type CardProps = {
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
};

export default function Card({
  title,
  subtitle,
  children,
  className,
}: CardProps) {
  return (
    <div
      className={`bg-zinc-900 rounded-2xl flex flex-col gap-4 p-4 ${className}`}
    >
      {title || subtitle ? (
        <div className="flex flex-col gap-2">
          {title ? <p className="font-bold text-lg">{title}</p> : null}
          {subtitle ? (
            <p className="font-semibold text-zinc-400">{subtitle}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
