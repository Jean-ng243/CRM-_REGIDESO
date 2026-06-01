import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { fetchFactures, fetchAbonnes, fetchReleves, createFacture, updateFacture } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const statutBadge: Record<string, string> = {
  impayee: "bg-red-100 text-red-800 border-red-200",
  payee: "bg-emerald-100 text-emerald-800 border-emerald-200",
  partiellement_payee: "bg-amber-100 text-amber-800 border-amber-200",
  annulee: "bg-gray-100 text-gray-600 border-gray-200",
};
const statutLabel: Record<string, string> = { impayee: "Impayée", payee: "Payée", partiellement_payee: "Partiellement payée", annulee: "Annulée" };

const schema = z.object({
  abonneId: z.coerce.number().min(1, "Sélectionnez un abonné"),
  releveId: z.coerce.number().min(1, "Sélectionnez un relevé"),
  dateEcheance: z.string().min(1, "La date d'échéance est requise"),
});
type FormData = z.infer<typeof schema>;

export default function Factures() {
  const [open, setOpen] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState("tous");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = filtreStatut !== "tous" ? { statut: filtreStatut } : {};
  const { data: factures, isLoading } = useQuery({ queryKey: ["factures", params], queryFn: () => fetchFactures(params) });
  const { data: abonnes } = useQuery({ queryKey: ["abonnes", {}], queryFn: () => fetchAbonnes() });
  const { data: releves } = useQuery({ queryKey: ["releves"], queryFn: () => fetchReleves() });

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const createMut = useMutation({
    mutationFn: createFacture,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["factures"] }); toast({ title: "Facture générée avec succès" }); setOpen(false); reset(); },
    onError: () => toast({ title: "Erreur lors de la génération", variant: "destructive" }),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => updateFacture(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["factures"] }); toast({ title: "Statut mis à jour" }); },
  });

  const nomAbonne = (id: number) => { const a = (abonnes as any[])?.find((x: any) => x.id === id); return a ? `${a.nom} ${a.prenom}` : `#${id}`; };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Facturation</h1>
            <p className="text-muted-foreground mt-1">Génération et suivi des factures selon les tranches tarifaires.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Générer une facture</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Générer une facture</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground mb-4">Montant calculé selon les tranches REGIDESO : 0–6 m³ → 0,35 USD/m³ · 7–15 m³ → 0,55 USD/m³ · au-delà → 0,80 USD/m³.</p>
              <form onSubmit={handleSubmit(d => createMut.mutate(d))} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Abonné</Label>
                  <Select onValueChange={v => setValue("abonneId", parseInt(v, 10))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{(abonnes as any[])?.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.nom} {a.prenom} — {a.numeroContrat}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.abonneId && <p className="text-sm text-destructive">{errors.abonneId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Relevé à facturer</Label>
                  <Select onValueChange={v => setValue("releveId", parseInt(v, 10))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un relevé" /></SelectTrigger>
                    <SelectContent>{(releves as any[])?.map((r: any) => <SelectItem key={r.id} value={String(r.id)}>{r.dateReleve} — {Number(r.consommationM3).toFixed(1)} m³ (abonné #{r.abonneId})</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.releveId && <p className="text-sm text-destructive">{errors.releveId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Date d'échéance</Label>
                  <Input type="date" {...register("dateEcheance")} />
                  {errors.dateEcheance && <p className="text-sm text-destructive">{errors.dateEcheance.message}</p>}
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={createMut.isPending}>{createMut.isPending ? "Génération..." : "Générer la facture"}</Button>
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
              <SelectItem value="impayee">Impayées</SelectItem>
              <SelectItem value="payee">Payées</SelectItem>
              <SelectItem value="partiellement_payee">Partiellement payées</SelectItem>
              <SelectItem value="annulee">Annulées</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium">{factures ? `${(factures as any[]).length} facture(s)` : "Chargement..."}</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? <div className="space-y-2 p-6">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse bg-muted rounded-md" />)}</div>
            : (factures as any[])?.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>N° Facture</TableHead><TableHead>Abonné</TableHead><TableHead>Montant (USD)</TableHead><TableHead>Émission</TableHead><TableHead>Échéance</TableHead><TableHead>Statut</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(factures as any[]).map((f: any) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono text-sm">FAC-{String(f.id).padStart(5, "0")}</TableCell>
                      <TableCell className="font-medium">{nomAbonne(f.abonneId)}</TableCell>
                      <TableCell className="font-bold">{Number(f.montantTotal).toFixed(2)}</TableCell>
                      <TableCell>{f.dateEmission}</TableCell>
                      <TableCell>{f.dateEcheance}</TableCell>
                      <TableCell><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statutBadge[f.statut] ?? ""}`}>{statutLabel[f.statut] ?? f.statut}</span></TableCell>
                      <TableCell>{f.statut === "impayee" && <Button size="sm" variant="outline" onClick={() => updateMut.mutate({ id: f.id, data: { statut: "payee" } })}>Marquer payée</Button>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-muted-foreground font-medium">Aucune facture générée</p></div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
