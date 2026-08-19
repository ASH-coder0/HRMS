import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2, Save } from "lucide-react";

import { api } from "@/lib/api";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

import type { Department, Designation } from "@/types";

// -- Employee (HR/identity) fields -> POST/PUT /employees --
const employeeSchema = z.object({
  employee_code: z.string().min(1, "Required"),
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  citizenship_number: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  date_of_birth: z.string().optional(),
  date_of_joining: z.string().min(1, "Required"),
  department_id: z.coerce.number().min(1, "Select a department"),
  designation_id: z.coerce.number().min(1, "Select a designation"),
  role_id: z.coerce.number().min(1, "Select a role"),
  employment_type: z.enum(["full_time", "part_time", "contract", "intern"]),
  status: z.enum(["active", "inactive", "on_leave", "terminated"]),
  address: z.string().optional(),
  blood_group: z.string().optional(),
});

// -- Salary fields -> POST /salary (only collected on create; editing/
// viewing salary later happens on the Set Salary screen, not here) --
const salarySchema = z.object({
  basic_salary: z.coerce.number().positive("Must be greater than 0"),
  basic_salary_multiplier: z.coerce.number().min(0).default(1),
  daily_working_hours: z.coerce.number().min(1).max(24),
  // Estimate-only: not sent to the backend. Real payroll runs pull the
  // actual working-day count for a given month from Calendar Setup /
  // attendance, so this is just to preview a monthly figure at registration.
  working_days: z.coerce.number().min(1).max(31).default(26),
  food_enabled: z.enum(["yes", "no"]).default("no"),
  food_allowance: z.coerce.number().min(0).default(0),
  accommodation_enabled: z.enum(["yes", "no"]).default("no"),
  accommodation_allowance: z.coerce.number().min(0).default(0),
  ot_enabled: z.enum(["yes", "no"]).default("no"),
  ot_rate: z.coerce.number().min(0).default(1.5),
  effective_date: z.string().min(1, "Required"),
});

const createSchema = employeeSchema.merge(salarySchema);
const editSchema = employeeSchema.merge(salarySchema.partial());

type FormValues = z.infer<typeof createSchema>;

const EMPLOYEE_FIELDS = [
  "employee_code", "first_name", "last_name", "email", "phone", "citizenship_number",
  "gender", "date_of_birth", "date_of_joining", "department_id", "designation_id",
  "role_id", "employment_type", "status", "address", "blood_group",
] as const;

const SALARY_FIELDS = [
  "basic_salary", "basic_salary_multiplier", "daily_working_hours",
  "food_enabled", "food_allowance", "accommodation_enabled", "accommodation_allowance",
  "ot_enabled", "ot_rate", "effective_date",
] as const;

function pick<T extends Record<string, any>>(obj: T, keys: readonly string[]) {
  return Object.fromEntries(keys.map((k) => [k, obj[k as keyof T]]));
}

export function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: {
      employment_type: "full_time",
      status: "active",
      basic_salary_multiplier: 1,
      daily_working_hours: 8,
      working_days: 26,
      food_enabled: "no",
      food_allowance: 0,
      accommodation_enabled: "no",
      accommodation_allowance: 0,
      ot_enabled: "no",
      ot_rate: 1.5,
      effective_date: new Date().toISOString().slice(0, 10),
    },
  });

  const foodEnabled = useWatch({ control, name: "food_enabled" });
  const accommodationEnabled = useWatch({ control, name: "accommodation_enabled" });
  const otEnabled = useWatch({ control, name: "ot_enabled" });

  const basicSalary = useWatch({ control, name: "basic_salary" });
  const basicSalaryMultiplier = useWatch({ control, name: "basic_salary_multiplier" });
  const dailyWorkingHours = useWatch({ control, name: "daily_working_hours" });
  const workingDays = useWatch({ control, name: "working_days" });
  const foodAllowance = useWatch({ control, name: "food_allowance" });
  const accommodationAllowance = useWatch({ control, name: "accommodation_allowance" });

  // Monthly working hours = No. of working days × Daily working hours.
  const monthlyWorkingHours = useMemo(() => {
    return (Number(workingDays) || 0) * (Number(dailyWorkingHours) || 0);
  }, [workingDays, dailyWorkingHours]);

  const adjustedBasicSalary = useMemo(() => {
    return (Number(basicSalary) || 0) * (Number(basicSalaryMultiplier) || 1);
  }, [basicSalary, basicSalaryMultiplier]);

  // Hourly rate derived from the adjusted basic salary spread over the
  // month's total working hours — this is what OT is calculated against.
  const hourlyRate = useMemo(() => {
    return monthlyWorkingHours > 0 ? adjustedBasicSalary / monthlyWorkingHours : 0;
  }, [adjustedBasicSalary, monthlyWorkingHours]);

  // Estimated monthly salary = adjusted basic salary + enabled allowances.
  // OT is deliberately excluded — it's variable and only known once actual
  // worked hours for the month exist (Payroll Calculation module).
  const estimatedMonthlySalary = useMemo(() => {
    const food = foodEnabled === "yes" ? Number(foodAllowance) || 0 : 0;
    const accommodation = accommodationEnabled === "yes" ? Number(accommodationAllowance) || 0 : 0;
    return adjustedBasicSalary + food + accommodation;
  }, [adjustedBasicSalary, foodEnabled, foodAllowance, accommodationEnabled, accommodationAllowance]);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () =>
      (await api.get<{ data: Department[] }>("/departments")).data.data,
  });

  const { data: designations } = useQuery({
    queryKey: ["designations"],
    queryFn: async () =>
      (await api.get<{ data: Designation[] }>("/designations")).data.data,
  });

  const { data: existing } = useQuery({
    queryKey: ["employees", id],
    queryFn: async () => (await api.get(`/employees/${id}`)).data.data,
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) reset(existing);
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const employeePayload = pick(values, EMPLOYEE_FIELDS);

      if (isEdit) {
        return api.put(`/employees/${id}`, employeePayload);
      }

      // 1. Create the employee first — we need its id for the salary row.
      const employeeRes = await api.post("/employees", employeePayload);
      const newEmployeeId = employeeRes?.data?.data?.id;

      // 2. Save initial salary for the new employee.
      if (newEmployeeId) {
        const salaryPayload = pick(values, SALARY_FIELDS);
        await api.post("/salary", {
          employee_id: newEmployeeId,
          ...salaryPayload,
          food_enabled: salaryPayload.food_enabled === "yes",
          accommodation_enabled: salaryPayload.accommodation_enabled === "yes",
          ot_enabled: salaryPayload.ot_enabled === "yes",
        });
      }

      return employeeRes;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["salary-components"] });
      navigate("/employees");
    },
  });

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit employee" : "Add employee"}
        description={
          isEdit
            ? "Keep employee records accurate and up to date."
            : "Register the employee and set their starting salary in one step."
        }
      />

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-8">

            {/* ================= EMPLOYEE INFO ================= */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Employee code</Label>
                <Input {...register("employee_code")} placeholder="EMP-0003" />
                {errors.employee_code && <p className="text-xs text-destructive">{errors.employee_code.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Employment type</Label>
                <Select {...register("employment_type")}>
                  <option value="full_time">Full time</option>
                  <option value="part_time">Part time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>First name</Label>
                <Input {...register("first_name")} />
                {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Last name</Label>
                <Input {...register("last_name")} />
                {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Contact number</Label>
                <Input {...register("phone")} placeholder="98XXXXXXXX" />
              </div>

              <div className="space-y-1.5">
                <Label>Citizenship number</Label>
                <Input {...register("citizenship_number")} placeholder="Citizenship / National ID number" />
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <Select {...register("gender")}>
                  <option value="">Select…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Date of birth</Label>
                <Input type="date" {...register("date_of_birth")} />
              </div>
              <div className="space-y-1.5">
                <Label>Date of joining</Label>
                <Input type="date" {...register("date_of_joining")} />
                {errors.date_of_joining && <p className="text-xs text-destructive">{errors.date_of_joining.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select {...register("status")}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On leave</option>
                  <option value="terminated">Terminated</option>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Blood group</Label>
                <Input {...register("blood_group")} placeholder="O+" />
              </div>

              <div className="space-y-1.5">
                <Label>Department</Label>
                <Select {...register("department_id")}>
                  <option value="">Select…</option>
                  {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
                {errors.department_id && <p className="text-xs text-destructive">{errors.department_id.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Designation</Label>
                <Select {...register("designation_id")}>
                  <option value="">Select…</option>
                  {designations?.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}
                </Select>
                {errors.designation_id && <p className="text-xs text-destructive">{errors.designation_id.message}</p>}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label>System role</Label>
                <Select {...register("role_id")}>
                  <option value="">Select…</option>
                  <option value="1">Super Admin</option>
                  <option value="2">HR Manager</option>
                  <option value="3">Hospital Administrator</option>
                  <option value="4">Department Head</option>
                  <option value="5">Doctor</option>
                  <option value="6">Nurse</option>
                  <option value="7">Pharmacist</option>
                  <option value="8">Lab Technician</option>
                  <option value="9">Receptionist</option>
                  <option value="10">Accountant</option>
                  <option value="11">Employee</option>
                </Select>
                {errors.role_id && <p className="text-xs text-destructive">{errors.role_id.message}</p>}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label>Address</Label>
                <Input {...register("address")} />
              </div>
            </div>

            {/* ================= STARTING SALARY (create only) ================= */}
            {!isEdit && (
              <div>
                <CardHeader className="px-0">
                  <CardTitle>Starting salary</CardTitle>
                </CardHeader>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Basic salary</Label>
                    <Input type="number" step="0.01" min="0" {...register("basic_salary")} placeholder="30000" />
                    {errors.basic_salary && <p className="text-xs text-destructive">{errors.basic_salary.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Basic salary (times)</Label>
                    <Input type="number" step="0.1" min="0" {...register("basic_salary_multiplier")} placeholder="1" />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Daily working hours</Label>
                    <Input type="number" step="0.5" min="1" max="24" {...register("daily_working_hours")} placeholder="8" />
                    {errors.daily_working_hours && <p className="text-xs text-destructive">{errors.daily_working_hours.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>No. of working days (this month)</Label>
                    <Input type="number" min="1" max="31" {...register("working_days")} placeholder="26" />
                    <p className="text-xs text-muted-foreground">Used only to preview monthly salary below — not saved.</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Effective date</Label>
                    <Input type="date" {...register("effective_date")} />
                    {errors.effective_date && <p className="text-xs text-destructive">{errors.effective_date.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label>Food facility</Label>
                    <Select {...register("food_enabled")}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </Select>
                  </div>
                  {foodEnabled === "yes" && (
                    <div className="space-y-1.5">
                      <Label>Food allowance</Label>
                      <Input type="number" step="0.01" min="0" {...register("food_allowance")} />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label>Accommodation facility</Label>
                    <Select {...register("accommodation_enabled")}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </Select>
                  </div>
                  {accommodationEnabled === "yes" && (
                    <div className="space-y-1.5">
                      <Label>Accommodation allowance</Label>
                      <Input type="number" step="0.01" min="0" {...register("accommodation_allowance")} />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label>OT applicable</Label>
                    <Select {...register("ot_enabled")}>
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </Select>
                  </div>
                  {otEnabled === "yes" && (
                    <div className="space-y-1.5">
                      <Label>OT rate (× hourly rate)</Label>
                      <Input type="number" step="0.1" min="0" {...register("ot_rate")} />
                    </div>
                  )}
                </div>

                {/* ============ MONTHLY SALARY PREVIEW ============ */}
                <div className="mt-5 rounded-lg border bg-muted/40 p-4">
                  <p className="text-sm font-medium">Monthly salary preview</p>

                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly working hours</p>
                      <p className="text-lg font-semibold">{monthlyWorkingHours.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Working days × Daily hours</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Hourly rate</p>
                      <p className="text-lg font-semibold">Rs. {hourlyRate.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">(Basic × Multiplier) ÷ Monthly hours</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Adjusted basic salary</p>
                      <p className="text-lg font-semibold">Rs. {adjustedBasicSalary.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Basic × Multiplier</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Estimated monthly salary</p>
                      <p className="text-lg font-semibold">Rs. {estimatedMonthlySalary.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">+ Food/Accommodation allowance</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    This is a preview only, not saved. OT pay isn't included here since it depends on
                    actual hours worked — the real monthly salary is produced by the Payroll Calculation
                    module using that month's attendance and working days from Calendar Setup.
                  </p>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  You can edit or view salary later from the Set Salary screen.
                </p>
              </div>
            )}

            {mutation.isError && (
              <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {(mutation.error as any)?.response?.data?.message || "Something went wrong. Please try again."}
              </p>
            )}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate("/employees")}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isEdit ? "Save employee" : "Save employee & salary"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}