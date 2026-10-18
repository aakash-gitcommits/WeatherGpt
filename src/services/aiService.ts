import { WeatherData, ChatMessage, LanguageCode } from '../types/weather';


export interface AskAISource {
  title: string;
  url: string;
  snippet?: string;
  fetched?: boolean;
}

export interface AskAIResponse {
  success: boolean;
  answer: string;
  note?: string;
  error?: string;
  sources?: AskAISource[];
  researchUsed?: boolean;
}


export async function askWeatherAI(
  question: string,
  weatherContext: WeatherData | null,
  conversationHistory: ChatMessage[],
  language: LanguageCode
): Promise<string> {
  try {
    const payload: AskAIRequest = {
      question,
      weatherContext: weatherContext
        ? {
            location: weatherContext.location,
            city: weatherContext.city,
            temperature: weatherContext.temperature,
            feelsLike: weatherContext.feelsLike,
            tempMax: weatherContext.tempMax,
            tempMin: weatherContext.tempMin,
            condition: weatherContext.condition,
            rainChance: weatherContext.rainChance,
            humidity: weatherContext.humidity,
            windSpeed: weatherContext.windSpeed,
            windDirection: weatherContext.windDirection,
            pressure: weatherContext.pressure,
            uvIndex: weatherContext.uvIndex,
            visibility: weatherContext.visibility,
            sunset: weatherContext.sunset,
            sunrise: weatherContext.sunrise,
            aqi: weatherContext.aqi,
          }
        : {},
      conversationHistory,
      language,
    };

    const response = await fetch('/api/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data: AskAIResponse = await response.json().catch(() => ({
      success: false,
      answer: '',
      error: `Server returned status ${response.status}`,
    }));

    if (data.success && data.answer) {
        return data;
}

    throw new Error(data.error || `Server returned status ${response.status}`);
  } catch (error: any) {
    console.error('Error contacting WeatherGPT AI backend:', error);
    throw error;
  }
}

export async function fetchDailySummary(
  weatherContext: WeatherData,
  language: LanguageCode
): Promise<string> {
  try {
    const res = await fetch('/api/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weatherContext, language }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.summary) return data.summary;
    }
  } catch (e) {
    console.warn('AI summary fetch failed, using local generation:', e);
  }

  // Local fallback summary by language
  const loc = weatherContext.city;
  const temp = weatherContext.temperature;
  const cond = weatherContext.condition;
  const rain = weatherContext.rainChance;
  const wind = weatherContext.windSpeed;

  switch (language) {
    case 'hi':
      return `आज ${loc} में मौसम मुख्यतः ${cond} रहेगा और तापमान लगभग ${temp}°C रहेगा। बारिश की संभावना ${rain}% है और हवा की गति ${wind} km/h है।`;
    case 'hinglish':
      return `Aaj ${loc} me weather mainly ${cond} rahega with temperature around ${temp}°C. Rain chance ${rain}% aur wind ${wind} km/h hai.`;
    case 'bn':
      return `আজ ${loc}-এ মূলত ${cond} থাকবে এবং তাপমাত্রা প্রায় ${temp}°C হবে। বৃষ্টির সম্ভাবনা ${rain}% এবং বাতাসের গতি ${wind} কিমি/ঘণ্টা।`;
    case 'te':
      return `నేడు ${loc}లో వాతావరణం ప్రధానంగా ${cond}గా ఉండి, ఉష్ణోగ్రత దాదాపు ${temp}°C ఉంటుంది. వర్షం అవకాశం ${rain}% మరియు గాలి వేగం ${wind} km/h.`;
    case 'mr':
      return `आज ${loc} मध्ये हवामान प्रामुख्याने ${cond} राहील आणि तापमान सुमारे ${temp}°C राहील. पावसाची शक्यता ${rain}% आणि वाऱ्याचा वेग ${wind} km/h आहे.`;
    case 'ta':
      return `இன்று ${loc} பகுதியில் வானிலை பெரும்பாலும் ${cond} ஆகவும், வெப்பநிலை சுமார் ${temp}°C ஆகவும் இருக்கும். மழை வாய்ப்பு ${rain}%, காற்றின் வேகம் ${wind} km/h.`;
    case 'gu':
      return `આજે ${loc}માં હવામાન મુખ્યત્વે ${cond} રહેશે અને તાપમાન લગભગ ${temp}°C રહેશે. વરસાદની શક્યતા ${rain}% અને પવનની ગતિ ${wind} km/h છે.`;
    case 'ur':
      return `آج ${loc} میں موسم زیادہ تر ${cond} رہے گا اور درجہ حرارت تقریباً ${temp}°C رہے گا۔ بارش کا امکان ${rain}% اور ہوا کی رفتار ${wind} کلومیٹر فی گھنٹہ ہے۔`;
    case 'kn':
      return `ಇಂದು ${loc}ನಲ್ಲಿ ಹವಾಮಾನವು ಮುಖ್ಯವಾಗಿ ${cond} ಆಗಿರುತ್ತದೆ ಮತ್ತು ತಾಪಮಾನ ಸುಮಾರು ${temp}°C ಇರುತ್ತದೆ. ಮಳೆಯ ಸಾಧ್ಯತೆ ${rain}% ಮತ್ತು ಗಾಳಿಯ ವೇಗ ${wind} km/h.`;
    case 'or':
      return `ଆଜି ${loc}ରେ ପାଣିପାଗ ମୁଖ୍ୟତଃ ${cond} ରହିବ ଏବଂ ତାପମାତ୍ରା ପ୍ରାୟ ${temp}°C ରହିବ। ବର୍ଷା ସମ୍ଭାବନା ${rain}% ଏବଂ ପବନ ଗତି ${wind} କିମି/ଘଣ୍ଟା।`;
    case 'ml':
      return `ഇന്ന് ${loc}ൽ കാലാവസ്ഥ പ്രധാനമായും ${cond} ആയിരിക്കും, താപനില ഏകദേശം ${temp}°C ആയിരിക്കും. മഴ സാധ്യത ${rain}% കാറ്റിന്റെ വേഗത ${wind} km/h.`;
    case 'pa':
      return `ਅੱਜ ${loc} ਵਿੱਚ ਮੌਸਮ ਮੁੱਖ ਤੌਰ 'ਤੇ ${cond} ਰਹੇਗਾ ਅਤੇ ਤਾਪਮਾਨ ਲਗਭਗ ${temp}°C ਰਹੇਗਾ। ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ${rain}% ਅਤੇ ਹਵਾ ਦੀ ਰਫ਼ਤਾਰ ${wind} km/h ਹੈ।`;
    case 'as':
      return `আজি ${loc}ত বতৰ প্ৰধানকৈ ${cond} থাকিব আৰু উষ্ণতা প্ৰায় ${temp}°C হ’ব। বৰষুণৰ সম্ভাৱনা ${rain}% আৰু বতাহৰ গতি ${wind} কিমি/ঘণ্টা।`;
    case 'sa':
      return `अद्य ${loc}नगरे ऋतुः मुख्यतया ${cond} भविष्यति, तापमानं च प्रायः ${temp}°C भविष्यति। वृष्टि सम्भावना ${rain}% अस्ति, वायुवेगश्च ${wind} km/h अस्ति।`;
    case 'kok':
      return `आयज ${loc} हांगा हवामान चड करून ${cond} आसतलें आनी तापमान सुमार ${temp}°C आसतलें. पावसाची शक्यताय ${rain}% आनी वाऱ्याचो वेग ${wind} km/h आसा.`;
    case 'sd':
      return `اڄ ${loc} ۾ موسم بنيادي طور ${cond} رهندي ۽ گرمي پد اٽڪل ${temp}°C رهندو. مينهن جو امڪان ${rain}% ۽ هوا جي رفتار ${wind} ڪلوميٽر/ڪلاڪ آهي.`;
    case 'ne':
      return `आज ${loc}मा मौसम मुख्यतया ${cond} रहनेछ र तापमान लगभग ${temp}°C रहनेछ। वर्षाको सम्भावना ${rain}% र हावाको गति ${wind} km/h छ।`;
    case 'doi':
      return `अज्ज ${loc} च मौसम मुख्य रूप कन्नै ${cond} रौह्ग ते तापमान लगभग ${temp}°C रौह्ग। झड़ी दे आसार ${rain}% न ते हवा दी चाल ${wind} km/h ऐ।`;
    case 'ks':
      return `از ${loc} مَنٛز روزِ موسم زیادہ تر ${cond} تہٕ درجہ حرارت روزِ تقریباً ${temp}°C۔ رُدُک امکان چھُ ${rain}% تہٕ واوک رفتار چھِ ${wind} کلومیٹر/گھنٹہ۔`;
    case 'sat':
      return `ᱛᱮᱦᱮᱧ ${loc} ᱨᱮ ᱦᱚᱭ-ᱦᱤᱥᱤᱫ ᱢᱩᱬᱩᱛ ᱞᱮᱠᱟᱛᱮ ${cond} ᱛᱟᱦᱮᱸᱱᱟ ᱟᱨ ᱞᱚᱞᱚ ᱯᱨᱟᱭ ${temp}°C ᱛᱟᱦᱮᱸᱱᱟ᱾ ᱫᱟᱜ ᱦᱩᱭᱩᱜ ᱨᱮᱭﺎᱜ ᱪᱟᱱᱥ ${rain}% ᱟᱨ ᱦᱚᱭ ᱨᱮᱭﺎᱜ ᱞᱟᱦᱟ ${wind} km/h ᱢᱮᱱᱟᱜ-ᱟ᱾`;
    case 'mni':
      return `ঙসি ${loc}দা নোংচুপ-নুংশিৎ মরুওইনা ${cond} ওইগনি অমসুং অশাবা চাউরাক্না ${temp}°C ওইগনি। নোং চুরকপগী চাং ${rain}% অমসুং নুংশিৎকী খোঙজেল ${wind} কিমি/পুংনি।`;
    case 'brx':
      return `दिनै ${loc} आव अखा-बारा गाहायै ${cond} थागोन आरो दुंथाया ओंखायै ${temp}°C थागोन। अखा हानिफोरा ${rain}% आरो बारनि गोख्रोंथि ${wind} km/h।`;
    case 'bho':
      return `आजु ${loc} में मौसम मुख्य रूप से ${cond} रही अउर तापमान लगभग ${temp}°C रही। बरखा के चांस ${rain}% बा अउर हवा ${wind} km/h के रफ्तार से चलत बा।`;
    case 'mai':
      return `आइ ${loc} मे मौसम मुख्य रूप सँ ${cond} रहत आ तापमान लगभग ${temp}°C रहत। बरखाक संभावना ${rain}% अछि आ हवाक गति ${wind} km/h अछि।`;
    case 'har':
      return `आज ${loc} म्ह मौसम मुख्य रूप तै ${cond} रहवेगा अर तापमान लगभग ${temp}°C रहवेगा। मींह के आसार ${rain}% सैं अर हवा ${wind} km/h की चाल तै चालैगी।`;
    case 'raj':
      return `आज ${loc} में मौसम मुख्य रूप सूं ${cond} रैवेगा अर तापमान लगभग ${temp}°C रैवेगा। मेहा रा आसार ${rain}% है अर हवा ${wind} km/h री चाल सूं चाल रयी है।`;
    case 'awa':
      return `आजु ${loc} मा मौसम मुख्य रूप से ${cond} रहिहि अउर तापमान लगभग ${temp}°C रहिहि। पानी बरसै क सम्भावना ${rain}% अहइ अउर बयार ${wind} km/h अहइ।`;
    case 'hne':
      return `आज ${loc} म मौसम मुख्य रूप ले ${cond} रहिही अउ तापमान लगभग ${temp}°C रहिही। पानी गिरे के संसो ${rain}% हे अउ हवा ${wind} km/h हे।`;
    case 'mag':
      return `आज ${loc} में मौसम मुख्य रूप से ${cond} रहतई आ तापमान लगभग ${temp}°C रहतई। बरखा के संभावना ${rain}% हे आ हवा ${wind} km/h हे।`;
    case 'bra':
      return `आज ${loc} में मौसम मुख्य रूप तैं ${cond} रहैगो अरू तापमान लगभग ${temp}°C रहैगो। बरखा के आसार ${rain}% हैं अरू बयारि ${wind} km/h है।`;
    case 'bns':
      return `आज ${loc} में मौसम मुख्य रूप से ${cond} रवेगो अरू तापमान लगभग ${temp}°C रवेगो। पानी गिरबे के आसार ${rain}% हैं अरू हवा ${wind} km/h हे।`;
    case 'gbm':
      return `आज ${loc} मा मौसम मुख्य रूप से ${cond} रोलू अर तापमान लगभग ${temp}°C रोलू। बरसात कु चांस ${rain}% च अर बयार ${wind} km/h च।`;
    case 'en':
    default:
      return `Today in ${loc} will be mostly ${cond.toLowerCase()} and warm, with a high near ${weatherContext.tempMax}°C and current temp ${temp}°C. Rain is ${rain > 40 ? 'possible' : 'unlikely'}, with winds blowing at ${wind} km/h.`;
  }
}

// Fetch AI Autopilot Advice
export async function fetchAutopilotAdvice(
  routine: any,
  weatherContext: WeatherData,
  language: LanguageCode
): Promise<string> {
  try {
    const res = await fetch('/api/autopilot-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routine, weatherContext, language }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.advice) return data.advice;
    }
  } catch (e) {
    console.warn('Autopilot advice fetch error:', e);
  }

  const rain = weatherContext.rainChance;
  const temp = weatherContext.temperature;
  return `Weather analysis for ${routine.name} (${routine.startTime}): Ambient temp is ${temp}°C with ${rain}% rain probability. ${
    rain > 40 ? 'Please carry an umbrella and allow extra travel buffer.' : 'Conditions are favorable for your routine.'
  }`;
}

// Fetch AI Route Intelligence Summary
export async function fetchRouteIntelligenceSummary(
  startLocation: string,
  destination: string,
  transportMode: string,
  waypoints: any[],
  language: LanguageCode
): Promise<string> {
  try {
    const res = await fetch('/api/route-intelligence', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startLocation, destination, transportMode, waypoints, language }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.summary) return data.summary;
    }
  } catch (e) {
    console.warn('Route intelligence fetch error:', e);
  }

  return `Route weather intelligence for ${startLocation} ➔ ${destination} (${transportMode}): Steady conditions across major transit corridors. Safe travel advised.`;
}

// Fetch AI User Advisory
export async function fetchUserAdvisoryAI(
  profileId: string,
  profileName: string,
  weatherContext: WeatherData,
  language: LanguageCode
): Promise<string> {
  try {
    const res = await fetch('/api/user-advisory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, profileName, weatherContext, language }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.advisory) return data.advisory;
    }
  } catch (e) {
    console.warn('User advisory fetch error:', e);
  }

  return `Customized meteorological advisory for ${profileName}: Current atmospheric temperature is ${weatherContext.temperature}°C, rain probability is ${weatherContext.rainChance}%, and AQI is ${weatherContext.aqi}.`;
}

// Fetch What Changed AI explanation
export async function fetchWhatChangedAIExplanation(
  changes: any[],
  weatherContext: WeatherData,
  language: LanguageCode
): Promise<string> {
  try {
    const res = await fetch('/api/what-changed-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ changes, weatherContext, language }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.explanation) return data.explanation;
    }
  } catch (e) {
    console.warn('What changed AI error:', e);
  }

  return 'Atmospheric parameters have shifted in accordance with normal diurnal cycles.';
}

// Fetch Early Alert AI advice
export async function fetchEarlyAlertAdvice(
  routineName: string,
  routineTime: string,
  changeDescription: string,
  weatherContext: WeatherData,
  language: LanguageCode
): Promise<string> {
  try {
    const res = await fetch('/api/early-alert-advice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ routineName, routineTime, changeDescription, weatherContext, language }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.alertAdvice) return data.alertAdvice;
    }
  } catch (e) {
    console.warn('Early alert advice fetch error:', e);
  }

  return `Early Alert: Significant weather change observed before your ${routineTime} ${routineName}. Please take necessary precautions.`;
}

function generateClientFallbackAnswer(
  question: string,
  ctx: WeatherData | null,
  lang: LanguageCode
): string {
  const q = question.toLowerCase();
  const loc = ctx?.city || 'your area';
  const temp = ctx?.temperature ?? 30;
  const rain = ctx?.rainChance ?? 15;
  const aqi = ctx?.aqi ?? 150;
  const cond = ctx?.condition ?? 'Clear Sky';

  if (lang === 'hi') {
    if (q.includes('rain') || q.includes('बारिश') || q.includes('छाता')) {
      return `आज ${loc} में बारिश की संभावना ${rain}% है। ${rain > 40 ? 'छाता साथ रखें।' : 'बारिश की संभावना कम है।'}`;
    }
    return `${loc} में वर्तमान मौसम ${cond} है, तापमान ${temp}°C, AQI ${aqi} और बारिश की संभावना ${rain}% है।`;
  }

  if (lang === 'bn') {
    if (q.includes('rain') || q.includes('বৃষ্টি') || q.includes('ছাতা')) {
      return `আজ ${loc}-এ বৃষ্টির সম্ভাবনা ${rain}%। ${rain > 40 ? 'ছাতা সাথে রাখুন।' : 'বৃষ্টির সম্ভাবনা কম।'}`;
    }
    return `${loc}-এ বর্তমান আবহাওয়া ${cond}, তাপমাত্রা ${temp}°C, AQI ${aqi} এবং বৃষ্টির সম্ভাবনা ${rain}%।`;
  }

  if (lang === 'te') {
    if (q.includes('rain') || q.includes('వర్షం') || q.includes('గొడుగు')) {
      return `నేడు ${loc}లో వర్షం అవకాశం ${rain}%. ${rain > 40 ? 'గొడుగు దగ్గర ఉంచుకోండి.' : 'వర్షం అవకాశం తక్కువగా ఉంది.'}`;
    }
    return `${loc}లో ప్రస్తుత వాతావరణం ${cond}, ఉష్ణోగ్రత ${temp}°C, AQI ${aqi} మరియు వర్షం అవకాశం ${rain}%.`;
  }

  if (lang === 'mr') {
    if (q.includes('rain') || q.includes('पाऊस') || q.includes('छत्री')) {
      return `आज ${loc} मध्ये पावसाची शक्यता ${rain}% आहे. ${rain > 40 ? 'छत्री सोबत ठेवा.' : 'पावसाची शक्यता कमी आहे.'}`;
    }
    return `${loc} मध्ये सध्याचे हवामान ${cond} असून तापमान ${temp}°C, AQI ${aqi} आणि पावसाची शक्यता ${rain}% आहे।`;
  }

  if (lang === 'ta') {
    if (q.includes('rain') || q.includes('மழை') || q.includes('குடை')) {
      return `இன்று ${loc} பகுதியில் மழைக்கு ${rain}% வாய்ப்புள்ளது. ${rain > 40 ? 'குடை எடுத்துச் செல்லுங்கள்.' : 'மழைக்கு வாய்ப்பு குறைவு.'}`;
    }
    return `${loc} தற்போதைய வானிலை: ${cond}, வெப்பநிலை ${temp}°C, AQI ${aqi}, மழை வாய்ப்பு ${rain}%.`;
  }

  if (lang === 'gu') {
    if (q.includes('rain') || q.includes('વરસાદ') || q.includes('છત્રી')) {
      return `આજે ${loc}માં વરસાદની શક્યતા ${rain}% છે. ${rain > 40 ? 'છત્રી સાથે રાખો.' : 'વરસાદની શક્યતા ઓછી છે.'}`;
    }
    return `${loc}માં વર્તમાન હવામાન ${cond} છે, તાપમાન ${temp}°C, AQI ${aqi} અને વરસાદની શક્યતા ${rain}% છે.`;
  }

  if (lang === 'ur') {
    return `${loc} میں موجودہ موسم ${cond} ہے، درجہ حرارت ${temp}°C، ہوا کا معیار AQI ${aqi} اور بارش کا امکان ${rain}% ہے۔`;
  }

  if (lang === 'kn') {
    return `${loc}ನಲ್ಲಿ ಪ್ರಸ್ತುತ ಹವಾಮಾನ ${cond}, ತಾಪಮಾನ ${temp}°C, AQI ${aqi} ಮತ್ತು ಮಳೆಯ ಸಾಧ್ಯತೆ ${rain}%.`;
  }

  if (lang === 'or') {
    return `${loc}ରେ ବର୍ତ୍ତମାନର ପାଣିପାଗ ${cond}, ତାପମାତ୍ରା ${temp}°C, AQI ${aqi} ଏବଂ ବର୍ଷା ସମ୍ଭାବନା ${rain}%।`;
  }

  if (lang === 'ml') {
    return `${loc}ൽ ഇപ്പോഴത്തെ അവസ്ഥ ${cond} ആണ്. താപനില ${temp}°C, AQI ${aqi}, മഴ സാധ്യത ${rain}%.`;
  }

  if (lang === 'pa') {
    return `${loc} ਵਿੱਚ ਮੌਜੂਦਾ ਮੌਸਮ ${cond} ਹੈ, ਤਾਪਮਾਨ ${temp}°C, AQI ${aqi} ਅਤੇ ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ${rain}% ਹੈ।`;
  }

  if (lang === 'bho') {
    if (q.includes('rain') || q.includes('बरखा') || q.includes('छाता') || q.includes('पानी')) {
      return `आजु ${loc} में पानी बरसे के संभावना ${rain}% बा। ${rain > 40 ? 'छाता जरूर साथे रखीं।' : 'बरखा के चांस बहुते कम बा।'}`;
    }
    return `${loc} में ताजा मौसम ${cond} बा, तापमान ${temp}°C, AQI ${aqi} अउर बरखा के चांस ${rain}% बा।`;
  }

  if (lang === 'mai') {
    if (q.includes('rain') || q.includes('बरखा') || q.includes('छाता')) {
      return `आइ ${loc} मे बरखाक संभावना ${rain}% अछि। ${rain > 40 ? 'छाता संग राखू।' : 'बरखाक संभावना कम अछि।'}`;
    }
    return `${loc} मे ताजा मौसम ${cond} अछि, तापमान ${temp}°C, AQI ${aqi} आ बरखाक संभावना ${rain}% अछि।`;
  }

  if (lang === 'har') {
    if (q.includes('rain') || q.includes('मींह') || q.includes('बरखा') || q.includes('छाता')) {
      return `आज ${loc} म्ह मींह बरसण के चांस ${rain}% सैं। ${rain > 40 ? 'छाता कनी हाथ में रखियो।' : 'मींह के चांस कम सैं।'}`;
    }
    return `${loc} म्ह इब का मौसम ${cond} सै, तापमान ${temp}°C, AQI ${aqi} अर मींह के आसार ${rain}% सैं।`;
  }

  if (lang === 'raj') {
    if (q.includes('rain') || q.includes('मेहा') || q.includes('बरखा') || q.includes('छातो')) {
      return `आज ${loc} में मेहा बरसण रा आसार ${rain}% है। ${rain > 40 ? 'छातो सागे राखजो।' : 'मेहा रा आसार कम है।'}`;
    }
    return `${loc} में इब रो मौसम ${cond} है, तापमान ${temp}°C, AQI ${aqi} अर मेहा री संभावना ${rain}% है।`;
  }

  if (lang === 'awa') {
    if (q.includes('rain') || q.includes('पानी') || q.includes('बरखा') || q.includes('छाता')) {
      return `आजु ${loc} मा पानी बरसै क सम्भावना ${rain}% अहइ। ${rain > 40 ? 'छाता साथे रखौ।' : 'पानी बरसै क सम्भावना कम अहइ।'}`;
    }
    return `${loc} मा वर्तमान मौसम ${cond} अहइ, तापमान ${temp}°C, AQI ${aqi} अउर पानी बरसै क चांस ${rain}% अहइ।`;
  }

  if (lang === 'hne') {
    if (q.includes('rain') || q.includes('पानी') || q.includes('बरखा') || q.includes('छाता')) {
      return `आज ${loc} म पानी गिरे के संसो ${rain}% हे। ${rain > 40 ? 'छाता संग म राखव।' : 'पानी गिरे के संसो कम हे।'}`;
    }
    return `${loc} म अभी के मौसम ${cond} हे, तापमान ${temp}°C, AQI ${aqi} अउ पानी गिरे के चांस ${rain}% हे।`;
  }

  if (lang === 'mag') {
    if (q.includes('rain') || q.includes('पानी') || q.includes('बरखा') || q.includes('छाता')) {
      return `आज ${loc} में पानी गिरे के संभावना ${rain}% हे। ${rain > 40 ? 'छाता संगे रखा।' : 'पानी गिरे के संभावना कम हे।'}`;
    }
    return `${loc} में ताजा मौसम ${cond} हे, तापमान ${temp}°C, AQI ${aqi} आ पानी गिरे के चांस ${rain}% हे।`;
  }

  if (lang === 'bra') {
    if (q.includes('rain') || q.includes('बरखा') || q.includes('मेघ') || q.includes('छाता')) {
      return `आज ${loc} में बरखा परन के आसार ${rain}% हैं। ${rain > 40 ? 'छाता संग राखौ।' : 'बरखा के आसार कम हैं।'}`;
    }
    return `${loc} में वर्तमान मौसम ${cond} है, तापमान ${temp}°C, AQI ${aqi} अरू बरखा के आसार ${rain}% हैं।`;
  }

  if (lang === 'bns') {
    if (q.includes('rain') || q.includes('पानी') || q.includes('बरखा') || q.includes('छाता')) {
      return `आज ${loc} में पानी गिरबे के आसार ${rain}% हैं। ${rain > 40 ? 'छाता संग राखो।' : 'पानी गिरबे के आसार कम हैं।'}`;
    }
    return `${loc} में वर्तमान मौसम ${cond} हे, तापमान ${temp}°C, AQI ${aqi} अरू पानी गिरबे के आसार ${rain}% हैं।`;
  }

  if (lang === 'gbm') {
    if (q.includes('rain') || q.includes('बरसात') || q.includes('बर्स') || q.includes('छाता')) {
      return `आज ${loc} मा बरसात होणा आसार ${rain}% छन। ${rain > 40 ? 'छाता संग रखा।' : 'बरसात कु चांस कम च।'}`;
    }
    return `${loc} मा ताजा मौसम ${cond} च, तापमान ${temp}°C, AQI ${aqi} अर बरसात कु चांस ${rain}% च।`;
  }

  if (lang === 'hinglish') {
    if (q.includes('rain') || q.includes('barish')) {
      return `Aaj ${loc} me rain chance ${rain}% hai. ${rain > 40 ? 'Umbrella rakh lo safer side.' : 'Rain ka risk kafi kam hai.'}`;
    }
    return `${loc} me current weather ${cond} hai, temp ${temp}°C, AQI ${aqi} aur rain chance ${rain}% hai.`;
  }

  if (q.includes('rain') || q.includes('umbrella')) {
    return `Based on current weather telemetry for ${loc}, the rain chance is ${rain}%. Significant rainfall is ${rain > 40 ? 'likely, so bring an umbrella' : 'unlikely today'}.`;
  }
  if (q.includes('air') || q.includes('aqi')) {
    return `The current Air Quality Index (AQI) in ${loc} is ${aqi} (${ctx?.aqiStatus || 'Moderate'}). Sensitive individuals should take appropriate precautions.`;
  }
  return `Current conditions for ${loc} show ${cond} with a temperature of ${temp}°C (feels like ${ctx?.feelsLike || temp}°C), ${ctx?.windSpeed || 14} km/h winds, and ${rain}% precipitation chance.`;
}
