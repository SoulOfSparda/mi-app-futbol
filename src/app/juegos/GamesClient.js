'use client';

import { useState } from 'react';
import TriviaGame from '@/components/TriviaGame';
import BadgeGame from '@/components/BadgeGame';
import styles from './page.module.css';

export default function GamesClient({ teams }) {
  const [activeGame, setActiveGame] = useState(null);

  if (activeGame === 'trivia') {
    return (
      <section className="section">
        <div className="container">
          <button className={styles.backBtn} onClick={() => setActiveGame(null)}>
            ← Volver a Juegos
          </button>
          <TriviaGame />
        </div>
      </section>
    );
  }

  if (activeGame === 'badge') {
    return (
      <section className="section">
        <div className="container">
          <button className={styles.backBtn} onClick={() => setActiveGame(null)}>
            ← Volver a Juegos
          </button>
          <BadgeGame teams={teams} />
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <div className={styles.gamesGrid}>
          {/* Trivia Card */}
          <div className={`${styles.gameCard} animate-in`} onClick={() => setActiveGame('trivia')}>
            <div className={styles.gameIcon}>🏆</div>
            <div className={styles.gameCardContent}>
              <h2 className={styles.gameTitle}>Maestro de Champions</h2>
              <p className={styles.gameDesc}>
                Trivia histórica con 15 preguntas sobre la UEFA Champions League.
                ¿Podrás conseguir el rango de Leyenda Absoluta?
              </p>
              <div className={styles.gameTags}>
                <span className={styles.tag}>📝 10 preguntas</span>
                <span className={styles.tag}>⏱️ Sin límite</span>
                <span className={styles.tag}>🏅 Ranking</span>
              </div>
            </div>
            <div className={styles.playBadge}>JUGAR →</div>
          </div>

          {/* Badge Card */}
          <div className={`${styles.gameCard} ${styles.gameCardPurple} animate-in animate-in-delay-1`} onClick={() => setActiveGame('badge')}>
            <div className={styles.gameIcon}>🛡️</div>
            <div className={styles.gameCardContent}>
              <h2 className={styles.gameTitle}>Adivina el Escudo</h2>
              <p className={styles.gameDesc}>
                Te mostramos el escudo de un equipo oculto en las sombras. 
                Tienes 10 segundos para adivinar de cuál club se trata.
              </p>
              <div className={styles.gameTags}>
                <span className={styles.tag}>🛡️ 10 rondas</span>
                <span className={styles.tag}>⏱️ 10 seg c/u</span>
                <span className={styles.tag}>🔮 Sombras</span>
              </div>
            </div>
            <div className={styles.playBadge}>JUGAR →</div>
          </div>
        </div>
      </div>
    </section>
  );
}
