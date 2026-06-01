import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { fetchReclamations, fetchAbonnes, createReclamation, updateReclamation } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const statutBadge: Record<string, string> = { ouverte: "bg-red-100 text-red-800 border-red-200", en_cours: "bg-amber-100 text-amber-800 border-amber-200", resolue: "bg-emerald-100 text-emerald-800 border-emerald-200", fermee: "bg-gray-100 text-gray-600 border-gray-200" };
const statutLabel: Record<string, string> = { ouverte: "Ouverte", en_cours: "En cours", resolue: "Résolue", fermee: "Fermée" };
const typeLabel: Record<string, string> = { fuite: "Fuite", facturation: "Facturation", compteur: "Compteur", coupure: "Coupure", autre: "Autre" };

const schema = z.object({
  abonneId: z.coerce.number().min(1, "Sélectionnez un abonné"),
  type: z.string().min(1, "Sélectionnez un type"),
  description: z.string().min(10, "La description doit faire au moins 10 caractères"),
  dateOuverture: z.string().min(1, "La date est requise"),
});
type FormData = z.infer<typeof schema>;

export default function Reclamations() {
  const [open, setOpen] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = filtreStatut !== "tous" ? { statut: filtreStatut } : {};
  const { data: reclamations, isLoading } = useQuery({ queryKey: ["reclamations", params], queryFn: () => fetchReclamations(params) });
  const { data: abonnes } = useQuery({ queryKey: ["abonnes", {}], queryFn: () => fetchAbonnes() });

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMut = useMutation({
    mutationFn: createReclamation,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reclamations"] }); toast({ title: "Réclamation enregistrée avec succès" }); setOpen(false); reset(); },
    onError: () => toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateReclamation(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["reclamations"] }); toast({ title: "Réclamation mise à jour" }); },
  });

  const nomAbonne = (id: number) => { const a = (abonnes as any[])?.find((x: any) => x.id === id); return a ? `${a.nom} ${a.prenom}` : `#${id}`; };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Réclamations</h1>
            <p className="text-muted-foreground mt-1">Gestion des litiges et réclamations des abonnés.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nouvelle réclamation</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Enregistrer une réclamation</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Abonné concerné</Label>
                  <Select onValueChange={v => setValue("abonneId", parseInt(v, 10))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{(abonnes as any[])?.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.nom} {a.prenom} — {a.numeroContrat}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.abonneId && <p className="text-sm text-destructive">{errors.abonneId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Type de réclamation</Label>
                  <Select onValueChange={v => setValue("type", v)}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fuite">Fuite d'eau</SelectItem>
                      <SelectItem value="facturation">Erreur de facturation</SelectItem>
                      <SelectItem value="compteur">Problème de compteur</SelectItem>
                      <SelectItem value="coupure">Coupure d'eau</SelectItem>
                      <SelectItem value="autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-destructive">{errors.type.message}</p>}
                </div>
                <div className="space-y-1.5"><Label>Description du problème</Label><Textarea placeholder="Décrivez le problème en détail..." rows={4} {...register("description")} />{errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}</div>
                <div className="space-y-1.5"><Label>Date d'ouverture</Label><Input type="date" {...register("dateOuverture")} />{errors.dateOuverture && <p className="text-sm text-destructive">{errors.dateOuverture.message}</p>}</div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={createMut.isPending}>{createMut.isPending ? "Enregistrement..." : "Enregistrer"}</Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex gap-3">
          <Select value={filtreStatut} onValueChange={setFiltreStatut}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les statuts</SelectItem>
              <SelectItem value="ouverte">Ouvertes</SelectItem>
              <SelectItem value="en_cours">En cours</SelectItem>
              <SelectItem value="resolue">Résolues</SelectItem>
              <SelectItem value="fermee">Fermées</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium">{reclamations ? `${(reclamations as any[]).length} réclamation(s)` : "Chargement..."}</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? <div className="space-y-2 p-6">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse bg-muted rounded-md" />)}</div>
            : (reclamations as any[])?.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Abonné</TableHead><TableHead>Type</TableHead><TableHead>Description</TableHead><TableHead>Date ouverture</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(reclamations as any[]).map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{nomAbonne(r.abonneId)}</TableCell>
                      <TableCell><span className="text-sm font-medium">{typeLabel[r.type] ?? r.type}</span></TableCell>
                      <TableCell className="max-w-[260px]"><p className="text-sm text-muted-foreground truncate">{r.description}</p></TableCell>
                      <TableCell>{r.dateOuverture}</TableCell>
                      <TableCell><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statutBadge[r.statut] ?? ""}`}>{statutLabel[r.statut] ?? r.statut}</span></TableCell>
                      <TableCell>
                        {r.statut === "ouverte" && <Button size="sm" variant="outline" onClick={() => updateMut.mutate({ id: r.id, data: { statut: "en_cours" } })}>Prendre en charge</Button>}
                        {r.statut === "en_cours" && <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50" onClick={() => updateMut.mutate({ id: r.id, data: { statut: "resolue", dateFermeture: new Date().toISOString().split("T")[0], resolution: "Réclamation résolue par l'agent." } })}>Marquer résolue</Button>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-muted-foreground font-medium">Aucune réclamation enregistrée</p></div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
