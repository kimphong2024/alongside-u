import { useRef, useState } from "react";
import { FileText, FlaskConical, FolderHeart, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useHealthData } from "@/lib/health-store";
import type { HealthRecord, RecordKind } from "@/lib/health-store";

const MAX_BYTES = 4 * 1024 * 1024;

const KIND_META: Record<RecordKind, { label: string; icon: typeof FileText }> = {
  report: { label: "Report", icon: FileText },
  test: { label: "Test result", icon: FlaskConical },
  record: { label: "Record", icon: FolderHeart },
};

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
};

export function RecordsSection({ records }: { records: HealthRecord[] }) {
  const { addRecord, removeRecord } = useHealthData();
  const [pendingKind, setPendingKind] = useState<RecordKind>("report");
  const [detail, setDetail] = useState<HealthRecord | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const pickFile = (kind: RecordKind) => {
    setPendingKind(kind);
    fileRef.current?.click();
  };

  const handleFile = (file: File) => {
    if (file.size > MAX_BYTES) {
      toast.error("That file is over 4 MB — try a smaller photo or PDF.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const created = await addRecord({
        kind: pendingKind,
        title: file.name.replace(/\.[a-z0-9]+$/i, ""),
        date: new Date().toISOString().slice(0, 10),
        file: reader.result as string,
        mime: file.type,
      });
      if (created) toast.success("Added to the family's records.");
      else toast.error("Couldn't save that file. Please try again.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="space-y-3">
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />

      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(KIND_META) as RecordKind[]).map((kind) => {
          const { label, icon: Icon } = KIND_META[kind];
          return (
            <button
              key={kind}
              onClick={() => pickFile(kind)}
              className="flex flex-col items-center justify-center gap-1 h-20 rounded-2xl border border-dashed border-border bg-card/60 hover:bg-muted/40 transition text-xs text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="h-4 w-4" strokeWidth={1.6} />
              <span className="flex items-center gap-1">
                <Upload className="h-3 w-3" strokeWidth={1.6} /> {label}
              </span>
            </button>
          );
        })}
      </div>

      {records.length === 0 && (
        <div className="rounded-2xl bg-card border border-dashed border-border p-5 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Photos of reports and test results live here — snap them as they arrive, and the family
            can always find them.
          </p>
        </div>
      )}

      {records.length > 0 && (
        <div className="space-y-2">
          {records.map((r) => {
            const Icon = KIND_META[r.kind].icon;
            return (
              <button
                key={r.id}
                onClick={() => setDetail(r)}
                className="w-full text-left rounded-2xl bg-card border border-border shadow-soft p-3.5 paper-grain hover:bg-muted/30 transition flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {r.file && r.mime?.startsWith("image/") ? (
                  <img
                    src={r.file}
                    alt=""
                    className="h-11 w-11 rounded-lg object-cover border border-border shrink-0"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-lg bg-sand/60 border border-border flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-foreground/60" strokeWidth={1.6} />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground/85 truncate">
                    {r.title || KIND_META[r.kind].label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {KIND_META[r.kind].label} · {fmtDate(r.date)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <Dialog open={!!detail} onOpenChange={(v) => !v && setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl">
          {detail && (
            <>
              <DialogHeader className="text-left">
                <p className="text-xs text-muted-foreground">
                  {KIND_META[detail.kind].label} · {fmtDate(detail.date)}
                </p>
                <DialogTitle className="font-serif italic text-2xl font-light text-foreground/90">
                  {detail.title || KIND_META[detail.kind].label}
                </DialogTitle>
              </DialogHeader>
              {detail.file && detail.mime?.startsWith("image/") && (
                <img
                  src={detail.file}
                  alt={detail.title}
                  className="w-full rounded-2xl border border-border"
                />
              )}
              {detail.file && detail.mime === "application/pdf" && (
                <div className="space-y-2">
                  <iframe
                    src={detail.file}
                    title={detail.title}
                    className="w-full h-80 rounded-2xl border border-border bg-white"
                  />
                  <a
                    href={detail.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  >
                    Open PDF in a new tab
                  </a>
                </div>
              )}
              <div className="flex justify-end pt-2 border-t border-border/60">
                <button
                  onClick={async () => {
                    setDetail(null);
                    await removeRecord(detail.id);
                    toast.success("Record deleted.");
                  }}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-clay transition"
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.6} /> Delete
                </button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
