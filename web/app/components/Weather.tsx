import { useEffect, useState } from "react";
import { formatTime } from "~/utils/formatter";
import {
  WiDayCloudy,
  WiDaySnow,
  WiDaySunny,
  WiDaySunnyOvercast,
} from "react-icons/wi";
import { type Weather as W } from "schema";
import { queryErrored, queryIsLoading, useGet } from "~/utils/query";

type Coords = {
  latitude: number;
  longitude: number;
};

export default function Weather() {
  const [loc, setLoc] = useState<Coords | undefined>();
  useEffect(() => {
    const location = localStorage.getItem("location");
    let askLocation = true;
    if (location) {
      const l = JSON.parse(location);
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
          alert(err.message);
        },
      );
    }
  }, []);
  const weather = useGet<W>(
    `/weather?lat=${loc?.latitude}&lon=${loc?.longitude}&unit=F`,
    !!loc,
  );
  if (queryIsLoading(weather)) return <>loading</>;
  if (queryErrored(weather)) return <>error</>;
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
