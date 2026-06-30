import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function AddSessionScreen() {
  return (
    <div className="space-y-5">
      <PageHeader
        description="Large fields and a fixed save action keep the common session entry flow fast on phone."
        eyebrow="Dialysis record"
        title="Add dialysis session"
      />

      <form className="space-y-4">
        <Card>
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Session basics</CardTitle>
            <Badge tone="success">Target under 30 sec</Badge>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Date" required type="date" />
            <Input label="Session time" type="time" />
            <Input inputMode="decimal" label="Pre-HD weight (kg)" placeholder="62.4" required />
            <Input inputMode="decimal" label="Post-HD weight (kg)" placeholder="58.5" required />
          </div>
        </Card>

        <Card>
          <CardTitle>BP and UF</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input inputMode="numeric" label="Pre-HD BP" placeholder="160/90" required />
            <Input inputMode="numeric" label="Post-HD BP" placeholder="130/80" required />
            <Input inputMode="decimal" label="UF removed (L)" placeholder="3.9" required />
            <Input label="Dialyzer used" placeholder="Active dialyzer" />
          </div>
        </Card>

        <Card>
          <CardTitle>Notes</CardTitle>
          <label className="mt-4 block" htmlFor="remarks">
            <span className="mb-1.5 block text-sm font-medium text-brand-muted">Remarks</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-brand-border bg-white px-3.5 py-2.5 text-base text-brand-ink outline-none focus:border-brand-primary focus:ring-4 focus:ring-brand-mint"
              id="remarks"
              placeholder="Stable, cramps, medicine changes, machine notes..."
            />
          </label>
        </Card>

        <div className="sticky bottom-20 rounded-xl border border-brand-border bg-white p-3 shadow-soft lg:static lg:p-0 lg:shadow-none">
          <Button className="w-full" type="button">
            Save session
          </Button>
        </div>
      </form>
    </div>
  );
}
