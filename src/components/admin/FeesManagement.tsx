import { useState } from "react";
import DataGrid from "./fees/DataGrid";
import FpdDataGrid from "./fees/FpdDataGrid";
import { cn } from "@/lib/utils";

const FeesManagement = () => {
  const [activeSystem, setActiveSystem] = useState<"ffh" | "fdp">("ffh");

  return (
    <div className="space-y-6">
      {/* System Toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSystem("ffh")}
          className={cn(
            "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
            activeSystem === "ffh"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80 border"
          )}
        >
          Taxa de Condomínio FFH
        </button>
        <button
          onClick={() => setActiveSystem("fdp")}
          className={cn(
            "px-5 py-2.5 rounded-lg text-sm font-semibold transition-all",
            activeSystem === "fdp"
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80 border"
          )}
        >
          Taxa de Condomínio FDP
        </button>
      </div>

      {/* Content */}
      {activeSystem === "ffh" ? <DataGrid /> : <FpdDataGrid />}
    </div>
  );
};

export default FeesManagement;
