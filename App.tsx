import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Layout from "@/components/layout";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
import ClientDetail from "@/pages/clients/[id]";
import Consommations from "@/pages/consommations";
import Factures from "@/pages/factures";
import Reclamations from "@/pages/reclamations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/clients/:id">
        <Layout>
          <ClientDetail />
        </Layout>
      </Route>
      <Route path="/clients">
        <Layout>
          <Clients />
        </Layout>
      </Route>
      <Route path="/consommations">
        <Layout>
          <Consommations />
        </Layout>
      </Route>
      <Route path="/factures">
        <Layout>
          <Factures />
        </Layout>
      </Route>
      <Route path="/reclamations">
        <Layout>
          <Reclamations />
        </Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
