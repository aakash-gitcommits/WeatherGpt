import { WeatherData } from './weather';

export interface AutopilotRoutine {
  id: string;
  name: string;
  activityType: 'commute' | 'exercise' | 'college' | 'work' | 'travel' | 'outdoor' | 'custom';
  location: string;
  lat: number;
  lon: number;
  daysOfWeek: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  startTime: string; // "09:00" in 24h
  endTime?: string; // "17:00" in 24h
  travelInfo?: string;
  enabled: boolean;
  earlyAlertsEnabled: boolean;
  lastChecked?: string;
  lastAdvice?: {
    text: string;
    time: string;
    temperature: number;
    condition: string;
    rainChance: number;
    aqi: number;
    windSpeed: number;
    suitability: 'optimal' | 'moderate' | 'caution' | 'hazardous';
  };
}

export type TransportMode = 'car' | 'train' | 'bus' | 'cab' | 'flight' | 'bike' | 'other';

export interface RouteWaypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceFromStartKm?: number;
  etaHours?: number;
  weather?: {
    temperature: number;
    feelsLike: number;
    condition: string;
    iconCode: WeatherData['iconCode'];
    rainChance: number;
    windSpeed: number;
    windDirection: string;
    aqi: number;
    aqiStatus: string;
    visibility: number;
  };
  isLoading?: boolean;
}

export interface RouteIntelligenceResult {
  startLocation: string;
  destination: string;
  transportMode: TransportMode;
  waypoints: RouteWaypoint[];
  totalDistanceKm: number;
  estimatedDurationHours: number;
  overallSafety: 'safe' | 'caution' | 'hazardous';
  aiSummary: string;
  rainSegments: string[];
  aqiWarnings: string[];
  travelTips: string[];
  bestDepartureWindow?: string;
  timestamp: string;
}

export interface WhatChangedMetric {
  id: string;
  key: 'temperature' | 'rainChance' | 'windSpeed' | 'aqi' | 'uvIndex' | 'condition' | 'pressure' | 'humidity';
  name: string;
  previousValue: string | number;
  currentValue: string | number;
  unit: string;
  deltaText: string;
  deltaValue: number;
  timeOfChange: string;
  status: 'improved' | 'worsened' | 'stable' | 'changed';
  explanation: string;
  iconName: string;
}

export type HistoryMetricType = 'temperature' | 'precipitation' | 'wind' | 'aqi' | 'uv' | 'humidity';

export interface HistoryDataPoint {
  date: string;
  displayDate: string;
  tempMax?: number;
  tempMin?: number;
  tempMean?: number;
  precipitation?: number;
  windMax?: number;
  aqi?: number;
  uvMax?: number;
  humidity?: number;
}

export interface DisasterAlertEvent {
  id: string;
  name: string;
  location: string;
  region: string;
  date: string;
  type: 'cyclone' | 'flood' | 'heatwave' | 'cloudburst' | 'severe_storm' | 'cold_wave' | 'smog';
  severity: 'critical' | 'severe' | 'warning' | 'advisory';
  details: string;
  safetyGuidance: string[];
  windSpeedKmH?: number;
  rainfallMm?: number;
  maxTempC?: number;
  minTempC?: number;
  aqiValue?: number;
  isHistorical?: boolean;
  helplines?: string[];
  impactSummary?: string;
}

export type AdvisoryProfileId =
  | 'traveler'
  | 'fisherman'
  | 'farmer'
  | 'commuter'
  | 'outdoor_worker'
  | 'student'
  | 'runner'
  | 'senior';

export interface UserAdvisoryData {
  profileId: AdvisoryProfileId;
  goodNews: string[];
  badNews: string[];
  warnings: string[];
  recommendations: string[];
  fullSummary: string;
  lastUpdated: string;
  suitabilityScore: number; // 0-100
}

export type UniqueFeatureTab =
  | 'dashboard'
  | 'autopilot'
  | 'route'
  | 'what_changed'
  | 'history'
  | 'disasters'
  | 'advisory';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'autopilot' | 'early_alert' | 'what_changed' | 'disaster' | 'advisory' | 'system';
  severity: 'critical' | 'warning' | 'info' | 'success';
  timestamp: string;
  read: boolean;
  actionFeature?: UniqueFeatureTab;
  metadata?: any;
}
