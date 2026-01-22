import { useEffect, useState } from "react";
import { useGet, queryIsLoading, queryErrored } from "~/utils/query";

type SecureImageProps = {
  name: string;
  className?: string;
  alt?: string;
};

export default function SecureImage({
  name,
  className,
  alt,
}: SecureImageProps) {
  const query = useGet<Blob>(
    `/photos/${encodeURIComponent(name)}`,
    true,
    "blob",
  );
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    if (query.status === "fetched") {
      const objectUrl = URL.createObjectURL(query.data);
      setSrc(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [query]);

  if (queryIsLoading(query))
    return <div className={`bg-zinc-800 animate-pulse ${className}`} />;

  if (queryErrored(query) || (!src && query.status === "fetched"))
    return (
      <div
        className={`bg-zinc-800 flex items-center justify-center text-zinc-500 ${className}`}
      >
        Error
      </div>
    );

  return src ? <img src={src} className={className} alt={alt || name} /> : null;
}
