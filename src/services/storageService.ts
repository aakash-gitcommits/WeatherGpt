import { AutopilotRoutine, AppNotification, AdvisoryProfileId } from '../types/uniqueFeatures';

const ROUTINES_STORAGE_KEY = 'weathergpt_routines_v2';
const NOTIFICATIONS_STORAGE_KEY = 'weathergpt_notifications_v2';
const SELECTED_PROFILE_KEY = 'weathergpt_selected_profile_v2';

// Default initial routine so the user immediately has an intuitive sample to interact with
export const DEFAULT_INITIAL_ROUTINES: AutopilotRoutine[] = [
  {
    id: 'routine-college-delhi',
    name: 'Going to College / Office',
    activityType: 'college',
    location: 'Delhi, India',
    lat: 28.6139,
    lon: 77.209,
    daysOfWeek: [1, 2, 3, 4, 5], // Monday to Friday
    startTime: '09:00',
    endTime: '17:00',
    travelInfo: 'Metro transit & 10 min walking',
    enabled: true,
    earlyAlertsEnabled: true,
    lastChecked: new Date().toISOString(),
    lastAdvice: {
      text: 'Conditions are favorable for morning travel. Ambient temperature is around 28°C with low rain probability (15%). Moderate UV expected later in the afternoon, carry hydration.',
      time: '08:00 AM',
      temperature: 28,
      condition: 'Clear Sky',
      rainChance: 15,
      aqi: 145,
      windSpeed: 12,
      suitability: 'optimal',
    },
  },
  {
    id: 'routine-morning-run',
    name: 'Morning Fitness Jog',
    activityType: 'exercise',
    location: 'Lodhi Garden, Delhi',
    lat: 28.5933,
    lon: 77.2197,
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // Daily
    startTime: '06:30',
    endTime: '07:30',
    travelInfo: 'Outdoor jogging in park',
    enabled: true,
    earlyAlertsEnabled: true,
    lastChecked: new Date().toISOString(),
  },
];

export const DEFAULT_INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-welcome',
    title: 'Weather Autopilot Active',
    message: 'Your scheduled routines are being monitored. WeatherGPT will notify you prior to routine departures.',
    type: 'autopilot',
    severity: 'info',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    actionFeature: 'autopilot',
  },
  {
    id: 'notif-early-alert-sample',
    title: 'Early Weather Alert (Delhi)',
    message: 'Early Alert: Rain probability increased to 60% for your 9:00 AM routine. Carry an umbrella!',
    type: 'early_alert',
    severity: 'warning',
    timestamp: new Date(Date.now() - 1000 * 60 * 10).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    read: false,
    actionFeature: 'autopilot',
  },
];

// Routines Storage
export function loadSavedRoutines(): AutopilotRoutine[] {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_ROUTINES;
  try {
    const raw = localStorage.getItem(ROUTINES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_ROUTINES));
      return DEFAULT_INITIAL_ROUTINES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_INITIAL_ROUTINES;
  } catch (e) {
    console.warn('Failed to load routines from storage, using defaults:', e);
    return DEFAULT_INITIAL_ROUTINES;
  }
}

export function saveRoutines(routines: AutopilotRoutine[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(routines));
  } catch (e) {
    console.error('Failed to save routines to storage:', e);
  }
}

// Notifications Storage
export function loadSavedNotifications(): AppNotification[] {
  if (typeof window === 'undefined') return DEFAULT_INITIAL_NOTIFICATIONS;
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_NOTIFICATIONS));
      return DEFAULT_INITIAL_NOTIFICATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_INITIAL_NOTIFICATIONS;
  } catch (e) {
    console.warn('Failed to load notifications from storage, using defaults:', e);
    return DEFAULT_INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: AppNotification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications.slice(0, 50))); // Keep last 50
  } catch (e) {
    console.error('Failed to save notifications to storage:', e);
  }
}

// User Selected Advisory Profile
export function loadSavedProfile(): AdvisoryProfileId {
  if (typeof window === 'undefined') return 'traveler';
  try {
    const raw = localStorage.getItem(SELECTED_PROFILE_KEY);
    return (raw as AdvisoryProfileId) || 'traveler';
  } catch (e) {
    return 'traveler';
  }
}

export function saveSelectedProfile(profileId: AdvisoryProfileId): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SELECTED_PROFILE_KEY, profileId);
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

// Chat Messages Persistence
const CHAT_MESSAGES_STORAGE_KEY = 'weathergpt_chat_messages_v2';

export function loadSavedChatMessages(): any[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CHAT_MESSAGES_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
  } catch (e) {
    console.warn('Failed to load chat messages from storage:', e);
    return null;
  }
}

export function saveChatMessages(messages: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    // Persist up to last 40 conversation messages
    localStorage.setItem(CHAT_MESSAGES_STORAGE_KEY, JSON.stringify(messages.slice(-40)));
  } catch (e) {
    console.error('Failed to save chat messages:', e);
  }
}

export function clearSavedChatMessages(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CHAT_MESSAGES_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear chat messages:', e);
  }
}
