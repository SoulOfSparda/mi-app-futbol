import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer} id="main-footer">
      <div className={`container ${styles.inner}`}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            ⚽ Mi<span className={styles.accent}>Futbolito</span>Fc
          </span>
          <p className={styles.tagline}>
            Tu portal de fútbol para la Liga BetPlay, Premier League, Champions y minijuegos.
          </p>
        </div>

        <div className={styles.linksGrid}>
          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>Navegación</h4>
            <Link href="/liga/betplay" className={styles.link}>Liga BetPlay</Link>
            <Link href="/liga/premier" className={styles.link}>Premier League</Link>
            <Link href="/liga/champions-league" className={styles.link}>Champions League</Link>
            <Link href="/juegos" className={styles.link}>Minijuegos</Link>
          </div>
          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>Información</h4>
            <span className={styles.link}>Datos por TheSportsDB</span>
            <span className={styles.link}>Hecho con Next.js</span>
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>
            © {new Date().getFullYear()} MiFutbolitoFc — Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
