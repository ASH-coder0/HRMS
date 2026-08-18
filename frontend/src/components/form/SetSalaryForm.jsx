import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { EmployeeSearchSelect } from "@/components/common/EmployeeSearchSelect";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle } from "lucide-react";

const initialForm = {
  basic_salary: "",
  housing_allowance: "0",
  transport_allowance: "0",
  medical_allowance: "0",
  other_allowance: "0",
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
        housing_allowance: Number(form.housing_allowance || 0),
        transport_allowance: Number(form.transport_allowance || 0),
        medical_allowance: Number(form.medical_allowance || 0),
        other_allowance: Number(form.other_allowance || 0),
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
