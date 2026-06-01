import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, facturesTable, relevesTable } from "../db.js";
import { z } from "zod";

const router = Router();

/* Tarification REGIDESO par tranches (en USD/m³) */
function calculerMontant(m3: number): number {
  const t1 = Math.min(m3, 6) * 0.35;
  const t2 = Math.min(Math.max(m3 - 6, 0), 9) * 0.55;
  const t3 = Math.max(m3 - 15, 0) * 0.80;
  return Math.round((t1 + t2 + t3) * 100) / 100;
}

const FactureSchema = z.object({
  abonneId: z.coerce.number(),
  releveId: z.coerce.number(),
  dateEcheance: z.string().min(1),
});

const serial = (f: any) => ({
  ...f,
  montantTotal: parseFloat(f.montantTotal),
  createdAt: f.createdAt.toISOString(),
});

router.get("/factures", async (req, res) => {
  try {
    const { abonneId, statut } = req.query as any;
    let results = await db.select().from(facturesTable);
    if (abonneId) results = results.filter(f => f.abonneId === parseInt(abonneId, 10));
    if (statut) results = results.filter(f => f.statut === statut);
    res.json(results.map(serial));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/factures", async (req, res) => {
  try {
    const p = FactureSchema.safeParse(req.body);
    if (!p.success) { res.status(400).json({ error: p.error.message }); return; }
    const [releve] = await db.select().from(relevesTable).where(eq(relevesTable.id, p.data.releveId));
    if (!releve) { res.status(404).json({ error: "Relevé introuvable" }); return; }
    const montant = calculerMontant(parseFloat(releve.consommationM3));
    const [f] = await db.insert(facturesTable).values({
      abonneId: p.data.abonneId,
      releveId: p.data.releveId,
      montantTotal: String(montant),
      statut: "impayee",
      dateEmission: new Date().toISOString().split("T")[0]!,
      dateEcheance: p.data.dateEcheance,
    }).returning();
    res.status(201).json(serial(f!));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/factures/:id", async (req, res) => {
  try {
    const [f] = await db.select().from(facturesTable).where(eq(facturesTable.id, parseInt(req.params.id!, 10)));
    if (!f) { res.status(404).json({ error: "Facture introuvable" }); return; }
    res.json(serial(f));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch("/factures/:id", async (req, res) => {
  try {
    const [f] = await db.update(facturesTable).set(req.body).where(eq(facturesTable.id, parseInt(req.params.id!, 10))).returning();
    if (!f) { res.status(404).json({ error: "Facture introuvable" }); return; }
    res.json(serial(f));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
