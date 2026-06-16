import { CITIES } from "./constants";

const fetchData = async () => {
  const url =
    "https://archive-api.open-meteo.com/v1/archive" +
    "?latitude=" +
    CITIES.map((c) => c.lat).join(",") +
    "&longitude=" +
    CITIES.map((c) => c.lon).join(",") +
    "&start_date=2025-01-01&end_date=2025-12-31" +
    "&daily=temperature_2m_mean&timezone=auto";

  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const processData = (data) => {
  const weeklyTemps = CITIES.map((city) => ({
    name: city.name,
    temperatures: Array(52).fill(0),
  }));

  data.data.daily.forEach((day, index) => {
    const weekIndex = Math.floor(index / 7);
    weeklyTemps.forEach((tempData, cityIndex) => {
      tempData.temperatures[weekIndex] += day.temperature_2m_mean[cityIndex];
    });
  });

  // Calculate the average for each week
  weeklyTemps.forEach((tempData) => {
    tempData.temperatures = tempData.temperatures.map(
      (sum) =>
        sum /
        (Math.min(
          7,
          data.data.daily.length - 52 * 7 * (CITIES.indexOf(tempData) + 1),
        ) || 1),
    );
  });

  return weeklyTemps;
};

export { fetchData, processData };
