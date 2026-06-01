import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import abonnesRouter from "./routes/abonnes.js";
import compteursRouter from "./routes/compteurs.js";
import relevesRouter from "./routes/releves.js";
import facturesRouter from "./routes/factures.js";
import paiementsRouter from "./routes/paiements.js";
import reclamationsRouter from "./routes/reclamations.js";
import dashboardRouter from "./routes/dashboard.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* Routes API */
app.use("/api", abonnesRouter);
app.use("/api", compteursRouter);
app.use("/api", relevesRouter);
app.use("/api", facturesRouter);
app.use("/api", paiementsRouter);
app.use("/api", reclamationsRouter);
app.use("/api", dashboardRouter);

/* Healthcheck */
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

/* Servir le frontend buildé en production */
if (process.env.NODE_ENV === "production") {
  const publicDir = path.join(__dirname, "..", "public");
  app.use(express.static(publicDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Serveur REGIDESO démarré sur http://localhost:${PORT}`);
});
