import { useEffect, useRef, useState } from "react";
import { Printer, Search } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { api } from "@/lib/api";
import Receipt from "@/components/payroll/Receipt";

const money = (value) =>
  `Rs. ${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const employeeName = (employee) =>
  employee
    ? `${employee.first_name || ""} ${employee.last_name || ""}`.trim()
    : "N/A";

const PaidSalary = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiptSearch, setReceiptSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const receiptRef = useRef(null);
  const itemsPerPage = 10;

  const handlePrint = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: selectedRecord?.receipt_number || "salary-receipt",
    onAfterPrint: () => setSelectedRecord(null),
  });

  useEffect(() => {
    if (selectedRecord && receiptRef.current) {
      handlePrint();
    }
  }, [selectedRecord, handlePrint]);

  useEffect(() => {
    let cancelled = false;

    const fetchPaidSalary = async () => {
      try {
        const response = await api.get("/emplyee-payroll/paid-all");
        if (!cancelled) setRecords(response.data.data || []);
      } catch (requestError) {
        console.error("FETCH PAID PAYROLL ERROR:", requestError.response?.data || requestError);
        if (!cancelled) {
          setError(
            requestError.response?.data?.message || "Failed to fetch paid payroll records.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPaidSalary();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRecords = records.filter((record) =>
    (record.receipt_number || "")
      .toLowerCase()
      .includes(receiptSearch.trim().toLowerCase()),
  );
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRecords = filteredRecords.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [receiptSearch]);

  return (
    <section className="mt-6 rounded-md border border-gray-300 bg-white p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Paid Salary</h2>
          <p className="text-sm text-muted-foreground">
            All payroll payments recorded as paid.
          </p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={receiptSearch}
            onChange={(event) => {
              setReceiptSearch(event.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search receipt number..."
            aria-label="Search by receipt number"
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
          />
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
      {!loading && error && <p className="text-sm text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b bg-blue-500">
                {["Employee", "Code", "Period", "Payment date", "Receipt", "Method", "Gross pay", "Net pay", "Status", "Print"].map(
                  (heading) => (
                    <th key={heading} className="whitespace-nowrap border-r border-blue-400 p-3 text-white last:border-r-0">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedRecords.map((record) => (
                <tr key={record.id} className="border-b">
                  <td className="whitespace-nowrap p-3">{employeeName(record.Employee || record.employee)}</td>
                  <td className="whitespace-nowrap p-3">{record.Employee?.employee_code || record.employee?.employee_code || "N/A"}</td>
                  <td className="whitespace-nowrap p-3">{record.period_label || `Month ${record.month}`}</td>
                  <td className="whitespace-nowrap p-3">
                    {record.payment_date ? new Date(record.payment_date).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="whitespace-nowrap p-3">{record.receipt_number}</td>
                  <td className="whitespace-nowrap p-3">{record.payment_method || "N/A"}</td>
                  <td className="whitespace-nowrap p-3 text-right">{money(record.gross_pay)}</td>
                  <td className="whitespace-nowrap p-3 text-right font-semibold">{money(record.net_pay)}</td>
                  <td className="p-3 font-semibold text-green-600">Paid</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(record)}
                      aria-label={`Print receipt ${record.receipt_number}`}
                      title="Print receipt"
                      className="inline-flex rounded-md border p-2 text-gray-700 transition hover:bg-gray-100"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {records.length === 0
                ? "No paid payroll records found."
                : "No receipt matches your search."}
            </p>
          )}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRecords.length)} of{" "}
            {filteredRecords.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div
        aria-hidden="true"
        className="absolute left-[-10000px] top-0 w-[350px]"
      >
        {selectedRecord && (
          <Receipt
            ref={receiptRef}
            payroll={selectedRecord}
            employee={selectedRecord.Employee || selectedRecord.employee}
          />
        )}
      </div>
    </section>
  );
};

export default PaidSalary;
