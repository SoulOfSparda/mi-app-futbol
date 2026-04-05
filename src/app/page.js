import Link from 'next/link';
import {
  LEAGUES,
  getStandings,
  getLastLeagueEvents,
  getNextLeagueEvents,
} from '@/lib/api';
import MatchCard from '@/components/MatchCard';
import StandingsTable from '@/components/StandingsTable';
import styles from './page.module.css';

export default async function HomePage() {
  const [
    betplayStandings,
    premierStandings,
    betplayLastEvents,
    premierLastEvents,
    betplayNextEvents,
    premierNextEvents,
  ] = await Promise.all([
    getStandings(LEAGUES.betplay.id, LEAGUES.betplay.season).catch(() => []),
    getStandings(LEAGUES.premier.id, LEAGUES.premier.season).catch(() => []),
    getLastLeagueEvents(LEAGUES.betplay).catch(() => []),
    getLastLeagueEvents(LEAGUES.premier).catch(() => []),
    getNextLeagueEvents(LEAGUES.betplay).catch(() => []),
    getNextLeagueEvents(LEAGUES.premier).catch(() => []),
  ]);

  const lastEvents = [
    ...betplayLastEvents.slice(0, 5),
    ...premierLastEvents.slice(0, 5),
  ];

  const nextEvents = [
    ...betplayNextEvents.slice(0, 5),
    ...premierNextEvents.slice(0, 5),
  ];

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroBadge}>
            <span className="badge">⚡ En vivo con TheSportsDB</span>
          </div>
          <h1 className={`${styles.heroTitle} animate-in`}>
            Mi<span className="accent-text">Futbolito</span>Fc
          </h1>
          <p className={`${styles.heroSub} animate-in animate-in-delay-1`}>
            Resultados, posiciones, equipos y jugadores de la Liga BetPlay y la
            Premier League. Todo en un solo lugar.
          </p>
          <div className={`${styles.heroActions} animate-in animate-in-delay-2`}>
            <Link href="/liga/betplay" className={styles.btnPrimary} id="hero-btn-betplay">
              🇨🇴 Liga BetPlay
            </Link>
            <Link href="/liga/premier" className={styles.btnSecondary} id="hero-btn-premier">
              🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League
            </Link>
          </div>
        </div>
      </section>

      {/* Últimos Resultados */}
      {lastEvents.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-title">
              <h2>Últimos Resultados</h2>
            </div>
            <div className={styles.matchGrid}>
              {lastEvents.map((event, i) => (
                <div
                  key={event.idEvent}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
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
              {nextEvents.map((event, i) => (
                <div
                  key={event.idEvent}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <MatchCard event={event} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tablas de Posiciones */}
      <section className="section">
        <div className="container">
          <div className="section-title">
            <h2>Tablas de Posiciones</h2>
          </div>
          <div className={styles.standingsGrid}>
            {/* BetPlay */}
            <div className={`${styles.standingsBlock} animate-in`}>
              <div className={styles.standingsHeader}>
                <h3>🇨🇴 Liga BetPlay</h3>
                <Link href="/liga/betplay" className={styles.viewAll}>
                  Ver completa →
                </Link>
              </div>
              {betplayStandings.length > 0 ? (
                <StandingsTable standings={betplayStandings} compact />
              ) : (
                <p className={styles.noData}>
                  Tabla no disponible en este momento.
                </p>
              )}
            </div>

            {/* Premier League */}
            <div
              className={`${styles.standingsBlock} animate-in animate-in-delay-2`}
            >
              <div className={styles.standingsHeader}>
                <h3>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League</h3>
                <Link href="/liga/premier" className={styles.viewAll}>
                  Ver completa →
                </Link>
              </div>
              {premierStandings.length > 0 ? (
                <StandingsTable standings={premierStandings} compact />
              ) : (
                <p className={styles.noData}>
                  Tabla no disponible en este momento.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
