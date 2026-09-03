import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { EmployeeSearchSelect } from "@/components/common/EmployeeSearchSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CheckCircle2, AlertCircle } from "lucide-react";

const initialForm = {
  basic_salary: "",
  basic_salary_multiplier: "1",
  housing_allowance: "0",
  transport_allowance: "0",
  medical_allowance: "0",
  other_allowance: "0",
  food_enabled: "no",
  food_allowance: "0",
  accommodation_enabled: "no",
  accommodation_allowance: "0",
  daily_working_hours: "8",
  working_days: "26",
  ot_enabled: "no",
  ot_rate: "1.5",
  effective_date: new Date().toISOString().slice(0, 10),
};

const ALLOWANCE_FIELDS = [
  { key: "housing_allowance", label: "Housing allowance" },
  { key: "transport_allowance", label: "Transport allowance" },
  { key: "medical_allowance", label: "Medical allowance" },
  { key: "other_allowance", label: "Other allowance" },
];

export function SetSalaryForm({ onSaved }) {
  const queryClient = useQueryClient();

  const [employeeCode, setEmployeeCode] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: async () => {
      return api.post("/salary", {
        employee_id: selectedEmployee.id,
        basic_salary: Number(form.basic_salary),
        basic_salary_multiplier: Number(form.basic_salary_multiplier || 1),
        housing_allowance: Number(form.housing_allowance || 0),
        transport_allowance: Number(form.transport_allowance || 0),
        medical_allowance: Number(form.medical_allowance || 0),
        other_allowance: Number(form.other_allowance || 0),
        food_enabled: form.food_enabled === "yes",
        food_allowance: Number(form.food_allowance || 0),
        accommodation_enabled: form.accommodation_enabled === "yes",
        accommodation_allowance: Number(form.accommodation_allowance || 0),
        daily_working_hours: Number(form.daily_working_hours || 8),
        // NOTE: working_days is intentionally NOT sent — it's a preview-only
        // input here. Salary.js has no working_days column; the real figure
        // for a given month comes from Calendar Setup/Attendance at payroll
        // run time, not from what's typed in at salary-setup time.
        ot_enabled: form.ot_enabled === "yes",
        ot_rate: Number(form.ot_rate || 1.5),
        effective_date: form.effective_date,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["salary-components", selectedEmployee?.id],
      });

      setForm(initialForm);
      setEmployeeCode("");
      setSelectedEmployee(null);
      onSaved?.();
    },
  });

  const handleChange = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: undefined,
      }));
    }
  };

  const validate = () => {
    const next = {};

    if (!selectedEmployee) {
      next.employee = "Select an employee";
    }

    if (!form.basic_salary || Number(form.basic_salary) <= 0) {
      next.basic_salary = "Enter a basic salary greater than 0";
    }

    if (!form.effective_date) {
      next.effective_date = "Effective date is required";
    }

    ALLOWANCE_FIELDS.forEach(({ key }) => {
      if (form[key] !== "" && Number(form[key]) < 0) {
        next[key] = "Cannot be negative";
      }
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    mutation.mutate();
  };

  // -- Monthly salary preview (display only, nothing here is submitted) --
  const monthlyWorkingHours =
    (Number(form.working_days) || 0) * (Number(form.daily_working_hours) || 0);

  const adjustedBasicSalary =
    (Number(form.basic_salary) || 0) * (Number(form.basic_salary_multiplier) || 1);

  const hourlyRate = monthlyWorkingHours > 0 ? adjustedBasicSalary / monthlyWorkingHours : 0;

  const estimatedMonthlySalary =
    adjustedBasicSalary +
    (form.food_enabled === "yes" ? Number(form.food_allowance) || 0 : 0) +
    (form.accommodation_enabled === "yes" ? Number(form.accommodation_allowance) || 0 : 0) +
    Number(form.housing_allowance || 0) +
    Number(form.transport_allowance || 0) +
    Number(form.medical_allowance || 0) +
    Number(form.other_allowance || 0);

  console.log("employeeCode:", employeeCode);
  console.log("selectedEmployee:", selectedEmployee);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Set salary</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Employee</Label>

            <EmployeeSearchSelect
              value={employeeCode}
              onChange={(value) => {
                setEmployeeCode(value);
                setSelectedEmployee(null);
              }}
              onSelect={(employee) => {
                console.log("SELECTED EMPLOYEE:", employee);
                setSelectedEmployee(employee);
                setEmployeeCode(employee?.employee_code || "");
                setErrors((prev) => ({
                  ...prev,
                  employee: undefined,
                }));
              }}
              placeholder="Search employee by name or code..."
            />

            {errors.employee && (
              <p className="text-xs text-destructive">{errors.employee}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="basic_salary">Basic salary</Label>

            <Input
              id="basic_salary"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.basic_salary}
              onChange={handleChange("basic_salary")}
            />

            {errors.basic_salary && (
              <p className="text-xs text-destructive">{errors.basic_salary}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="basic_salary_multiplier">Basic salary (times)</Label>

            <Input
              id="basic_salary_multiplier"
              type="number"
              min="0"
              step="0.1"
              value={form.basic_salary_multiplier}
              onChange={handleChange("basic_salary_multiplier")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="daily_working_hours">Daily working hours</Label>

              <Input
                id="daily_working_hours"
                type="number"
                min="1"
                max="24"
                step="0.5"
                value={form.daily_working_hours}
                onChange={handleChange("daily_working_hours")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="working_days">No. of working days (this month)</Label>

              <Input
                id="working_days"
                type="number"
                min="1"
                max="31"
                value={form.working_days}
                onChange={handleChange("working_days")}
              />
              <p className="text-xs text-muted-foreground">Used only for the preview below — not saved.</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ot_enabled">OT applicable</Label>

            <Select id="ot_enabled" value={form.ot_enabled} onChange={handleChange("ot_enabled")}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </Select>
          </div>

          {form.ot_enabled === "yes" && (
            <div className="space-y-1.5">
              <Label htmlFor="ot_rate">OT rate (× hourly rate)</Label>

              <Input
                id="ot_rate"
                type="number"
                min="0"
                step="0.1"
                value={form.ot_rate}
                onChange={handleChange("ot_rate")}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="food_enabled">Food facility</Label>

              <Select id="food_enabled" value={form.food_enabled} onChange={handleChange("food_enabled")}>
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </div>

            {form.food_enabled === "yes" && (
              <div className="space-y-1.5">
                <Label htmlFor="food_allowance">Food allowance</Label>

                <Input
                  id="food_allowance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.food_allowance}
                  onChange={handleChange("food_allowance")}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="accommodation_enabled">Accommodation facility</Label>

              <Select
                id="accommodation_enabled"
                value={form.accommodation_enabled}
                onChange={handleChange("accommodation_enabled")}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </Select>
            </div>

            {form.accommodation_enabled === "yes" && (
              <div className="space-y-1.5">
                <Label htmlFor="accommodation_allowance">Accommodation allowance</Label>

                <Input
                  id="accommodation_allowance"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.accommodation_allowance}
                  onChange={handleChange("accommodation_allowance")}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {ALLOWANCE_FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1.5">
                <Label htmlFor={key}>{label}</Label>

                <Input
                  id={key}
                  type="number"
                  min="0"
                  step="0.01"
                  value={form[key]}
                  onChange={handleChange(key)}
                />

                {errors[key] && (
                  <p className="text-xs text-destructive">{errors[key]}</p>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="effective_date">Effective date</Label>

            <Input
              id="effective_date"
              type="date"
              value={form.effective_date}
              onChange={handleChange("effective_date")}
            />

            {errors.effective_date && (
              <p className="text-xs text-destructive">
                {errors.effective_date}
              </p>
            )}

            <p className="text-xs text-muted-foreground">
              History is kept — the row with the latest effective date becomes
              the employee's current salary.
            </p>
          </div>

          {/* ============ MONTHLY SALARY PREVIEW ============ */}
          <div className="rounded-lg border bg-muted/40 p-4">
            <p className="text-sm font-medium">Monthly salary preview</p>

            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-muted-foreground">Monthly hours</p>
                <p className="text-lg font-semibold">{monthlyWorkingHours.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Days × Daily hours</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hourly rate</p>
                <p className="text-lg font-semibold">Rs. {hourlyRate.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Adjusted basic</p>
                <p className="text-lg font-semibold">Rs. {adjustedBasicSalary.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Est. monthly salary</p>
                <p className="text-lg font-semibold">Rs. {estimatedMonthlySalary.toFixed(2)}</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              Preview only, nothing here is saved. Excludes OT pay, which depends on actual
              hours worked and is calculated by the Payroll Calculation module.
            </p>
          </div>

          {mutation.isSuccess && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Salary component saved
            </div>
          )}

          {mutation.isError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {mutation.error?.response?.data?.message ||
                "Could not save salary"}
            </div>
          )}

          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Saving..." : "Save salary component"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}