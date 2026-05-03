import { useState } from "react";
import { FileUp } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { update, nid } from "@/lib/mock/store";
import { pushAudit } from "@/lib/mock/queries";
import { useAuth } from "@/lib/auth-context";

const CATEGORIES = ["Survey", "Photo", "MCS Certificate", "EPC", "Declaration", "Retrofit Assessment", "Other"];

export function EvidenceUploadDialog({
  open,
  onOpenChange,
  fundingId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  fundingId: string;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);

  function reset() {
    setName("");
    setCategory(CATEGORIES[0]);
  }

  function upload() {
    if (!name.trim()) {
      toast.error("File name is required");
      return;
    }
    update((d) => {
      const f = d.fundingProjects.find((p) => p.id === fundingId);
      if (!f) return;
      f.evidence.push({ id: nid("ev"), name: name.trim(), category, uploadedAt: Date.now() });
      pushAudit(d, "funding", fundingId, user.fullName, `Uploaded evidence ${name.trim()}`, category);
    });
    toast.success("Evidence uploaded");
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload evidence</DialogTitle>
          <DialogDescription>Attach a document to this funding project. Stored against the audit trail.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ev-name">File name</Label>
            <Input id="ev-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="EPC certificate.pdf" />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="press rounded-full border bg-background px-3.5 py-2 text-sm">Cancel</button>
          <button onClick={upload} className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            <FileUp className="size-3.5" /> Upload
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
