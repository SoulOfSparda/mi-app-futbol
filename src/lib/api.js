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
 * Busca las rondas actuales/recientes de una liga.
 * Retorna las rondas adyacentes seguras contemplando los saltos de
 * la Champions League (fases eliminatorias: 125, 150, 160, 200, 400).
 */
async function findCurrentRounds(leagueId, season, totalRounds) {
  let roundsToCheck = [];
  if (leagueId === '4480') {
    // Añadimos posibles IDs de torneos eliminatorios. (Eliminamos 400 que es ronda clasificatoria).
    roundsToCheck = [200, 160, 150, 125, 100, 90, 80, 60, 50];
    for (let i = totalRounds; i >= 1; i--) roundsToCheck.push(i);
  } else {
    for (let i = totalRounds; i >= 1; i--) roundsToCheck.push(i);
  }

  let validRoundsFound = [];

  // Recorremos buscando las rondas que EXISTAN realmente y contengan información
  for (let i = 0; i < roundsToCheck.length; i++) {
    const r = roundsToCheck[i];
    try {
      const events = await getEventsByRound(leagueId, r, season);
      if (!events.length) continue;

      // Ignorar rondas clasificatorias previas a septiembre (para no mostrar partidos de Julio/Agosto)
      if (events[0].dateEvent) {
        const year = season.substring(0, 4);
        if (events[0].dateEvent < `${year}-09-01`) {
          continue;
        }
      }

      validRoundsFound.push({
        r,
        played: events.some((e) => e.intHomeScore !== null),
        unplayed: events.some((e) => e.intHomeScore === null),
      });

      // Detener búsqueda tras encontrar suficiente historial
      if (validRoundsFound.length >= 6) break;
    } catch {
      continue;
    }
  }

  // Por si no encontramos nada
  if (validRoundsFound.length === 0) {
    return { lastPlayedRound: 1, prevRound: 1, nextRound: 1, nextNextRound: 1 };
  }

  // validRoundsFound está ordenado de más reciente a más antiguo cronológicamente
  const lastPlayedIdx = validRoundsFound.findIndex((v) => v.played);

  if (lastPlayedIdx !== -1) {
    // Si la ronda a medias tiene unplayed, también es nextRound
    const roundHasUnplayed = validRoundsFound[lastPlayedIdx].unplayed;
    
    const lastPlayedRound = validRoundsFound[lastPlayedIdx].r;
    const prevRound = validRoundsFound[lastPlayedIdx + 1]
      ? validRoundsFound[lastPlayedIdx + 1].r
      : lastPlayedRound;

    let nextRound, nextNextRound;

    if (roundHasUnplayed) {
      nextRound = lastPlayedRound;
      nextNextRound = lastPlayedIdx > 0 ? validRoundsFound[lastPlayedIdx - 1].r : nextRound;
    } else {
      nextRound = lastPlayedIdx > 0 ? validRoundsFound[lastPlayedIdx - 1].r : lastPlayedRound;
      // nextNextRound es la ronda previa a nextRound en el array
      nextNextRound = lastPlayedIdx > 1 ? validRoundsFound[lastPlayedIdx - 2].r : nextRound;
    }

    return { lastPlayedRound, prevRound, nextRound, nextNextRound };
  } else {
    // Ningún partido jugado aún en toda la temporada (ej. inicio de septiembre)
    const latestRoundIdx = validRoundsFound.length - 1;
    const r = validRoundsFound[latestRoundIdx].r;
    return {
      lastPlayedRound: r,
      prevRound: r,
      nextRound: r,
      nextNextRound: validRoundsFound.length > 1 ? validRoundsFound[latestRoundIdx - 1].r : r,
    };
  }
}

export async function getLastLeagueEvents(league) {
  const { lastPlayedRound, prevRound } = await findCurrentRounds(
    league.id,
    league.season,
    league.totalRounds
  );

  const [currentEvents, prevEvents] = await Promise.all([
    getEventsByRound(league.id, lastPlayedRound, league.season).catch(() => []),
    prevRound !== lastPlayedRound
      ? getEventsByRound(league.id, prevRound, league.season).catch(() => [])
      : Promise.resolve([]),
  ]);

  const allEvents = [...currentEvents, ...prevEvents]
    .filter((e) => e.intHomeScore !== null)
    .sort((a, b) => (b.dateEvent || '').localeCompare(a.dateEvent || ''));

  return allEvents;
}

export async function getNextLeagueEvents(league) {
  const { nextRound, nextNextRound } = await findCurrentRounds(
    league.id,
    league.season,
    league.totalRounds
  );

  const [currentEvents, nextEvents] = await Promise.all([
    getEventsByRound(league.id, nextRound, league.season).catch(() => []),
    nextNextRound !== nextRound
      ? getEventsByRound(league.id, nextNextRound, league.season).catch(() => [])
      : Promise.resolve([]),
  ]);

  const allEvents = [...currentEvents, ...nextEvents]
    .filter((e) => e.intHomeScore === null)
    .sort((a, b) => (a.dateEvent || '').localeCompare(b.dateEvent || ''));

  return allEvents;
}

// --- Team detail ---

export async function getTeamDetails(teamId) {
  // Nota: En la API gratuita (key: 3), el endpoint lookupteam.php siempre
  // devuelve los datos del Arsenal ignorando el ID. Para solucionarlo,
  // cargamos los equipos de nuestras ligas y buscamos el que coincida.
  
  // Obtenemos todos los equipos de todas las ligas configuradas
  const leaguesPromises = Object.values(LEAGUES).map((league) => 
    getTeamsByLeague(league.apiName)
  );
  
  const allLeaguesTeams = await Promise.all(leaguesPromises);
  const allTeams = allLeaguesTeams.flat();
  
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
