import { api } from "@/lib/api";

export const calculateNetSalary = async (employeeId, month, economicYearId) => {
  try {
    if (!employeeId) throw new Error("employeeId is required");
    if (!month) throw new Error("month is required");
    if (!economicYearId) throw new Error("economicYearId is required");

    const res = await api.get("/payroll/net-salary", {
      params: { employee_id: employeeId, month, economic_year_id: economicYearId },
    });

    return { success: true, data: res.data?.data };
  } catch (err) {
    return {
      success: false,
      status: err?.response?.status,
      error: err?.response?.data?.message || err.message || "Failed to calculate net salary",
    };
  }
};

// Bikram Sambat months covered by an economic year (e.g. "Jestha 2083").
export const fetchPayrollPeriods = async (economicYearId) => {
  try {
    if (!economicYearId) throw new Error("economicYearId is required");

    const res = await api.get("/payroll/periods", {
      params: { economic_year_id: economicYearId },
    });

    return { success: true, data: res.data?.data };
  } catch (err) {
    return {
      success: false,
      status: err?.response?.status,
      error: err?.response?.data?.message || err.message || "Failed to load payroll periods",
    };
  }
};
