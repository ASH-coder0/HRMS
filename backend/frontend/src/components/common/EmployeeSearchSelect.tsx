
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Search, ChevronDown, Check } from "lucide-react";

type Employee = {
  id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email?: string;
};

interface EmployeeSearchSelectProps {
  value: string;               // stores employee_code
  onChange: (value: string) => void;
  onSelect?: (employee: Employee) => void;  // <-- ADD THIS
  placeholder?: string;
  status?: string;
}

export function EmployeeSearchSelect({
  value,
  onChange,
  onSelect,  // <-- ADD THIS
  placeholder = "Search employee...",
  status = "active",
}: EmployeeSearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employee-search", search, status],
    queryFn: async () => {
      const res = await api.get("/employees", {
        params: {
          search: search || undefined,
          limit: 20,
          status: status || undefined,
        },
      });
      return res.data.data?.items || [];
    },
    enabled: isOpen,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedEmployee = employees.find((emp) => emp.employee_code === value);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        <span className="truncate text-foreground">
          {selectedEmployee
            ? `${selectedEmployee.first_name} ${selectedEmployee.last_name} (${selectedEmployee.employee_code})`
            : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-8 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">Loading...</div>
            ) : employees.length === 0 ? (
              <div className="px-4 py-2 text-sm text-muted-foreground">No employees found</div>
            ) : (
              <ul>
                {employees.map((emp) => {
                  const isSelected = value === emp.employee_code;
                  return (
                    <li
                      key={emp.id}
                      onClick={() => {
                        onChange(emp.employee_code);
                        onSelect?.(emp);  // <-- ADD THIS - calls the parent's onSelect
                        setIsOpen(false);
                      }}
                      className={`flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors ${
                        isSelected
                          ? "bg-muted text-foreground"
                          : "hover:bg-muted/50 hover:text-foreground"
                      }`}
                    >
                      {/* Profile avatar - BLUE */}
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}>
                        {emp.first_name[0]}{emp.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {emp.first_name} {emp.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {emp.employee_code} {emp.email ? `• ${emp.email}` : ""}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 flex-shrink-0 text-primary" />
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}