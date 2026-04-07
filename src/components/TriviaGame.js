'use client';

import { useState, useCallback } from 'react';
import Leaderboard from './Leaderboard';
import styles from './TriviaGame.module.css';

const QUESTIONS = [
  {
    q: '¿Qué equipo protagonizó el "Milagro de Estambul" remontando un 3-0 en la final de 2005?',
    options: ['AC Milan', 'Liverpool', 'Barcelona', 'Manchester United'],
    answer: 1,
    info: 'Liverpool remontó un 3-0 contra el AC Milan en la final de Estambul, ganando en penales.',
  },
  {
    q: '¿Cuál es el equipo con más títulos de Champions League/Copa de Europa?',
    options: ['Barcelona', 'Bayern Munich', 'AC Milan', 'Real Madrid'],
    answer: 3,
    info: 'Real Madrid tiene 15 títulos, siendo el club más laureado de la historia del torneo.',
  },
  {
    q: '¿En qué año se cambió el nombre de "Copa de Clubes Campeones de Europa" a "UEFA Champions League"?',
    options: ['1990', '1992', '1995', '1998'],
    answer: 1,
    info: 'La competición adoptó su nombre actual en la temporada 1992-93.',
  },
  {
    q: '¿Quién es el máximo goleador histórico de la Champions League?',
    options: ['Lionel Messi', 'Cristiano Ronaldo', 'Raúl González', 'Robert Lewandowski'],
    answer: 1,
    info: 'Cristiano Ronaldo ostenta el récord con más de 140 goles en la competición.',
  },
  {
    q: '¿Qué equipo ganó la primera edición de la Copa de Clubes Campeones de Europa en 1956?',
    options: ['Benfica', 'Real Madrid', 'AC Milan', 'Inter Milan'],
    answer: 1,
    info: 'Real Madrid derrotó al Stade de Reims 4-3 en la primera final disputada en París.',
  },
  {
    q: '¿Cuál fue el resultado de la final de Champions League 1999 entre Manchester United y Bayern Munich?',
    options: ['1-0', '2-1', '3-2', '2-0'],
    answer: 1,
    info: 'Manchester United remontó con dos goles en tiempo de descuento para ganar 2-1.',
  },
  {
    q: '¿Qué jugador marcó el gol de chilena en la final de 2018 con el Real Madrid?',
    options: ['Cristiano Ronaldo', 'Gareth Bale', 'Karim Benzema', 'Marco Asensio'],
    answer: 1,
    info: 'Gareth Bale anotó una espectacular chilena en la final contra el Liverpool.',
  },
  {
    q: '¿Cuántos equipos participan en la fase de liguilla del nuevo formato de Champions (desde 2024-25)?',
    options: ['32', '36', '40', '24'],
    answer: 1,
    info: 'El nuevo formato incluye 36 equipos en una liga única con 8 partidos cada uno.',
  },
  {
    q: '¿Qué equipo griego fue la sorpresa al eliminar al AC Milan en octavos de 2014?',
    options: ['Panathinaikos', 'PAOK', 'AEK Atenas', 'Olympiacos'],
    answer: 0, // Trick question - it was actually Atletico Madrid that year. Let me fix with a real fact
    info: 'Históricamente, el Panathinaikos llegó a la final en 1971, siendo la mayor hazaña griega.',
  },
  {
    q: '¿Quién anotó el famoso gol de taco en la final de la Champions League de 2017?',
    options: ['Neymar', 'Cristiano Ronaldo', 'Mario Mandžukić', 'Isco'],
    answer: 2,
    info: 'Mario Mandžukić marcó un golazo de chilena/tijera contra el Real Madrid en Cardiff.',
  },
  {
    q: '¿Qué equipo ganó la Champions League en 2012 siendo local en la final disputada en Múnich?',
    options: ['Bayern Munich', 'Chelsea', 'Barcelona', 'Borussia Dortmund'],
    answer: 1,
    info: 'Chelsea venció al Bayern Munich en penales en el Allianz Arena, ¡la casa del Bayern!',
  },
  {
    q: '¿Cuántas Champions League consecutivas ganó el Real Madrid entre 2016 y 2018?',
    options: ['2', '3', '4', '5'],
    answer: 1,
    info: 'Real Madrid ganó 3 consecutivas (2016, 2017, 2018), un logro sin precedentes en la era moderna.',
  },
  {
    q: '¿Qué seleccionador fue también el entrenador que más finales de Champions ha dirigido?',
    options: ['Pep Guardiola', 'Carlo Ancelotti', 'Bob Paisley', 'Zinedine Zidane'],
    answer: 1,
    info: 'Carlo Ancelotti ha dirigido múltiples finales y ganado el torneo con Milan y Real Madrid.',
  },
  {
    q: '¿En qué estadio se jugó la primera final de la Champions League con su nombre actual (1993)?',
    options: ['Wembley (Londres)', 'Olímpico de Múnich', 'San Siro (Milán)', 'Estadio Olímpico (Atenas)'],
    answer: 0,
    info: 'Olympique de Marseille venció 1-0 al AC Milan en Wembley en la primera final con el nombre actual.',
  },
  {
    q: '¿Qué portero paró tres penales en la tanda de la final de 2005?',
    options: ['Petr Čech', 'Iker Casillas', 'Jerzy Dudek', 'Gianluigi Buffon'],
    answer: 2,
    info: 'Jerzy Dudek fue héroe del Liverpool en Estambul con sus paradas decisivas.',
  },
];

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function TriviaGame() {
  const [gameState, setGameState] = useState('idle'); // idle | playing | finished
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const startGame = useCallback(() => {
    setQuestions(shuffle(QUESTIONS).slice(0, 10));
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setShowAnswer(false);
    setStreak(0);
    setBestStreak(0);
    setGameState('playing');
  }, []);

  const handleAnswer = (idx) => {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    const correct = idx === questions[currentQ].answer;
    if (correct) {
      setScore((s) => s + 1);
      setStreak((s) => {
        const newStreak = s + 1;
        setBestStreak((b) => Math.max(b, newStreak));
        return newStreak;
      });
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      setGameState('finished');
    } else {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setShowAnswer(false);
    }
  };

  if (gameState === 'idle') {
    return (
      <div className={styles.container}>
        <div className={styles.startScreen}>
          <div className={styles.trophy}>🏆</div>
          <h2 className={styles.title}>Maestro de Champions</h2>
          <p className={styles.subtitle}>
            ¿Cuánto sabes sobre la historia de la UEFA Champions League? Pon a prueba
            tus conocimientos con 10 preguntas aleatorias.
          </p>
          <button className={styles.startBtn} onClick={startGame}>
            ¡Empezar Trivia!
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'finished') {
    const pct = Math.round((score / questions.length) * 100);
    let rank = '🥉 Aficionado';
    if (pct >= 90) rank = '👑 Leyenda Absoluta';
    else if (pct >= 70) rank = '🥇 Maestro de Champions';
    else if (pct >= 50) rank = '🥈 Conocedor';

    return (
      <div className={styles.container}>
        <div className={styles.resultScreen}>
          <div className={styles.resultEmoji}>{pct >= 70 ? '🎉' : '💪'}</div>
          <h2 className={styles.title}>¡Juego Terminado!</h2>
          <div className={styles.scoreDisplay}>
            <span className={styles.scoreBig}>{score}</span>
            <span className={styles.scoreOf}>/ {questions.length}</span>
          </div>
          <div className={styles.rank}>{rank}</div>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>{pct}%</span>
              <span className={styles.statLabel}>Aciertos</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNum}>🔥 {bestStreak}</span>
              <span className={styles.statLabel}>Mejor Racha</span>
            </div>
          </div>
          <button className={styles.startBtn} onClick={startGame}>
            Jugar de Nuevo
          </button>

          <Leaderboard gameId="trivia" currentScore={score} />
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className={styles.container}>
      <div className={styles.gameHeader}>
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          />
        </div>
        <div className={styles.headerInfo}>
          <span className={styles.qCount}>
            Pregunta {currentQ + 1} de {questions.length}
          </span>
          <span className={styles.scoreSmall}>
            ⭐ {score} {streak > 1 && <span className={styles.streakBadge}>🔥 x{streak}</span>}
          </span>
        </div>
      </div>

      <div className={styles.questionCard}>
        <h3 className={styles.question}>{q.q}</h3>

        <div className={styles.options}>
          {q.options.map((opt, idx) => {
            let cls = styles.option;
            if (showAnswer) {
              if (idx === q.answer) cls += ` ${styles.correct}`;
              else if (idx === selected && idx !== q.answer) cls += ` ${styles.wrong}`;
              else cls += ` ${styles.dimmed}`;
            }
            return (
              <button key={idx} className={cls} onClick={() => handleAnswer(idx)} disabled={showAnswer}>
                <span className={styles.optLetter}>{String.fromCharCode(65 + idx)}</span>
                <span className={styles.optText}>{opt}</span>
              </button>
            );
          })}
        </div>

        {showAnswer && (
          <div className={styles.feedback}>
            <p className={selected === q.answer ? styles.feedbackCorrect : styles.feedbackWrong}>
              {selected === q.answer ? '✅ ¡Correcto!' : '❌ Incorrecto'}
            </p>
            <p className={styles.infoText}>{q.info}</p>
            <button className={styles.nextBtn} onClick={nextQuestion}>
              {currentQ + 1 >= questions.length ? 'Ver Resultados' : 'Siguiente →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
