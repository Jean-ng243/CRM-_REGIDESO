import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { createAbonne } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  numeroContrat: z.string().min(1, "Le numéro de contrat est requis"),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
  adresse: z.string().min(1, "L'adresse est requise"),
  commune: z.string().min(1, "La commune est requise"),
  telephone: z.string().min(1, "Le téléphone est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  statut: z.string().default("actif"),
});
type FormData = z.infer<typeof schema>;

export default function AbonnesNouveau() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { statut: "actif" },
  });

  const mut = useMutation({
    mutationFn: createAbonne,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["abonnes"] });
      toast({ title: "Abonné enregistré avec succès" });
      navigate("/abonnes");
    },
    onError: () => toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" }),
  });

  function onSubmit(data: FormData) {
    mut.mutate({ ...data, email: data.email || undefined });
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 max-w-2xl">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/abonnes")}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nouvel abonné</h1>
            <p className="text-muted-foreground mt-1">Enregistrez un nouvel abonné dans le système.</p>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>Informations du contrat</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="numeroContrat">Numéro de contrat</Label>
                <Input id="numeroContrat" placeholder="Ex : REG-2025-0001" {...register("numeroContrat")} />
                {errors.numeroContrat && <p className="text-sm text-destructive">{errors.numeroContrat.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nom">Nom</Label>
                  <Input id="nom" placeholder="Nom de famille" {...register("nom")} />
                  {errors.nom && <p className="text-sm text-destructive">{errors.nom.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="prenom">Prénom</Label>
                  <Input id="prenom" placeholder="Prénom" {...register("prenom")} />
                  {errors.prenom && <p className="text-sm text-destructive">{errors.prenom.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adresse">Adresse</Label>
                <Input id="adresse" placeholder="Ex : Avenue Lumumba, n°32" {...register("adresse")} />
                {errors.adresse && <p className="text-sm text-destructive">{errors.adresse.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="commune">Commune</Label>
                <Input id="commune" placeholder="Ex : Kalamu, Gombe, Limete..." {...register("commune")} />
                {errors.commune && <p className="text-sm text-destructive">{errors.commune.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="telephone">Téléphone</Label>
                  <Input id="telephone" placeholder="08XXXXXXXX" {...register("telephone")} />
                  {errors.telephone && <p className="text-sm text-destructive">{errors.telephone.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email (optionnel)</Label>
                  <Input id="email" type="email" placeholder="abonne@email.cd" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Statut</Label>
                <Select defaultValue="actif" onValueChange={v => setValue("statut", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="actif">Actif</SelectItem>
                    <SelectItem value="suspendu">Suspendu</SelectItem>
                    <SelectItem value="resilie">Résilié</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={mut.isPending}>{mut.isPending ? "Enregistrement..." : "Enregistrer l'abonné"}</Button>
                <Button type="button" variant="outline" onClick={() => navigate("/abonnes")}>Annuler</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
