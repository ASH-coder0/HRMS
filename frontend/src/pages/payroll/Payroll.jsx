import { useState, useEffect } from "react";
import { useReactToPrint } from "react-to-print";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Wallet, Settings2, AlertTriangle, Printer } from "lucide-react";
import { calculateNetSalary } from "@/lib/payroll";
import { EmployeeSearchSelect } from "@/components/common/EmployeeSearchSelect";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import EconomicYearSelect, { MonthSelect } from "@/components/common/EconomicYearSelect";
import PayrollDetails from "../../components/payroll/EmployeePayrollDetails";
import Receipt from "../../components/payroll/Receipt";
import { api } from "@/lib/api";
import { useRef } from "react";

function toDevanagariDigits(value) {
  const digits = { 0: "०", 1: "१", 2: "२", 3: "३", 4: "४", 5: "५", 6: "६", 7: "७", 8: "८", 9: "९" };
  return String(value).replace(/\d/g, (digit) => digits[digit]);
}

const Payroll = () => {
  const [employeeCode, setEmployeeCode] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedEconomicYear, setSelectedEconomicYear] = useState("");
  const [selectedEconomicYearData, setSelectedEconomicYearData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");

  const [paidStatus, setPaidStatus] = useState(null);
  const [checkingPaid, setCheckingPaid] = useState(false);
  const [paidStatusError, setPaidStatusError] = useState(null);

  //for receipt
  const [receiptData, setReceiptData] = useState(null);
const [fetchingReceipt, setFetchingReceipt] = useState(false);
const receiptRef = useRef(null);

  useEffect(() => {
    const employeeId = selectedEmployee?.id || selectedEmployee?.employee_id;
    const economicYearId =
      selectedEconomicYear?.id ?? selectedEconomicYear?.economic_year_id ?? selectedEconomicYear;
    const month = selectedMonth?.month ?? selectedMonth?.month_number ?? selectedMonth;

    if (!employeeId || !economicYearId || !month) {
      setPaidStatus(null);
      setPaidStatusError(null);
      setCheckingPaid(false);
      return;
    }

    let cancelled = false;
    const checkStatus = async () => {
      setCheckingPaid(true);
      setPaidStatus(null);
      setPaidStatusError(null);
      try {
        const response = await api.post("/emplyee-payroll/status", null, {
          params: { employeeId, economicYearId, month },
        });
        if (!cancelled) setPaidStatus(response.data);
      } catch (error) {
        console.error("STATUS CHECK ERROR:", error.response?.data || error);
        if (!cancelled) {
          setPaidStatusError(
            error.response?.data?.message || "Failed to check payroll status."
          );
        }
      } finally {
        if (!cancelled) setCheckingPaid(false);
      }
    };
    checkStatus();
    return () => { cancelled = true; };
  }, [selectedEmployee, selectedMonth, selectedEconomicYear]);

  const payrollQuery = useQuery({
    queryKey: ["net-salary", selectedEmployee?.id, selectedMonth, selectedEconomicYear],
    queryFn: async () => {
      const result = await calculateNetSalary(selectedEmployee.id, selectedMonth, selectedEconomicYear);
      if (!result.success) {
        const error = new Error(result.error);
        error.status = result.status;
        throw error;
      }
      return result.data;
    },
    enabled:
      !!selectedEmployee?.id &&
      !!selectedMonth &&
      !!selectedEconomicYear &&
      !paidStatus?.paid &&
      !paidStatusError,
    retry: false,
  });

  const payroll = payrollQuery.data;
  const salary = payroll?.salary;
  const hasSelection = selectedEmployee && selectedMonth && selectedEconomicYear;
  const isLoading = hasSelection && !paidStatus?.paid && payrollQuery.isLoading;
  const noSalary = payrollQuery.isError && payrollQuery.error?.status === 404;
  const fullDeduction = payroll && Number(payroll.absenceDeduction) > 0 && Number(payroll.netPay) === 0;

  const handlePrint = useReactToPrint({
   contentRef: receiptRef,
   documentTitle: receiptData?.receipt_number || "receipt",
   onAfterPrint: () => setReceiptData(null),
 });

 useEffect(() => {
   if (!receiptData || !receiptRef.current) return;

   handlePrint();
 }, [receiptData, handlePrint]);

 const handlePrintReceiptClick = async () => {
  const employeeId = selectedEmployee?.id || selectedEmployee?.employee_id;
  const economicYearId =
    selectedEconomicYear?.id ?? selectedEconomicYear?.economic_year_id ?? selectedEconomicYear;
  const month = selectedMonth?.month ?? selectedMonth?.month_number ?? selectedMonth;

  setFetchingReceipt(true);
  try {
    const response = await api.get("/emplyee-payroll/paid-details", {
      params: { employeeId, economicYearId, month },
    });
    setReceiptData(response.data.data);
  } catch (error) {
    console.error("RECEIPT FETCH ERROR:", error.response?.data || error);
  } finally {
    setFetchingReceipt(false);
  }
};
  return (
    <div>
      <PageHeader
        title="Payroll"
        description="Pick an employee, economic year and month — salary and attendance are pulled in automatically."
        action={
          <Link to="/save-salary">
            <Button variant="outline"><Settings2 className="h-4 w-4" /> Manage salary components</Button>
          </Link>
        }
      />

      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <EmployeeSearchSelect
                value={employeeCode}
                onChange={(value) => { setEmployeeCode(value); setSelectedEmployee(null); }}
                onSelect={(employee) => { setSelectedEmployee(employee); setEmployeeCode(employee?.employee_code || ""); }}
                placeholder="Search employee by name or code..."
              />
            </div>

            <div className="space-y-1.5">
              <Label>Economic Year</Label>
              <EconomicYearSelect
                value={selectedEconomicYear}
                onChange={(id) => { setSelectedEconomicYear(id); setSelectedMonth(""); }}
                onYearChange={setSelectedEconomicYearData}
                placeholder="Select economic year"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Month</Label>
              <MonthSelect
                economicYear={selectedEconomicYearData}
                value={selectedMonth}
                onChange={setSelectedMonth}
                placeholder="Select month"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!hasSelection && (
        <Card>
          <EmptyState icon={Wallet} title="Select an employee and month to calculate payroll" description="Salary structure and attendance for the selected month will load automatically." />
        </Card>
      )}

      {hasSelection && checkingPaid && (
        <Card><CardContent className="p-6 text-sm text-gray-500">Checking payroll status...</CardContent></Card>
      )}

      {hasSelection && !checkingPaid && paidStatus?.paid && (
  <Card>
    <CardContent className="p-6">
      <div className="rounded-md border border-green-300 bg-green-50 p-4 text-sm text-black">
        <h2 className="mb-2 text-lg font-bold"> Paid</h2>
        <p>This employee has been paid for the selected period. Please check the receipt in that selected year.</p>
        {paidStatus.receiptNumber && <p className="mt-2 font-semibold">Receipt No: {paidStatus.receiptNumber}</p>}
        <div
          className="mt-3 flex cursor-pointer items-center gap-2"
          onClick={handlePrintReceiptClick}
        >
          <Printer size={30} className="rounded p-2 text-white bg-blue-500" />
          <p className="font-bold">{fetchingReceipt ? "Loading..." : "Print Receipt"}</p>
        </div>
      </div>
    </CardContent>
  </Card>
)}

{/* Keep the receipt mounted off-screen so the browser can render it for printing. */}
<div style={{ position: "absolute", top: 0, left: "-10000px", width: "350px" }}>
  {receiptData && (
    <Receipt ref={receiptRef} payroll={receiptData} employee={selectedEmployee} />
  )}
</div>
      {hasSelection && !checkingPaid && paidStatusError && (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="Couldn't verify payroll status"
            description={paidStatusError}
          />
        </Card>
      )}

      {hasSelection && !checkingPaid && !paidStatus?.paid && !paidStatusError && isLoading && (
        <Card><CardContent className="space-y-3 p-6">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>
      )}

      {hasSelection && !checkingPaid && !paidStatus?.paid && !paidStatusError && !isLoading && noSalary && (
        <Card>
          <EmptyState
            icon={AlertTriangle}
            title="No salary structure set for this employee"
            description={`Set a basic salary and allowances before payroll can be calculated for ${selectedEmployee.first_name}.`}
            action={<Link to="/save-salary"><Button>Set up salary</Button></Link>}
          />
        </Card>
      )}

      {hasSelection && !checkingPaid && !paidStatus?.paid && !paidStatusError && !isLoading && payrollQuery.isError && !noSalary && (
        <Card>
          <EmptyState icon={AlertTriangle} title="Couldn't calculate payroll" description={payrollQuery.error?.message || "Something went wrong while calculating payroll."} />
        </Card>
      )}

      {hasSelection && !checkingPaid && !paidStatus?.paid && !paidStatusError && !isLoading && payroll && salary && (
        <div className="space-y-6">
          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {selectedEmployee.first_name?.[0]}
                  {selectedEmployee.last_name?.[0]}
                </div>
                <div>
                  <p className="font-semibold">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedEmployee.employee_code}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold">{payroll.period?.label}</p>
                <p className="text-xs text-muted-foreground">
                  {payroll.period?.ad?.start_date} → {payroll.period?.ad?.end_date} (A.D.)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={fullDeduction ? "destructive" : payroll.unpaidDays > 0 ? "warning" : "success"}>
                  {fullDeduction
                    ? "Full deduction, no attendance this month"
                    : payroll.unpaidDays > 0
                      ? `${toDevanagariDigits(payroll.unpaidDays)} unpaid day${Number(payroll.unpaidDays) === 1 ? "" : "s"}`
                      : "Full attendance"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <PayrollDetails
            payroll={payroll}
            employee={selectedEmployee}
            selectedEconomicYear={selectedEconomicYear}
            selectedMonth={selectedMonth}
            onPaymentSaved={(payment) => setPaidStatus({ paid: true, ...payment })}
          />
        </div>
      )}
    </div>
  );
};

export default Payroll;