import "./App.css";

import { useEffect, useState } from "react";
import usePermissions from "./use-permissions";
import { convertTemp } from "./lib/utils";

type GeoLocationCoordinates = {
  latitude: number;
  longitude: number
}

type WeatherDetails = {
  base: string;
  main: {
    temp: number;
    temp_max: number;
    temp_min: number;
    humidity: number;
    pressure: number;
  }
  name: string;
  sys: {
    country: string;
    sunset: number;
    sunrise: number;
  }
  weather: {
    description: string;
    icon: string;
    id: number;
    main: string;
  }[]
}

// can split the logic to separate components, but will have them here instead.
const useGetWeatherDetails = () => {
  const [geoLocation, setGeoLocation] = useState<GeoLocationCoordinates>();

  const [weatherDetails, setWeatherDetails] = useState<WeatherDetails>();
  const [error, setError] = useState<Error | GeolocationPositionError>();
  const [loading, setLoading] = useState(false);

  const permissions = usePermissions({ name: "geolocation", setLoading, setError })

  const [weatherTemperature, setWeatherTemperature] = useState<"Celsius" | "Farenheit">("Celsius");

  useEffect(() => {
    if (permissions === "granted") {
      setLoading(true)
      navigator.geolocation.getCurrentPosition((position) => {
        setGeoLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
        setLoading(false)
      }, (error) => {
        setError(error)
        setLoading(false)
      })
    }
  }, [permissions])

  useEffect(() => {
    if (geoLocation) {
      setLoading(true);
      fetch(`${import.meta.env.VITE_WEATHER_API}?lat=${geoLocation.latitude}&lon=${geoLocation.longitude}`)
        .then((response) => {
          response.json()
            .then((data: WeatherDetails) => {
              setWeatherDetails(data)
            })
            .catch((error) => {
              setError(error)
            })
        })
        .catch((error) => {
          setError(error)
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [geoLocation]);

  return {
    permissions,
    weatherDetails,
    error,
    weatherTemperature,
    setWeatherTemperature,
    loading
  }
}

const App: React.FC = () => {
  const { weatherDetails, weatherTemperature, setWeatherTemperature, loading, permissions, error } = useGetWeatherDetails();

  return (
    <>
      <header>
        <h1>Weather App</h1>
      </header>

      <main>
        <article className="card">
          {loading && !permissions && (
            <div className="loader-container">
              <span className="loader"></span>
              <span>Loading...</span>
            </div>
          )}

          {loading && permissions === "prompt" && (
            <div className="loader-container">
              <span className="loader"></span>
              <span>Waiting for your permission...</span>
            </div>
          )}

          {permissions === "prompt" && !loading && (
            <>
              <h2>Grant permission to access your location</h2>
              <p>Please give access to your geo location to show the current weather.</p>
            </>
          )}

          {permissions === "denied" && !loading && (
            <>
              <h2>Permission denied</h2>
              <p>We cannot show the current weather without your general location.</p>
            </>
          )}

          {loading && permissions === "granted" && (
            <div className="loader-container">
              <span className="loader"></span>
              <span>Feeling the weather...</span>
            </div>
          )}

          {permissions === "granted" && !loading && weatherDetails && (
            <>
              <h2>{weatherDetails.weather[0].main} in {weatherDetails.sys.country}</h2>
              <div>
                <img
                  src={weatherDetails.weather[0].icon}
                  alt={weatherDetails.weather[0].description}
                />
                <p>The {weatherDetails.name} has {weatherDetails.weather[0].description}</p>
              </div>
              <div className="misc-details">
                <div>
                  Temperature:&nbsp;
                  <span>{convertTemp(weatherDetails.main.temp, weatherTemperature) + " " + weatherTemperature[0]}</span>
                </div>
                <div>
                  Humidity:&nbsp;
                  <span>{weatherDetails.main.humidity}</span>
                </div>
              </div>

              <button
                type="button"
                title="Toggle weather temperature"
                aria-label="Toggle weather temperature"
                onClick={() => {
                  if (weatherTemperature === "Celsius") {
                    setWeatherTemperature("Farenheit")
                  } else {
                    setWeatherTemperature("Celsius")
                  }
                }}
              >
                Show temperature in {weatherTemperature === "Celsius" ? "Farenheit" : "Celsius"}
              </button>
            </>
          )}

          {error && !loading && (
            <>
              <h2>Something went wrong</h2>
              <p>{error.message}</p>
            </>
          )}
        </article>
      </main>
    </>
  );
};

export default App;