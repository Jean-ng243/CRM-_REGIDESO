import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL est requise mais non définie.");
}

/* Connexion PostgreSQL via le pool de connexions */
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });

export {
  abonnesTable,
  compteursTable,
  relevesTable,
  facturesTable,
  paiementsTable,
  reclamationsTable,
} from "./schema.js";
