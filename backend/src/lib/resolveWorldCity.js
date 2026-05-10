import { Country } from "country-state-city";
import { prisma } from "./prisma.js";
import { buildWorldKey } from "./worldCityKey.js";

/**
 * Turn a worldwide catalog pick into a DB City row (reuse by worldKey).
 */
export async function resolveCityFromWorldPick(worldCity) {
  if (!worldCity || typeof worldCity !== "object") {
    return null;
  }
  const name = typeof worldCity.name === "string" ? worldCity.name.trim() : "";
  const countryCode = typeof worldCity.countryCode === "string" ? worldCity.countryCode.trim().toUpperCase() : "";
  const stateCode = typeof worldCity.stateCode === "string" ? worldCity.stateCode.trim() : "";

  if (!name || !countryCode || countryCode.length !== 2) {
    return null;
  }

  const countryName = Country.getCountryByCode(countryCode)?.name || countryCode;
  const worldKey = buildWorldKey(countryCode, stateCode, name);

  const existing = await prisma.city.findUnique({ where: { worldKey } });
  if (existing) {
    return existing;
  }

  return prisma.city.create({
    data: {
      worldKey,
      name,
      country: countryName,
      countryCode,
      stateCode,
      tagline: "",
      emoji: "📍",
    },
  });
}
