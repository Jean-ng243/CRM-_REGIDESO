import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, relevesTable } from "../db.js";
import { z } from "zod";

const router = Router();

const ReleveSchema = z.object({
  compteurId: z.coerce.number(),
  abonneId: z.coerce.number(),
  indexPrecedent: z.coerce.number(),
  indexActuel: z.coerce.number(),
  dateReleve: z.string().min(1),
  observation: z.string().optional(),
});

const serial = (r: any) => ({
  ...r,
  indexPrecedent: parseFloat(r.indexPrecedent),
  indexActuel: parseFloat(r.indexActuel),
  consommationM3: parseFloat(r.consommationM3),
  createdAt: r.createdAt.toISOString(),
});

router.get("/releves", async (req, res) => {
  try {
    const { abonneId, compteurId } = req.query as any;
    let results = await db.select().from(relevesTable);
    if (abonneId) results = results.filter(r => r.abonneId === parseInt(abonneId, 10));
    if (compteurId) results = results.filter(r => r.compteurId === parseInt(compteurId, 10));
    res.json(results.map(serial));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/releves", async (req, res) => {
  try {
    const p = ReleveSchema.safeParse(req.body);
    if (!p.success) { res.status(400).json({ error: p.error.message }); return; }
    const consommationM3 = p.data.indexActuel - p.data.indexPrecedent;
    const [r] = await db.insert(relevesTable).values({
      ...p.data,
      indexPrecedent: String(p.data.indexPrecedent),
      indexActuel: String(p.data.indexActuel),
      consommationM3: String(consommationM3),
    }).returning();
    res.status(201).json(serial(r!));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/releves/:id", async (req, res) => {
  try {
    const [r] = await db.select().from(relevesTable).where(eq(relevesTable.id, parseInt(req.params.id!, 10)));
    if (!r) { res.status(404).json({ error: "Relevé introuvable" }); return; }
    res.json(serial(r));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
