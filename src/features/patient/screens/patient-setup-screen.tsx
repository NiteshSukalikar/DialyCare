import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function PatientSetupScreen() {
  return (
    <div className="space-y-5">
      <PageHeader
        description="Capture the one patient profile and dialysis baseline needed before daily tracking."
        eyebrow="Step 1"
        title="Patient setup"
      />

      <form className="space-y-4">
        <Card>
          <CardTitle>Patient details</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Patient name" placeholder="Full name" required />
            <Input label="UHID or hospital ID" placeholder="Optional" />
            <Input inputMode="numeric" label="Age" placeholder="62" />
            <Input label="Gender" placeholder="Male / Female / Other" />
            <Input label="Hospital" placeholder="Dialysis center name" />
            <Input label="Consultant nephrologist" placeholder="Doctor name" />
            <Input className="sm:col-span-2" label="Emergency contact" placeholder="Name and phone number" />
          </div>
        </Card>

        <Card>
          <CardTitle>Dialysis baseline</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input inputMode="decimal" label="Dry weight (kg)" placeholder="57.0" required />
            <Input label="Dialysis frequency" placeholder="3 times per week" />
            <Input label="Default hospital" placeholder="Same as above" />
            <Input label="Default doctor" placeholder="Doctor name" />
          </div>
        </Card>

        <Card>
          <CardTitle>Initial dialyzer</CardTitle>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input label="Dialyzer name" placeholder="F8HPS" />
            <Input label="Start date" type="date" />
            <Input inputMode="numeric" label="Current usage count" placeholder="0" />
            <Input inputMode="numeric" label="Max usage count" placeholder="12" />
          </div>
        </Card>

        <div className="sticky bottom-20 rounded-xl border border-brand-border bg-white p-3 shadow-soft lg:static lg:p-0 lg:shadow-none">
          <Button className="w-full" type="button">
            Save patient profile
          </Button>
        </div>
      </form>
    </div>
  );
}
