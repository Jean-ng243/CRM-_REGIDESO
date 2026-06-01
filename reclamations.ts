import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, reclamationsTable } from "../db.js";
import { z } from "zod";

const router = Router();

const ReclamationSchema = z.object({
  abonneId: z.coerce.number(),
  type: z.string().min(1),
  description: z.string().min(1),
  dateOuverture: z.string().min(1),
});

const serial = (r: any) => ({ ...r, createdAt: r.createdAt.toISOString() });

router.get("/reclamations", async (req, res) => {
  try {
    const { abonneId, statut } = req.query as any;
    let results = await db.select().from(reclamationsTable);
    if (abonneId) results = results.filter(r => r.abonneId === parseInt(abonneId, 10));
    if (statut) results = results.filter(r => r.statut === statut);
    res.json(results.map(serial));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/reclamations", async (req, res) => {
  try {
    const p = ReclamationSchema.safeParse(req.body);
    if (!p.success) { res.status(400).json({ error: p.error.message }); return; }
    const [r] = await db.insert(reclamationsTable).values({ ...p.data, statut: "ouverte" }).returning();
    res.status(201).json(serial(r!));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/reclamations/:id", async (req, res) => {
  try {
    const [r] = await db.select().from(reclamationsTable).where(eq(reclamationsTable.id, parseInt(req.params.id!, 10)));
    if (!r) { res.status(404).json({ error: "Réclamation introuvable" }); return; }
    res.json(serial(r));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch("/reclamations/:id", async (req, res) => {
  try {
    const [r] = await db.update(reclamationsTable).set(req.body).where(eq(reclamationsTable.id, parseInt(req.params.id!, 10))).returning();
    if (!r) { res.status(404).json({ error: "Réclamation introuvable" }); return; }
    res.json(serial(r));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
