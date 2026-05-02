/**
 * Payment Method dialog — opens from /settings/subscription.
 * Mock card-entry form. On save, returns the new last-4 to the parent.
 */

import { useState } from "react";
import { CreditCard, Lock } from "lucide-react";
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

export function PaymentMethodDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: (last4: string) => void;
}) {
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  function reset() {
    setName(""); setNumber(""); setExp(""); setCvc("");
  }

  function save() {
    const digits = number.replace(/\D/g, "");
    if (!name.trim() || digits.length < 12 || exp.length < 4 || cvc.length < 3) {
      toast.error("Please fill all card fields");
      return;
    }
    const last4 = digits.slice(-4);
    toast.success(`Payment method updated · •••• ${last4}`);
    onSaved(last4);
    reset();
    onOpenChange(false);
  }

  function fmtNumber(v: string) {
    return v.replace(/\D/g, "").slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
  }

  function fmtExp(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? d.slice(0, 2) + "/" + d.slice(2) : d;
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="size-4" /> Update payment method
          </DialogTitle>
          <DialogDescription>
            We use Stripe for secure card processing — your card details never touch our servers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pm-name">Name on card</Label>
            <Input id="pm-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pm-num">Card number</Label>
            <Input
              id="pm-num"
              value={number}
              onChange={(e) => setNumber(fmtNumber(e.target.value))}
              inputMode="numeric"
              placeholder="4242 4242 4242 4242"
              className="font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="pm-exp">Expiry</Label>
              <Input
                id="pm-exp"
                value={exp}
                onChange={(e) => setExp(fmtExp(e.target.value))}
                placeholder="MM/YY"
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pm-cvc">CVC</Label>
              <Input
                id="pm-cvc"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                className="font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-surface/60 px-3 py-2 text-[11px] text-ink-muted">
            <Lock className="size-3" /> Your details are encrypted in transit and at rest.
          </div>
        </div>

        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="press rounded-full border bg-background px-3.5 py-2 text-sm">
            Cancel
          </button>
          <button onClick={save} className="press rounded-full bg-foreground px-3.5 py-2 text-sm font-medium text-background">
            Save card
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
