import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, paiementsTable, facturesTable } from "../db.js";
import { z } from "zod";

const router = Router();

const PaiementSchema = z.object({
  factureId: z.coerce.number(),
  abonneId: z.coerce.number(),
  montant: z.coerce.number().positive(),
  modePaiement: z.string().min(1),
  datePaiement: z.string().min(1),
  reference: z.string().optional(),
});

const serial = (p: any) => ({
  ...p,
  montant: parseFloat(p.montant),
  createdAt: p.createdAt.toISOString(),
});

router.get("/paiements", async (req, res) => {
  try {
    const { abonneId, factureId } = req.query as any;
    let results = await db.select().from(paiementsTable);
    if (abonneId) results = results.filter(p => p.abonneId === parseInt(abonneId, 10));
    if (factureId) results = results.filter(p => p.factureId === parseInt(factureId, 10));
    res.json(results.map(serial));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/paiements", async (req, res) => {
  try {
    const p = PaiementSchema.safeParse(req.body);
    if (!p.success) { res.status(400).json({ error: p.error.message }); return; }
    const [facture] = await db.select().from(facturesTable).where(eq(facturesTable.id, p.data.factureId));
    if (!facture) { res.status(404).json({ error: "Facture introuvable" }); return; }
    const [paiement] = await db.insert(paiementsTable).values({
      ...p.data, montant: String(p.data.montant),
    }).returning();
    /* Mise à jour du statut de la facture */
    const tous = await db.select().from(paiementsTable).where(eq(paiementsTable.factureId, p.data.factureId));
    const total = tous.reduce((s, x) => s + parseFloat(x.montant), 0);
    const montantF = parseFloat(facture.montantTotal);
    const statut = total >= montantF ? "payee" : total > 0 ? "partiellement_payee" : "impayee";
    await db.update(facturesTable).set({ statut }).where(eq(facturesTable.id, p.data.factureId));
    res.status(201).json(serial(paiement!));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/paiements/:id", async (req, res) => {
  try {
    const [p] = await db.select().from(paiementsTable).where(eq(paiementsTable.id, parseInt(req.params.id!, 10)));
    if (!p) { res.status(404).json({ error: "Paiement introuvable" }); return; }
    res.json(serial(p));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
