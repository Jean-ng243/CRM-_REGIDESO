/* Client API — appels fetch vers le serveur Express */

const BASE = "/api";

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`Erreur API ${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json();
}

/* Abonnés */
export const fetchAbonnes = (p?: { search?: string; statut?: string }) =>
  req<any[]>(`/abonnes${p && Object.keys(p).length ? "?" + new URLSearchParams(p as any) : ""}`);
export const createAbonne = (data: any) => req<any>("/abonnes", { method: "POST", body: JSON.stringify(data) });
export const updateAbonne = (id: number, data: any) => req<any>(`/abonnes/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteAbonne = (id: number) => req<void>(`/abonnes/${id}`, { method: "DELETE" });

/* Compteurs */
export const fetchCompteurs = () => req<any[]>("/compteurs");
export const createCompteur = (data: any) => req<any>("/compteurs", { method: "POST", body: JSON.stringify(data) });
export const updateCompteur = (id: number, data: any) => req<any>(`/compteurs/${id}`, { method: "PATCH", body: JSON.stringify(data) });

/* Relevés */
export const fetchReleves = (p?: { abonneId?: number; compteurId?: number }) =>
  req<any[]>(`/releves${p && Object.keys(p).length ? "?" + new URLSearchParams(p as any) : ""}`);
export const createReleve = (data: any) => req<any>("/releves", { method: "POST", body: JSON.stringify(data) });

/* Factures */
export const fetchFactures = (p?: { statut?: string; abonneId?: number }) =>
  req<any[]>(`/factures${p && Object.keys(p).length ? "?" + new URLSearchParams(p as any) : ""}`);
export const createFacture = (data: any) => req<any>("/factures", { method: "POST", body: JSON.stringify(data) });
export const updateFacture = (id: number, data: any) => req<any>(`/factures/${id}`, { method: "PATCH", body: JSON.stringify(data) });

/* Paiements */
export const fetchPaiements = (p?: { abonneId?: number; factureId?: number }) =>
  req<any[]>(`/paiements${p && Object.keys(p).length ? "?" + new URLSearchParams(p as any) : ""}`);
export const createPaiement = (data: any) => req<any>("/paiements", { method: "POST", body: JSON.stringify(data) });

/* Réclamations */
export const fetchReclamations = (p?: { statut?: string; abonneId?: number }) =>
  req<any[]>(`/reclamations${p && Object.keys(p).length ? "?" + new URLSearchParams(p as any) : ""}`);
export const createReclamation = (data: any) => req<any>("/reclamations", { method: "POST", body: JSON.stringify(data) });
export const updateReclamation = (id: number, data: any) => req<any>(`/reclamations/${id}`, { method: "PATCH", body: JSON.stringify(data) });

/* Dashboard */
export const fetchDashboardStats = () => req<any>("/dashboard/stats");
export const fetchActiviteRecente = () => req<any[]>("/dashboard/activite-recente");
export const fetchConsommationMensuelle = () => req<any[]>("/dashboard/consommation-mensuelle");
