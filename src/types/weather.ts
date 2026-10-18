export interface WeatherData {
  city: string;
  country: string;
  state?: string;
  location: string;
  lat: number;
  lon: number;
  temperature: number; // in Celsius
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  condition: string;
  iconCode: 'clear' | 'clouds' | 'partly-cloudy' | 'rain' | 'thunderstorm' | 'drizzle' | 'snow' | 'mist' | 'wind';
  humidity: number;
  humidityStatus: string;
  windSpeed: number; // in km/h
  windDirection: string;
  windDegree: number;
  windStatus: string;
  pressure: number; // in hPa
  pressureStatus: string;
  uvIndex: number;
  uvStatus: string;
  visibility: number; // in km
  visibilityStatus: string;
  rainChance: number; // 0 - 100%
  rainStatus: string;
  sunrise: string;
  sunset: string;
  dayLength?: string;
  sunCycle?: string;
  lastUpdated?: string;
  aqi: number;
  aqiStatus: string;
  aqiCategory?: 'Good' | 'Moderate' | 'Poor' | 'Severe' | string;
  greeting?: {
    title: string;
    text: string;
  };
  guidance?: {
    title: string;
    text: string;
  };
  radarPoints?: Array<{
    lat: number;
    lon: number;
    intensity: number; // 0-100%
    type: 'light' | 'moderate' | 'heavy' | 'extreme';
  }>;
  tempPoints?: Array<{
    lat: number;
    lon: number;
    temp: number;
  }>;
  windPoints?: Array<{
    lat: number;
    lon: number;
    speed: number;
    direction: string;
    deg: number;
  }>;
  aqiPoints?: Array<{
    lat: number;
    lon: number;
    aqi: number;
    category: 'Good' | 'Moderate' | 'Poor' | 'Severe' | string;
  }>;
}

export interface ForecastDay {
  id: string;
  day: string;
  date: string;
  fullDate?: string;
  condition: string;
  iconCode: WeatherData['iconCode'];
  rainChance: number;
  tempMin: number;
  tempMax: number;
  windSpeed: number;
  feelsLike: number;
  humidity: number;
  uvIndex: number;
  uvCategory?: string;
  uvStatus?: string;
  aqi: number;
  aqiCategory?: string;
  sunset: string;
}

export interface HourlyForecastItem {
  id: string;
  time: string; // e.g. "12:00 PM" or "12 PM"
  hour: number; // 0-23
  fullTime: string; // e.g. "Today, 12:00 PM"
  date: string; // "YYYY-MM-DD" or short date
  isDay: boolean;
  temperature: number; // Celsius
  feelsLike: number; // Celsius
  condition: string;
  iconCode: WeatherData['iconCode'];
  humidity: number; // %
  uvIndex: number;
  rainChance: number; // %
  precipitation: number; // mm
  windSpeed: number; // km/h
  windDirection: string; // 'N', 'NW', etc.
  windDegree: number;
  visibility: number; // km
  pressure: number; // hPa
  aqi?: number;
  aqiCategory?: string;
  aqiStatus?: string;
}

export interface ActivityItem {
  key: string;
  name: string;
  status: 'Good' | 'Moderate' | 'Poor';
  icon: string;
  reason: string;
}

export interface WeatherAlertItem {
  id: string;
  title: string;
  severity: 'warning' | 'alert' | 'info';
  description: string;
  time: string;
  icon: string;
}

export interface ComparisonData {
  temperatureDiff: {
    diff: number;
    text: string;
    direction: 'warmer' | 'cooler' | 'same';
  };
  rainDiff: {
    diff: number;
    text: string;
    direction: 'increase' | 'decrease' | 'same';
  };
  windDiff: {
    diff: number;
    text: string;
    direction: 'stronger' | 'gentler' | 'same';
  };
  aqiDiff: {
    diff: number;
    text: string;
    direction: 'better' | 'worse' | 'same';
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  sources?: Array<{
  title: string;
  url: string;
  snippet?: string;
  fetched?: boolean;
}>;

researchUsed?: boolean;
}

export type MapLayerType = 'radar' | 'temperature' | 'wind' | 'aqi';

export type LanguageCode =
  | 'en'
  | 'hi'
  | 'hinglish'
  | 'bn'
  | 'te'
  | 'mr'
  | 'ta'
  | 'gu'
  | 'ur'
  | 'kn'
  | 'or'
  | 'ml'
  | 'pa'
  | 'as'
  | 'sa'
  | 'kok'
  | 'sd'
  | 'ne'
  | 'doi'
  | 'ks'
  | 'sat'
  | 'mni'
  | 'brx'
  | 'bho'
  | 'mai'
  | 'har'
  | 'raj'
  | 'awa'
  | 'hne'
  | 'mag'
  | 'bra'
  | 'bns'
  | 'gbm';

export type TemperatureUnit = 'C' | 'F';

export type ThemeMode = 'dark' | 'light';
