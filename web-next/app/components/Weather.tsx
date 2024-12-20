import { useEffect, useState } from "react";
import { formatTime } from "../utils";
import {
  WiDayCloudy,
  WiDaySnow,
  WiDaySunny,
  WiDaySunnyOvercast,
} from "react-icons/wi";
import { Weather as W } from "schema";
import toast from "react-hot-toast";
import { useGet } from "~/query";

type Coords = {
  latitude: number;
  longitude: number;
};

export default function Weather() {
  const [loc, setLoc] = useState<Coords | undefined>();
  useEffect(() => {
    let location = localStorage.getItem("location");
    let askLocation = true;
    if (location) {
      let l = JSON.parse(location);
      if (new Date().getTime() - new Date(l.time).getTime() < 60000) {
        setLoc(l);
        askLocation = false;
      }
    }
    if (askLocation) {
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const loc = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            time: new Date().toUTCString(),
          };
          setLoc(loc);
          window.localStorage.setItem("location", JSON.stringify(loc));
        },
        (err) => {
          toast.error(err.message);
        }
      );
    }
  }, []);
  const weather = useGet<W>(
    `/weather?lat=${loc?.latitude}&lon=${loc?.longitude}&unit=F`,
    !!loc
  );
  if (weather.status === "loading") return <>loading</>;
  if (weather.status !== "fetched") return <>Error</>;
  return (
    <div className="grid grid-cols-[1fr_48px] gap-x-4 gap-y-2 items-center">
      <p className="text-xl">{formatTime(new Date())}</p>
      <div className="row-span-3">
        <WeatherIcon code={weather.data.weather_code} size={48} />
      </div>
      <p className="text-4xl">{weather.data.temperature_2m.toFixed(2)}°F</p>
      <p className="text-xl">{weather.data.location}</p>
    </div>
  );
}

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
