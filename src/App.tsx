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
    // Asegurar que la fecha se trate como local sin desplazamiento de zona horaria
    const [year, month, day] = data.dob.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day, 12, 0, 0); // Al medio día para robustez

    const mapResult = generateFullMap(data.name, dateObj);
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
    const reportElement = document.getElementById('pdf-report-template');
    if (!reportElement || !results) return;

    try {
      console.log("Generando PDF...");
      // Forzar visibilidad para la captura pero mantener fuera de pantalla
      reportElement.style.display = 'block';
      reportElement.style.position = 'fixed';
      reportElement.style.left = '-10000px';
      reportElement.style.top = '0';

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageIds = ['pdf-page-cover', 'pdf-page-esencia', 'pdf-page-mision', 'pdf-page-nombre', 'pdf-page-ano', 'pdf-page-regalo', 'pdf-page-synthesis'];

      for (let i = 0; i < pageIds.length; i++) {
        const pageElement = document.getElementById(pageIds[i]);
        if (!pageElement) {
          console.warn(`Página no encontrada: ${pageIds[i]}`);
          continue;
        }

        // Delay para asegurar que los estilos (especialmente gradientes y glassmorphism) se apliquen
        await new Promise(resolve => setTimeout(resolve, 1500));

        const dataUrl = await toPng(pageElement, {
          quality: 0.95,
          pixelRatio: 1.5,
          backgroundColor: '#050505',
          cacheBust: true,
          skipFonts: false
        });

        if (i > 0) pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, 0, 210, 297);
      }

      pdf.save(`Estudio_Numerologico_${results.name.replace(/\s+/g, '_')}.pdf`);
      console.log("PDF generado con éxito");
    } catch (err) {
      console.error("Error detallado generando PDF:", err);
    } finally {
      // No ocultamos aquí si queremos re-intentar, pero el div padre en App.tsx lo mantiene oculto
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center overflow-hidden relative">
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
