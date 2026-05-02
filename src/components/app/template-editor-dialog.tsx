/**
 * Notification Template Editor — opened from /admin/config Edit button.
 * Mock-only: edits live in component state and toast on save.
 */

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

export type Template = {
  name: string;
  desc: string;
  subject: string;
  body: string;
};

const DEFAULT_BODY: Record<string, { subject: string; body: string }> = {
  "IBG issued": {
    subject: "Your IBG {{ibgRef}} has been issued",
    body:
      "Hi {{installerName}},\n\nYour IBG {{ibgRef}} for {{measure}} at {{propertyAddress}} has been issued.\n\nDownload the PDF from the IBG Repository.\n\n— Renewably UK",
  },
  "Amendment approved": {
    subject: "Amendment to {{ibgRef}} approved",
    body:
      "Hi {{installerName}},\n\nYour amendment request to {{ibgRef}} has been approved by {{adminName}}.\n\nThe revised IBG is available in the Repository.\n\n— Renewably UK",
  },
  "Funding submitted": {
    subject: "Funding project {{fundingRef}} submitted to {{scheme}}",
    body:
      "Hi {{installerName}},\n\nFunding project {{fundingRef}} ({{measure}}) has been submitted to {{scheme}}.\n\nYou'll receive an update once the scheme responds.\n\n— Renewably UK",
  },
};

export function TemplateEditorDialog({
  open,
  template,
  onOpenChange,
}: {
  open: boolean;
  template: { name: string; desc: string } | null;
  onOpenChange: (v: boolean) => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    if (template) {
      const def = DEFAULT_BODY[template.name] ?? { subject: "", body: "" };
      setSubject(def.subject);
      setBody(def.body);
    }
  }, [template]);

  if (!template) return null;

  function save() {
    toast.success(`${template!.name} template saved`);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit · {template.name}</DialogTitle>
          <DialogDescription>{template.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tpl-subj">Subject line</Label>
            <Input id="tpl-subj" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tpl-body">Body</Label>
            <Textarea id="tpl-body" value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="font-mono text-xs" />
            <p className="text-[11px] text-ink-muted">
              Variables: <code className="rounded bg-tile px-1 py-0.5">{"{{installerName}}"}</code>{" "}
              <code className="rounded bg-tile px-1 py-0.5">{"{{ibgRef}}"}</code>{" "}
              <code className="rounded bg-tile px-1 py-0.5">{"{{measure}}"}</code>
            </p>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="press rounded-full border bg-background px-3.5 py-2 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="press inline-flex items-center gap-1.5 rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background"
          >
            <Save className="size-3.5" /> Save template
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
