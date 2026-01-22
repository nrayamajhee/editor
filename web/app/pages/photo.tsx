import { getAuth } from "@clerk/react-router/server";
import { get } from "~/utils/query";
import { useEffect } from "react";
import type { Photo } from "~/schema";
import {
  useLoaderData,
  useNavigate,
  useParams,
  Link,
  type LoaderFunctionArgs,
} from "react-router";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import SecureImage from "~/components/SecureImage";

export async function loader(args: LoaderFunctionArgs) {
  const { getToken } = await getAuth(args);
  const token = await getToken();
  const photos = await get("/photos", token ?? "");
  return { photos };
}

export default function PhotoPage() {
  const { photos } = useLoaderData<{ photos: Photo[] }>();
  const { name, username } = useParams();
  const navigate = useNavigate();

  const currentIndex = photos.findIndex((p: Photo) => p.name === name);

  useEffect(() => {
    if (currentIndex === -1 && photos.length > 0) {
      navigate(`/${username}/photos`);
    }
  }, [currentIndex, photos, navigate, username]);

  if (currentIndex === -1) return null;

  const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
  const nextIndex = (currentIndex + 1) % photos.length;

  const prevPhoto = photos[prevIndex];
  const nextPhoto = photos[nextIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate(`/${username}/photos`);
      if (e.key === "ArrowLeft")
        navigate(`/${username}/photo/${prevPhoto.name}`);
      if (e.key === "ArrowRight")
        navigate(`/${username}/photo/${nextPhoto.name}`);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, username, prevPhoto.name, nextPhoto.name]);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
      <Link
        to={`/${username}/photos`}
        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 z-50 transition-colors"
      >
        <FiX size={32} />
      </Link>

      <Link
        to={`/${username}/photo/${prevPhoto.name}`}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-50 transition-colors"
      >
        <FiChevronLeft size={48} />
      </Link>

      <div className="w-full h-full p-4 md:p-12 flex items-center justify-center overflow-hidden">
        <SecureImage
          name={name!}
          className="max-w-full max-h-full object-contain shadow-2xl"
        />
      </div>

      <Link
        to={`/${username}/photo/${nextPhoto.name}`}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 z-50 transition-colors"
      >
        <FiChevronRight size={48} />
      </Link>
    </div>
  );
}
