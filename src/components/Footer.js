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
            Tu portal de fútbol para la Liga BetPlay y la Premier League.
          </p>
        </div>

        <div className={styles.linksGrid}>
          <div className={styles.linkGroup}>
            <h4 className={styles.groupTitle}>Ligas</h4>
            <Link href="/liga/betplay" className={styles.link}>Liga BetPlay</Link>
            <Link href="/liga/premier" className={styles.link}>Premier League</Link>
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
