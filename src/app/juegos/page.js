import { getTeamsByLeague } from '@/lib/api';
import GamesClient from './GamesClient';
import styles from './page.module.css';

export const metadata = {
  title: 'Juegos — MiFutbolitoFc',
  description: 'Pon a prueba tus conocimientos de fútbol con nuestra trivia de la Champions League y el juego de adivinar escudos.',
};

export default async function JuegosPage() {
  // Cargamos los equipos de Champions para el juego de escudos
  const teams = await getTeamsByLeague('UEFA Champions League').catch(() => []);

  return (
    <div className={styles.page}>
      <section className={styles.header}>
        <div className="container">
          <h1 className={`${styles.title} animate-in`}>🎮 Zona de Juegos</h1>
          <p className={`${styles.subtitle} animate-in animate-in-delay-1`}>
            Diviértete y pon a prueba tus conocimientos sobre la Champions League
          </p>
        </div>
      </section>

      <GamesClient teams={teams} />
    </div>
  );
}
