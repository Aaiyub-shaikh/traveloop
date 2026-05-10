/**
 * Dummy data for UI placeholders — replace with real APIs later.
 */

export const mockTrips = [
  {
    id: "trip-1",
    title: "Kyoto Spring",
    destination: "Kyoto, Japan",
    startDate: "2026-04-12",
    endDate: "2026-04-22",
    coverGradient: "from-cyan-400/30 to-teal-600/40",
    status: "draft",
  },
  {
    id: "trip-2",
    title: "Coastal Portugal",
    destination: "Porto → Lisbon",
    startDate: "2026-06-01",
    endDate: "2026-06-14",
    coverGradient: "from-sky-400/30 to-indigo-600/40",
    status: "planned",
  },
  {
    id: "trip-3",
    title: "Banff Weekend",
    destination: "Alberta, Canada",
    startDate: "2026-09-05",
    endDate: "2026-09-08",
    coverGradient: "from-emerald-400/25 to-cyan-700/35",
    status: "completed",
  },
];

export const mockCities = [
  { id: "c1", name: "Lisbon", country: "Portugal", tagline: "Tiles, trams, Atlantic breeze", image: "🏛️" },
  { id: "c2", name: "Reykjavik", country: "Iceland", tagline: "Northern lights basecamp", image: "🌋" },
  { id: "c3", name: "Queenstown", country: "New Zealand", tagline: "Adventure capital", image: "⛰️" },
  { id: "c4", name: "Barcelona", country: "Spain", tagline: "Gaudí & gastronomy", image: "🎨" },
  { id: "c5", name: "Vancouver", country: "Canada", tagline: "Sea meets mountains", image: "🌲" },
  { id: "c6", name: "Marrakech", country: "Morocco", tagline: "Souks & sunsets", image: "🕌" },
];

export const mockActivities = [
  { id: "a1", title: "Sunrise hike", category: "Outdoors", city: "Queenstown", duration: "4h", priceHint: "$$" },
  { id: "a2", title: "Cooking class", category: "Food", city: "Barcelona", duration: "3h", priceHint: "$$$" },
  { id: "a3", title: "Blue Lagoon soak", category: "Wellness", city: "Reykjavik", duration: "half day", priceHint: "$$$$" },
  { id: "a4", title: "Street art tour", category: "Culture", city: "Lisbon", duration: "2h", priceHint: "$" },
  { id: "a5", title: "Kayak fjord", category: "Outdoors", city: "Vancouver", duration: "5h", priceHint: "$$$" },
];

export const mockItineraryDays = [
  {
    day: 1,
    date: "Apr 12",
    items: [
      { time: "09:00", title: "Arrival & check-in", place: "Gion district" },
      { time: "14:00", title: "Temple walk", place: "Kiyomizu-dera" },
    ],
  },
  {
    day: 2,
    date: "Apr 13",
    items: [
      { time: "08:30", title: "Bamboo grove", place: "Arashiyama" },
      { time: "19:00", title: "Izakaya crawl", place: "Pontocho" },
    ],
  },
];

export const mockBudgetCategories = [
  { id: "flights", label: "Flights", allocated: 1200, spent: 0 },
  { id: "stay", label: "Stay", allocated: 800, spent: 0 },
  { id: "food", label: "Food", allocated: 450, spent: 0 },
  { id: "activities", label: "Activities", allocated: 350, spent: 0 },
];

export const mockPackingItems = [
  { id: "p1", label: "Passport & visas", done: true },
  { id: "p2", label: "Universal adapter", done: false },
  { id: "p3", label: "Layered clothing", done: false },
  { id: "p4", label: "Comfortable shoes", done: true },
];

export const mockNotes = [
  { id: "n1", title: "Ideas for Day 3", excerpt: "Tea ceremony booking — confirm by Friday...", updatedAt: "2026-05-02" },
  { id: "n2", title: "Restaurant shortlist", excerpt: "Omakase option near hotel...", updatedAt: "2026-05-01" },
];
