import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, compteursTable } from "../db.js";
import { z } from "zod";

const router = Router();

const CompteurSchema = z.object({
  numeroCompteur: z.string().min(1),
  abonneId: z.coerce.number(),
  marque: z.string().min(1),
  dateInstallation: z.string().min(1),
  etat: z.string().default("actif"),
  indexInitial: z.coerce.number().default(0),
});

const serial = (c: any) => ({
  ...c,
  indexInitial: parseFloat(c.indexInitial),
  createdAt: c.createdAt.toISOString(),
});

router.get("/compteurs", async (_req, res) => {
  try {
    const results = await db.select().from(compteursTable);
    res.json(results.map(serial));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.post("/compteurs", async (req, res) => {
  try {
    const p = CompteurSchema.safeParse(req.body);
    if (!p.success) { res.status(400).json({ error: p.error.message }); return; }
    const [c] = await db.insert(compteursTable).values({
      ...p.data, indexInitial: String(p.data.indexInitial),
    }).returning();
    res.status(201).json(serial(c!));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.get("/compteurs/:id", async (req, res) => {
  try {
    const [c] = await db.select().from(compteursTable).where(eq(compteursTable.id, parseInt(req.params.id!, 10)));
    if (!c) { res.status(404).json({ error: "Compteur introuvable" }); return; }
    res.json(serial(c));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

router.patch("/compteurs/:id", async (req, res) => {
  try {
    const [c] = await db.update(compteursTable).set(req.body).where(eq(compteursTable.id, parseInt(req.params.id!, 10))).returning();
    if (!c) { res.status(404).json({ error: "Compteur introuvable" }); return; }
    res.json(serial(c));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
