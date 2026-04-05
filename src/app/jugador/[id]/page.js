import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPlayerDetails, translateText } from '@/lib/api';
import styles from './page.module.css';

export async function generateMetadata({ params }) {
  const { id } = await params;
  const player = await getPlayerDetails(id).catch(() => null);
  if (!player) return { title: 'Jugador no encontrado' };
  return {
    title: `${player.strPlayer} — MiFutbolitoFc`,
    description: `Perfil de ${player.strPlayer}. Posición: ${player.strPosition || 'N/A'}.`,
  };
}

export default async function PlayerPage({ params }) {
  const { id } = await params;
  const player = await getPlayerDetails(id).catch(() => null);

  if (!player) notFound();

  const heroImg = player.strFanart1 || player.strThumb || null;
  const cutout = player.strCutout || player.strThumb || null;
  let descES = player.strDescriptionES;
  if (!descES && player.strDescriptionEN) {
    descES = await translateText(player.strDescriptionEN);
  }

  const stats = [
    { label: 'Posición', value: player.strPosition },
    { label: 'Nacionalidad', value: player.strNationality },
    { label: 'Nacimiento', value: player.dateBorn },
    { label: 'Altura', value: player.strHeight },
    { label: 'Peso', value: player.strWeight },
    { label: 'Equipo', value: player.strTeam },
    { label: 'Dorsal', value: player.strNumber },
    { label: 'Pierna', value: player.strSide },
  ].filter((s) => s.value);

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          {heroImg && (
            <Image
              src={heroImg}
              alt={player.strPlayer}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          )}
          <div className={styles.heroOverlay} />
        </div>

        <div className={`container ${styles.heroContent}`}>
          {cutout && (
            <div className={`${styles.cutout} animate-in`}>
              <Image
                src={cutout}
                alt={player.strPlayer}
                width={280}
                height={360}
                style={{ objectFit: 'contain' }}
              />
            </div>
          )}

          <div className={`${styles.heroInfo} animate-in animate-in-delay-1`}>
            {player.strNumber && (
              <span className={styles.heroNumber}>
                {player.strNumber}
              </span>
            )}
            <h1 className={styles.playerName}>{player.strPlayer}</h1>
            {player.strPosition && (
              <span className="badge">{player.strPosition}</span>
            )}
            {player.strTeam && (
              <p className={styles.teamLink}>
                Equipo actual:{' '}
                <Link
                  href={`/equipo/${player.idTeam}`}
                  className={styles.teamAnchor}
                >
                  {player.strTeam}
                </Link>
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="container">
        {/* Stats */}
        {stats.length > 0 && (
          <section className="section">
            <div className="section-title">
              <h2>Datos del Jugador</h2>
            </div>
            <div className={styles.statsGrid}>
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`${styles.statCard} animate-in`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <span className={styles.statLabel}>{stat.label}</span>
                  <span className={styles.statValue}>{stat.value}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Biografía */}
        {descES && (
          <section className="section">
            <div className="section-title">
              <h2>Biografía</h2>
            </div>
            <div className={styles.bioCard}>
              <p className={styles.bio}>
                {descES.length > 1200
                  ? descES.substring(0, 1200) + '...'
                  : descES}
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
