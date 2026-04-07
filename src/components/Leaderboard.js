'use client';

import { useState, useEffect } from 'react';
import { getLeaderboard, submitScore } from '@/app/actions/leaderboard';
import styles from './Leaderboard.module.css';

export default function Leaderboard({ gameId, currentScore, timeElapsed }) {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchBoard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const fetchBoard = async () => {
    setLoading(true);
    const data = await getLeaderboard(gameId);
    setBoard(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const result = await submitScore(name, gameId, currentScore, timeElapsed);
    
    if (result.success) {
      setSubmitted(true);
      await fetchBoard();
    } else {
      alert(result.message || 'Error guardando puntuación');
    }
    setIsSubmitting(false);
  };

  return (
    <div className={styles.boardContainer}>
      {/* SECCIÓN DE SUBMIT SCORE */}
      {!submitted && currentScore > 0 && (
        <form className={styles.submitScoreBox} onSubmit={handleSubmit}>
          <h3 className={styles.submitTitle}>¡Guarda tu Récord Mundial!</h3>
          <p className={styles.submitDesc}>Has conseguido <strong>{currentScore}</strong> puntos. Escribe tu nombre para entrar al ranking.</p>
          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.input}
              placeholder="Ej. Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={25}
              required
            />
            <button type="submit" className={styles.submitBtn} disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? 'Guardando...' : 'Publicar Récord'}
            </button>
          </div>
        </form>
      )}

      {/* SECCIÓN DEL RANKING */}
      <h3 className={styles.boardTitle}>🏆 Top 10 Mejores Jugadores</h3>
      
      {loading ? (
        <p className={styles.loading}>Cargando Ranking Global...</p>
      ) : board.length === 0 ? (
        <p className={styles.empty}>Aún no hay puntuaciones registradas. ¡Sé el primero!</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Jugador</th>
              <th>Puntos</th>
              {gameId === 'badge' && <th>Tiempo Total</th>}
            </tr>
          </thead>
          <tbody>
            {board.map((row, idx) => (
              <tr key={idx} className={idx < 3 ? styles.top3 : ''}>
                <td className={styles.rankCol}>
                  {idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </td>
                <td className={styles.playerCol}>{row.player_name}</td>
                <td className={styles.scoreCol}>{row.score}</td>
                {gameId === 'badge' && (
                  <td className={styles.timeCol}>
                    {row.completed_in_seconds ? `${row.completed_in_seconds}s` : '--'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
