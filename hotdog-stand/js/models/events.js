/**
 * Events and Weather model for Hot Dog Stand: The Works.
 * Defines the 8-event season, venues, weather forecasts, and Frankie's commentary.
 */

export const WEATHER_TYPES = {
  SUNNY_WARM: {
    id: 'SUNNY_WARM',
    name: 'Sunny & Pleasant',
    icon: '☀️',
    tempRange: [72, 79],
    attendanceMult: 1.05,
    coldDrinkDemandMult: 1.15,
    warmDrinkDemandMult: 0.6,
    hotDogDemandMult: 1.0,
    snackDemandMult: 1.05,
    description: 'Clear blue skies with a gentle breeze. Perfect picnic weather!',
    frankieAdvice: "Hot diggity dog! The sun is shining and people will be hungry and thirsty. Keep your drink coolers well-stocked!"
  },
  HEATWAVE: {
    id: 'HEATWAVE',
    name: 'Blazing Heatwave',
    icon: '🔥',
    tempRange: [88, 97],
    attendanceMult: 1.1,
    coldDrinkDemandMult: 2.1,
    warmDrinkDemandMult: 0.1,
    hotDogDemandMult: 0.85,
    snackDemandMult: 0.9,
    description: 'Sizzling hot sun beating down! Fans will be parched and seeking cold refreshments.',
    frankieAdvice: "Whew! It's hotter than a grill out there! Stock up heavily on ice-cold sodas and lemonade—people will drink more than they eat!"
  },
  MILD_OVERCAST: {
    id: 'MILD_OVERCAST',
    name: 'Cool & Overcast',
    icon: '⛅',
    tempRange: [62, 68],
    attendanceMult: 0.98,
    coldDrinkDemandMult: 0.9,
    warmDrinkDemandMult: 1.1,
    hotDogDemandMult: 1.05,
    snackDemandMult: 1.0,
    description: 'Cloudy skies with comfortable, crisp air.',
    frankieAdvice: "A balanced day ahead! No extreme weather means steady, reliable sales across your whole menu."
  },
  CHILLY_WIND: {
    id: 'CHILLY_WIND',
    name: 'Chilly & Brisk',
    icon: '🍂',
    tempRange: [46, 55],
    attendanceMult: 0.9,
    coldDrinkDemandMult: 0.45,
    warmDrinkDemandMult: 2.3,
    hotDogDemandMult: 1.15,
    snackDemandMult: 1.0,
    description: 'Brisk autumn wind whipping through the bleachers. Fans need warm food to keep cozy!',
    frankieAdvice: "Brrr! My bun is shivering! Hot cocoa and warm hot dogs will be huge hits today. Go light on the iced sodas!"
  },
  RAIN_DRIZZLE: {
    id: 'RAIN_DRIZZLE',
    name: 'Drizzle & Light Rain',
    icon: '🌧️',
    tempRange: [50, 58],
    attendanceMult: 0.72,
    coldDrinkDemandMult: 0.5,
    warmDrinkDemandMult: 1.8,
    hotDogDemandMult: 0.95,
    snackDemandMult: 0.85,
    description: 'Steady light rain dampening the grounds. Turnout will be lower than usual.',
    frankieAdvice: "Wet weather warning! Total crowd size will shrink by roughly 25-30%. Don't overbuy buns or you'll be left with soggy leftovers!"
  },
  THUNDERSTORM: {
    id: 'THUNDERSTORM',
    name: 'Stormy & Gusty',
    icon: '⛈️',
    tempRange: [56, 64],
    attendanceMult: 0.55,
    coldDrinkDemandMult: 0.4,
    warmDrinkDemandMult: 1.5,
    hotDogDemandMult: 0.8,
    snackDemandMult: 0.75,
    description: 'Dark storm clouds with scattered thunder. Only dedicated fans will brave the weather.',
    frankieAdvice: "Yikes! Stormy skies! Many fans are staying home. Keep your inventory lean and prices competitive to avoid heavy spoilage!"
  }
};

export const SEASON_SCHEDULE = [
  {
    eventIndex: 0,
    id: 'event_little_league',
    name: 'Little League Opening Day',
    venue: 'Elm Street Community Ballpark',
    baseAttendance: 650,
    allowedWeather: ['SUNNY_WARM', 'MILD_OVERCAST'],
    permitFee: 15.00,
    specialNote: 'Lots of hungry young ballplayers and parents! High demand for classic hot dogs and cold lemonade.',
    flavorText: 'Welcome to your first event! Start smart, watch your pack sizes, and learn the ropes.'
  },
  {
    eventIndex: 1,
    id: 'event_hs_football',
    name: 'Friday Night Lights: Rivalry Game',
    venue: 'Tiger Stadium',
    baseAttendance: 1800,
    allowedWeather: ['CHILLY_WIND', 'MILD_OVERCAST', 'RAIN_DRIZZLE'],
    permitFee: 40.00,
    specialNote: 'Brisk evening air under the stadium lights. Warm drinks and hearty double-dog orders will be popular.',
    flavorText: 'The stands are packed with spirited high schoolers and alumni ready to cheer on the Tigers.'
  },
  {
    eventIndex: 2,
    id: 'event_jazz_fest',
    name: 'Riverside Summer Jazz Festival',
    venue: 'Riverside Park Bandstand',
    baseAttendance: 3200,
    allowedWeather: ['SUNNY_WARM', 'HEATWAVE'],
    permitFee: 75.00,
    specialNote: 'Leisurely music lovers lounging on lawn blankets all afternoon. Massive demand for sodas and chips!',
    flavorText: 'Smooth tunes and hot sun mean visitors will visit your stand multiple times for cold drinks.'
  },
  {
    eventIndex: 3,
    id: 'event_track_meet',
    name: 'State Track & Field Invitational',
    venue: 'Westside Athletic Complex',
    baseAttendance: 1200,
    allowedWeather: ['RAIN_DRIZZLE', 'CHILLY_WIND', 'MILD_OVERCAST'],
    permitFee: 30.00,
    specialNote: 'Weather can be tricky here! Pay close attention to Frankie’s forecast before placing your orders.',
    flavorText: 'Athletes and spectators are braving brisk conditions across an all-day field event.'
  },
  {
    eventIndex: 4,
    id: 'event_county_fair',
    name: 'Sunny Valley County Fair',
    venue: 'Fairgrounds Pavilion',
    baseAttendance: 4500,
    allowedWeather: ['SUNNY_WARM', 'HEATWAVE', 'MILD_OVERCAST'],
    permitFee: 120.00,
    specialNote: 'Huge foot traffic from carnival goers! Advertising flyers around the fairgrounds will yield fantastic results.',
    flavorText: 'Ferris wheels, livestock exhibits, and prize ribbons. Everyone wants a tasty hot dog lunch!'
  },
  {
    eventIndex: 5,
    id: 'event_rock_concert',
    name: 'Midsummer Rock in the Park',
    venue: 'Lakeview Amphitheater',
    baseAttendance: 5400,
    allowedWeather: ['HEATWAVE', 'SUNNY_WARM', 'THUNDERSTORM'],
    permitFee: 150.00,
    specialNote: 'High energy concert crowd! Premium combo pricing will sell well if you advertise with the radio spot.',
    flavorText: 'The electric guitars are humming and the arena is buzzing with thousands of thirsty fans.'
  },
  {
    eventIndex: 6,
    id: 'event_homecoming',
    name: 'University Homecoming Game',
    venue: 'Memorial Bowl',
    baseAttendance: 7000,
    allowedWeather: ['CHILLY_WIND', 'SUNNY_WARM', 'MILD_OVERCAST', 'RAIN_DRIZZLE'],
    permitFee: 180.00,
    specialNote: 'Raucous homecoming crowd! Long lines can cost you sales if you don’t keep service fast.',
    flavorText: 'Tailgaters, marching bands, and thousands of fans eager for hot dogs before kickoff.'
  },
  {
    eventIndex: 7,
    id: 'event_grand_finale',
    name: 'National Championship Grand Finale',
    venue: 'Metropolis Stadium Plaza',
    baseAttendance: 9200,
    allowedWeather: ['SUNNY_WARM', 'HEATWAVE', 'CHILLY_WIND', 'THUNDERSTORM'],
    permitFee: 250.00,
    specialNote: 'The ultimate test of your hot dog stand empire! Maximum crowd, high stakes, and high rewards.',
    flavorText: 'The biggest stage of the year. Run your business like a master tycoon and etch your name in the Hall of Fame!'
  }
];

/**
 * Generates an event instance with randomized weather within allowed parameters
 */
export function generateEvent(eventIndex = 0, weatherOverride = null) {
  const scheduleIndex = Math.min(eventIndex, SEASON_SCHEDULE.length - 1);
  const template = SEASON_SCHEDULE[scheduleIndex];

  let weatherKey = weatherOverride;
  if (!weatherKey || !WEATHER_TYPES[weatherKey]) {
    const allowed = template.allowedWeather;
    weatherKey = allowed[Math.floor(Math.random() * allowed.length)];
  }

  const weather = WEATHER_TYPES[weatherKey];
  const tempMin = weather.tempRange[0];
  const tempMax = weather.tempRange[1];
  const temperature = Math.round(tempMin + Math.random() * (tempMax - tempMin));

  // Small random attendance variance (+- 7%)
  const variance = 0.93 + Math.random() * 0.14;
  const expectedAttendance = Math.round(template.baseAttendance * variance * weather.attendanceMult);

  return {
    ...template,
    eventNumber: eventIndex + 1,
    totalEvents: SEASON_SCHEDULE.length,
    weather: {
      ...weather,
      temperature
    },
    expectedAttendance
  };
}
