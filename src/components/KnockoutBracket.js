'use client';

import Image from 'next/image';
import styles from './KnockoutBracket.module.css';

// Mapea el ID de ronda de la API al nombre de fase
function getPhaseName(roundId) {
  const id = parseInt(roundId);
  if (id === 32) return 'Ronda de Playoffs';
  if (id === 16) return 'Octavos de Final';
  if (id === 125) return 'Cuartos de Final';
  if (id === 150 || id === 160) return 'Semifinales';
  if (id === 200) return 'Gran Final';
  return `Ronda ${roundId}`;
}

// Orden cronológico real de las fases (de más temprana a más tardía)
const ROUND_ORDER = { 32: 1, 16: 2, 125: 3, 150: 4, 160: 5, 200: 6 };

// Agrupa partidos de ida y vuelta en "ties" (enfrentamientos)
function groupIntoTies(matches) {
  const ties = {};

  matches.forEach((match) => {
    // Identificamos la pareja por los equipos involucrados (sin importar quién es local)
    const teams = [match.idHomeTeam, match.idAwayTeam].sort().join('-');
    if (!ties[teams]) {
      ties[teams] = {
        teamA: null,
        teamB: null,
        legs: [],
      };
    }
    ties[teams].legs.push(match);
  });

  // Ordenar legs por fecha y asignar equipos de referencia
  Object.values(ties).forEach((tie) => {
    tie.legs.sort((a, b) => (a.dateEvent || '').localeCompare(b.dateEvent || ''));
    const first = tie.legs[0];
    tie.teamA = {
      id: first.idHomeTeam,
      name: first.strHomeTeam,
      badge: first.strHomeTeamBadge,
    };
    tie.teamB = {
      id: first.idAwayTeam,
      name: first.strAwayTeam,
      badge: first.strAwayTeamBadge,
    };

    // Calcular agregado
    let aggA = 0;
    let aggB = 0;
    let allPlayed = true;

    tie.legs.forEach((leg) => {
      if (leg.intHomeScore === null || leg.intAwayScore === null) {
        allPlayed = false;
        return;
      }
      const hs = parseInt(leg.intHomeScore);
      const as = parseInt(leg.intAwayScore);

      // Queremos sumar goles de teamA y teamB sin importar en qué partido fue local
      if (leg.idHomeTeam === tie.teamA.id) {
        aggA += hs;
        aggB += as;
      } else {
        aggA += as;
        aggB += hs;
      }
    });

    tie.aggA = aggA;
    tie.aggB = aggB;
    tie.allPlayed = allPlayed;
    tie.winner = allPlayed ? (aggA > aggB ? 'A' : aggB > aggA ? 'B' : null) : null;
  });

  return Object.values(ties);
}

function formatLocalDate(dateStr, timeStr) {
  if (!dateStr) return '';
  const utcTime = timeStr ? timeStr.substring(0, 5) : '00:00';
  const utcDate = new Date(`${dateStr}T${utcTime}:00Z`);
  return utcDate.toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function formatLocalTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return '';
  const utcTime = timeStr.substring(0, 5);
  const utcDate = new Date(`${dateStr}T${utcTime}:00Z`);
  return utcDate.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function KnockoutBracket({ knockoutEvents }) {
  if (!knockoutEvents || Object.keys(knockoutEvents).length === 0) return null;

  // Ordenar rondas cronológicamente usando nuestro mapa de orden
  const sortedRoundIds = Object.keys(knockoutEvents).sort(
    (a, b) => (ROUND_ORDER[a] || 99) - (ROUND_ORDER[b] || 99)
  );

  return (
    <div className={styles.bracketContainer}>
      {sortedRoundIds.map((roundId) => {
        const matches = knockoutEvents[roundId];
        const ties = groupIntoTies(matches);
        const phaseName = getPhaseName(roundId);

        return (
          <div key={roundId} className={styles.phase}>
            <h3 className={styles.phaseTitle}>{phaseName}</h3>

            <div className={styles.tiesGrid}>
              {ties.map((tie, tieIdx) => (
                <div
                  key={tieIdx}
                  className={`${styles.tieCard} animate-in`}
                  style={{ animationDelay: `${tieIdx * 80}ms` }}
                >
                  {/* Header del enfrentamiento */}
                  <div className={styles.tieHeader}>
                    <div className={styles.tieTeam}>
                      {tie.teamA.badge && (
                        <Image
                          src={tie.teamA.badge}
                          alt={tie.teamA.name}
                          width={28}
                          height={28}
                          style={{ objectFit: 'contain' }}
                        />
                      )}
                      <span className={`${styles.teamName} ${tie.winner === 'A' ? styles.winner : ''}`}>
                        {tie.teamA.name}
                      </span>
                    </div>

                    <div className={styles.aggScore}>
                      {tie.allPlayed ? (
                        <>
                          <span className={tie.winner === 'A' ? styles.winScore : ''}>{tie.aggA}</span>
                          <span className={styles.aggSep}>-</span>
                          <span className={tie.winner === 'B' ? styles.winScore : ''}>{tie.aggB}</span>
                        </>
                      ) : (
                        <span className={styles.vs}>VS</span>
                      )}
                    </div>

                    <div className={`${styles.tieTeam} ${styles.tieTeamRight}`}>
                      <span className={`${styles.teamName} ${tie.winner === 'B' ? styles.winner : ''}`}>
                        {tie.teamB.name}
                      </span>
                      {tie.teamB.badge && (
                        <Image
                          src={tie.teamB.badge}
                          alt={tie.teamB.name}
                          width={28}
                          height={28}
                          style={{ objectFit: 'contain' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Partidos individuales (ida y vuelta) */}
                  <div className={styles.legsContainer}>
                    {tie.legs.map((leg, legIdx) => {
                      const isPlayed = leg.intHomeScore !== null && leg.intAwayScore !== null;
                      return (
                        <div key={leg.idEvent} className={styles.leg}>
                          <span className={styles.legLabel}>
                            {tie.legs.length > 1 ? (legIdx === 0 ? 'Ida' : 'Vuelta') : 'Partido único'}
                          </span>
                          <span className={styles.legDate}>
                            {formatLocalDate(leg.dateEvent, leg.strTime)}
                            {!isPlayed && leg.strTime && (
                              <span className={styles.legTime}> {formatLocalTime(leg.dateEvent, leg.strTime)}</span>
                            )}
                          </span>
                          <div className={styles.legScore}>
                            <span className={styles.legTeam}>{leg.strHomeTeam}</span>
                            {isPlayed ? (
                              <span className={styles.legResult}>
                                {leg.intHomeScore} - {leg.intAwayScore}
                              </span>
                            ) : (
                              <span className={styles.legPending}>vs</span>
                            )}
                            <span className={styles.legTeam}>{leg.strAwayTeam}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Indicador de ganador */}
                  {tie.allPlayed && tie.winner && (
                    <div className={styles.winnerBadge}>
                      🏆 {tie.winner === 'A' ? tie.teamA.name : tie.teamB.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
