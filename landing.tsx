import { Link } from "wouter";
import { Droplet, ArrowRight, ShieldCheck, Zap, Server, Phone, Mail, MapPin, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-6 lg:px-14 h-20 flex items-center border-b">
        <div className="flex items-center gap-2">
          <Droplet className="h-8 w-8 text-primary" />
          <span className="font-bold text-xl tracking-tight">REGIDESO S.A.</span>
        </div>
        <nav className="ml-auto hidden md:flex gap-6">
          <a href="#mission" className="text-sm font-medium text-muted-foreground hover:text-foreground">Mission</a>
          <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">Fonctionnalités</a>
        </nav>
        <div className="ml-auto md:ml-6 flex items-center gap-4">
          <Link href="/dashboard">
            <Button>Accéder au Portail</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 lg:py-32 px-6 lg:px-14 bg-muted/30">
          <div className="max-w-[800px] mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Gestion centralisée de la relation client
            </h1>
            <p className="text-lg lg:text-xl text-muted-foreground mb-10">
              La plateforme moderne pour la gestion des abonnés, compteurs, relevés et facturation de la Régie de Distribution d'Eau S.A. à Kinshasa.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="h-12 px-8 text-base">
                Ouvrir le tableau de bord <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        <section id="features" className="py-24 px-6 lg:px-14 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Une infrastructure performante</h2>
            <p className="text-muted-foreground max-w-[600px] mx-auto">
              Éliminez les processus manuels et sécurisez vos données avec des outils adaptés aux exigences du service public moderne.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-card border rounded-xl shadow-sm">
              <Server className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Centralisation Totale</h3>
              <p className="text-muted-foreground">Regroupez tous vos abonnés, contrats et compteurs dans un espace de travail unique et unifié.</p>
            </div>
            <div className="p-6 bg-card border rounded-xl shadow-sm">
              <Zap className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Facturation Rapide</h3>
              <p className="text-muted-foreground">Générez des factures fiables basées sur des relevés d'index précis avec un suivi des paiements en temps réel.</p>
            </div>
            <div className="p-6 bg-card border rounded-xl shadow-sm">
              <ShieldCheck className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">Résolution des Litiges</h3>
              <p className="text-muted-foreground">Gérez efficacement les réclamations et assurez une qualité de service optimale pour tous vos abonnés.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card">
        {/* Bloc coordonnées officielles */}
        <div className="py-12 px-6 lg:px-14 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Identité */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Droplet className="h-6 w-6" />
                <span className="font-bold text-lg">REGIDESO S.A.</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Régie de Distribution d'Eau — Société d'utilité publique étatique chargée de la production et de la distribution d'eau potable en République Démocratique du Congo depuis 1929.
              </p>
            </div>

            {/* Coordonnées */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-foreground">Coordonnées officielles</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span>59–63, Boulevard du 30 Juin, Commune de la Gombe<br />BP 12599, Kinshasa — RDC</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Call center : <strong className="text-foreground">4020</strong></span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                  <a href="mailto:courrier@regideso.cd" className="hover:text-primary transition-colors">courrier@regideso.cd</a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                  <a href="https://www.regideso.cd" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">www.regideso.cd</a>
                </li>
              </ul>
            </div>

            {/* Tutelle */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wide text-foreground">Tutelle</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ministère de l'Énergie et du Portefeuille — République Démocratique du Congo.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                REGIDESO détient le monopole institutionnel sur la production et la distribution d'eau potable sur l'ensemble du territoire national.
              </p>
            </div>
          </div>
        </div>

        {/* Barre de bas de page */}
        <div className="border-t py-6 px-6 lg:px-14">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
            <p>© 2025 REGIDESO S.A. — Tous droits réservés.</p>
            <div className="text-center md:text-right leading-relaxed bg-muted/50 rounded-lg px-4 py-2">
              Projet Tutoré — Jean Ngandu · L3 Informatique de Gestion, Option Conception des Systèmes d'Information · HEC-Kinshasa · Année Académique 2025–2026
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
