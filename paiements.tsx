import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { fetchPaiements, fetchAbonnes, fetchFactures, createPaiement } from "@/api/client";
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

const modeLabel: Record<string, string> = { especes: "Espèces", mobile_money: "Mobile Money", virement: "Virement", cheque: "Chèque" };

const schema = z.object({
  factureId: z.coerce.number().min(1, "Sélectionnez une facture"),
  abonneId: z.coerce.number().min(1, "Sélectionnez un abonné"),
  montant: z.coerce.number().positive("Le montant doit être positif"),
  modePaiement: z.string().min(1, "Sélectionnez un mode de paiement"),
  datePaiement: z.string().min(1, "La date est requise"),
  reference: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Paiements() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: paiements, isLoading } = useQuery({ queryKey: ["paiements"], queryFn: () => fetchPaiements() });
  const { data: abonnes } = useQuery({ queryKey: ["abonnes", {}], queryFn: () => fetchAbonnes() });
  const { data: facturesImpayees } = useQuery({ queryKey: ["factures", { statut: "impayee" }], queryFn: () => fetchFactures({ statut: "impayee" }) });
  const { data: facturesPartielles } = useQuery({ queryKey: ["factures", { statut: "partiellement_payee" }], queryFn: () => fetchFactures({ statut: "partiellement_payee" }) });
  const factures = [...((facturesImpayees as any[]) ?? []), ...((facturesPartielles as any[]) ?? [])];

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const mut = useMutation({
    mutationFn: createPaiement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paiements"] });
      queryClient.invalidateQueries({ queryKey: ["factures"] });
      toast({ title: "Paiement enregistré avec succès" });
      setOpen(false); reset();
    },
    onError: () => toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" }),
  });

  const nomAbonne = (id: number) => { const a = (abonnes as any[])?.find((x: any) => x.id === id); return a ? `${a.nom} ${a.prenom}` : `#${id}`; };

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
            <p className="text-muted-foreground mt-1">Historique des encaissements aux guichets de la REGIDESO.</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Enregistrer un paiement</Button></DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Enregistrer un paiement</DialogTitle></DialogHeader>
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
                  <Label>Facture à régler</Label>
                  <Select onValueChange={v => setValue("factureId", parseInt(v, 10))}>
                    <SelectTrigger><SelectValue placeholder="Sélectionner une facture" /></SelectTrigger>
                    <SelectContent>{factures.map((f: any) => <SelectItem key={f.id} value={String(f.id)}>FAC-{String(f.id).padStart(5,"0")} — {Number(f.montantTotal).toFixed(2)} USD ({f.statut})</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.factureId && <p className="text-sm text-destructive">{errors.factureId.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Montant (USD)</Label><Input type="number" step="0.01" placeholder="0.00" {...register("montant")} />{errors.montant && <p className="text-sm text-destructive">{errors.montant.message}</p>}</div>
                  <div className="space-y-1.5">
                    <Label>Mode de paiement</Label>
                    <Select onValueChange={v => setValue("modePaiement", v)}>
                      <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                      <SelectContent><SelectItem value="especes">Espèces</SelectItem><SelectItem value="mobile_money">Mobile Money</SelectItem><SelectItem value="virement">Virement</SelectItem><SelectItem value="cheque">Chèque</SelectItem></SelectContent>
                    </Select>
                    {errors.modePaiement && <p className="text-sm text-destructive">{errors.modePaiement.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label>Date du paiement</Label><Input type="date" {...register("datePaiement")} />{errors.datePaiement && <p className="text-sm text-destructive">{errors.datePaiement.message}</p>}</div>
                  <div className="space-y-1.5"><Label>Référence (optionnel)</Label><Input placeholder="Ex : REF-00123" {...register("reference")} /></div>
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
          <CardHeader><CardTitle className="text-base font-medium">{paiements ? `${(paiements as any[]).length} paiement(s)` : "Chargement..."}</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? <div className="space-y-2 p-6">{[1,2,3].map(i => <div key={i} className="h-12 animate-pulse bg-muted rounded-md" />)}</div>
            : (paiements as any[])?.length > 0 ? (
              <Table>
                <TableHeader><TableRow><TableHead>Référence</TableHead><TableHead>Abonné</TableHead><TableHead>Facture</TableHead><TableHead>Montant (USD)</TableHead><TableHead>Mode</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                <TableBody>
                  {(paiements as any[]).map((p: any) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.reference ?? `PAY-${String(p.id).padStart(5,"0")}`}</TableCell>
                      <TableCell className="font-medium">{nomAbonne(p.abonneId)}</TableCell>
                      <TableCell className="font-mono text-sm">FAC-{String(p.factureId).padStart(5,"0")}</TableCell>
                      <TableCell className="font-bold text-emerald-700">{Number(p.montant).toFixed(2)}</TableCell>
                      <TableCell>{modeLabel[p.modePaiement] ?? p.modePaiement}</TableCell>
                      <TableCell>{p.datePaiement}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : <div className="flex flex-col items-center justify-center py-16 text-center"><p className="text-muted-foreground font-medium">Aucun paiement enregistré</p></div>}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
