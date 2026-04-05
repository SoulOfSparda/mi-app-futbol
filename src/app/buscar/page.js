import { searchTeams } from '@/lib/api';
import TeamCard from '@/components/TeamCard';
import styles from './page.module.css';

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const query = params.q || '';
  return {
    title: query ? `Resultados para "${query}" — MiFutbolitoFc` : 'Buscar Equipos — MiFutbolitoFc',
  };
}

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const query = params.q || '';
  let teams = [];

  if (query) {
    teams = await searchTeams(query).catch(() => []);
  }

  return (
    <div className={`container section ${styles.searchPage}`}>
      <div className="section-title">
        {query ? (
          <h2>Resultados de búsqueda para: <span className="accent-text">&quot;{query}&quot;</span></h2>
        ) : (
          <h2>Buscador de Equipos</h2>
        )}
      </div>

      {!query ? (
        <p className={styles.emptyState}>Ingresa el nombre de un equipo en la barra de búsqueda de arriba.</p>
      ) : teams.length > 0 ? (
        <div className={styles.teamsGrid}>
          {teams.map((team, i) => (
            <div key={team.idTeam} className="animate-in" style={{ animationDelay: `${i * 50}ms` }}>
              <TeamCard team={team} />
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.emptyState}>No se encontraron equipos que coincidan con &quot;{query}&quot;.</p>
      )}
    </div>
  );
}
