import { LanguageCode, WeatherData, ForecastDay } from '../types/weather';

export function translateCondition(
  condition: string | undefined,
  t: (key: string, fallback?: string) => string
): string {
  if (!condition) return '';
  const c = condition.trim().toLowerCase();

  if (c.includes('clear') || c.includes('sunny')) return t('clearSky', 'Clear Sky');
  if (c.includes('partly')) return t('partlyCloudy', 'Partly Cloudy');
  if (c.includes('overcast') || c.includes('cloud')) return t('overcast', 'Overcast');
  if (c.includes('mist') || c.includes('fog') || c.includes('haze')) return t('mistAndFog', 'Mist & Fog');
  if (c.includes('drizzle')) return t('lightDrizzle', 'Light Drizzle');
  if (c.includes('heavy rain')) return t('heavyRain', 'Heavy Rain');
  if (c.includes('shower') || c.includes('rain')) return t('rainShowers', 'Rain Showers');
  if (c.includes('snow') || c.includes('sleet') || c.includes('ice')) return t('snowfall', 'Snowfall');
  if (c.includes('thunder') || c.includes('storm')) return t('thunderstorm', 'Thunderstorm');

  return condition;
}

export const getLocalizedCondition = translateCondition;

export function translateDayName(
  day: string | undefined,
  t: (key: string, fallback?: string) => string
): string {
  if (!day) return '';
  const d = day.trim().toLowerCase();

  if (d === 'today' || d === 'आज') return t('today', 'Today');
  if (d === 'tomorrow' || d === 'कल') return t('tomorrow', 'Tomorrow');
  if (d.startsWith('mon')) return t('mon', 'Mon');
  if (d.startsWith('tue')) return t('tue', 'Tue');
  if (d.startsWith('wed')) return t('wed', 'Wed');
  if (d.startsWith('thu')) return t('thu', 'Thu');
  if (d.startsWith('fri')) return t('fri', 'Fri');
  if (d.startsWith('sat')) return t('sat', 'Sat');
  if (d.startsWith('sun')) return t('sun', 'Sun');

  return day;
}

export const getLocalizedDayName = translateDayName;

export function translateWindDirection(
  dir: string | undefined,
  t: (key: string, fallback?: string) => string
): string {
  if (!dir) return '';
  const d = dir.trim().toUpperCase();
  switch (d) {
    case 'N': return t('dirN', 'N');
    case 'NE': return t('dirNE', 'NE');
    case 'E': return t('dirE', 'E');
    case 'SE': return t('dirSE', 'SE');
    case 'S': return t('dirS', 'S');
    case 'SW': return t('dirSW', 'SW');
    case 'W': return t('dirW', 'W');
    case 'NW': return t('dirNW', 'NW');
    default: return dir;
  }
}

export const getLocalizedWindDirection = translateWindDirection;

export function translateStatus(
  status: string | undefined,
  t: (key: string, fallback?: string) => string
): string {
  if (!status) return '';
  const s = status.trim().toLowerCase();

  switch (s) {
    case 'good': return t('good', 'Good');
    case 'moderate': return t('moderate', 'Moderate');
    case 'poor': return t('poor', 'Poor');
    case 'severe': return t('severe', 'Severe');
    case 'normal': return t('normal', 'Normal');
    case 'calm': return t('calm', 'Calm');
    case 'humid': return t('humid', 'Humid');
    case 'dry': return t('dry', 'Dry');
    case 'stable': return t('stable', 'Stable');
    case 'gentle': return t('gentle', 'Gentle');
    case 'breezy': return t('breezy', 'Breezy');
    case 'strong': return t('strong', 'Strong');
    case 'low': return t('lowStatus', 'Low');
    case 'high': return t('highStatus', 'High');
    case 'very high': return t('veryHighStatus', 'Very High');
    case 'excellent': return t('excellent', 'Excellent');
    default: return t(s, status);
  }
}

export const getLocalizedStatus = translateStatus;

export function getLocalizedAqiStatus(
  aqi: number,
  t: (key: string, fallback?: string) => string
): string {
  if (aqi <= 50) return t('aqiGood', 'Good');
  if (aqi <= 100) return t('aqiModerate', 'Moderate');
  if (aqi <= 150) return t('aqiUnhealthySensitive', 'Unhealthy (Sensitive)');
  if (aqi <= 200) return t('aqiUnhealthy', 'Unhealthy');
  if (aqi <= 300) return t('aqiVeryUnhealthy', 'Very Unhealthy');
  return t('aqiHazardous', 'Hazardous');
}


export function getLocalizedGreeting(
  condition: string,
  temp: number,
  rainChance: number,
  t: (key: string, fallback?: string) => string
): string {
  const hour = new Date().getHours();
  let timeStr = t('goodDay', 'Good day');
  if (hour >= 5 && hour < 12) timeStr = t('goodMorning', 'Good morning');
  else if (hour >= 12 && hour < 17) timeStr = t('goodAfternoon', 'Good afternoon');
  else if (hour >= 17 && hour < 21) timeStr = t('goodEvening', 'Good evening');
  else timeStr = t('goodNight', 'Good night');

  let descStr = '';
  const cond = condition.toLowerCase();
  if (cond.includes('clear') || cond.includes('sun')) {
    descStr = temp > 28
      ? t('greetingBrightWarm', "It's looking bright and warm in your area.")
      : t('greetingBrightComfortable', "It's looking bright, crisp, and comfortable in your area.");
  } else if (cond.includes('rain') || rainChance > 50) {
    descStr = t('greetingRainy', 'Wet weather conditions observed. Keep your umbrella handy today.');
  } else if (cond.includes('cloud') || cond.includes('overcast')) {
    descStr = t('greetingCloudy', 'Mild overcast skies with calm ambient breezes.');
  } else {
    descStr = t('greetingPeaceful', "It's looking peaceful and balanced in your area.");
  }

  return `${timeStr}! ${descStr}`;
}

export function getLocalizedGuidance(
  temp: number,
  rainChance: number,
  uvIndex: number,
  aqi: number,
  t: (key: string, fallback?: string) => string
): string {
  const parts: string[] = [];

  if (rainChance > 50) {
    parts.push(t('guidanceRain', 'High rain probability today—carry an umbrella or raincoat.'));
  } else if (temp > 32) {
    parts.push(t('guidanceHot', 'Warm afternoon temperatures expected. Keep well-hydrated during peak hours.'));
  } else if (temp < 15) {
    parts.push(t('guidanceCold', 'Cooler conditions today. A light jacket is recommended for outdoor comfort.'));
  } else {
    parts.push(t('guidancePleasant', 'Pleasant, mostly comfortable conditions today. Great time for outdoor activities.'));
  }

  if (uvIndex >= 6) {
    parts.push(t('guidanceUV', 'UV levels are elevated, so consider wearing SPF protection outdoors.'));
  }
  if (aqi > 150) {
    parts.push(t('guidanceAQI', 'Air quality is slightly reduced; sensitive individuals should take gentle precautions.'));
  }

  return parts.join(' ');
}

export function getLocalizedWearTitle(
  temp: number,
  rainChance: number,
  t: (key: string, fallback?: string) => string
): string {
  if (rainChance > 50) return t('rainwear', 'Rainwear');
  if (temp > 28) return t('lightSummerWear', 'Light Summer Wear');
  if (temp < 16) return t('warmLayers', 'Warm Layers');
  return t('comfortableLayers', 'Comfortable Layers');
}

export function getLocalizedWearAdvice(
  temp: number,
  rainChance: number,
  t: (key: string, fallback?: string) => string
): string {
  if (rainChance > 50) {
    return t('wearRain', 'Waterproof jacket or compact umbrella recommended. Wear water-resistant shoes.');
  }
  if (temp > 30) {
    return t('wearHot', 'Breathable, lightweight cotton/linen clothing. Sun cap and sunglasses advised.');
  }
  if (temp < 16) {
    return t('wearCold', 'Warm layers, windbreaker or fleece sweater recommended.');
  }
  return t('wearComfortable', 'Comfortable casual attire with light layers for changing afternoon temperatures.');
}

export function getLocalizedHealthAdvice(
  aqi: number,
  uvIndex: number,
  t: (key: string, fallback?: string) => string
): string {
  if (aqi > 150) {
    return t('healthAQI', 'Air quality is elevated. Sensitive groups and children should wear protective N95 masks.');
  }
  if (uvIndex >= 7) {
    return t('healthUV', 'Peak UV hours require broad-spectrum sunscreen (SPF 30+) and UV protection lenses.');
  }
  return t('healthNormal', 'Atmospheric parameters are well-balanced. Safe for outdoor cardio and walks.');
}

export function getLocalizedActivityReason(
  key: string,
  temp: number,
  rainChance: number,
  aqi: number,
  uvIndex: number,
  windSpeed: number,
  t: (key: string, fallback?: string) => string
): string {
  switch (key) {
    case 'running':
      return aqi > 150
        ? t('reasonAQIHigh', 'Moderate due to higher AQI')
        : rainChance > 40
        ? t('reasonRainRisk', 'Wet ground risk')
        : t('reasonGoodWeather', 'Great temperature & breeze');
    case 'cycling':
      return windSpeed > 25
        ? t('reasonWindHigh', 'Moderate wind resistance')
        : t('reasonSmoothRoads', 'Smooth dry roads');
    case 'walking':
      return temp > 33
        ? t('reasonHotWalk', 'Best in early morning/evening')
        : t('reasonPleasantWalk', 'Pleasant ambient atmosphere');
    case 'outdoorSports':
      return rainChance > 30
        ? t('reasonWetPitch', 'Check for wet pitches')
        : t('reasonOptimalSports', 'Optimal daylight & conditions');
    case 'travel':
      return t('reasonStandardTravel', 'Standard highway visibility and normal transit conditions');
    case 'photography':
      return uvIndex > 5
        ? t('reasonGoldenHour', 'Excellent dynamic golden hour lighting')
        : t('reasonSoftLight', 'Soft diffused lighting');
    default:
      return '';
  }
}

export function getLocalizedComparisonText(
  type: 'temp' | 'rain' | 'wind' | 'aqi',
  today: WeatherData,
  tomorrow: ForecastDay,
  t: (key: string, fallback?: string) => string
): string {
  if (type === 'temp') {
    const diff = tomorrow.tempMax - today.tempMax;
    const absDiff = Math.abs(diff);
    if (diff > 0) return `${t('tomorrowWillBe', 'Tomorrow will be')} ${absDiff}°C ${t('warmer', 'warmer')}.`;
    if (diff < 0) return `${t('tomorrowWillBe', 'Tomorrow will be')} ${absDiff}°C ${t('cooler', 'cooler')}.`;
    return t('tempIdentical', 'Temperature will be identical.');
  }

  if (type === 'rain') {
    const diff = tomorrow.rainChance - today.rainChance;
    const absDiff = Math.abs(diff);
    if (diff > 0) return `${t('rainProbabilityIncrease', 'Rain probability will increase by')} ${absDiff}%.`;
    if (diff < 0) return `${t('rainProbabilityDecrease', 'Rain probability will decrease by')} ${absDiff}%.`;
    return t('sameRain', 'Rain chance will remain stable.');
  }

  if (type === 'wind') {
    const diff = tomorrow.windSpeed - today.windSpeed;
    if (diff > 2) return t('windStronger', 'Wind speed will be slightly stronger tomorrow.');
    if (diff < -2) return t('windGentler', 'Wind speed will be gentler tomorrow.');
    return t('windSteady', 'Wind speed will be steady.');
  }

  if (type === 'aqi') {
    const diff = tomorrow.aqi - today.aqi;
    if (diff < -10) return t('betterAQI', 'Air quality is expected to improve.');
    if (diff > 10) return t('worseAQI', 'Air quality may deteriorate slightly.');
    return t('aqiComparable', 'Air quality index will remain comparable.');
  }

  return '';
}

export function getLocalizedAlert(
  alert: { id: string; title: string; description: string; time: string },
  t: (key: string, fallback?: string) => string
): { title: string; description: string; time: string } {
  switch (alert.id) {
    case 'uv-alert':
      return {
        title: t('highUVAlertTitle', alert.title),
        description: t('highUVAlertDesc', alert.description),
        time: t('uvPeakTime', alert.time),
      };
    case 'aqi-alert':
      return {
        title: t('aqiNoticeTitle', alert.title),
        description: t('aqiNoticeDesc', alert.description),
        time: t('currentObservation', alert.time),
      };
    case 'rain-alert':
      return {
        title: t('rainAlertTitle', alert.title),
        description: t('rainAlertDesc', alert.description),
        time: t('activeToday', alert.time),
      };
    case 'heat-alert':
      return {
        title: t('heatAlertTitle', alert.title),
        description: t('heatAlertDesc', alert.description),
        time: t('daytime', alert.time),
      };
    case 'wind-alert':
      return {
        title: t('windAlertTitle', alert.title),
        description: t('windAlertDesc', alert.description),
        time: t('ongoing', alert.time),
      };
    default:
      return {
        title: alert.title,
        description: alert.description,
        time: alert.time,
      };
  }
}

export function getLocalizedFallbackSummary(
  weather: WeatherData,
  t: (key: string, fallback?: string) => string,
  formatTemp: (val: number) => string
): string {
  const cond = translateCondition(weather.condition, t);
  const max = formatTemp(weather.tempMax);
  const min = formatTemp(weather.tempMin);
  return `${t('todayIn', 'Today in')} ${weather.city}, ${weather.country} ${t('summaryOverview', 'will feature')} ${cond}. ${t('highOf', 'High temperature around')} ${max}, ${t('lowOf', 'with an overnight low near')} ${min}. ${weather.rainChance > 30 ? t('guidanceRain', 'Carry an umbrella.') : t('rainUnlikely', 'Rain is unlikely with steady atmospheric pressure.')}`;
}

export function getLocalizedWelcomeMessage(
  weather: WeatherData,
  t: (key: string, fallback?: string) => string
): string {
  const cond = translateCondition(weather.condition, t);
  const greeting = t('aiWelcomeGreeting', t('welcomeAiGreeting', 'Hello! I am **WeatherGPT AI**'));
  const analyzing = t('aiWelcomeAnalyzing', t('welcomeAiRole', 'your intelligent meteorology specialist. I am analyzing live telemetry for'));
  const prompt = t('aiWelcomePrompt', t('welcomeAiPrompt', 'Ask me anything about current conditions, outfit recommendations, rain predictions, or outdoor safety!'));
  return `${greeting} ${analyzing} **${weather.city}** (${weather.temperature}°C, ${cond}, AQI ${weather.aqi}). ${prompt}`;
}


