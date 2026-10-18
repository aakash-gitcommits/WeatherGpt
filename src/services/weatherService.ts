import {
  WeatherData,
  ForecastDay,
  HourlyForecastItem,
  ActivityItem,
  WeatherAlertItem,
  ComparisonData,
} from '../types/weather';

export interface LocationSearchResult {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  country_code?: string;
}

// Pre-seeded popular Indian locations
export const POPULAR_LOCATIONS: LocationSearchResult[] = [
  { name: 'Delhi', country: 'India', admin1: 'Delhi', latitude: 28.6139, longitude: 77.209, country_code: 'IN' },
  { name: 'Mumbai', country: 'India', admin1: 'Maharashtra', latitude: 19.076, longitude: 72.8777, country_code: 'IN' },
  { name: 'Pune', country: 'India', admin1: 'Maharashtra', latitude: 18.5204, longitude: 73.8567, country_code: 'IN' },
  { name: 'Bengaluru', country: 'India', admin1: 'Karnataka', latitude: 12.9716, longitude: 77.5946, country_code: 'IN' },
  { name: 'Hyderabad', country: 'India', admin1: 'Telangana', latitude: 17.385, longitude: 78.4867, country_code: 'IN' },
  { name: 'Chennai', country: 'India', admin1: 'Tamil Nadu', latitude: 13.0827, longitude: 80.2707, country_code: 'IN' },
  { name: 'Kolkata', country: 'India', admin1: 'West Bengal', latitude: 22.5726, longitude: 88.3639, country_code: 'IN' },
  { name: 'Ahmedabad', country: 'India', admin1: 'Gujarat', latitude: 23.0225, longitude: 72.5714, country_code: 'IN' },
  { name: 'Jaipur', country: 'India', admin1: 'Rajasthan', latitude: 26.9124, longitude: 75.7873, country_code: 'IN' },
  { name: 'Lucknow', country: 'India', admin1: 'Uttar Pradesh', latitude: 26.8467, longitude: 80.9462, country_code: 'IN' },
  { name: 'Chandigarh', country: 'India', admin1: 'Chandigarh', latitude: 30.7333, longitude: 76.7794, country_code: 'IN' },
  { name: 'Kochi', country: 'India', admin1: 'Kerala', latitude: 9.9312, longitude: 76.2673, country_code: 'IN' },
];

// Helper: Convert WMO weather code to condition and icon code
function parseWmoWeatherCode(code: number): {
  condition: string;
  iconCode: WeatherData['iconCode'];
} {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', iconCode: 'clear' };
    case 1:
    case 2:
      return { condition: 'Partly Cloudy', iconCode: 'partly-cloudy' };
    case 3:
      return { condition: 'Overcast', iconCode: 'clouds' };
    case 45:
    case 48:
      return { condition: 'Mist & Fog', iconCode: 'mist' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Light Drizzle', iconCode: 'drizzle' };
    case 61:
    case 63:
      return { condition: 'Rain Showers', iconCode: 'rain' };
    case 65:
      return { condition: 'Heavy Rain', iconCode: 'rain' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snowfall', iconCode: 'snow' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', iconCode: 'rain' };
    case 95:
    case 96:
    case 99:
      return { condition: 'Thunderstorm', iconCode: 'thunderstorm' };
    default:
      return { condition: 'Clear Sky', iconCode: 'clear' };
  }
}

// Convert wind degree to cardinal direction
export function getWindDirection(deg: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round((deg % 360) / 45) % 8;
  return directions[index];
}

// Helper: Generate dynamic greetings
export function generateGreeting(
  condition: string,
  temp: number,
  rainChance: number
): { title: string; text: string } {
  const hour = new Date().getHours();
  let timeGreeting = 'Good day';
  if (hour >= 5 && hour < 12) timeGreeting = 'Good morning';
  else if (hour >= 12 && hour < 17) timeGreeting = 'Good afternoon';
  else if (hour >= 17 && hour < 21) timeGreeting = 'Good evening';
  else timeGreeting = 'Good night';

  let desc = '';
  if (condition.toLowerCase().includes('clear') || condition.toLowerCase().includes('sun')) {
    desc = temp > 28
      ? "It's looking bright and warm in your area."
      : "It's looking bright, crisp, and comfortable in your area.";
  } else if (condition.toLowerCase().includes('rain') || rainChance > 50) {
    desc = 'Wet weather conditions observed. Keep your umbrella handy today.';
  } else if (condition.toLowerCase().includes('cloud')) {
    desc = 'Mild overcast skies with calm ambient breezes.';
  } else {
    desc = "It's looking peaceful and balanced in your area.";
  }

  return {
    title: 'WEATHER GREETING',
    text: `${timeGreeting}! ${desc}`,
  };
}

// Helper: Generate dynamic guidance
export function generateDailyGuidance(
  condition: string,
  temp: number,
  rainChance: number,
  uvIndex: number,
  aqi: number
): { title: string; text: string } {
  const parts: string[] = [];

  if (rainChance > 50) {
    parts.push('High rain probability today—carry an umbrella or raincoat.');
  } else if (temp > 32) {
    parts.push('Warm afternoon temperatures expected. Keep well-hydrated during peak hours.');
  } else if (temp < 15) {
    parts.push('Cooler conditions today. A light jacket is recommended for outdoor comfort.');
  } else {
    parts.push('Pleasant, mostly comfortable conditions today. Great time for outdoor activities.');
  }

  if (uvIndex >= 6) {
    parts.push('UV levels are elevated, so consider wearing SPF protection outdoors.');
  }
  if (aqi > 150) {
    parts.push('Air quality is slightly reduced; sensitive individuals should take gentle precautions.');
  }

  return {
    title: 'DAILY GUIDANCE',
    text: parts.join(' '),
  };
}

// Generate smart activity recommendations
export function generateActivityRecommendations(
  temp: number,
  rainChance: number,
  aqi: number,
  uvIndex: number,
  windSpeed: number
): ActivityItem[] {
  // Running
  const runGood = rainChance < 30 && aqi <= 120 && temp >= 12 && temp <= 28 && windSpeed < 25;
  const runMod = rainChance < 50 && aqi <= 170 && temp >= 8 && temp <= 34;

  // Cycling
  const cycleGood = rainChance < 20 && windSpeed < 22 && aqi <= 140;
  const cycleMod = rainChance < 40 && windSpeed < 30 && aqi <= 180;

  // Walking
  const walkGood = rainChance < 40 && aqi <= 160 && temp >= 10 && temp <= 35;
  const walkMod = rainChance < 65 && aqi <= 220;

  // Outdoor Sports
  const sportsGood = rainChance < 20 && temp >= 14 && temp <= 32 && windSpeed < 20;
  const sportsMod = rainChance < 45 && temp >= 10 && temp <= 35;

  // Travel
  const travelGood = rainChance < 60 && windSpeed < 35;
  const travelMod = windSpeed < 45;

  // Photography
  const photoGood = rainChance < 30 && windSpeed < 25;
  const photoMod = rainChance < 60;

  return [
    {
      key: 'running',
      name: 'Running',
      status: runGood ? 'Good' : runMod ? 'Moderate' : 'Poor',
      icon: 'Activity',
      reason: aqi > 150 ? 'Moderate due to higher AQI' : rainChance > 40 ? 'Wet ground risk' : 'Great temperature & breeze',
    },
    {
      key: 'cycling',
      name: 'Cycling',
      status: cycleGood ? 'Good' : cycleMod ? 'Moderate' : 'Poor',
      icon: 'Bike',
      reason: windSpeed > 25 ? 'Moderate wind resistance' : 'Smooth dry roads',
    },
    {
      key: 'walking',
      name: 'Walking',
      status: walkGood ? 'Good' : walkMod ? 'Moderate' : 'Poor',
      icon: 'Footprints',
      reason: temp > 33 ? 'Best in early morning/evening' : 'Pleasant ambient atmosphere',
    },
    {
      key: 'outdoorSports',
      name: 'Outdoor Sports',
      status: sportsGood ? 'Good' : sportsMod ? 'Moderate' : 'Poor',
      icon: 'Trophy',
      reason: rainChance > 30 ? 'Check for wet pitches' : 'Optimal daylight & conditions',
    },
    {
      key: 'travel',
      name: 'Travel',
      status: travelGood ? 'Good' : travelMod ? 'Moderate' : 'Poor',
      icon: 'Compass',
      reason: 'Standard highway visibility and normal transit conditions',
    },
    {
      key: 'photography',
      name: 'Photography',
      status: photoGood ? 'Good' : photoMod ? 'Moderate' : 'Poor',
      icon: 'Camera',
      reason: uvIndex > 5 ? 'Excellent dynamic golden hour lighting' : 'Soft diffused lighting',
    },
  ];
}

// Generate weather alerts
export function generateWeatherAlerts(
  temp: number,
  rainChance: number,
  aqi: number,
  uvIndex: number,
  windSpeed: number
): WeatherAlertItem[] {
  const alerts: WeatherAlertItem[] = [];

  if (uvIndex >= 7) {
    alerts.push({
      id: 'uv-alert',
      title: 'High UV Index Alert',
      severity: 'warning',
      description: 'High UV levels expected this afternoon. Apply broad-spectrum sunscreen and wear UV sunglasses.',
      time: 'Peak 12:00 PM – 4:00 PM',
      icon: 'SunMedium',
    });
  }

  if (aqi > 150) {
    alerts.push({
      id: 'aqi-alert',
      title: 'Air Quality Notice',
      severity: aqi > 200 ? 'alert' : 'warning',
      description: `Air Quality Index is ${aqi} (Poor). Sensitive groups should consider wearing a protective mask or limiting strenuous workouts.`,
      time: 'Current Observation',
      icon: 'Wind',
    });
  }

  if (rainChance >= 60) {
    alerts.push({
      id: 'rain-alert',
      title: 'Precipitation Probability Alert',
      severity: 'warning',
      description: `Elevated rain chance (${rainChance}%) in the area. Expect possible road delays and damp conditions.`,
      time: 'Active Today',
      icon: 'CloudRain',
    });
  }

  if (temp >= 35) {
    alerts.push({
      id: 'heat-alert',
      title: 'High Temperature Advisory',
      severity: 'alert',
      description: 'Ambient temperature is high. Ensure constant hydration and avoid excessive direct heat exposure.',
      time: 'Daytime',
      icon: 'Flame',
    });
  }

  if (windSpeed >= 30) {
    alerts.push({
      id: 'wind-alert',
      title: 'Strong Breeze Advisory',
      severity: 'warning',
      description: `Wind gusts recorded up to ${windSpeed} km/h. Secure loose outdoor objects.`,
      time: 'Ongoing',
      icon: 'Wind',
    });
  }

  return alerts;
}

// Generate comparison between Today and Tomorrow
export function generateComparison(today: WeatherData, tomorrow: ForecastDay): ComparisonData {
  const tempDiffVal = tomorrow.tempMax - today.tempMax;
  const rainDiffVal = tomorrow.rainChance - today.rainChance;
  const windDiffVal = tomorrow.windSpeed - today.windSpeed;
  const aqiDiffVal = tomorrow.aqi - today.aqi;

  return {
    temperatureDiff: {
      diff: Math.abs(tempDiffVal),
      text:
        tempDiffVal > 0
          ? `Tomorrow will be ${Math.abs(tempDiffVal)}°C warmer.`
          : tempDiffVal < 0
          ? `Tomorrow will be ${Math.abs(tempDiffVal)}°C cooler.`
          : 'Temperature will be identical.',
      direction: tempDiffVal > 0 ? 'warmer' : tempDiffVal < 0 ? 'cooler' : 'same',
    },
    rainDiff: {
      diff: Math.abs(rainDiffVal),
      text:
        rainDiffVal > 0
          ? `Rain probability will increase by ${Math.abs(rainDiffVal)}%.`
          : rainDiffVal < 0
          ? `Rain probability will decrease by ${Math.abs(rainDiffVal)}%.`
          : 'Rain chance will remain stable.',
      direction: rainDiffVal > 0 ? 'increase' : rainDiffVal < 0 ? 'decrease' : 'same',
    },
    windDiff: {
      diff: Math.abs(windDiffVal),
      text:
        windDiffVal > 2
          ? 'Wind speed will be slightly stronger tomorrow.'
          : windDiffVal < -2
          ? 'Wind speed will be gentler tomorrow.'
          : 'Wind speed will be steady.',
      direction: windDiffVal > 2 ? 'stronger' : windDiffVal < -2 ? 'gentler' : 'same',
    },
    aqiDiff: {
      diff: Math.abs(aqiDiffVal),
      text:
        aqiDiffVal < -10
          ? 'Air quality is expected to improve.'
          : aqiDiffVal > 10
          ? 'Air quality may deteriorate slightly.'
          : 'Air quality index will remain comparable.',
      direction: aqiDiffVal < -10 ? 'better' : aqiDiffVal > 10 ? 'worse' : 'same',
    },
  };
}

// Generate realistic 24-hour mock hourly forecast starting from current hour
export function generateMockHourlyForecast(
  baseTemp: number = 30,
  baseCondition: string = 'Clear Sky',
  baseIcon: WeatherData['iconCode'] = 'clear',
  baseAqi: number = 120
): HourlyForecastItem[] {
  const items: HourlyForecastItem[] = [];
  const now = new Date();

  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getTime() + i * 3600000);
    const hour = d.getHours();
    const isNow = i === 0;

    // Diurnal temperature variation: peak at 14:00 (2 PM), low at 05:00 (5 AM)
    const angle = ((hour - 5) / 24) * 2 * Math.PI;
    const tempVariation = Math.round(Math.sin(angle) * 5);
    const temperature = Math.round(baseTemp + tempVariation);
    const feelsLike = temperature + (temperature > 28 ? 2 : -1);

    // Diurnal humidity: inverse of temperature
    const humidity = Math.max(30, Math.min(95, Math.round(65 - tempVariation * 4)));

    // UV Index: peaks around 12:00-14:00
    const isDay = hour >= 6 && hour < 19;
    let uvIndex = 0;
    if (isDay) {
      const uvDistFromNoon = Math.abs(hour - 13);
      uvIndex = Math.max(0, Math.round(8 - uvDistFromNoon * 1.4));
    }

    // Rain chance: slightly higher in afternoon or based on condition
    let rainChance = baseCondition.toLowerCase().includes('rain') ? 65 : 12;
    if (i >= 6 && i <= 10) rainChance = Math.min(100, rainChance + 15);
    const precipitation = rainChance > 50 ? 1.4 : 0;

    // Wind speed
    const windSpeed = Math.max(5, Math.round(12 + Math.sin(i * 0.5) * 6));
    const windDegree = (hour * 15) % 360;
    const windDirection = getWindDirection(windDegree);

    // AQI variation: slightly worse at night/early morning
    const aqiOffset = hour >= 22 || hour <= 8 ? 25 : -15;
    const aqi = Math.max(25, Math.round(baseAqi + aqiOffset + (i % 3) * 4));
    const aqiCategory = aqi <= 50 ? 'Good' : aqi <= 100 ? 'Moderate' : aqi <= 200 ? 'Poor' : 'Severe';

    const timeDisplay = isNow ? 'Now' : d.toLocaleTimeString([], { hour: 'numeric', hour12: true });
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const fullTime = `${dateStr}, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`;

    let iconCode = baseIcon;
    let condition = baseCondition;
    if (!isDay && (iconCode === 'clear' || iconCode === 'partly-cloudy')) {
      condition = iconCode === 'clear' ? 'Clear Sky' : 'Partly Cloudy';
    }

    items.push({
      id: `mock-hour-${i}-${d.getTime()}`,
      time: timeDisplay,
      hour,
      fullTime,
      date: dateStr,
      isDay,
      temperature,
      feelsLike,
      condition,
      iconCode,
      humidity,
      uvIndex,
      rainChance,
      precipitation,
      windSpeed,
      windDirection,
      windDegree,
      visibility: 9.5,
      pressure: 1012,
      aqi,
      aqiCategory,
      aqiStatus: aqiCategory,
    });
  }

  return items;
}

// Fallback Default Data (e.g. Delhi, India)
export function getMockDelhiWeather(): {
  weather: WeatherData;
  forecast: ForecastDay[];
  hourly: HourlyForecastItem[];
} {
  const weather: WeatherData = {
    city: 'Delhi',
    country: 'India',
    state: 'Delhi',
    location: 'Delhi, India',
    lat: 28.6139,
    lon: 77.209,
    temperature: 31,
    feelsLike: 34,
    tempMin: 24,
    tempMax: 34,
    condition: 'Clear Sky',
    iconCode: 'clear',
    humidity: 62,
    humidityStatus: 'Normal',
    windSpeed: 14,
    windDirection: 'N',
    windDegree: 10,
    windStatus: 'Gentle',
    pressure: 1012,
    pressureStatus: 'Stable',
    uvIndex: 7,
    uvStatus: 'High',
    visibility: 8.5,
    visibilityStatus: 'Good',
    rainChance: 15,
    rainStatus: 'Low',
    sunCycle: '12h 46m',
    sunrise: '6:02 AM',
    sunset: '6:48 PM',
    aqi: 156,
    aqiStatus: 'Poor',
    lastUpdated: 'Updated just now',
    greeting: {
      title: 'WEATHER GREETING',
      text: "Good afternoon! It's looking bright and comfortable in your area.",
    },
    guidance: {
      title: 'DAILY GUIDANCE',
      text: 'Pleasant, mostly sunny conditions today. Great time for outdoor activities, but keep some water with you for the afternoon warmth.',
    },
  };

  const forecast: ForecastDay[] = [
    {
      id: 'day-0',
      day: 'Today',
      date: '08-24',
      fullDate: 'Monday, August 24',
      condition: 'Clear Sky',
      iconCode: 'clear',
      rainChance: 15,
      tempMin: 24,
      tempMax: 34,
      windSpeed: 14,
      feelsLike: 35,
      humidity: 62,
      uvIndex: 7,
      uvStatus: 'High',
      aqi: 156,
      sunset: '6:48 PM',
    },
    {
      id: 'day-1',
      day: 'Tomorrow',
      date: '08-25',
      fullDate: 'Tuesday, August 25',
      condition: 'Partly Cloudy',
      iconCode: 'partly-cloudy',
      rainChance: 25,
      tempMin: 25,
      tempMax: 35,
      windSpeed: 16,
      feelsLike: 36,
      humidity: 65,
      uvIndex: 8,
      uvStatus: 'Very High',
      aqi: 148,
      sunset: '6:47 PM',
    },
    {
      id: 'day-2',
      day: 'Wed',
      date: '08-26',
      fullDate: 'Wednesday, August 26',
      condition: 'Rain',
      iconCode: 'rain',
      rainChance: 80,
      tempMin: 23,
      tempMax: 31,
      windSpeed: 20,
      feelsLike: 32,
      humidity: 82,
      uvIndex: 4,
      uvStatus: 'Moderate',
      aqi: 85,
      sunset: '6:46 PM',
    },
    {
      id: 'day-3',
      day: 'Thu',
      date: '08-27',
      fullDate: 'Thursday, August 27',
      condition: 'Light Drizzle',
      iconCode: 'drizzle',
      rainChance: 60,
      tempMin: 22,
      tempMax: 29,
      windSpeed: 18,
      feelsLike: 30,
      humidity: 78,
      uvIndex: 5,
      uvStatus: 'Moderate',
      aqi: 92,
      sunset: '6:45 PM',
    },
    {
      id: 'day-4',
      day: 'Fri',
      date: '08-28',
      fullDate: 'Friday, August 28',
      condition: 'Partly Cloudy',
      iconCode: 'partly-cloudy',
      rainChance: 30,
      tempMin: 24,
      tempMax: 32,
      windSpeed: 15,
      feelsLike: 33,
      humidity: 68,
      uvIndex: 6,
      uvStatus: 'High',
      aqi: 118,
      sunset: '6:44 PM',
    },
    {
      id: 'day-5',
      day: 'Sat',
      date: '08-29',
      fullDate: 'Saturday, August 29',
      condition: 'Clear Sky',
      iconCode: 'clear',
      rainChance: 10,
      tempMin: 24,
      tempMax: 33,
      windSpeed: 13,
      feelsLike: 34,
      humidity: 58,
      uvIndex: 7,
      uvStatus: 'High',
      aqi: 135,
      sunset: '6:43 PM',
    },
    {
      id: 'day-6',
      day: 'Sun',
      date: '08-30',
      fullDate: 'Sunday, August 30',
      condition: 'Thunderstorm',
      iconCode: 'thunderstorm',
      rainChance: 75,
      tempMin: 23,
      tempMax: 30,
      windSpeed: 24,
      feelsLike: 31,
      humidity: 85,
      uvIndex: 3,
      uvStatus: 'Moderate',
      aqi: 72,
      sunset: '6:42 PM',
    },
  ];

  const hourly = generateMockHourlyForecast(31, 'Clear Sky', 'clear', 156);

  return { weather, forecast, hourly };
}

// Search location using Open-Meteo Geocoding
export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      query.trim()
    )}&count=6&language=en&format=json`;

    const res = await fetch(url);
    if (!res.ok) throw new Error('Geocoding fetch failed');
    const data = await res.json();

    if (data && data.results && Array.isArray(data.results)) {
      return data.results.map((r: any) => ({
        name: r.name,
        country: r.country || '',
        admin1: r.admin1 || '',
        latitude: r.latitude,
        longitude: r.longitude,
        country_code: r.country_code,
      }));
    }
  } catch (error) {
    console.warn('Geocoding network error, falling back to pre-seeded search:', error);
  }

  // Fallback search in pre-seeded popular locations
  const q = query.toLowerCase().trim();
  return POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.country.toLowerCase().includes(q) ||
      (loc.admin1 && loc.admin1.toLowerCase().includes(q))
  );
}

// Fetch live weather data for coordinates
export async function fetchWeatherData(
  lat: number,
  lon: number,
  cityName: string,
  countryName: string,
  stateName?: string
): Promise<{ weather: WeatherData; forecast: ForecastDay[]; hourly: HourlyForecastItem[] }> {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,uv_index,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset&timezone=auto`;
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm2_5,pm10&hourly=us_aqi,pm2_5,pm10&timezone=auto`;

    const [weatherRes, aqiRes] = await Promise.allSettled([
      fetch(weatherUrl),
      fetch(aqiUrl),
    ]);

    let weatherJson: any = null;
    let aqiJson: any = null;

    if (weatherRes.status === 'fulfilled' && weatherRes.value.ok) {
      weatherJson = await weatherRes.value.json();
    }
    if (aqiRes.status === 'fulfilled' && aqiRes.value.ok) {
      aqiJson = await aqiRes.value.json();
    }

    if (!weatherJson || !weatherJson.current) {
      throw new Error('No weather payload received');
    }

    const current = weatherJson.current;
    const daily = weatherJson.daily || {};
    const aqiVal = aqiJson?.current?.us_aqi ? Math.round(aqiJson.current.us_aqi) : 110;

    const { condition, iconCode } = parseWmoWeatherCode(current.weather_code ?? 0);
    const temp = Math.round(current.temperature_2m ?? 28);
    const feelsLike = Math.round(current.apparent_temperature ?? temp + 2);
    const tempMax = Math.round(daily.temperature_2m_max?.[0] ?? temp + 3);
    const tempMin = Math.round(daily.temperature_2m_min?.[0] ?? temp - 6);
    const rainChance = Math.round(
      current.precipitation_probability ?? daily.precipitation_probability_max?.[0] ?? 10
    );
    const windSpeed = Math.round(current.wind_speed_10m ?? 12);
    const windDeg = current.wind_direction_10m ?? 0;
    const windDirection = getWindDirection(windDeg);
    const humidity = Math.round(current.relative_humidity_2m ?? 60);
    const pressure = Math.round(current.surface_pressure ?? 1013);
    const uvIndex = Math.round(daily.uv_index_max?.[0] ?? 6);

    const sunriseIso = daily.sunrise?.[0];
    const sunsetIso = daily.sunset?.[0];
    const sunriseStr = sunriseIso
      ? new Date(sunriseIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '6:00 AM';
    const sunsetStr = sunsetIso
      ? new Date(sunsetIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '6:45 PM';

    // Calculate daylight duration
    let sunCycleStr = '12h 30m';
    if (sunriseIso && sunsetIso) {
      const diffMs = new Date(sunsetIso).getTime() - new Date(sunriseIso).getTime();
      const hrs = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      sunCycleStr = `${hrs}h ${mins}m`;
    }

    const aqiStatus: WeatherData['aqiStatus'] =
      aqiVal <= 50 ? 'Good' : aqiVal <= 100 ? 'Moderate' : aqiVal <= 200 ? 'Poor' : 'Severe';

    const cleanCity = (cityName || '').trim();
    const cleanCountry = (countryName || '').trim();
    const locationName = cleanCountry
      ? (cleanCity.toLowerCase().includes(cleanCountry.toLowerCase()) ? cleanCity : `${cleanCity}, ${cleanCountry}`)
      : cleanCity || 'Delhi, India';

    const weather: WeatherData = {
      city: cityName,
      country: countryName,
      state: stateName,
      location: locationName,
      lat,
      lon,
      temperature: temp,
      feelsLike,
      tempMin,
      tempMax,
      condition,
      iconCode,
      humidity,
      humidityStatus: humidity < 40 ? 'Dry' : humidity > 75 ? 'Humid' : 'Normal',
      windSpeed,
      windDirection,
      windDegree: windDeg,
      windStatus: windSpeed < 10 ? 'Calm' : windSpeed < 20 ? 'Gentle' : windSpeed < 35 ? 'Breezy' : 'Strong',
      pressure,
      pressureStatus: pressure > 1015 ? 'High' : pressure < 1005 ? 'Low' : 'Stable',
      uvIndex,
      uvStatus: uvIndex <= 2 ? 'Low' : uvIndex <= 5 ? 'Moderate' : uvIndex <= 7 ? 'High' : 'Very High',
      visibility: 9.2,
      visibilityStatus: 'Good',
      rainChance,
      rainStatus: rainChance < 20 ? 'Low' : rainChance < 55 ? 'Moderate' : 'High',
      sunCycle: sunCycleStr,
      sunrise: sunriseStr,
      sunset: sunsetStr,
      aqi: aqiVal,
      aqiStatus,
      lastUpdated: 'Updated just now',
      greeting: generateGreeting(condition, temp, rainChance),
      guidance: generateDailyGuidance(condition, temp, rainChance, uvIndex, aqiVal),
    };

    // Construct 7-day forecast
    const forecast: ForecastDay[] = [];
    const daysCount = Math.min(7, daily.time?.length || 7);

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < daysCount; i++) {
      const dateStr = daily.time?.[i];
      const dateObj = dateStr ? new Date(dateStr) : new Date(Date.now() + i * 86400000);
      const isToday = i === 0;
      const isTomorrow = i === 1;
      const dayLabel = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : dayLabels[dateObj.getDay()];

      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const dayNum = String(dateObj.getDate()).padStart(2, '0');
      const shortDate = `${month}-${dayNum}`;

      const fCode = daily.weather_code?.[i] ?? current.weather_code ?? 0;
      const parsed = parseWmoWeatherCode(fCode);
      const fTempMax = Math.round(daily.temperature_2m_max?.[i] ?? tempMax);
      const fTempMin = Math.round(daily.temperature_2m_min?.[i] ?? tempMin);
      const fRain = Math.round(daily.precipitation_probability_max?.[i] ?? (i === 0 ? rainChance : 20));
      const fWind = Math.round(daily.wind_speed_10m_max?.[i] ?? windSpeed);
      const fUv = Math.round(daily.uv_index_max?.[i] ?? uvIndex);
      const fSunsetIso = daily.sunset?.[i];
      const fSunset = fSunsetIso
        ? new Date(fSunsetIso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : sunsetStr;

      forecast.push({
        id: `forecast-${i}`,
        day: dayLabel,
        date: shortDate,
        fullDate: dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        condition: parsed.condition,
        iconCode: parsed.iconCode,
        rainChance: fRain,
        tempMin: fTempMin,
        tempMax: fTempMax,
        windSpeed: fWind,
        feelsLike: fTempMax + 1,
        humidity: Math.max(40, Math.min(95, humidity + (i % 2 === 0 ? 5 : -5))),
        uvIndex: fUv,
        uvStatus: fUv <= 2 ? 'Low' : fUv <= 5 ? 'Moderate' : fUv <= 7 ? 'High' : 'Very High',
        aqi: Math.max(30, aqiVal + (i * 4 - 8)),
        sunset: fSunset,
      });
    }

    // Construct Hourly Forecast (Next 24 Hours)
    const hourly: HourlyForecastItem[] = [];
    if (weatherJson.hourly && Array.isArray(weatherJson.hourly.time)) {
      const nowMs = Date.now();
      let startIndex = weatherJson.hourly.time.findIndex(
        (tStr: string) => new Date(tStr).getTime() >= nowMs - 1800000
      );
      if (startIndex === -1) startIndex = 0;

      const totalHours = Math.min(24, weatherJson.hourly.time.length - startIndex);

      for (let i = 0; i < totalHours; i++) {
        const idx = startIndex + i;
        const timeIso = weatherJson.hourly.time[idx];
        const dateObj = new Date(timeIso);
        const hourNum = dateObj.getHours();

        const isNow = i === 0;
        const timeDisplay = isNow
          ? 'Now'
          : dateObj.toLocaleTimeString([], { hour: 'numeric', hour12: true });

        const dateStr = dateObj.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        const fullTime = `${dateStr}, ${dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}`;

        const hCode = weatherJson.hourly.weather_code?.[idx] ?? 0;
        const parsedH = parseWmoWeatherCode(hCode);
        const hTemp = Math.round(weatherJson.hourly.temperature_2m?.[idx] ?? temp);
        const hFeelsLike = Math.round(weatherJson.hourly.apparent_temperature?.[idx] ?? hTemp);
        const hHumidity = Math.round(weatherJson.hourly.relative_humidity_2m?.[idx] ?? humidity);
        const hRainChance = Math.round(weatherJson.hourly.precipitation_probability?.[idx] ?? 0);
        const hPrecip = Number((weatherJson.hourly.precipitation?.[idx] ?? 0).toFixed(1));
        const hWindSpeed = Math.round(weatherJson.hourly.wind_speed_10m?.[idx] ?? windSpeed);
        const hWindDeg = weatherJson.hourly.wind_direction_10m?.[idx] ?? 0;
        const hWindDir = getWindDirection(hWindDeg);
        const hPressure = Math.round(weatherJson.hourly.surface_pressure?.[idx] ?? pressure);
        const hUv = Math.max(0, Math.round(weatherJson.hourly.uv_index?.[idx] ?? 0));
        const hVisibilityM = weatherJson.hourly.visibility?.[idx];
        const hVisibility = hVisibilityM != null ? Number((hVisibilityM / 1000).toFixed(1)) : 9.5;
        const isDay = weatherJson.hourly.is_day?.[idx] === 1;

        let hAqi = aqiVal;
        if (aqiJson?.hourly?.us_aqi && aqiJson.hourly.us_aqi[idx] != null) {
          hAqi = Math.round(aqiJson.hourly.us_aqi[idx]);
        }
        const hAqiCategory =
          hAqi <= 50 ? 'Good' : hAqi <= 100 ? 'Moderate' : hAqi <= 200 ? 'Poor' : 'Severe';

        let condName = parsedH.condition;
        let icCode = parsedH.iconCode;
        if (!isDay && (icCode === 'clear' || icCode === 'partly-cloudy')) {
          condName = icCode === 'clear' ? 'Clear Sky' : 'Partly Cloudy';
        }

        hourly.push({
          id: `hour-${idx}-${timeIso}`,
          time: timeDisplay,
          hour: hourNum,
          fullTime,
          date: dateStr,
          isDay,
          temperature: hTemp,
          feelsLike: hFeelsLike,
          condition: condName,
          iconCode: icCode,
          humidity: hHumidity,
          uvIndex: hUv,
          rainChance: hRainChance,
          precipitation: hPrecip,
          windSpeed: hWindSpeed,
          windDirection: hWindDir,
          windDegree: hWindDeg,
          visibility: hVisibility,
          pressure: hPressure,
          aqi: hAqi,
          aqiCategory: hAqiCategory,
          aqiStatus: hAqiCategory,
        });
      }
    }

    if (hourly.length === 0) {
      hourly.push(...generateMockHourlyForecast(temp, condition, iconCode, aqiVal));
    }

    return { weather, forecast, hourly };
  } catch (err) {
    console.warn('Falling back to local simulation data for location:', cityName, err);
    const fallback = getMockDelhiWeather();
    fallback.weather.city = cityName;
    fallback.weather.country = countryName;
    fallback.weather.state = stateName;
    const cleanCity = (cityName || '').trim();
    const cleanCountry = (countryName || '').trim();
    fallback.weather.location = cleanCountry
      ? (cleanCity.toLowerCase().includes(cleanCountry.toLowerCase()) ? cleanCity : `${cleanCity}, ${cleanCountry}`)
      : cleanCity || 'Delhi, India';
    fallback.weather.lat = lat;
    fallback.weather.lon = lon;
    return fallback;
  }
}
