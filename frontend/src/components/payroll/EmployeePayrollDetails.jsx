import React, { useState } from "react";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {api} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const fmt = (n, digits = 2) =>
  Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const rs = (n) => `Rs. ${fmt(n)}`;

const hrs = (n) => `${fmt(n)} h`;

const PayrollDetails = ({
  payroll,
  employee,
  selectedMonth,
  selectedEconomicYear,
  onPaymentSaved,
}) => {
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState("cash");

  if (!payroll || !payroll.salary) return null;

  const salary = payroll.salary;
  const earnings = payroll.earnings || {};
  const period = payroll.period || {};

  const dailyWorkingHours = Number(salary.daily_working_hours) || 8;
  const otRate = Number(salary.ot_rate) || 1.5;
  const workingDays = Number(payroll.workingDays) || 0;
  const requiredHours = Number(payroll.requiredMonthlyHours) || 0;
  const workedHours = Number(payroll.totalWorkedHours) || 0;
  const shortfallHours = Number(payroll.shortfallHours) || 0;
  const excessHours = Number(payroll.overtimeHours) || 0;
  const hourlyRate = Number(payroll.hourlyRate) || 0;
  const perDayRate = Number(payroll.perDayRate) || 0;
  const absenceDeduction = Number(payroll.absenceDeduction) || 0;
  const otPay = Number(payroll.otPay) || 0;
  const grossMonthly = Number(earnings.grossMonthly) || 0;
  const netPay = Number(payroll.netPay) || 0;

  const summary = payroll.summary || {};
  const summaryRows = Object.entries(summary);

  const earningLines = [
    { label: `Basic Salary${Number(salary.basic_salary_multiplier) !== 1 ? ` (x ${salary.basic_salary_multiplier})` : ""}`, value: earnings.basic },
    { label: "Housing Allowance", value: earnings.housing },
    { label: "Transport Allowance", value: earnings.transport },
    { label: "Medical Allowance", value: earnings.medical },
    { label: "Other Allowance", value: earnings.other },
    ...(salary.food_enabled ? [{ label: "Food Allowance", value: earnings.food }] : []),
    ...(salary.accommodation_enabled ? [{ label: "Accommodation Allowance", value: earnings.accommodation }] : []),
  ].filter((l) => Number(l.value) > 0);

  const hasDeduction = absenceDeduction > 0;
  const hasOt = salary.ot_enabled && excessHours > 0;
  const unpaidDays = Number(payroll.unpaidDays) || 0;

  

const payEmployee = async () => {
  const employeeName = `${employee?.first_name || ""} ${employee?.last_name || ""}`.trim();
  if (!window.confirm(`Are you sure you want to pay "${employeeName}"?`)) return;

  try {
    const payload = {
      employeeId: employee?.id || employee?.employee_id,

      // selectedEconomicYear is currently: 7
      economicYearId:
        selectedEconomicYear?.id ??
        selectedEconomicYear?.economic_year_id ??
        selectedEconomicYear,

      // selectedMonth is currently: 5
      month:
        selectedMonth?.month ??
        selectedMonth?.month_number ??
        selectedMonth,

      year:
        payroll?.year ??
        payroll?.period?.bs?.year,

      periodLabel:
        payroll?.period?.label ||
        `${payroll?.period?.bs?.month_name || ""} ${
          payroll?.period?.bs?.year || ""
        }`,

      periodStartAD: payroll?.period?.ad?.start_date,
      periodEndAD: payroll?.period?.ad?.end_date,

      salary: payroll?.salary,
      payroll,

      paymentMethod,
      paymentReference: null,
      paidById: user?.id,
      remarks: null,

      otherDeductions: [],
      otherAdditions: [],
    };

    console.log("PAYROLL PAYMENT PAYLOAD:", payload);

    const response = await api.post(
      "/emplyee-payroll/save",
      payload
    );

    console.log("PAYMENT RESPONSE:", response.data);

    if (response.data.success) {
      toast.success("Employee payment saved successfully!");
      onPaymentSaved?.({
        receiptNumber: response.data.data?.receipt_number,
        paymentDate: response.data.data?.payment_date,
      });
    } else {
      toast.error(response.data.message || "Failed to save payment");
    }
  } catch (error) {
    console.error(
      "PAYMENT ERROR:",
      error.response?.data || error
    );

    toast.error(
      error.response?.data?.message ||
      "Failed to save employee payment"
    );
  }
};

  return (
    <div className="rounded-md border border-gray-300 bg-white p-6 text-sm text-gray-900 print:border-0">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-gray-300 pb-4">
        <div>
          <h2 className="text-lg font-bold">Payroll Slip</h2>
          <p className="text-xs text-muted-foreground">
            Employee: <span className="font-semibold">{employee?.first_name} {employee?.last_name}</span>{" "}
            ({employee?.employee_code})
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{period.label || `${period.bs?.month_name ?? ""} ${period.bs?.year ?? ""}`}</p>
          <p className="text-xs text-muted-foreground">
            A.D. {period.ad?.start_date} → {period.ad?.end_date}
          </p>
        </div>
      </div>

      {/*  Gross salary breakdown */}
      <section className="mb-5">
        <h3 className="mb-2 font-semibold">1. Gross Salary</h3>
        <table className="w-full border-collapse border border-gray-300">
          <tbody>
            {earningLines.map((line) => (
              <tr key={line.label}>
                <td className="border border-gray-300 px-3 py-1.5">{line.label}</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right">{rs(line.value)}</td>
              </tr>
            ))}
            <tr className="bg-gray-50 font-bold">
              <td className="border border-gray-300 px-3 py-1.5">Gross Monthly Salary</td>
              <td className="border border-gray-300 px-3 py-1.5 text-right">{rs(grossMonthly)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Rate derivation */}
      <section className="mb-5">
        <h3 className="mb-2 font-semibold">2. Rate Calculation</h3>
        <table className="w-full border-collapse border border-gray-300">
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-1.5">Daily working hours</td>
              <td className="border border-gray-300 px-3 py-1.5 text-right">{dailyWorkingHours} h/day</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1.5">
                Working days this month <span className="text-xs text-muted-foreground">(Saturdays off)</span>
              </td>
              <td className="border border-gray-300 px-3 py-1.5 text-right">{workingDays} days</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1.5">
                Required monthly hours <span className="text-xs">({workingDays} × {dailyWorkingHours})</span>
              </td>
              <td className="border border-gray-300 px-3 py-1.5 text-right">{hrs(requiredHours)}</td>
            </tr>
            <tr className="bg-gray-50 font-semibold">
              <td className="border border-gray-300 px-3 py-1.5">
                Hourly rate <span className="text-xs">({rs(grossMonthly)} ÷ {requiredHours} h)</span>
              </td>
              <td className="border border-gray-300 px-3 py-1.5 text-right">{rs(hourlyRate)}/h</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1.5">
                Daily rate <span className="text-xs">({rs(hourlyRate)} × {dailyWorkingHours})</span>
              </td>
              <td className="border border-gray-300 px-3 py-1.5 text-right">{rs(perDayRate)}/day</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 3. Attendance */}
      <section className="mb-5">
        <h3 className="mb-2 font-semibold">3. Attendance Summary</h3>
        <table className="w-full border-collapse border border-gray-300">
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-1.5">Total hours worked</td>
              <td className="border border-gray-300 px-3 py-1.5 text-right font-semibold">{hrs(workedHours)}</td>
            </tr>
            {summaryRows.map(([status, count]) => (
              <tr key={status}>
                <td className="border border-gray-300 px-3 py-1.5 capitalize">{String(status).replace("_", " ")} (days)</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right">{count}</td>
              </tr>
            ))}
            {!summaryRows.length && (
              <tr>
                <td className="border border-gray-300 px-3 py-1.5" colSpan={2}>
                  No attendance records found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* 4. Deductions */}
      <section className="mb-5">
        <h3 className="mb-2 font-semibold">4. Deductions</h3>
        {hasDeduction ? (
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5">
                  Monthly hours shortfall{" "}
                  <span className="text-xs">
                    ({hrs(requiredHours)} required − {hrs(workedHours)} worked = {hrs(shortfallHours)} short ≈ {fmt(unpaidDays)} unpaid days)
                  </span>
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right">
                  {hrs(shortfallHours)} × {rs(hourlyRate)}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right font-semibold text-red-600">
                  −{rs(Math.min(absenceDeduction, grossMonthly))}
                </td>
              </tr>
              <tr className="bg-gray-50 font-bold">
                <td className="border border-gray-300 px-3 py-1.5" colSpan={2}>Total Deductions</td>
                <td className="border border-gray-300 px-3 py-1.5 text-right text-red-600">−{rs(absenceDeduction)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-green-700">No deduction made. Required monthly hours were fully met.</p>
        )}
      </section>

      {/* 5. Overtime */}
      <section className="mb-5">
        <h3 className="mb-2 font-semibold">5. Overtime</h3>
        {hasOt ? (
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5">
                  Extra hours beyond schedule{" "}
                  <span className="text-xs">({hrs(workedHours)} worked − {hrs(requiredHours)} required)</span>
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right">{hrs(excessHours)}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-1.5">
                  Equivalent extra days <span className="text-xs">(÷ {dailyWorkingHours} h)</span>
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right">{fmt(excessHours / dailyWorkingHours)} days</td>
              </tr>
              <tr className="bg-gray-50 font-bold">
                <td className="border border-gray-300 px-3 py-1.5">
                  Overtime payment <span className="text-xs">({hrs(excessHours)} × {rs(hourlyRate)} × {otRate}x)</span>
                </td>
                <td className="border border-gray-300 px-3 py-1.5 text-right text-green-700">+{rs(otPay)}</td>
              </tr>
            </tbody>
          </table>
        ) : (
          <p className="text-muted-foreground">
            {!salary.ot_enabled
              ? "Overtime is not enabled for this employee — extra hours are not paid."
              : "No overtime — monthly working hours were not exceeded."}
          </p>
        )}
      </section>

      {/* Net pay */}
      <div className="mt-4 flex items-center justify-between rounded-md bg-gray-100 px-4 py-3 dark:bg-gray-800">
        <span className="text-base font-bold">Net Payable</span>
        <span className="text-xl font-extrabold">{rs(netPay)}</span>
      </div>

      {/* Footer */}
     <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground print:hidden">
        <span>Generated: {new Date().toLocaleString()}</span>

       <div className="flex items-center gap-2">
         <label htmlFor="payment-method" className="font-medium text-gray-700">
           Payment method
         </label>
         <select
           id="payment-method"
           value={paymentMethod}
           onChange={(event) => setPaymentMethod(event.target.value)}
           className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
         >
           <option value="cash">Cash</option>
           <option value="bank_transfer">Bank Transfer</option>
           <option value="digital_wallet">Wallet</option>
         </select>
         <Button onClick={payEmployee}>
           Pay {employee?.first_name} {employee?.last_name}
         </Button>
       </div>
     </div>
      <p className="mt-6 hidden justify-between text-xs text-muted-foreground print:flex">
        <span>Employee Signature: ____________________</span>
        <span>Authorized Signature: ____________________</span>
      </p>
    </div>
  );
};

export default PayrollDetails;
