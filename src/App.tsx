import { useNavigate } from "react-router-dom";
import CutSheetForms from "./components/CutSheetForms";
import FormatForms from "./components/FormatForms";
import { Button } from "./components/ui/button/button";

function App() {
  const navigate = useNavigate();

  return (
    // Główny kontener blokuje wysokość do 100% ekranu (h-screen)
    <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
      {/* Dodajemy style dla ładnych, cienkich pasków przewijania */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />

      {/* 1. HEADER (Stały na górze) */}
      <div className="border-b px-8 py-5 bg-white shrink-0 shadow-sm z-20">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight italic leading-none">
          CUT <span className="text-blue-600 font-black">MASTER</span> PRO
        </h1>
        <p className="text-slate-500 font-medium mt-1 text-sm">
          System optymalizacji rozkroju płyt meblowych
        </p>
      </div>

      {/* 2. GŁÓWNY OBSZAR ROBOCZY (Wypełnia resztę ekranu) */}
      <div className="flex-1 overflow-hidden w-full max-w-[1920px] mx-auto p-6">
        {/* Układ 3 kolumn obok siebie */}
        <div className="flex h-full gap-6">
          {/* KOLUMNA 1: Płyta Główna (Ustalona szerokość) */}
          <div className="w-[340px] shrink-0 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
            <FormatForms />
          </div>

          {/* KOLUMNA 2: Nowa Formatka (Ustalona szerokość) */}
          <div className="w-[340px] shrink-0 h-full overflow-y-auto custom-scrollbar pr-2 pb-6">
            <CutSheetForms showOnly="form" />
          </div>

          {/* KOLUMNA 3: Tabela Formatek (Zajmuje CAŁĄ resztę dostępnego miejsca) */}
          <div className="flex-1 flex flex-col h-full bg-white rounded-2xl shadow-sm border overflow-hidden min-w-0">
            {/* Nagłówek Tabeli (Stały, nie przewija się) */}
            <div className="flex justify-between items-center p-6 border-b shrink-0 bg-white z-10 gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                  LISTA FORMATEK
                </h2>
                <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">
                  Zestawienie elementów do produkcji
                </p>
              </div>

              <Button
                onClick={() => navigate("/cut-plan")}
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-7 text-xl font-black rounded-xl shadow-lg transition-all active:scale-95 flex gap-3 group whitespace-nowrap"
              >
                <span className="group-hover:animate-pulse">🚀</span> GENERUJ
                PLAN CIĘCIA
              </Button>
            </div>

            {/* Obszar przewijania samej tabeli (Tylko to pole ma scrolla) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              <CutSheetForms showOnly="table" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
