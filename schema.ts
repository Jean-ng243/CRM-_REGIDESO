import { pgTable, text, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";

/* Table des abonnés */
export const abonnesTable = pgTable("abonnes", {
  id: serial("id").primaryKey(),
  numeroContrat: text("numero_contrat").notNull().unique(),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  adresse: text("adresse").notNull(),
  commune: text("commune").notNull(),
  telephone: text("telephone").notNull(),
  email: text("email"),
  statut: text("statut").notNull().default("actif"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/* Table des compteurs */
export const compteursTable = pgTable("compteurs", {
  id: serial("id").primaryKey(),
  numeroCompteur: text("numero_compteur").notNull().unique(),
  abonneId: integer("abonne_id").notNull(),
  marque: text("marque").notNull(),
  dateInstallation: text("date_installation").notNull(),
  etat: text("etat").notNull().default("actif"),
  indexInitial: numeric("index_initial", { precision: 12, scale: 3 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/* Table des relevés d'index */
export const relevesTable = pgTable("releves", {
  id: serial("id").primaryKey(),
  compteurId: integer("compteur_id").notNull(),
  abonneId: integer("abonne_id").notNull(),
  indexPrecedent: numeric("index_precedent", { precision: 12, scale: 3 }).notNull(),
  indexActuel: numeric("index_actuel", { precision: 12, scale: 3 }).notNull(),
  consommationM3: numeric("consommation_m3", { precision: 12, scale: 3 }).notNull(),
  dateReleve: text("date_releve").notNull(),
  observation: text("observation"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/* Table des factures */
export const facturesTable = pgTable("factures", {
  id: serial("id").primaryKey(),
  abonneId: integer("abonne_id").notNull(),
  releveId: integer("releve_id").notNull(),
  montantTotal: numeric("montant_total", { precision: 12, scale: 2 }).notNull().default("0"),
  statut: text("statut").notNull().default("impayee"),
  dateEmission: text("date_emission").notNull(),
  dateEcheance: text("date_echeance").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/* Table des paiements */
export const paiementsTable = pgTable("paiements", {
  id: serial("id").primaryKey(),
  factureId: integer("facture_id").notNull(),
  abonneId: integer("abonne_id").notNull(),
  montant: numeric("montant", { precision: 12, scale: 2 }).notNull(),
  modePaiement: text("mode_paiement").notNull(),
  datePaiement: text("date_paiement").notNull(),
  reference: text("reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

/* Table des réclamations */
export const reclamationsTable = pgTable("reclamations", {
  id: serial("id").primaryKey(),
  abonneId: integer("abonne_id").notNull(),
  type: text("type").notNull(),
  description: text("description").notNull(),
  statut: text("statut").notNull().default("ouverte"),
  dateOuverture: text("date_ouverture").notNull(),
  dateFermeture: text("date_fermeture"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});
