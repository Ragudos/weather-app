const convertTemp = (temperature: number, weatherTemperature: "Celsius" | "Farenheit") => {
  if (weatherTemperature === "Celsius") {
    return temperature
  }

  if (weatherTemperature === "Farenheit") {
    return ((temperature * 9 / 5) + 32)
  }
}

export {
  convertTemp
}