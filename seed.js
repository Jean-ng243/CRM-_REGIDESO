#!/usr/bin/env node
/**
 * Script de données de démonstration REGIDESO S.A.
 * Usage : node scripts/seed.js
 */
import "dotenv/config";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  console.log("Insertion des données de démonstration...");

  const abonnes = [
    ["REG-2025-0001", "Mbeki", "Joseph", "Avenue de la Paix, n°12", "Gombe", "0812345678", "j.mbeki@gmail.com", "actif"],
    ["REG-2025-0002", "Lukusa", "Marie-Claire", "Rue Kimbangu, n°45", "Kalamu", "0897654321", null, "actif"],
    ["REG-2025-0003", "Nzuzi", "Pierre", "Bld du 30 Juin, n°78", "Gombe", "0856789012", "p.nzuzi@yahoo.fr", "actif"],
    ["REG-2025-0004", "Kabongo", "Cécile", "Avenue Kasavubu, n°23", "Kinshasa", "0823456789", null, "suspendu"],
    ["REG-2025-0005", "Tshisekedi", "Paul", "Rue Lumumba, n°56", "Limete", "0834567890", "paul.t@gmail.com", "actif"],
  ];

  for (const a of abonnes) {
    await pool.query(`
      INSERT INTO abonnes (numero_contrat, nom, prenom, adresse, commune, telephone, email, statut)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (numero_contrat) DO NOTHING
    `, a);
  }

  const compteurs = [
    ["CPT-001-KIN", 1, "Sensus", "2024-01-15", "actif", 0],
    ["CPT-002-KIN", 2, "Elster", "2024-02-20", "actif", 0],
    ["CPT-003-KIN", 3, "Itron", "2024-03-10", "actif", 0],
    ["CPT-004-KIN", 4, "Sensus", "2023-11-05", "defectueux", 120],
    ["CPT-005-KIN", 5, "Elster", "2024-04-01", "actif", 0],
  ];
  for (const c of compteurs) {
    await pool.query(`
      INSERT INTO compteurs (numero_compteur, abonne_id, marque, date_installation, etat, index_initial)
      VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (numero_compteur) DO NOTHING
    `, c);
  }

  const releves = [
    [1,1, 0, 18, "2025-10-15", null],
    [2,2, 0, 12, "2025-10-16", null],
    [3,3, 0, 25, "2025-10-17", null],
    [5,5, 0, 8,  "2025-10-18", null],
    [1,1, 18, 36, "2025-11-15", null],
    [2,2, 12, 24, "2025-11-16", null],
    [3,3, 25, 50, "2025-11-17", "Forte consommation"],
    [5,5, 8,  17, "2025-11-18", null],
    [1,1, 36, 55, "2025-12-15", null],
    [2,2, 24, 36, "2025-12-16", null],
    [3,3, 50, 72, "2025-12-17", null],
    [5,5, 17, 28, "2025-12-18", null],
  ];
  for (const r of releves) {
    const conso = r[3] - r[2];
    await pool.query(`
      INSERT INTO releves (compteur_id, abonne_id, index_precedent, index_actuel, consommation_m3, date_releve, observation)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `, [...r.slice(0,5), conso.toString(), r[5], r[6]]);
  }

  const ids = await pool.query("SELECT id, abonne_id, consommation_m3 FROM releves ORDER BY id");
  for (const row of ids.rows) {
    const m3 = parseFloat(row.consommation_m3);
    const t1 = Math.min(m3, 6) * 0.35;
    const t2 = Math.min(Math.max(m3 - 6, 0), 9) * 0.55;
    const t3 = Math.max(m3 - 15, 0) * 0.80;
    const montant = Math.round((t1+t2+t3)*100)/100;
    const emission = new Date().toISOString().split("T")[0];
    const d = new Date(); d.setDate(d.getDate() + 30);
    const echeance = d.toISOString().split("T")[0];
    await pool.query(`
      INSERT INTO factures (abonne_id, releve_id, montant_total, statut, date_emission, date_echeance)
      VALUES ($1,$2,$3,'impayee',$4,$5)
    `, [row.abonne_id, row.id, montant, emission, echeance]);
  }

  const factures = await pool.query("SELECT id, montant_total, abonne_id FROM factures ORDER BY id LIMIT 4");
  const paiements = [
    [factures.rows[0].id, factures.rows[0].abonne_id, factures.rows[0].montant_total, "especes", "2025-12-20", "REF-001"],
    [factures.rows[1].id, factures.rows[1].abonne_id, factures.rows[1].montant_total, "mobile_money", "2025-12-21", "REF-002"],
    [factures.rows[2].id, factures.rows[2].abonne_id, 5.00, "especes", "2025-12-22", "REF-003"],
    [factures.rows[3].id, factures.rows[3].abonne_id, factures.rows[3].montant_total, "virement", "2025-12-23", "REF-004"],
  ];
  for (const p of paiements) {
    await pool.query(`INSERT INTO paiements (facture_id, abonne_id, montant, mode_paiement, date_paiement, reference) VALUES ($1,$2,$3,$4,$5,$6)`, p);
    await pool.query(`UPDATE factures SET statut = CASE WHEN $1::numeric >= montant_total THEN 'payee' ELSE 'partiellement_payee' END WHERE id = $2`, [p[2], p[0]]);
  }

  const reclamations = [
    [1, "fuite", "Fuite détectée dans la canalisation principale. Perte importante d'eau.", "2025-12-01", "ouverte"],
    [2, "facturation", "Montant anormalement élevé sur la facture de novembre 2025.", "2025-12-05", "en_cours"],
    [3, "compteur", "Le compteur affiche des relevés incohérents depuis 2 mois.", "2025-12-10", "resolue"],
    [5, "coupure", "Interruption totale de l'approvisionnement en eau depuis 48h.", "2025-12-15", "en_cours"],
    [1, "autre", "Demande de changement du numéro de contrat suite à succession.", "2025-12-18", "ouverte"],
  ];
  for (const r of reclamations) {
    const fermeture = r[4] === "resolue" ? new Date().toISOString().split("T")[0] : null;
    const resolution = r[4] === "resolue" ? "Compteur remplacé par l'équipe technique." : null;
    await pool.query(`
      INSERT INTO reclamations (abonne_id, type, description, date_ouverture, statut, date_fermeture, resolution)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
    `, [...r.slice(0,5), fermeture, resolution]);
  }

  console.log("Données de démonstration insérées avec succès !");
  await pool.end();
}

seed().catch(e => { console.error(e); process.exit(1); });
