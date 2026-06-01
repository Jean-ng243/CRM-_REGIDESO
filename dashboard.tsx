import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { fetchDashboardStats, fetchActiviteRecente, fetchConsommationMensuelle } from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Receipt, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { data: stats, isLoading: loadingStats } = useQuery({ queryKey: ["dashboard-stats"], queryFn: fetchDashboardStats });
  const { data: activite, isLoading: loadingActivite } = useQuery({ queryKey: ["activite-recente"], queryFn: fetchActiviteRecente });
  const { data: consommation, isLoading: loadingConsommation } = useQuery({ queryKey: ["consommation-mensuelle"], queryFn: fetchConsommationMensuelle });

  return (
    <AppLayout>
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground mt-1">Vue globale de la gestion des clients et de l'exploitation.</p>
        </div>

        {loadingStats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => <Card key={i} className="h-32 animate-pulse bg-muted" />)}
          </div>
        ) : stats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Abonnés</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAbonnes}</div>
                <p className="text-xs text-muted-foreground">{stats.abonnesActifs} actifs</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Factures Générées</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFactures}</div>
                <p className="text-xs text-muted-foreground">{stats.facturesImpayees} impayées</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Montant Recouvré</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.montantRecouvre.toLocaleString()} USD</div>
                <p className="text-xs text-muted-foreground">Total cumulé</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Réclamations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReclamations}</div>
                <p className="text-xs text-muted-foreground">En cours de traitement</p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader><CardTitle>Consommation Mensuelle (m³)</CardTitle></CardHeader>
            <CardContent className="pl-2">
              {loadingConsommation ? (
                <div className="h-[350px] w-full animate-pulse bg-muted rounded-md" />
              ) : consommation && consommation.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={consommation}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="mois" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="totalM3" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground">Aucune donnée disponible</div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader><CardTitle>Activité Récente</CardTitle></CardHeader>
            <CardContent>
              {loadingActivite ? (
                <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-12 animate-pulse bg-muted rounded-md" />)}</div>
              ) : activite && activite.length > 0 ? (
                <div className="space-y-6">
                  {activite.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {item.type.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{item.description}</p>
                        <p className="text-sm text-muted-foreground">{new Date(item.date).toLocaleDateString("fr-FR")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">Aucune activité</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
