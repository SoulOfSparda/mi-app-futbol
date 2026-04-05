import Image from 'next/image';
import Link from 'next/link';
import styles from './PlayerCard.module.css';

export default function PlayerCard({ player }) {
  const thumbSrc = player.strThumb || player.strCutout || null;

  return (
    <Link
      href={`/jugador/${player.idPlayer}`}
      className={`${styles.card} animate-in`}
      id={`player-${player.idPlayer}`}
    >
      <div className={styles.imageWrap}>
        {thumbSrc ? (
          <Image
            src={thumbSrc}
            alt={player.strPlayer}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className={styles.placeholder}>👤</div>
        )}
        <div className={styles.overlay} />
      </div>

      <div className={styles.info}>
        <h4 className={styles.name}>{player.strPlayer}</h4>
        <div className={styles.meta}>
          {player.strPosition && (
            <span className={styles.position}>{player.strPosition}</span>
          )}
          {player.strNationality && (
            <span className={styles.nationality}>{player.strNationality}</span>
          )}
        </div>
      </div>

      {player.strNumber && (
        <span className={styles.number}>{player.strNumber}</span>
      )}
    </Link>
  );
}
