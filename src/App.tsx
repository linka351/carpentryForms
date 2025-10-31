import CutSheetForms from "./components/CutSheetForms";
import FormatForms from "./components/FormatForms";
import { Button } from "./components/ui/button/button";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  return (
    <>
      <FormatForms />
      <CutSheetForms />
      <Button onClick={() => navigate("/cut-plan")}>Generuj</Button>
    </>
  );
}

export default App;
