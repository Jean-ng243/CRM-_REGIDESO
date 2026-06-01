import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { fetchAbonnes, deleteAbonne } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Search, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const statutBadge: Record<string, string> = {
  actif: "bg-emerald-100 text-emerald-800 border-emerald-200",
  suspendu: "bg-amber-100 text-amber-800 border-amber-200",
  resilie: "bg-red-100 text-red-800 border-red-200",
};
const statutLabel: Record<string, string> = { actif: "Actif", suspendu: "Suspendu", resilie: "Résilié" };

export default function Abonnes() {
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("tous");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const params = { ...(search ? { search } : {}), ...(statut !== "tous" ? { statut } : {}) };
  const { data: abonnes, isLoading } = useQuery({ queryKey: ["abonnes", params], queryFn: () => fetchAbonnes(params) });

  const deleteMut = useMutation({
    mutationFn: (id: number) => deleteAbonne(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["abonnes"] }); toast({ title: "Abonné supprimé avec succès" }); },
    onError: () => toast({ title: "Erreur lors de la suppression", variant: "destructive" }),
  });

  return (
    <AppLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Abonnés</h1>
            <p className="text-muted-foreground mt-1">Gérez les abonnés enregistrés auprès de la REGIDESO S.A.</p>
          </div>
          <Link href="/abonnes/nouveau"><Button><Plus className="mr-2 h-4 w-4" />Nouvel abonné</Button></Link>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher par nom, contrat, commune..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Select value={statut} onValueChange={setStatut}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Statut" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les statuts</SelectItem>
              <SelectItem value="actif">Actif</SelectItem>
              <SelectItem value="suspendu">Suspendu</SelectItem>
              <SelectItem value="resilie">Résilié</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base font-medium">{abonnes ? `${abonnes.length} abonné(s) trouvé(s)` : "Chargement..."}</CardTitle></CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-6">{[1,2,3,4,5].map(i => <div key={i} className="h-12 animate-pulse bg-muted rounded-md" />)}</div>
            ) : abonnes && abonnes.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Contrat</TableHead><TableHead>Nom complet</TableHead><TableHead>Commune</TableHead>
                    <TableHead>Téléphone</TableHead><TableHead>Statut</TableHead><TableHead>Enregistré le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {abonnes.map((a: any) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-sm font-medium">{a.numeroContrat}</TableCell>
                      <TableCell className="font-medium">{a.nom} {a.prenom}</TableCell>
                      <TableCell>{a.commune}</TableCell>
                      <TableCell>{a.telephone}</TableCell>
                      <TableCell><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statutBadge[a.statut] ?? ""}`}>{statutLabel[a.statut] ?? a.statut}</span></TableCell>
                      <TableCell className="text-muted-foreground text-sm">{new Date(a.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                              <AlertDialogDescription>Supprimer l'abonné {a.nom} {a.prenom} (contrat {a.numeroContrat}) ? Cette action est irréversible.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteMut.mutate(a.id)}>Supprimer</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-muted-foreground font-medium">Aucun abonné trouvé</p>
                <p className="text-sm text-muted-foreground mt-1">Modifiez vos critères ou enregistrez un nouvel abonné.</p>
                <Link href="/abonnes/nouveau"><Button className="mt-4" variant="outline"><Plus className="mr-2 h-4 w-4" />Enregistrer un abonné</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
