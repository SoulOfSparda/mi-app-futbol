'use server';

import { sql, createTableIfNotExists } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Guarda la puntuación de un minijuego en la base de datos Neon (PostgreSQL).
export async function submitScore(playerName, gameId, score, completedInSeconds = null) {
  if (!sql) {
    return { success: false, message: 'Base de datos no configurada.' };
  }

  // Prevenir nombres vacíos y hacer control de longitud
  const finalName = playerName?.trim() ? playerName.trim().substring(0, 30) : 'Anónimo';

  try {
    await createTableIfNotExists(); // Garantizamos que la tabla exista

    await sql`
      INSERT INTO leaderboards (player_name, game_id, score, completed_in_seconds)
      VALUES (${finalName}, ${gameId}, ${score}, ${completedInSeconds});
    `;

    // Revalidamos la ruta para que todos los usuarios vean los datos frescos al instante
    revalidatePath('/juegos');

    return { success: true };
  } catch (error) {
    console.error('Error insertando score:', error);
    return { success: false, message: 'Error de conexión con la base de datos.' };
  }
}

// Obtiene los 10 mejores puntajes para un juego específico
export async function getLeaderboard(gameId) {
  if (!sql) return [];

  try {
    await createTableIfNotExists(); // Garantizamos que la tabla exista

    const rows = await sql`
      SELECT player_name, score, completed_in_seconds, created_at
      FROM leaderboards
      WHERE game_id = ${gameId}
      ORDER BY score DESC, completed_in_seconds ASC, created_at DESC
      LIMIT 10;
    `;
    return rows;
  } catch (error) {
    console.error('Error obteniendo leaderboard para', gameId, ':', error);
    return [];
  }
}
