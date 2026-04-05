import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  getLeagueBySlug,
  getLeagueDetails,
  getStandings,
  getLastLeagueEvents,
  getNextLeagueEvents,
  getTeamsByLeague,
} from '@/lib/api';
import StandingsTable from '@/components/StandingsTable';
import MatchCard from '@/components/MatchCard';
import TeamCard from '@/components/TeamCard';
import styles from './page.module.css';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const league = getLeagueBySlug(id);
  if (!league) return { title: 'Liga no encontrada' };
  return {
    title: `${league.name} — MiFutbolitoFc`,
    description: `Tabla de posiciones, resultados y equipos de la ${league.name}.`,
  };
}

export default async function LeaguePage({ params }) {
  const { id } = await params;
  const league = getLeagueBySlug(id);
  if (!league) notFound();

  const [details, standings, lastEvents, nextEvents, teams] =
    await Promise.all([
      getLeagueDetails(league.id).catch(() => null),
      getStandings(league.id, league.season).catch(() => []),
      getLastLeagueEvents(league).catch(() => []),
      getNextLeagueEvents(league).catch(() => []),
      getTeamsByLeague(league.apiName).catch(() => []),
    ]);

  return (
    <>
      {/* Header */}
      <section className={styles.header}>
        <div className={styles.headerBg}>
          {details?.strFanart1 && (
            <Image
              src={details.strFanart1}
              alt={league.name}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          )}
          <div className={styles.headerOverlay} />
        </div>

        <div className={`container ${styles.headerContent}`}>
          {details?.strBadge && (
            <div className={`${styles.leagueBadge} animate-in`}>
              <Image
                src={details.strBadge}
                alt={league.name}
                width={80}
                height={80}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          <h1 className={`${styles.leagueTitle} animate-in animate-in-delay-1`}>
            {league.name}
          </h1>
          {(details?.strDescriptionES || details?.strDescriptionEN) && (
            <p className={`${styles.leagueDesc} animate-in animate-in-delay-2`}>
              {(details.strDescriptionES || details.strDescriptionEN).substring(0, 250)}...
            </p>
          )}
        </div>
      </section>

      {/* Tabla de Posiciones */}
      {standings.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>Tabla de Posiciones</h2>
            </div>
            <StandingsTable standings={standings} />
          </div>
        </section>
      )}

      {/* Últimos Resultados */}
      {lastEvents.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>Últimos Resultados</h2>
            </div>
            <div className={styles.matchGrid}>
              {lastEvents.slice(0, 8).map((event, i) => (
                <div key={event.idEvent} style={{ animationDelay: `${i * 60}ms` }}>
                  <MatchCard event={event} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Próximos Partidos */}
      {nextEvents.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>Próximos Partidos</h2>
            </div>
            <div className={styles.matchGrid}>
              {nextEvents.slice(0, 8).map((event, i) => (
                <div key={event.idEvent} style={{ animationDelay: `${i * 60}ms` }}>
                  <MatchCard event={event} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Equipos */}
      {teams.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>Equipos</h2>
            </div>
            <div className={styles.teamsGrid}>
              {teams.map((team, i) => (
                <div key={team.idTeam} style={{ animationDelay: `${i * 50}ms` }}>
                  <TeamCard team={team} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
