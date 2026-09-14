import { useEditMode } from "@/contexts/EditModeContext";
import { Button } from "@/components/ui/button";
import { Edit3, X, Save, Loader2, Eye } from "lucide-react";

export function AdminToolbar() {
  const { isAdmin, editMode, toggleEditMode, saveContent, discardChanges, isSaving, isDirty } = useEditMode();

  if (!isAdmin) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
      <div className="container mx-auto px-4 pb-4 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-2 bg-gray-900 text-white rounded-2xl px-4 py-2.5 shadow-2xl border border-white/10">
          {editMode ? (
            <>
              <span className="text-xs font-medium text-green-400 mr-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Edit Mode aktif
              </span>
              {isDirty && (
                <Button
                  size="sm"
                  className="h-8 gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs"
                  onClick={saveContent}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Simpan
                </Button>
              )}
              {isDirty && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1 text-gray-300 hover:text-white hover:bg-white/10 text-xs"
                  onClick={discardChanges}
                >
                  <X className="h-3.5 w-3.5" /> Batalkan
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-gray-300 hover:text-white hover:bg-white/10 text-xs"
                onClick={toggleEditMode}
              >
                <Eye className="h-3.5 w-3.5" /> Selesai Edit
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-accent text-accent-foreground hover:bg-accent/90 text-xs"
              onClick={toggleEditMode}
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit Website
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
