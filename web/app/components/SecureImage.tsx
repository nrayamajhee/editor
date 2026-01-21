import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react-router";

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
  const { getToken } = useAuth();
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    const fetchImage = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/photos/${name}/view`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) throw new Error("Failed to load image");

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setSrc(objectUrl);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [name, getToken]);

  if (loading)
    return <div className={`bg-zinc-800 animate-pulse ${className}`} />;
  if (error || !src)
    return (
      <div
        className={`bg-zinc-800 flex items-center justify-center text-zinc-500 ${className}`}
      >
        Error
      </div>
    );

  return <img src={src} className={className} alt={alt || name} />;
}
