const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

/**
 * Ligas soportadas.
 * - apiName: nombre exacto para búsqueda de equipos
 * - season: formato de temporada que usa TheSportsDB
 * - totalRounds: rondas máximas en la temporada
 */
export const LEAGUES = {
  betplay: {
    id: '4497',
    name: 'Liga BetPlay',
    slug: 'betplay',
    apiName: 'Colombia Categoría Primera A',
    season: '2026',
    totalRounds: 20,
  },
  premier: {
    id: '4328',
    name: 'Premier League',
    slug: 'premier',
    apiName: 'English Premier League',
    season: '2025-2026',
    totalRounds: 38,
  },
  champions: {
    id: '4480',
    name: 'Champions League',
    slug: 'champions-league',
    apiName: 'UEFA Champions League',
    season: '2025-2026',
    totalRounds: 15,
  },
};

export function getLeagueBySlug(slug) {
  return Object.values(LEAGUES).find((l) => l.slug === slug) || null;
}

export function getLeagueById(id) {
  return Object.values(LEAGUES).find((l) => l.id === id) || null;
}

// --- Base fetch ---

async function fetchAPI(endpoint) {
  const res = await fetch(`${BASE_URL}/${endpoint}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

/**
 * Traduce texto de inglés a español usando la API gratuita de Google Translate.
 * Se usa como fallback cuando la API no provee versión en español.
 */
export async function translateText(text) {
  if (!text) return '';
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(text)}`;
    // Cacheamos la traducción indefinidamente a menos que revalide Next.js
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) return text;
    const data = await res.json();
    return data[0].map(item => item[0]).join('');
  } catch (error) {
    return text; // Fallback al texto original si falla la traducción
  }
}

// --- Teams ---

export async function getTeamsByLeague(leagueName) {
  const data = await fetchAPI(
    `search_all_teams.php?l=${encodeURIComponent(leagueName)}`
  );
  return data.teams || [];
}

// --- Standings ---
// Nota: la API free (key 3) solo devuelve los top 5 equipos.
// Usamos ese dato e informamos al usuario.

export async function getStandings(leagueId, season) {
  const seasonParam = season ? `&s=${season}` : '';
  const data = await fetchAPI(`lookuptable.php?l=${leagueId}${seasonParam}`);
  return data.table || [];
}

// --- Events by round (CONFIABLE — correcta para primera división) ---

export async function getEventsByRound(leagueId, round, season) {
  const data = await fetchAPI(
    `eventsround.php?id=${leagueId}&r=${round}&s=${season}`
  );
  return data.events || [];
}

/**
 * Busca la ronda actual/reciente de una liga.
 * Recorre rondas de atrás hacia adelante buscando la última con resultados.
 * Devuelve { lastPlayedRound, nextRound }
 */
async function findCurrentRounds(leagueId, season, totalRounds) {
  // Buscamos desde la ronda más alta hacia atrás
  for (let r = totalRounds; r >= 1; r--) {
    try {
      const events = await getEventsByRound(leagueId, r, season);
      if (!events.length) continue;

      const played = events.filter((e) => e.intHomeScore !== null);
      const unplayed = events.filter((e) => e.intHomeScore === null);

      // Si hay algunos jugados y algunos sin jugar, esta es la ronda actual
      if (played.length > 0 && unplayed.length > 0) {
        return { lastPlayedRound: r, nextRound: r };
      }

      // Si todos están jugados, esta fue la última ronda completada
      if (played.length > 0 && unplayed.length === 0) {
        return { lastPlayedRound: r, nextRound: Math.min(r + 1, totalRounds) };
      }
    } catch {
      continue;
    }
  }
  return { lastPlayedRound: 1, nextRound: 1 };
}

/**
 * Obtiene los últimos resultados de la liga (partidos ya jugados de primera división).
 * Usa eventsround que SÍ devuelve datos correctos de la liga indicada.
 */
export async function getLastLeagueEvents(league) {
  const { lastPlayedRound } = await findCurrentRounds(
    league.id,
    league.season,
    league.totalRounds
  );

  // Traemos la ronda actual y la anterior para tener suficientes resultados
  const [currentRoundEvents, prevRoundEvents] = await Promise.all([
    getEventsByRound(league.id, lastPlayedRound, league.season).catch(() => []),
    lastPlayedRound > 1
      ? getEventsByRound(league.id, lastPlayedRound - 1, league.season).catch(
          () => []
        )
      : Promise.resolve([]),
  ]);

  // Filtramos solo los ya jugados y ordenamos por fecha DESC
  const allEvents = [...currentRoundEvents, ...prevRoundEvents]
    .filter((e) => e.intHomeScore !== null)
    .sort((a, b) => (b.dateEvent || '').localeCompare(a.dateEvent || ''));

  return allEvents;
}

/**
 * Obtiene los próximos partidos de la liga (aún no jugados, primera división).
 */
export async function getNextLeagueEvents(league) {
  const { nextRound } = await findCurrentRounds(
    league.id,
    league.season,
    league.totalRounds
  );

  // Traemos ronda actual y siguiente
  const [currentRoundEvents, nextRoundEvents] = await Promise.all([
    getEventsByRound(league.id, nextRound, league.season).catch(() => []),
    nextRound < league.totalRounds
      ? getEventsByRound(league.id, nextRound + 1, league.season).catch(
          () => []
        )
      : Promise.resolve([]),
  ]);

  // Filtramos solo los NO jugados y ordenamos por fecha ASC
  const allEvents = [...currentRoundEvents, ...nextRoundEvents]
    .filter((e) => e.intHomeScore === null)
    .sort((a, b) => (a.dateEvent || '').localeCompare(b.dateEvent || ''));

  return allEvents;
}

// --- Team detail ---

export async function getTeamDetails(teamId) {
  // Nota: En la API gratuita (key: 3), el endpoint lookupteam.php siempre
  // devuelve los datos del Arsenal ignorando el ID. Para solucionarlo,
  // cargamos los equipos de nuestras ligas y buscamos el que coincida.
  const [betplayTeams, premierTeams] = await Promise.all([
    getTeamsByLeague(LEAGUES.betplay.apiName),
    getTeamsByLeague(LEAGUES.premier.apiName),
  ]);

  const allTeams = [...betplayTeams, ...premierTeams];
  const team = allTeams.find((t) => t.idTeam === teamId.toString());
  
  return team || null;
}

// --- Players ---

export async function getTeamPlayers(teamId) {
  const data = await fetchAPI(`lookup_all_players.php?id=${teamId}`);
  return data.player || [];
}

export async function getPlayerDetails(playerId) {
  const data = await fetchAPI(`lookupplayer.php?id=${playerId}`);
  return data.players?.[0] || null;
}

// --- League details ---

export async function getLeagueDetails(leagueId) {
  const data = await fetchAPI(`lookupleague.php?id=${leagueId}`);
  return data.leagues?.[0] || null;
}

// --- Team events (filtrados por liga) ---

export async function getTeamLastEvents(teamId, leagueId) {
  const data = await fetchAPI(`eventslast.php?id=${teamId}`);
  const results = data.results || [];
  // Filtrar solo partidos de la liga correcta si se provee
  if (leagueId) {
    return results.filter((e) => e.idLeague === leagueId);
  }
  return results;
}

export async function getTeamNextEvents(teamId) {
  // Nota: En la API gratuita, el endpoint eventsnext.php siempre devuelve
  // partidos del Bolton Wanderers ignorando el ID. La solución es obtener
  // la liga del equipo, pedir los próximos partidos de la liga y filtrar.
  const team = await getTeamDetails(teamId);
  if (!team) return [];

  const league = getLeagueById(team.idLeague);
  if (!league) return [];

  const leagueEvents = await getNextLeagueEvents(league);
  return leagueEvents.filter(
    (e) => e.idTeamHome === teamId.toString() || e.idTeamAway === teamId.toString()
  );
}

// --- Search ---

export async function searchTeams(query) {
  const data = await fetchAPI(
    `searchteams.php?t=${encodeURIComponent(query)}`
  );
  return data.teams || [];
}
