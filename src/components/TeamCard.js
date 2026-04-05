import Image from 'next/image';
import Link from 'next/link';
import styles from './TeamCard.module.css';

export default function TeamCard({ team }) {
  const color1 = team.strColour1 || '#1a2035';
  const color2 = team.strColour2 || '#0a0e17';

  return (
    <Link
      href={`/equipo/${team.idTeam}`}
      className={`${styles.card} animate-in`}
      id={`team-card-${team.idTeam}`}
      style={{
        '--team-color-1': color1,
        '--team-color-2': color2,
      }}
    >
      <div className={styles.glowOverlay} />

      <div className={styles.badgeWrap}>
        {team.strBadge && (
          <Image
            src={team.strBadge}
            alt={team.strTeam}
            width={72}
            height={72}
            style={{ objectFit: 'contain' }}
          />
        )}
      </div>

      <h4 className={styles.name}>{team.strTeam}</h4>

      {team.strStadium && (
        <p className={styles.stadium}>🏟️ {team.strStadium}</p>
      )}

      <div className={styles.arrow}>→</div>
    </Link>
  );
}
