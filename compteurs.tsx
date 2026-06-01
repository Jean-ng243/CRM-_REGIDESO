import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { fetchCompteurs, fetchAbonnes, createCompteur } from "@/api/client";
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

const etatBadge: Record<string, string> = {
  actif: "bg-emerald-100 text-emerald-800 border-emerald-200",
  defectueux: "bg-red-100 text-red-800 border-red-200",
  remplace: "bg-gray-100 text-gray-700 border-gray-200",
};
const etatLabel: Record<string, string> = { actif: "Actif", defectueux: "Défectueux", remplace: "Remplacé" };

const schema = z.object({
  numeroCompteur: z.string().min(1, "Le numéro de compteur est requis"),
  abonneId: z.coerce.number().min(1, "Veuillez sélectionner un abonné"),
  marque: z.string().min(1, "La marque est requise"),
  dateInstallation: z.string().min(1, "La date est requise"),
  etat: z.string().default("actif"),
  indexInitial: z.coerce.number().default(0),
});
type FormData = z.infer<typeof schema>;

export default function Compteurs() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: compteurs, isLoading } = useQuery({ queryKey: ["compteurs"], queryFn: fetchCompteurs });
  const { data: abonnes } = useQuery({ queryKey: ["abonnes", {}], queryFn: () => fetchAbonnes() });

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { etat: "actif", indexInitial: 0 },
  });

  const mut = useMutation({
    mutationFn: createCompteur,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["compteurs"] }); toast({ title: "Compteur enregistré avec succès" }); setOpen(false); reset(); },
    onError: () => toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" }),
  });

  function nomAbonne(id: number) { const a = (abonnes as any[])?.find((a: any) => a.id === id); return a ? `${a.nom} ${a.prenom}` : `Abonné #${id}`; }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compteurs</h1>
            <p className="text-muted-foreground mt-1">Gérez les compteurs d'eau associés aux abonnés.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Nouveau compteur</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Enregistrer un compteur</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit(d => mut.mutate(d))} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Numéro de compteur</Label>
                  <Input placeholder="Ex : CPT-006-KIN" {...register("numeroCompteur")} />
                  {errors.numeroCompteur && <p className="text-sm text-destructive">{errors.numeroCompteur.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label>Abonné</Label>
                  <Select onValueChange={v => setValue("abonneId", parseInt(v, 10))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner un abonné" /></SelectTrigger>
                    <SelectContent>{(abonnes as any[])?.map((a: any) => <SelectItem key={a.id} value={String(a.id)}>{a.nom} {a.prenom} — {a.numeroContrat}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.abonneId && <p className="text-sm text-destructive">{errors.abonneId.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Marque</Label><Input placeholder="Ex : Sensus" {...register("marque")} /></div>
                  <div className="space-y-1.5"><Label>Date d'installation</Label><Input type="date" {...register("dateInstallation")} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>État</Label>
                    <Select defaultValue="actif" onValueChange={v => setValue("etat", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="defectueux">Défectueux</SelectItem><SelectItem value="remplace">Remplacé</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5"><Label>Index initial (m³)</Label><Input type="number" step="0.001" defaultValue={0} {...register("indexInitial")} /></div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Enregistrement..." : "Enregistrer"}</Button>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <CardHeader><CardTitle className="text-base font-medium">{compteurs ? `${(compteurs as any[]).length} compteur(s)` : "Chargement..."}</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? <div className="space-y-2 p-6">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse bg-muted rounded-md" />)}</div>
            : (compteurs as any[])?.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>N° Compteur</TableHead><TableHead>Abonné</TableHead><TableHead>Marque</TableHead><TableHead>Date installation</TableHead><TableHead>Index initial</TableHead><TableHead>État</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(compteurs as any[]).map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm font-medium">{c.numeroCompteur}</TableCell>
                      <TableCell>{nomAbonne(c.abonneId)}</TableCell>
                      <TableCell>{c.marque}</TableCell>
                      <TableCell>{c.dateInstallation}</TableCell>
                      <TableCell className="font-mono">{Number(c.indexInitial).toFixed(1)} m³</TableCell>
                      <TableCell><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${etatBadge[c.etat] ?? ""}`}>{etatLabel[c.etat] ?? c.etat}</span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-muted-foreground font-medium">Aucun compteur enregistré</p></div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
