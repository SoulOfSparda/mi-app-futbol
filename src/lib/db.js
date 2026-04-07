import { neon } from '@neondatabase/serverless';

// Singleton instance to prevent multiple connections during hot-reloading in dev.
let sql;

if (process.env.DATABASE_URL) {
  sql = neon(process.env.DATABASE_URL);
}

export { sql };

// Función auxiliar para inicializar la tabla si no existe.
// Idealmente se debería hacer con migraciones, pero para este caso rápido:
export async function createTableIfNotExists() {
  if (!sql) return;
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS leaderboards (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(100) NOT NULL,
        game_id VARCHAR(50) NOT NULL,
        score INTEGER NOT NULL,
        completed_in_seconds INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
  } catch (error) {
    console.error('Error creating leaderboards table:', error);
  }
}
