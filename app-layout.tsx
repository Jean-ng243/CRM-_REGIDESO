import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Gauge, FileText, Receipt, AlertTriangle, Menu, Droplet, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AppLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Tableau de bord", href: "/dashboard", icon: LayoutDashboard },
  { name: "Abonnés", href: "/abonnes", icon: Users },
  { name: "Compteurs", href: "/compteurs", icon: Gauge },
  { name: "Relevés d'index", href: "/releves", icon: FileText },
  { name: "Facturation", href: "/factures", icon: Receipt },
  { name: "Paiements", href: "/paiements", icon: Receipt },
  { name: "Réclamations", href: "/reclamations", icon: AlertTriangle },
];

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();

  const NavLinks = () => (
    <>
      {navigation.map((item) => {
        const isActive = location === item.href || location.startsWith(item.href + "/");
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <div className="flex h-14 items-center border-b px-4 lg:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden mr-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex items-center gap-2 mb-6 mt-4 px-2">
              <Droplet className="h-6 w-6 text-primary" />
              <span className="font-semibold tracking-tight">REGIDESO S.A.</span>
            </div>
            <nav className="flex flex-col gap-1">
              <NavLinks />
            </nav>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2 mr-6 hidden md:flex">
          <Droplet className="h-6 w-6 text-primary" />
          <span className="font-semibold tracking-tight text-lg">REGIDESO S.A.</span>
        </Link>

        <div className="ml-auto flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Page d'accueil</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-1">
        <aside className="hidden w-[240px] flex-col border-r bg-muted/40 md:flex">
          <nav className="flex-1 space-y-1 p-4">
            <NavLinks />
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
