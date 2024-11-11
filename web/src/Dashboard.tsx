import { Document as Doc, CurrentWeather } from "schema";
import { QueryErr, useMutation, useQuery } from "./main";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FiFilePlus } from "react-icons/fi";
import Profile from "./components/Profile";
import { formatDate } from "./utils";
import { useUser } from "@clerk/clerk-react";
import { useCallback, useEffect, useState } from "react";

const Dashboard = () => {
  const docQuery = useQuery<Doc[]>("documents", "/documents");
  const navigate = useNavigate();
  const { user } = useUser();
  const createDoc = useMutation("create_document", "/documents");
  if (docQuery.isLoading) {
    return <>Loading</>;
  }
  if (docQuery.isError) {
    if ((docQuery.error as QueryErr).status === 401) {
      return <Navigate to="/login" />;
    } else {
      return <>Error</>;
    }
  }
  const handleNew = async () => {
    let doc = await createDoc.mutateAsync({
      title: "Untitled",
      content: "",
    });
    navigate(`/document/${doc.id}`);
  };
  return (
    <div className="mx-auto max-w-[960px] p-8 flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <p className="text-xl font-medium">Welcome</p>
          <p className="text-2xl font-semibold">{user?.fullName}</p>
        </div>
        <Profile variant="big" />
      </div>
      <Weather />
      <div className="grid grid-cols-3 gap-4">
        {docQuery.data
          ?.sort(
            (a: Doc, b: Doc) =>
              new Date(a.updated_at).getTime() -
              new Date(b.updated_at).getTime(),
          )
          .map((document: Doc) => (
            <Document document={document} key={document.id} />
          ))}
        <button
          onClick={handleNew}
          className="bg-zinc-700 rounded-md p-2  w-full flex items-center justify-center gap-2 min-h-[5rem]"
        >
          <FiFilePlus />
          <p>New File</p>
        </button>
      </div>
    </div>
  );
};

type DocumentProp = {
  document: Doc;
};

const Document = ({ document }: DocumentProp) => {
  return (
    <Link to={`document/${document.id}`}>
      <div className="bg-zinc-700 rounded-md p-4 flex flex-cols">
        <div className="flex flex-col gap-2">
          <p className="font-semibold text-xl">{document.title}</p>
          <p className="font-medium text-sm">
            {formatDate(document.updated_at)}
          </p>
        </div>
      </div>
    </Link>
  );
};

type Coords = {
  latitude: number;
  longitude: number;
};

const Weather = () => {
  const [loc, setLoc] = useState<Coords | undefined>();
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((location) => {
      let { latitude, longitude } = location.coords;
      setLoc({
        latitude,
        longitude,
      });
    });
  }, []);
  const weatherQuery = useQuery<CurrentWeather>(
    "weather",
    `/weather?lat=${loc?.latitude}&long=${loc?.longitude}&unit=F`,
    !!loc,
  );
  if (weatherQuery.isLoading || !loc) return <>loading</>;
  if (weatherQuery.isError || !weatherQuery.data) return <>Error</>;
  const { time, temperature_2m, wind_speed_10m } = weatherQuery.data;
  return (
    <div>
      <p>{time}</p>
      <p>{temperature_2m}</p>
      <p>{wind_speed_10m}</p>
    </div>
  );
};

export default Dashboard;
