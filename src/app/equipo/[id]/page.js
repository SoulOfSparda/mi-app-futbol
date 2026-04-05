import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  getTeamDetails,
  getTeamPlayers,
  getTeamLastEvents,
  getTeamNextEvents,
} from '@/lib/api';
import MatchCard from '@/components/MatchCard';
import PlayerCard from '@/components/PlayerCard';
import styles from './page.module.css';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const team = await getTeamDetails(id).catch(() => null);
  if (!team) return { title: 'Equipo no encontrado' };
  return {
    title: `${team.strTeam} — MiFutbolitoFc`,
    description: `Información, jugadores y resultados de ${team.strTeam}.`,
  };
}

export default async function TeamPage({ params }) {
  const { id } = await params;
  const [team, players, lastEvents, nextEvents] = await Promise.all([
    getTeamDetails(id).catch(() => null),
    getTeamPlayers(id).catch(() => []),
    getTeamLastEvents(id).catch(() => []),
    getTeamNextEvents(id).catch(() => []),
  ]);

  if (!team) notFound();

  const color1 = team.strColour1 || '#1a2035';
  const descES = team.strDescriptionES || team.strDescriptionEN || '';

  return (
    <>
      {/* Hero Header */}
      <section
        className={styles.hero}
        style={{ '--team-color': color1 }}
      >
        <div className={styles.heroBg}>
          {team.strFanart1 && (
            <Image
              src={team.strFanart1}
              alt={team.strTeam}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          )}
          <div className={styles.heroOverlay} />
        </div>

        <div className={`container ${styles.heroContent}`}>
          <div className={`${styles.badgeBox} animate-in`}>
            {team.strBadge && (
              <Image
                src={team.strBadge}
                alt={team.strTeam}
                width={120}
                height={120}
                style={{ objectFit: 'contain' }}
              />
            )}
          </div>

          <div className={`${styles.heroInfo} animate-in animate-in-delay-1`}>
            <h1 className={styles.teamName}>{team.strTeam}</h1>
            <div className={styles.metaRow}>
              {team.intFormedYear && (
                <span className={styles.metaItem}>
                  📅 Fundado en {team.intFormedYear}
                </span>
              )}
              {team.strStadium && (
                <span className={styles.metaItem}>
                  🏟️ {team.strStadium}{' '}
                  {team.intStadiumCapacity &&
                    `(${parseInt(team.intStadiumCapacity).toLocaleString()} asientos)`}
                </span>
              )}
              {team.strLocation && (
                <span className={styles.metaItem}>
                  📍 {team.strLocation}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Descripción */}
        {descES && (
          <section className={`section ${styles.descSection}`}>
            <div className="section-title">
              <h2>Acerca del Club</h2>
            </div>
            <p className={styles.desc}>
              {descES.length > 800 ? descES.substring(0, 800) + '...' : descES}
            </p>
          </section>
        )}

        {/* Últimos Resultados */}
        {lastEvents.length > 0 && (
          <section className="section">
            <div className="section-title">
              <h2>Últimos Resultados</h2>
            </div>
            <div className={styles.matchGrid}>
              {lastEvents.slice(0, 5).map((event, i) => (
                <div key={event.idEvent} style={{ animationDelay: `${i * 80}ms` }}>
                  <MatchCard event={event} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Próximos Partidos */}
        {nextEvents.length > 0 && (
          <section className="section">
            <div className="section-title">
              <h2>Próximos Partidos</h2>
            </div>
            <div className={styles.matchGrid}>
              {nextEvents.slice(0, 5).map((event, i) => (
                <div key={event.idEvent} style={{ animationDelay: `${i * 80}ms` }}>
                  <MatchCard event={event} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Plantilla */}
        {players.length > 0 && (
          <section className="section">
            <div className="section-title">
              <h2>Plantilla</h2>
            </div>
            <div className={styles.playersGrid}>
              {players.map((player, i) => (
                <div
                  key={player.idPlayer}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <PlayerCard player={player} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Redes Sociales */}
        <section className="section">
          <div className="section-title">
            <h2>Redes Sociales</h2>
          </div>
          <div className={styles.socialRow}>
            {team.strWebsite && (
              <a
                href={`https://${team.strWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                🌐 Sitio Web
              </a>
            )}
            {team.strFacebook && (
              <a
                href={`https://${team.strFacebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                📘 Facebook
              </a>
            )}
            {team.strTwitter && (
              <a
                href={`https://${team.strTwitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                🐦 Twitter
              </a>
            )}
            {team.strInstagram && (
              <a
                href={`https://${team.strInstagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                📸 Instagram
              </a>
            )}
            {team.strYoutube && (
              <a
                href={`https://${team.strYoutube}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
              >
                🎬 YouTube
              </a>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
