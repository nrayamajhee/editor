import { Document as Doc, Weather as W } from "schema";
import { QueryErr, useMutation, useQuery } from "./main";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { FiFile, FiFilePlus, FiPlus, FiPlusSquare } from "react-icons/fi";
import Profile from "./components/Profile";
import { formatDate, formatTime } from "./utils";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import {
  WiDayCloudy,
  WiDaySnow,
  WiDaySunny,
  WiDaySunnyOvercast,
} from "react-icons/wi";

const docStyle = " bg-zinc-700/50 hover:bg-zinc-700/80 transition-colors rounded-2xl ";

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
  const linkStyle =
    "py-4 px-8 border-b-4 border-b-sky-400/20 hover:border-b-sky-400/50 transition-colors";
  return (
    <div className="min-h-screen bg-zinc-900">
      <div className="mx-auto max-w-[960px] p-8 flex flex-col">
        <div className="flex justify-between px-16">
          <Weather />
          <Profile variant="big" />
        </div>
        <nav className="flex gap-1 px-8">
          <Link className={linkStyle} to="/">
            Documents
          </Link>
          <Link className={linkStyle} to="/pictures">
            Pictures
          </Link>
        </nav>
        <div className="grid grid-cols-3 gap-8 p-8 border-t-sky-400/10 border-t-2 rounded-3xl hover:border-t-sky-400/20 transition-colors duration-700">
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
            className={
              "w-full flex items-center justify-center gap-2 min-h-[5rem]" +
              docStyle
            }
          >
            <FiFile />
            <p>New File</p>
          </button>
        </div>
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
      <div className={docStyle + "px-8 py-4 flex flex-cols"}>
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
    let location = localStorage.getItem("location");
    let askLocation = true;
    if (location) {
      let l = JSON.parse(location);
      if (new Date().getTime() - new Date(l.time).getTime() > 1000 * 60) {
        setLoc(l);
        askLocation = false;
      }
    }
    if (askLocation) {
      navigator.geolocation.getCurrentPosition((location) => {
        const loc = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          time: new Date().toUTCString(),
        };
        setLoc(loc);
        window.localStorage.setItem("location", JSON.stringify(loc));
      });
    }
  }, []);
  const weatherQuery = useQuery<W>(
    "weather",
    `/weather?lat=${loc?.latitude}&long=${loc?.longitude}&unit=F`,
    !!loc,
  );
  if (weatherQuery.isLoading || !loc) return <>loading</>;
  if (weatherQuery.isError || !weatherQuery.data) return <>Error</>;
  const { current, location } = weatherQuery.data;
  return (
    <div className="grid grid-cols-[1fr_48px] gap-x-4 gap-y-2 items-center">
      <p className="text-xl">{formatTime(current.time)}</p>
      <div className="row-span-3">
        <WeatherIcon code={current.weather_code} size={48} />
      </div>
      <p className="text-4xl">{current.temperature_2m}°F</p>
      <p className="text-xl">
        {location.address.city ?? location.address.county}
      </p>
    </div>
  );
};

type WeatherIconProps = {
  size: number;
  code: number;
};

const WeatherIcon = ({ code, size }: WeatherIconProps) => {
  if (code <= 1) {
    return <WiDaySunny size={size} />;
  } else if (code == 2) {
    return <WiDaySunnyOvercast size={size} />;
  } else if (code == 3) {
    return <WiDayCloudy size={size} />;
  } else if (code > 3 && code < 9) {
    return <WiDaySunny size={size} />;
  } else if (code >= 9 && code <= 13) {
    return <WiDaySunny size={size} />;
  } else {
    return <WiDaySnow size={size} />;
  }
};

export default Dashboard;
