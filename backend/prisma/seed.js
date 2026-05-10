import { PrismaClient } from "@prisma/client";
import { buildWorldKey } from "../src/lib/worldCityKey.js";

const prisma = new PrismaClient();

/**
 * Featured cities (stable UUIDs for backwards compatibility).
 * worldKey matches picks from country-state-city when countryCode + name align.
 */
const CITY_DATA = [
  { name: "Lisbon", country: "Portugal", countryCode: "PT", tagline: "Tiles, trams, Atlantic breeze", emoji: "🏛️" },
  { name: "Reykjavik", country: "Iceland", countryCode: "IS", tagline: "Northern lights basecamp", emoji: "🌋" },
  { name: "Queenstown", country: "New Zealand", countryCode: "NZ", tagline: "Adventure capital", emoji: "⛰️" },
  { name: "Barcelona", country: "Spain", countryCode: "ES", tagline: "Gaudí & gastronomy", emoji: "🎨" },
  { name: "Vancouver", country: "Canada", countryCode: "CA", tagline: "Sea meets mountains", emoji: "🌲" },
  { name: "Marrakech", country: "Morocco", countryCode: "MA", tagline: "Souks & sunsets", emoji: "🕌" },
  { name: "Kyoto", country: "Japan", countryCode: "JP", tagline: "Temples & tea houses", emoji: "⛩️" },
  { name: "Porto", country: "Portugal", countryCode: "PT", tagline: "Riverfront wine culture", emoji: "🍷" },
  { name: "Paris", country: "France", countryCode: "FR", tagline: "Museums & café culture", emoji: "🗼" },
  { name: "Amsterdam", country: "Netherlands", countryCode: "NL", tagline: "Canals & cycling", emoji: "🚲" },
  { name: "Rome", country: "Italy", countryCode: "IT", tagline: "Ancient ruins & pasta", emoji: "🏛️" },
  { name: "London", country: "United Kingdom", countryCode: "GB", tagline: "History & theatre", emoji: "🇬🇧" },
  { name: "Berlin", country: "Germany", countryCode: "DE", tagline: "Nightlife & galleries", emoji: "🎭" },
  { name: "Prague", country: "Czechia", countryCode: "CZ", tagline: "Castle views & beer halls", emoji: "🏰" },
  { name: "Vienna", country: "Austria", countryCode: "AT", tagline: "Music & coffee houses", emoji: "🎻" },
  { name: "Athens", country: "Greece", countryCode: "GR", tagline: "Acropolis & islands gateway", emoji: "🏺" },
  { name: "Dublin", country: "Ireland", countryCode: "IE", tagline: "Pubs & literary heritage", emoji: "☘️" },
  { name: "Edinburgh", country: "United Kingdom", countryCode: "GB", tagline: "Festivals & old town", emoji: "🏰" },
  { name: "Stockholm", country: "Sweden", countryCode: "SE", tagline: "Archipelago & design", emoji: "🛶" },
  { name: "Copenhagen", country: "Denmark", countryCode: "DK", tagline: "Hygge & waterfront", emoji: "🚢" },
  { name: "Zurich", country: "Switzerland", countryCode: "CH", tagline: "Alps gateway & lakes", emoji: "🏔️" },
  { name: "Madrid", country: "Spain", countryCode: "ES", tagline: "Art museums & tapas", emoji: "🖼️" },
  { name: "Seville", country: "Spain", countryCode: "ES", tagline: "Flamenco & Moorish heritage", emoji: "💃" },
  { name: "Florence", country: "Italy", countryCode: "IT", tagline: "Renaissance art hub", emoji: "🎨" },
  { name: "Venice", country: "Italy", countryCode: "IT", tagline: "Canals & carnival spirit", emoji: "🛶" },
  { name: "Santorini", country: "Greece", countryCode: "GR", tagline: "Caldera sunsets", emoji: "🌅" },
  { name: "Dubrovnik", country: "Croatia", countryCode: "HR", tagline: "Walled old town & Adriatic", emoji: "🏝️" },
  { name: "Istanbul", country: "Türkiye", countryCode: "TR", tagline: "East meets West", emoji: "🕌" },
  { name: "New York", country: "United States", countryCode: "US", tagline: "Broadway & skyline", emoji: "🗽" },
  { name: "San Francisco", country: "United States", countryCode: "US", tagline: "Bay bridges & fog", emoji: "🌉" },
  { name: "Los Angeles", country: "United States", countryCode: "US", tagline: "Film & beaches", emoji: "🎬" },
  { name: "Chicago", country: "United States", countryCode: "US", tagline: "Architecture & lakeshore", emoji: "🏙️" },
  { name: "Miami", country: "United States", countryCode: "US", tagline: "Art deco & beaches", emoji: "🏖️" },
  { name: "Seattle", country: "United States", countryCode: "US", tagline: "Coffee & Pike Place", emoji: "☕" },
  { name: "Mexico City", country: "Mexico", countryCode: "MX", tagline: "Street food & murals", emoji: "🌮" },
  { name: "Oaxaca", country: "Mexico", countryCode: "MX", tagline: "Markets & mezcal", emoji: "🌺" },
  { name: "Buenos Aires", country: "Argentina", countryCode: "AR", tagline: "Tango & steakhouses", emoji: "💃" },
  { name: "Rio de Janeiro", country: "Brazil", countryCode: "BR", tagline: "Copacabana & Christ statue", emoji: "🏖️" },
  { name: "Lima", country: "Peru", countryCode: "PE", tagline: "Ceviche & colonial core", emoji: "🦙" },
  { name: "Cusco", country: "Peru", countryCode: "PE", tagline: "Gateway to Machu Picchu", emoji: "⛰️" },
  { name: "Toronto", country: "Canada", countryCode: "CA", tagline: "Multicultural neighborhoods", emoji: "🍁" },
  { name: "Montreal", country: "Canada", countryCode: "CA", tagline: "Festivals & Old Montreal", emoji: "🎪" },
  { name: "Banff", country: "Canada", countryCode: "CA", tagline: "Rocky Mountain lakes", emoji: "🏔️" },
  { name: "Tokyo", country: "Japan", countryCode: "JP", tagline: "Neon districts & cuisine", emoji: "🗼" },
  { name: "Osaka", country: "Japan", countryCode: "JP", tagline: "Street food capital", emoji: "🍜" },
  { name: "Seoul", country: "South Korea", countryCode: "KR", tagline: "K-pop & palace quarters", emoji: "🏯" },
  { name: "Singapore", country: "Singapore", countryCode: "SG", tagline: "Hawker stalls & gardens", emoji: "🌿" },
  { name: "Bangkok", country: "Thailand", countryCode: "TH", tagline: "Temples & night markets", emoji: "🛕" },
  { name: "Chiang Mai", country: "Thailand", countryCode: "TH", tagline: "Temples & mountains", emoji: "🐘" },
  { name: "Hanoi", country: "Vietnam", countryCode: "VN", tagline: "Old quarter & pho", emoji: "🍜" },
  { name: "Ho Chi Minh City", country: "Vietnam", countryCode: "VN", tagline: "Motorbikes & street eats", emoji: "🏍️" },
  { name: "Bali", country: "Indonesia", countryCode: "ID", tagline: "Rice terraces & surf", emoji: "🌴" },
  { name: "Kuala Lumpur", country: "Malaysia", countryCode: "MY", tagline: "Petronas & night markets", emoji: "🕌" },
  { name: "Hong Kong", country: "Hong Kong SAR", countryCode: "HK", tagline: "Harbour skyline & dim sum", emoji: "🌃" },
  { name: "Taipei", country: "Taiwan", countryCode: "TW", tagline: "Night markets & hot springs", emoji: "🧋" },
  { name: "Shanghai", country: "China", countryCode: "CN", tagline: "Bund & futurist towers", emoji: "🏙️" },
  { name: "Beijing", country: "China", countryCode: "CN", tagline: "Great Wall gateway", emoji: "🐉" },
  { name: "Sydney", country: "Australia", countryCode: "AU", tagline: "Opera House & harbour", emoji: "🦘" },
  { name: "Melbourne", country: "Australia", countryCode: "AU", tagline: "Lanes & coffee culture", emoji: "☕" },
  { name: "Dubai", country: "United Arab Emirates", countryCode: "AE", tagline: "Desert metropolis", emoji: "🏜️" },
  { name: "Tel Aviv", country: "Israel", countryCode: "IL", tagline: "Beaches & Bauhaus", emoji: "🏖️" },
  { name: "Jerusalem", country: "Israel", countryCode: "IL", tagline: "Ancient quarters", emoji: "✡️" },
  { name: "Cairo", country: "Egypt", countryCode: "EG", tagline: "Pyramids & Nile", emoji: "🐫" },
  { name: "Cape Town", country: "South Africa", countryCode: "ZA", tagline: "Table Mountain & wine", emoji: "🍷" },
  { name: "Nairobi", country: "Kenya", countryCode: "KE", tagline: "Safari gateway", emoji: "🦁" },
  { name: "Zanzibar", country: "Tanzania", countryCode: "TZ", tagline: "Spice islands & beaches", emoji: "🏝️" },
  { name: "Budapest", country: "Hungary", countryCode: "HU", tagline: "Thermal baths & ruin bars", emoji: "♨️" },
  { name: "Kraków", country: "Poland", countryCode: "PL", tagline: "Medieval square & cafes", emoji: "🏰" },
  { name: "Bruges", country: "Belgium", countryCode: "BE", tagline: "Canals & chocolate", emoji: "🍫" },
  { name: "Ljubljana", country: "Slovenia", countryCode: "SI", tagline: "Green capital & castle", emoji: "🐉" },
  { name: "Valencia", country: "Spain", countryCode: "ES", tagline: "Paella & futuristic arts", emoji: "🍚" },
  { name: "Split", country: "Croatia", countryCode: "HR", tagline: "Diocletian's palace coast", emoji: "⚓" },
];

function cityId(indexOneBased) {
  const hex = indexOneBased.toString(16).padStart(12, "0");
  return `c1000000-0000-4000-8000-${hex}`;
}

async function main() {
  let count = 0;
  for (let i = 0; i < CITY_DATA.length; i++) {
    const id = cityId(i + 1);
    const c = CITY_DATA[i];
    const stateCode = c.stateCode || "";
    const worldKey = buildWorldKey(c.countryCode, stateCode, c.name);
    await prisma.city.upsert({
      where: { id },
      create: {
        id,
        worldKey,
        name: c.name,
        country: c.country,
        countryCode: c.countryCode,
        stateCode,
        tagline: c.tagline,
        emoji: c.emoji,
      },
      update: {
        worldKey,
        name: c.name,
        country: c.country,
        countryCode: c.countryCode,
        stateCode,
        tagline: c.tagline,
        emoji: c.emoji,
      },
    });
    count++;
  }
  console.log(`Seeded ${count} featured cities (world catalog is separate — see API search)`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
