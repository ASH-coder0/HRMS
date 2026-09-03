import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Search, Clock3, UserRound, CalendarDays, UserCog } from "lucide-react";

import { api } from "@/lib/api";

import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { initials } from "@/lib/utils";

import { toast } from 'react-toastify';
// STATUS

const STATUS_VARIANT: Record<
  string,
  "success" | "secondary" | "warning" | "destructive"
> = {
  active: "success",
  inactive: "secondary",
  on_leave: "warning",
  terminated: "destructive",
};

// DAYS

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

// FORMAT TIME

function formatTime(time?: string) {
  if (!time) return "";

  const [hour, minute] = time.split(":");

  const date = new Date();

  date.setHours(Number(hour), Number(minute), 0, 0);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// TYPES

type Shift = {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  is_night_shift?: boolean;
};

type EmployeeShift = {
  id: number;
  employee_id: number;
  shift_id: number;
  effective_date?: string;
  day_of_week?: number;

  Shift?: Shift;
  shift?: Shift;

  // In case backend returns flat shift information
  shift_name?: string;
  start_time?: string;
  end_time?: string;
};

type Employee = {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
  status: string;

  Department?: {
    name: string;
  };

  Designation?: {
    title: string;
  };

  currentShift?: Shift;
};

// RESPONSE HELPERS

function extractArray<T>(responseData: any): T[] {
  const data = responseData?.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.items)) {
    return data.items;
  }

  if (Array.isArray(responseData?.items)) {
    return responseData.items;
  }

  return [];
}

// COMPONENT

export default function Shifts() {
  const queryClient = useQueryClient();
  // TABLE STAT
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [page, setPage] = useState(1);

  // MODAL STATE
  const [showModal, setShowModal] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );
  // FORM STATE
  const [form, setForm] = useState({
    shift_id: "",
    effective_date: "",
    day_of_week: "",
  });


  // GET EMPLOYEES
  const {
    data: employeeData,
    isLoading: employeesLoading,
    error: employeesError,
  } = useQuery({
    queryKey: [
      "shift-employees",
      {
        search,
        status,
        page,
      },
    ],

    queryFn: async () => {
      const res = await api.get("/employees", {
        params: {
          search: search || undefined,
          status: status || undefined,
          page,
          limit: 10,
        },
      });

      console.log("EMPLOYEE API RESPONSE:", res.data);

      return res.data.data;
    },
  });


  // GET SHIFTS
  const {
    data: shifts = [],
    isLoading: shiftsLoading,
    error: shiftsError,
  } = useQuery<Shift[]>({
    queryKey: ["shifts"],

    queryFn: async () => {
      try {
        const res = await api.get("/shifts");

        console.log("SHIFT API RESPONSE:", res.data);

        const result = extractArray<Shift>(res.data);

        console.log("SHIFTS USED BY DROPDOWN:", result);

        return result;
      } catch (error) {
        console.error("SHIFT API ERROR:", error);

        throw error;
      }
    },
  });

  // GET ALL EMPLOYEE SHIFT ASSIGNMENTS
  const {
    data: employeeShifts = [],
    isLoading: employeeShiftsLoading,
    error: employeeShiftsError,
  } = useQuery<EmployeeShift[]>({
    queryKey: ["employee-shifts"],

    queryFn: async () => {
      try {
        const res = await api.get("/shifts/assignments/all");

        console.log("EMPLOYEE SHIFT ASSIGNMENTS RESPONSE:", res.data);

        const result = extractArray<EmployeeShift>(res.data);

        console.log("EMPLOYEE SHIFT ASSIGNMENTS:", result);

        return result;
      } catch (error) {
        console.error("EMPLOYEE SHIFT API ERROR:", error);

        throw error;
      }
    },
  });

  // MERGE EMPLOYEES + ASSIGNMENTS
  const employees: Employee[] = (employeeData?.items || []).map(
    (employee: Employee) => {
      const assignmentsForEmployee = employeeShifts.filter(
        (assignment) => Number(assignment.employee_id) === Number(employee.id),
      );

      /*
       * If employee has no assignment,
       * return employee normally.
       */
      if (!assignmentsForEmployee.length) {
        return employee;
      }

      /*
       * Sort by effective date.
       *
       * The newest effective assignment
       * becomes currentShift.
       */
      const sortedAssignments = [...assignmentsForEmployee].sort((a, b) => {
        const dateA = a.effective_date
          ? new Date(a.effective_date).getTime()
          : 0;

        const dateB = b.effective_date
          ? new Date(b.effective_date).getTime()
          : 0;

        return dateB - dateA;
      });

      const assignment = sortedAssignments[0];
      let currentShift = assignment.Shift || assignment.shift;
      if (!currentShift) {
        if (
          assignment.shift_name ||
          assignment.start_time ||
          assignment.end_time
        ) {
          currentShift = {
            id: Number(assignment.shift_id),
            name: assignment.shift_name || "Assigned Shift",
            start_time: assignment.start_time || "",
            end_time: assignment.end_time || "",
          };
        }
      }

      console.log(`EMPLOYEE ${employee.id} SHIFT:`, currentShift);

      return {
        ...employee,
        currentShift,
      };
    },
  );
// ASSIGN SHIFT
const assignShiftMutation = useMutation({
  mutationFn: async (payload: {
    employee_id: number;
    shift_id: number;
    effective_date: string;
    day_of_week: number;
  }) => {
    console.log("SENDING ASSIGN SHIFT:", payload);
    const res = await api.post("/shifts/assign", payload);

    console.log("ASSIGN SHIFT RESPONSE:", res.data);

    return res.data;
  },

  onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["shift-employees"] });
    await queryClient.invalidateQueries({ queryKey: ["employee-shifts"] });
    await queryClient.invalidateQueries({ queryKey: ["shifts"] });

    const employeeName = selectedEmployee
      ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
      : "Employee";

    closeModal();

    toast.success(`Shift assigned to ${employeeName}`);
  },

  onError: (error: any) => {
    console.error("ASSIGN SHIFT ERROR:", error);
    console.error("SERVER RESPONSE:", error?.response?.data);

    toast.error(
      error?.response?.data?.message || "Failed to assign shift",
    );
  },
});
  // OPEN MODAL
 function openAssignModal(employee: Employee) {
    setSelectedEmployee(employee);

    setForm({
      shift_id: "",
      effective_date: "",
      day_of_week: "",
    });

    setShowModal(true);
  }
  // CLOSE MODAL
  function closeModal() {
    setShowModal(false);

    setSelectedEmployee(null);

    setForm({
      shift_id: "",
      effective_date: "",
      day_of_week: "",
    });
  }


  // FORM CHANGE


  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }


  // SUBMIT ASSIGNMENT
function handleAssignShift(e: React.FormEvent) {
  e.preventDefault();

  if (!selectedEmployee) {
    toast.error("Employee not selected");
    return;
  }

  if (!form.shift_id) {
    toast.error("Please select a shift");
    return;
  }

  if (!form.effective_date) {
    toast.error("Please select an effective date");
    return;
  }

  if (form.day_of_week === "") {
    toast.error("Please select a day");
    return;
  }

  const payload = {
    employee_id: Number(selectedEmployee.id),

    shift_id: Number(form.shift_id),

    effective_date: form.effective_date,

    day_of_week: Number(form.day_of_week),
  };

  console.log("ASSIGN SHIFT PAYLOAD:", payload);

  assignShiftMutation.mutate(payload);
}

  // RENDER


  return (
    <div className="space-y-6">
      {/*==
          HEADER
    == */}

      <PageHeader
        title="Employee Shifts"
        description="Assign and manage work shifts for hospital employees."
      />

      {/*==
          EMPLOYEE TABLE
    == */}

      <Card>
        {/* FILTERS */}

        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              placeholder="Search employee by name, email, or code..."
              className="pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);

                setPage(1);
              }}
            />
          </div>

          <Select
            className="w-44"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);

              setPage(1);
            }}
          >
            <option value="">All statuses</option>

            <option value="active">Active</option>

            <option value="inactive">Inactive</option>

            <option value="on_leave">On leave</option>

            <option value="terminated">Terminated</option>
          </Select>
        </div>

        {/*
            LOADING*/}

        {employeesLoading || employeeShiftsLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({
              length: 6,
            }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : employeesError ? (
          <EmptyState
            icon={UserRound}
            title="Failed to load employees"
            description="Could not load employees from the server."
          />
        ) : employeeShiftsError ? (
          <EmptyState
            icon={Clock3}
            title="Failed to load employee shifts"
            description="Employees loaded, but their shift assignments could not be loaded."
          />
        ) : !employees.length ? (
          <EmptyState
            icon={UserRound}
            title="No employees found"
            description="No employees match your current filters."
          />
        ) : (
          /* ======================================
             TABLE
          ====================================== */

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-3 font-medium">Employee</th>

                  <th className="px-4 py-3 font-medium">Department</th>

                  <th className="px-4 py-3 font-medium">Designation</th>

                  <th className="px-4 py-3 font-medium">Status</th>

                  <th className="px-4 py-3 font-medium">Shift</th>

                  <th className="px-4 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-border last:border-0 hover:bg-muted/50"
                  >
                    {/* EMPLOYEE */}

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(emp.first_name, emp.last_name)}
                        </div>

                        <div>
                          <p className="font-medium">
                            {emp.first_name} {emp.last_name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {emp.email || "—"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* DEPARTMENT */}

                    <td className="px-4 py-3">{emp.Department?.name || "—"}</td>

                    {/* DESIGNATION */}

                    <td className="px-4 py-3">
                      {emp.Designation?.title || "—"}
                    </td>

                    {/* STATUS */}

                    <td className="px-4 py-3">
                      <Badge
                        variant={STATUS_VARIANT[emp.status] || "secondary"}
                      >
                        {emp.status?.replace("_", " ")}
                      </Badge>
                    </td>

                    {/* SHIFT */}

                    <td className="px-4 py-3">
                      {emp.currentShift ? (
                        <div>
                          <div className="flex items-center gap-2 font-medium">
                            <Clock3 className="h-4 w-4 text-primary" />

                            {emp.currentShift.name}
                          </div>

                          <p className="text-xs text-muted-foreground">
                            {formatTime(emp.currentShift.start_time)}

                            {" - "}

                            {formatTime(emp.currentShift.end_time)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          No shift assigned
                        </span>
                      )}
                    </td>

                    {/* ACTION */}

                    <td className="px-4 py-3 text-right">
                      <Button size="sm" onClick={() => openAssignModal(emp)}>
                        <UserCog className="h-4 w-4" />
                        Assign Shift
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/*
            PAGINATION*/}

        {employeeData && (
          <Pagination
            page={employeeData.page}
            totalPages={employeeData.totalPages}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/*==
          ASSIGN SHIFT MODAL
    == */}

      {showModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-background shadow-xl">
            {/* MODAL HEADER */}

            <div className="border-b border-border p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Assign Shift</h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Assign a work shift to{" "}
                    <span className="font-medium text-foreground">
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="text-xl text-muted-foreground hover:text-foreground"
                >
                  ×
                </button>
              </div>
            </div>

            {/* FORM */}

            <form onSubmit={handleAssignShift} className="space-y-5 p-5">
              {/* EMPLOYEE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Employee
                </label>

                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {initials(
                      selectedEmployee.first_name,
                      selectedEmployee.last_name,
                    )}
                  </div>

                  <div>
                    <p className="font-medium">
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {selectedEmployee.employee_code}
                    </p>
                  </div>
                </div>
              </div>

              {/* SHIFT */}

              <div>
                <label className="mb-2 block text-sm font-medium">Shift</label>

                <Select
                  name="shift_id"
                  value={form.shift_id}
                  onChange={handleChange}
                  className="w-full"
                  disabled={shiftsLoading}
                >
                  <option value="">
                    {shiftsLoading ? "Loading shifts..." : "Select shift"}
                  </option>

                  {shifts.map((shift) => (
                    <option key={shift.id} value={shift.id}>
                      {shift.name}

                      {" ("}

                      {formatTime(shift.start_time)}

                      {" - "}

                      {formatTime(shift.end_time)}

                      {")"}
                    </option>
                  ))}
                </Select>

                {shiftsError && (
                  <p className="mt-2 text-xs text-destructive">
                    Failed to load shifts.
                  </p>
                )}

                {!shiftsLoading && !shiftsError && shifts.length === 0 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    No shifts available. Create a shift first.
                  </p>
                )}
              </div>

              {/* EFFECTIVE DATE */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Effective Date
                </label>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    type="date"
                    name="effective_date"
                    value={form.effective_date}
                    onChange={handleChange}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* DAY */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Day of Week
                </label>

                <Select
                  name="day_of_week"
                  value={form.day_of_week}
                  onChange={handleChange}
                  className="w-full"
                >
                  <option value="">Select day</option>

                  {DAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </Select>

                <p className="mt-1 text-xs text-muted-foreground">
                  Sunday = 0 and Saturday = 6.
                </p>
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-border pt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeModal}
                  disabled={assignShiftMutation.isPending}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    assignShiftMutation.isPending ||
                    shiftsLoading ||
                    shifts.length === 0
                  }
                >
                  {assignShiftMutation.isPending
                    ? "Assigning..."
                    : "Assign Shift"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}