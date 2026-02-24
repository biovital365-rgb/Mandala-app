import { useState, useEffect } from "react";
import { LandingPage } from "./components/LandingPage";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";
import { DetailView } from "./components/DetailView";
import { Auth } from "./components/Auth";
import { ReportTemplate } from "./components/ReportTemplate";
import { generateFullMap } from "./lib/numerology-engine";
import { jsPDF } from "jspdf";
import { toPng } from "html-to-image";
import { supabase } from "./lib/supabase";

export default function App() {
  const [view, setView] = useState<"landing" | "onboarding" | "dashboard" | "detail" | "auth">("landing");
  const [results, setResults] = useState<any>(null);
  const [selectedPillar, setSelectedPillar] = useState<string>("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Restaurar sesión con Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartOnboarding = () => {
    setView("onboarding");
  };

  const handleAuthClick = () => {
    setView("auth");
  };

  const handleAuthSuccess = (userData: any) => {
    setUser(userData);
    setView("landing");
  };

  const handleCompleteOnboarding = async (data: { dob: string; name: string }) => {
    const mapResult = generateFullMap(data.name, new Date(data.dob));
    const processedResults = {
      name: data.name,
      dob: data.dob,
      essence: mapResult.esencia,
      lifePath: mapResult.mision,
      nameVibration: mapResult.nombre,
      personalYear: mapResult.anoPersonal,
      divineGift: mapResult.regalo
    };

    setResults(processedResults);

    // Persistir en Supabase si está logueado
    if (user) {
      try {
        const { error } = await supabase.from('calculations').insert({
          user_id: user.id,
          name: data.name,
          birth_date: data.dob,
          results: processedResults
        });
        if (error) throw error;
      } catch (err) {
        console.error("Error persistiendo cálculo en Supabase", err);
      }
    }

    setView("dashboard");
  };

  const handleViewDetail = (pillar: string) => {
    setSelectedPillar(pillar);
    setView("detail");
  };

  const handleBackToDashboard = () => {
    setView("dashboard");
  };

  const handleBackToLanding = () => {
    setView("landing");
  };

  const handleGeneratePDF = async () => {
    const element = document.getElementById('pdf-report-template');
    if (!element || !results) return;

    try {
      // Asegurar visibilidad para la captura
      element.style.position = 'fixed';
      element.style.top = '0';
      element.style.left = '0';
      element.style.zIndex = '-1';
      element.style.display = 'block';

      // Pequeño delay para asegurar renderizado de iconos/fuentes
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2, // Mejor resolución
        backgroundColor: '#050505' // Asegurar fondo sólido
      });

      // Restaurar estado oculto
      element.style.display = 'none';
      element.style.position = 'absolute';
      element.style.top = '-10000px';

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Mandala_${results.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Error generando PDF", err);
      // Asegurar que se oculte si hay error
      if (element) {
        element.style.display = 'none';
        element.style.position = 'absolute';
        element.style.top = '-10000px';
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center overflow-hidden relative">
      <div id="pdf-report-template" style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        {results && <ReportTemplate results={results} />}
      </div>
      {view === "landing" && <LandingPage onStart={handleStartOnboarding} onAuthClick={handleAuthClick} user={user} />}
      {view === "auth" && <Auth onAuthSuccess={handleAuthSuccess} onBack={handleBackToLanding} />}
      {view === "onboarding" && <Onboarding onComplete={handleCompleteOnboarding} onBack={handleBackToLanding} />}
      {view === "dashboard" && results && (
        <Dashboard
          results={results}
          onViewDetail={handleViewDetail}
          onGeneratePDF={handleGeneratePDF}
        />
      )}
      {view === "detail" && results && (
        <DetailView
          pillar={selectedPillar}
          results={results}
          onBack={handleBackToDashboard}
        />
      )}
    </div>
  );
}
