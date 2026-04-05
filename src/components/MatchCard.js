import Image from 'next/image';
import styles from './MatchCard.module.css';

export default function MatchCard({ event }) {
  const homeScore = event.intHomeScore;
  const awayScore = event.intAwayScore;
  const isFinished = homeScore !== null && awayScore !== null;
  const dateStr = event.dateEvent
    ? new Date(event.dateEvent + 'T00:00:00').toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
      })
    : '';
  const timeStr = event.strTime
    ? event.strTime.substring(0, 5)
    : '';

  return (
    <article className={`${styles.card} animate-in`} id={`match-${event.idEvent}`}>
      <div className={styles.meta}>
        <span className={styles.date}>{dateStr}</span>
        {!isFinished && timeStr && (
          <span className={styles.time}>{timeStr}</span>
        )}
        {isFinished && <span className={styles.badge}>FT</span>}
      </div>

      <div className={styles.teams}>
        <div className={styles.team}>
          {event.strHomeTeamBadge && (
            <div className={styles.badgeWrap}>
              <Image
                src={event.strHomeTeamBadge}
                alt={event.strHomeTeam}
                width={40}
                height={40}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          <span className={styles.teamName}>{event.strHomeTeam}</span>
        </div>

        <div className={styles.score}>
          {isFinished ? (
            <>
              <span className={styles.scoreNum}>{homeScore}</span>
              <span className={styles.scoreSep}>-</span>
              <span className={styles.scoreNum}>{awayScore}</span>
            </>
          ) : (
            <span className={styles.vs}>VS</span>
          )}
        </div>

        <div className={`${styles.team} ${styles.teamAway}`}>
          {event.strAwayTeamBadge && (
            <div className={styles.badgeWrap}>
              <Image
                src={event.strAwayTeamBadge}
                alt={event.strAwayTeam}
                width={40}
                height={40}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}
          <span className={styles.teamName}>{event.strAwayTeam}</span>
        </div>
      </div>
    </article>
  );
}
