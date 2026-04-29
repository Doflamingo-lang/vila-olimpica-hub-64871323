import { useState } from "react";
import DataGrid from "./fees/DataGrid";
import FpdDataGrid from "./fees/FpdDataGrid";
import InstitutionsGrid from "./fees/InstitutionsGrid";
import { cn } from "@/lib/utils";

type System = "ffh" | "fdp" | "instituicoes";

const FeesManagement = () => {
  const [activeSystem, setActiveSystem] = useState<System>("ffh");

  const tabs: { key: System; label: string }[] = [
    { key: "ffh", label: "Taxa de Condomínio FFH" },
    { key: "fdp", label: "Taxa de Condomínio FDP" },
    { key: "instituicoes", label: "Instituições" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveSystem(t.key)}
            className={cn(
              "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
              activeSystem === t.key
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80 border"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeSystem === "ffh" && <DataGrid />}
      {activeSystem === "fdp" && <FpdDataGrid />}
      {activeSystem === "instituicoes" && <InstitutionsGrid />}
    </div>
  );
};

export default FeesManagement;
