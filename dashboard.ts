import { Router } from "express";
import { db, abonnesTable, facturesTable, paiementsTable, reclamationsTable, relevesTable } from "../db.js";

const router = Router();

/* Statistiques globales du tableau de bord */
router.get("/dashboard/stats", async (_req, res) => {
  try {
    const [abonnes, factures, reclamations, paiements] = await Promise.all([
      db.select().from(abonnesTable),
      db.select().from(facturesTable),
      db.select().from(reclamationsTable),
      db.select().from(paiementsTable),
    ]);
    const montantRecouvre = paiements.reduce((s, p) => s + parseFloat(p.montant), 0);
    res.json({
      totalAbonnes: abonnes.length,
      totalFactures: factures.length,
      montantRecouvre: Math.round(montantRecouvre * 100) / 100,
      totalReclamations: reclamations.length,
      abonnesActifs: abonnes.filter(a => a.statut === "actif").length,
      facturesImpayees: factures.filter(f => f.statut === "impayee").length,
    });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* Activité récente */
router.get("/dashboard/activite-recente", async (_req, res) => {
  try {
    const [releves, paiements, reclamations] = await Promise.all([
      db.select().from(relevesTable),
      db.select().from(paiementsTable),
      db.select().from(reclamationsTable),
    ]);
    const activites = [
      ...releves.slice(-5).map(r => ({ id: r.id, type: "releve", description: `Relevé : ${parseFloat(r.consommationM3).toFixed(1)} m³ (abonné #${r.abonneId})`, date: r.createdAt.toISOString() })),
      ...paiements.slice(-5).map(p => ({ id: p.id, type: "paiement", description: `Paiement ${parseFloat(p.montant).toFixed(2)} USD (facture #${p.factureId})`, date: p.createdAt.toISOString() })),
      ...reclamations.slice(-5).map(r => ({ id: r.id, type: "reclamation", description: `Réclamation ${r.type} — ${r.statut} (abonné #${r.abonneId})`, date: r.createdAt.toISOString() })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
    res.json(activites);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* Consommation mensuelle sur 12 mois */
router.get("/dashboard/consommation-mensuelle", async (_req, res) => {
  try {
    const releves = await db.select().from(relevesTable);
    const nomsDesMois = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
    const parMois = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      parMois.set(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`, 0);
    }
    releves.forEach(r => {
      const cle = r.dateReleve.substring(0, 7);
      if (parMois.has(cle)) parMois.set(cle, (parMois.get(cle) ?? 0) + parseFloat(r.consommationM3));
    });
    const data = Array.from(parMois.entries()).map(([cle, total]) => ({
      mois: nomsDesMois[parseInt(cle.split("-")[1]!, 10) - 1],
      totalM3: Math.round(total * 10) / 10,
    }));
    res.json(data);
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
