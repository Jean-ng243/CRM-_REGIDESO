import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/landing";
import Dashboard from "./pages/dashboard";
import Abonnes from "./pages/abonnes";
import AbonnesNouveau from "./pages/abonnes-nouveau";
import Compteurs from "./pages/compteurs";
import Releves from "./pages/releves";
import Factures from "./pages/factures";
import Paiements from "./pages/paiements";
import Reclamations from "./pages/reclamations";
import NotFound from "./pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: false } },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/abonnes" component={Abonnes} />
      <Route path="/abonnes/nouveau" component={AbonnesNouveau} />
      <Route path="/compteurs" component={Compteurs} />
      <Route path="/releves" component={Releves} />
      <Route path="/factures" component={Factures} />
      <Route path="/paiements" component={Paiements} />
      <Route path="/reclamations" component={Reclamations} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
