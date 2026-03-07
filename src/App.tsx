import { useNavigate } from "react-router-dom";
import CutSheetForms from "./components/CutSheetForms";
import FormatForms from "./components/FormatForms";
import { Button } from "./components/ui/button/button";

function App() {
  const navigate = useNavigate();

  return (
    /* 1. Rama zajmuje 100% szerokości okna */
    <div className="min-h-screen w-full bg-slate-50 py-10 px-6">
      {/* 2. Usunąłem max-w-7xl, teraz ten div rozciąga się na maksa (w-full) */}
      <div className="w-full space-y-10">
        {/* Header */}
        <div className="border-b pb-6">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">
            CUT <span className="text-blue-600 font-black">MASTER</span> PRO
          </h1>
          <p className="text-slate-500 font-medium">
            System optymalizacji rozkroju płyt meblowych
          </p>
        </div>

        {/* Sekcja formularzy */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Formularz parametrów płyty zostawiamy na stałej szerokości, żeby nie był "rozjechany" */}
          <div className="w-full lg:w-[380px] shrink-0">
            <FormatForms />
          </div>
          {/* Formularz dodawania formatek rozciąga się na resztę miejsca */}
          <div className="flex-1 w-full">
            <CutSheetForms showOnly="form" />
          </div>
        </div>

        {/* Sekcja Tabeli i Akcji - teraz na pełną szerokość */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl border shadow-sm gap-4">
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
              className="bg-green-600 hover:bg-green-700 text-white px-14 py-8 text-xl font-black rounded-xl shadow-lg transition-all active:scale-95 flex gap-3 group whitespace-nowrap"
            >
              <span className="group-hover:animate-pulse">🚀</span> GENERUJ PLAN
              CIĘCIA
            </Button>
          </div>

          <div className="w-full">
            {/* Tabela zajmie teraz całą szerokość monitora */}
            <CutSheetForms showOnly="table" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
