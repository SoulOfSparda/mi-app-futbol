'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Leaderboard from './Leaderboard';
import styles from './BadgeGame.module.css';

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function BadgeGame({ teams }) {
  const [gameState, setGameState] = useState('idle');
  const [rounds, setRounds] = useState([]);
  const [currentR, setCurrentR] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(10);
  const [bestScore, setBestScore] = useState(0);
  
  const totalTimeSpent = useRef(0);
  const [finalTime, setFinalTime] = useState(0);

  // Generar rondas de juego
  const generateRounds = useCallback(() => {
    const validTeams = teams.filter((t) => t.strBadge);
    if (validTeams.length < 4) return [];

    const shuffled = shuffle(validTeams);
    const gameRounds = [];

    for (let i = 0; i < Math.min(10, Math.floor(validTeams.length / 4)); i++) {
      const correctIdx = i * 4;
      const correctTeam = shuffled[correctIdx];
      const wrongTeams = shuffle(
        shuffled.filter((t) => t.idTeam !== correctTeam.idTeam)
      ).slice(0, 3);
      const options = shuffle([correctTeam, ...wrongTeams]);

      gameRounds.push({
        correctTeam,
        options,
        correctIndex: options.findIndex((o) => o.idTeam === correctTeam.idTeam),
      });
    }

    return gameRounds;
  }, [teams]);

  const startGame = useCallback(() => {
    const r = generateRounds();
    setRounds(r);
    setCurrentR(0);
    setScore(0);
    setSelected(null);
    setShowAnswer(false);
    setRevealed(false);
    setLoading(false);
    setTimer(10);
    totalTimeSpent.current = 0;
    setFinalTime(0);
    setGameState('playing');
  }, [generateRounds]);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing' || showAnswer) return;
    if (timer <= 0) {
      setShowAnswer(true);
      setRevealed(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
      totalTimeSpent.current += 1;
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState, timer, showAnswer]);

  const handleAnswer = (idx) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    setRevealed(true);
    if (idx === rounds[currentR].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const nextRound = () => {
    if (currentR + 1 >= rounds.length) {
      setBestScore((b) => Math.max(b, score));
      setFinalTime(totalTimeSpent.current);
      setGameState('finished');
    } else {
      setLoading(true);
      setRevealed(false);
      setShowAnswer(false);
      setSelected(null);
      // Pequeña pausa para que el filtro de sombra se aplique antes de mostrar la nueva imagen
      setTimeout(() => {
        setCurrentR((r) => r + 1);
        setLoading(false);
        setTimer(10);
      }, 150);
    }
  };

  if (!teams || teams.length < 4) {
    return <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Cargando equipos...</p>;
  }

  if (gameState === 'idle') {
    return (
      <div className={styles.container}>
        <div className={styles.startScreen}>
          <div className={styles.icon}>🛡️</div>
          <h2 className={styles.title}>Adivina el Escudo</h2>
          <p className={styles.subtitle}>
            Te mostraremos el escudo de un equipo completamente oculto en las sombras.
            Tienes <strong>10 segundos</strong> para adivinar a qué club pertenece antes de que se revele.
          </p>
          <button className={styles.startBtn} onClick={startGame}>
            ¡Comenzar!
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const pct = Math.round((score / rounds.length) * 100);
    let rank = '👀 Novato';
    if (pct >= 90) rank = '🦅 Ojo de Águila';
    else if (pct >= 70) rank = '🔍 Detective del Fútbol';
    else if (pct >= 50) rank = '🛡️ Conocedor de Escudos';

    return (
      <div className={styles.container}>
        <div className={styles.resultScreen}>
          <div className={styles.icon}>{pct >= 70 ? '🎊' : '🛡️'}</div>
          <h2 className={styles.title}>¡Ronda Completa!</h2>
          <div className={styles.scoreDisplay}>
            <span className={styles.scoreBig}>{score}</span>
            <span className={styles.scoreOf}>/ {rounds.length}</span>
          </div>
          <div className={styles.rank}>{rank}</div>
          <button className={styles.startBtn} onClick={startGame}>
            Jugar de Nuevo
          </button>

          <Leaderboard gameId="badge" currentScore={score} timeElapsed={finalTime} />
        </div>
      </div>
    );
  }

  const round = rounds[currentR];
  const isCorrect = selected === round.correctIndex;
  const timerDanger = timer <= 3;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.gameHeader}>
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{ width: `${((currentR + 1) / rounds.length) * 100}%` }}
          />
        </div>
        <div className={styles.headerInfo}>
          <span className={styles.qCount}>Ronda {currentR + 1} de {rounds.length}</span>
          <span className={`${styles.timerBadge} ${timerDanger ? styles.timerDanger : ''}`}>
            ⏱️ {timer}s
          </span>
          <span className={styles.scoreSmall}>⭐ {score}</span>
        </div>
      </div>

      {/* Badge display */}
      <div className={styles.badgeSection}>
        <div className={`${styles.badgeFrame} ${revealed ? styles.badgeRevealed : ''} ${loading ? styles.badgeHidden : ''}`}>
          {!loading && (
            <Image
              src={round.correctTeam.strBadge}
              alt="Escudo misterioso"
              width={160}
              height={160}
              style={{ objectFit: 'contain', pointerEvents: 'none', userSelect: 'none' }}
              className={styles.badgeImg}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            />
          )}
        </div>
        <p className={styles.badgeHint}>
          {revealed ? round.correctTeam.strTeam : '¿De qué equipo es este escudo?'}
        </p>
      </div>

      {/* Options */}
      <div className={styles.options}>
        {round.options.map((team, idx) => {
          let cls = styles.option;
          if (showAnswer) {
            if (idx === round.correctIndex) cls += ` ${styles.correct}`;
            else if (idx === selected && !isCorrect) cls += ` ${styles.wrong}`;
            else cls += ` ${styles.dimmed}`;
          }
          return (
            <button key={team.idTeam} className={cls} onClick={() => handleAnswer(idx)} disabled={showAnswer}>
              <span>{team.strTeam}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showAnswer && (
        <div className={styles.feedback}>
          <p className={isCorrect ? styles.feedCorrect : styles.feedWrong}>
            {selected === null
              ? '⏰ ¡Se acabó el tiempo!'
              : isCorrect
              ? '✅ ¡Bien hecho!'
              : `❌ Era: ${round.correctTeam.strTeam}`}
          </p>
          <button className={styles.nextBtn} onClick={nextRound}>
            {currentR + 1 >= rounds.length ? 'Ver Resultados' : 'Siguiente →'}
          </button>
        </div>
      )}
    </div>
  );
}
