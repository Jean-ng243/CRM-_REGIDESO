import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { fetchReleves, fetchAbonnes, fetchCompteurs, createReleve } from "@/api/client";
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

const schema = z.object({
  compteurId: z.coerce.number().min(1, "Sélectionnez un compteur"),
  abonneId: z.coerce.number().min(1, "Sélectionnez un abonné"),
  indexPrecedent: z.coerce.number().min(0),
  indexActuel: z.coerce.number().min(0),
  dateReleve: z.string().min(1, "La date est requise"),
  observation: z.string().optional(),
}).refine(d => d.indexActuel >= d.indexPrecedent, { message: "L'index actuel doit être ≥ à l'index précédent", path: ["indexActuel"] });
type FormData = z.infer<typeof schema>;

export default function Releves() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: releves, isLoading } = useQuery({ queryKey: ["releves"], queryFn: () => fetchReleves() });
  const { data: abonnes } = useQuery({ queryKey: ["abonnes", {}], queryFn: () => fetchAbonnes() });
  const { data: compteurs } = useQuery({ queryKey: ["compteurs"], queryFn: fetchCompteurs });

  const { register, handleSubmit, setValue, reset, watch, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const indexPrec = watch("indexPrecedent") ?? 0;
  const indexAct = watch("indexActuel") ?? 0;
  const consommation = Math.max(0, (indexAct || 0) - (indexPrec || 0));

  const mut = useMutation({
    mutationFn: createReleve,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["releves"] }); toast({ title: "Relevé enregistré avec succès" }); setOpen(false); reset(); },
    onError: () => toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" }),
  });

  const nomAbonne = (id: number) => { const a = (abonnes as any[])?.find((x: any) => x.id === id); return a ? `${a.nom} ${a.prenom}` : `#${id}`; };
  const nomCompteur = (id: number) => { const c = (compteurs as any[])?.find((x: any) => x.id === id); return c ? c.numeroCompteur : `#${id}`; };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Relevés d'index</h1>
            <p className="text-muted-foreground mt-1">Saisie et historique des relevés de consommation (m³).</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nouveau relevé</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Saisir un relevé d'index</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Abonné</Label>
                  <Select onValueChange={v => setValue("abonneId", parseInt(v, 10))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{(abonnes as any[])?.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.nom} {a.prenom} — {a.numeroContrat}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.abonneId && <p className="text-sm text-destructive">{errors.abonneId.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Compteur</Label>
                  <Select onValueChange={v => setValue("compteurId", parseInt(v, 10))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>{(compteurs as any[])?.map((c: any) => <SelectItem key={c.id} value={String(c.id)}>{c.numeroCompteur} ({c.marque})</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.compteurId && <p className="text-sm text-destructive">{errors.compteurId.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Index précédent (m³)</Label><Input type="number" step="0.001" {...register("indexPrecedent")} /></div>
                  <div className="space-y-1.5"><Label>Index actuel (m³)</Label><Input type="number" step="0.001" {...register("indexActuel")} />{errors.indexActuel && <p className="text-sm text-destructive">{errors.indexActuel.message}</p>}</div>
                </div>
                <div className="rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                  <p className="text-sm text-muted-foreground">Consommation calculée</p>
                  <p className="text-2xl font-bold text-primary">{consommation.toFixed(3)} m³</p>
                </div>
                <div className="space-y-1.5"><Label>Date du relevé</Label><Input type="date" {...register("dateReleve")} />{errors.dateReleve && <p className="text-sm text-destructive">{errors.dateReleve.message}</p>}</div>
                <div className="space-y-1.5"><Label>Observation (optionnel)</Label><Textarea placeholder="Remarques du releveur..." {...register("observation")} /></div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Enregistrement..." : "Enregistrer"}</Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium">{releves ? `${(releves as any[]).length} relevé(s)` : "Chargement..."}</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? <div className="space-y-2 p-6">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse bg-muted rounded-md" />)}</div>
            : (releves as any[])?.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Abonné</TableHead><TableHead>Compteur</TableHead><TableHead>Index préc.</TableHead><TableHead>Index act.</TableHead><TableHead>Consommation</TableHead><TableHead>Date du relevé</TableHead><TableHead>Observation</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(releves as any[]).map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">{nomAbonne(r.abonneId)}</TableCell>
                      <TableCell className="font-mono text-sm">{nomCompteur(r.compteurId)}</TableCell>
                      <TableCell className="font-mono">{Number(r.indexPrecedent).toFixed(1)}</TableCell>
                      <TableCell className="font-mono">{Number(r.indexActuel).toFixed(1)}</TableCell>
                      <TableCell><span className="font-semibold text-primary">{Number(r.consommationM3).toFixed(1)} m³</span></TableCell>
                      <TableCell>{r.dateReleve}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.observation ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-muted-foreground font-medium">Aucun relevé enregistré</p></div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
