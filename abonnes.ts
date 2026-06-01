import { Router } from "express";
import { eq, ilike, or } from "drizzle-orm";
import { db, abonnesTable } from "../db.js";
import { z } from "zod";

const router = Router();

const AbonneSchema = z.object({
  numeroContrat: z.string().min(1),
  nom: z.string().min(1),
  prenom: z.string().min(1),
  adresse: z.string().min(1),
  commune: z.string().min(1),
  telephone: z.string().min(1),
  email: z.string().email().optional().nullable(),
  statut: z.string().default("actif"),
});

/* Liste des abonnés avec recherche et filtrage */
router.get("/abonnes", async (req, res) => {
  try {
    const { search, statut } = req.query as { search?: string; statut?: string };
    let results = await db.select().from(abonnesTable);
    if (search) {
      results = results.filter(a =>
        a.nom.toLowerCase().includes(search.toLowerCase()) ||
        a.prenom.toLowerCase().includes(search.toLowerCase()) ||
        a.numeroContrat.toLowerCase().includes(search.toLowerCase()) ||
        a.commune.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statut) results = results.filter(a => a.statut === statut);
    res.json(results.map(a => ({ ...a, createdAt: a.createdAt.toISOString() })));
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* Création d'un abonné */
router.post("/abonnes", async (req, res) => {
  try {
    const parsed = AbonneSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
    const [a] = await db.insert(abonnesTable).values(parsed.data).returning();
    res.status(201).json({ ...a, createdAt: a!.createdAt.toISOString() });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* Obtenir un abonné */
router.get("/abonnes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const [a] = await db.select().from(abonnesTable).where(eq(abonnesTable.id, id));
    if (!a) { res.status(404).json({ error: "Abonné introuvable" }); return; }
    res.json({ ...a, createdAt: a.createdAt.toISOString() });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* Mise à jour d'un abonné */
router.patch("/abonnes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!, 10);
    const [a] = await db.update(abonnesTable).set(req.body).where(eq(abonnesTable.id, id)).returning();
    if (!a) { res.status(404).json({ error: "Abonné introuvable" }); return; }
    res.json({ ...a, createdAt: a.createdAt.toISOString() });
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

/* Suppression d'un abonné */
router.delete("/abonnes/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id!, 10);
    await db.delete(abonnesTable).where(eq(abonnesTable.id, id));
    res.status(204).send();
  } catch (e) { res.status(500).json({ error: String(e) }); }
});

export default router;
