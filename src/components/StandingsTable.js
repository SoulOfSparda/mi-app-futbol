import Image from 'next/image';
import Link from 'next/link';
import styles from './StandingsTable.module.css';

export default function StandingsTable({ standings, compact = false }) {
  const rows = compact ? standings.slice(0, 5) : standings;

  return (
    <div className={styles.wrapper}>
      <div className={styles.tableWrap}>
        <table className={styles.table} id="standings-table">
          <thead>
            <tr>
              <th className={styles.thPos}>#</th>
              <th className={styles.thTeam}>Equipo</th>
              {!compact && <th className={styles.thStat}>PJ</th>}
              <th className={styles.thStat}>G</th>
              <th className={styles.thStat}>E</th>
              <th className={styles.thStat}>P</th>
              {!compact && <th className={styles.thStat}>GF</th>}
              {!compact && <th className={styles.thStat}>GC</th>}
              {!compact && <th className={styles.thStat}>DG</th>}
              <th className={styles.thPts}>PTS</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const pos = parseInt(row.intRank || i + 1);
              const isTop = pos <= 4;
              const isBottom = !compact && pos >= standings.length - 2;

              return (
                <tr
                  key={row.idTeam || i}
                  className={`${styles.row} ${isTop ? styles.rowTop : ''} ${
                    isBottom ? styles.rowBottom : ''
                  } animate-in`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <td className={styles.pos}>
                    <span
                      className={`${styles.posNum} ${
                        isTop ? styles.posTop : ''
                      } ${isBottom ? styles.posBottom : ''}`}
                    >
                      {pos}
                    </span>
                  </td>
                  <td className={styles.teamCell}>
                    <Link
                      href={`/equipo/${row.idTeam}`}
                      className={styles.teamLink}
                    >
                      {row.strTeamBadge && (
                        <Image
                          src={row.strTeamBadge}
                          alt={row.strTeam}
                          width={24}
                          height={24}
                          style={{ objectFit: 'contain' }}
                        />
                      )}
                      <span className={styles.teamName}>{row.strTeam}</span>
                    </Link>
                  </td>
                  {!compact && <td className={styles.stat}>{row.intPlayed}</td>}
                  <td className={styles.stat}>{row.intWin}</td>
                  <td className={styles.stat}>{row.intDraw}</td>
                  <td className={styles.stat}>{row.intLoss}</td>
                  {!compact && (
                    <td className={styles.stat}>{row.intGoalsFor}</td>
                  )}
                  {!compact && (
                    <td className={styles.stat}>{row.intGoalsAgainst}</td>
                  )}
                  {!compact && (
                    <td className={styles.stat}>
                      {row.intGoalDifference}
                    </td>
                  )}
                  <td className={styles.pts}>{row.intPoints}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
