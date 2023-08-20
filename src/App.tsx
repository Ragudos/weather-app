import "./App.css";

import { useEffect, useState } from "react";

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
  const [permissions, setPermissions] = useState<"granted" | "prompt" | "denied">();

  const [geoLocation, setGeoLocation] = useState<GeoLocationCoordinates>();

  const [weatherDetails, setWeatherDetails] = useState<WeatherDetails>();
  const [error, setError] = useState<Error | GeolocationPositionError>();
  const [loading, setLoading] = useState(false);

  const [weatherTemperature, setWeatherTemperature] = useState<"Celsius" | "Farenheit">("Celsius");

  useEffect(() => {
    setLoading(true);
    navigator.permissions.query({ name: "geolocation" }).then((result) => {
      if (result.state === "prompt") {
        setPermissions("prompt")
      }

      if (result.state === "granted") {
        setPermissions("granted");
      }

      if (result.state === "denied") {
        setPermissions("denied");
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      result.addEventListener("change", (result: any) => {
        if (result.target?.state === "prompt") {
          setPermissions("prompt")
        }

        if (result.target?.state === "granted") {
          setPermissions("granted");
        }

        if (result.target?.state === "denied") {
          setPermissions("denied");
        }
      });

      setLoading(false);
    }).catch((error) => {
      setError(error);
      setLoading(false);
    });
  }, []);

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
      fetch(`https://weather-proxy.freecodecamp.rocks/api/current?lat=${geoLocation.latitude}&lon=${geoLocation.longitude}`)
        .then((response) => {
          response.json()
            .then((data: WeatherDetails) => {
              setWeatherDetails(data)
            })
            .catch((error) => {
              setError(error)
            })
            .finally(() => {
              setLoading(false)
            })
        })
        .catch((error) => {
          setError(error)
        })
    }
  }, [geoLocation]);

  return {
    permissions,
    setPermissions,
    weatherDetails,
    error,
    weatherTemperature,
    setWeatherTemperature,
    loading
  }
}

const App: React.FC = () => {
  const { weatherDetails, weatherTemperature, setWeatherTemperature, loading, permissions, error } = useGetWeatherDetails();

  const convertTemp = (temperature: number) => {
    if (weatherTemperature === "Celsius") {
      return temperature
    }

    if (weatherTemperature === "Farenheit") {
      return ((temperature * 9/5) + 32)
    }
  }

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
                  <span>{convertTemp(weatherDetails.main.temp) + " " + weatherTemperature[0]}</span>
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