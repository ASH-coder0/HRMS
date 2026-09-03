import React, { forwardRef } from "react";
import companyDetails from "@/config/company";

const rs = (n) =>
  `Rs. ${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const amount = (value) => Number(value || 0);

const paymentMethodLabel = (method) =>
  String(method || "-")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

const parseItems = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const Receipt = forwardRef(({ payroll, employee }, ref) => {
  const salaryItems = [
    ["Basic Salary", payroll?.basic_salary],
    ["Housing Allowance", payroll?.housing_allowance],
    ["Transport Allowance", payroll?.transport_allowance],
    ["Medical Allowance", payroll?.medical_allowance],
    ["Other Allowance", payroll?.other_allowance],
    ["Food Allowance", payroll?.food_allowance],
    ["Accommodation Allowance", payroll?.accommodation_allowance],
  ].filter(([, value]) => amount(value) !== 0);

  const additionItems = [
    ...(amount(payroll?.ot_pay) !== 0
      ? [[`Overtime (${payroll?.overtime_hours || 0} hrs)`, payroll.ot_pay]]
      : []),
    ...parseItems(payroll?.other_additions)
      .filter((item) => amount(item.amount) !== 0)
      .map((item) => [item.label || "Additional Payment", item.amount]),
  ];

  const deductionItems = [
    ...(amount(payroll?.absence_deduction) !== 0
      ? [["Absence Deduction", payroll.absence_deduction]]
      : []),
    ...parseItems(payroll?.other_deductions)
      .filter((item) => amount(item.amount) !== 0)
      .map((item) => [item.label || "Deduction", item.amount]),
  ];

  const totalAdditions = additionItems.reduce((sum, [, v]) => sum + amount(v), 0);
  const totalDeductions = deductionItems.reduce((sum, [, v]) => sum + amount(v), 0);
  const grossSalary = amount(payroll?.gross_pay);
  const netPay = amount(payroll?.net_pay);

  // Unified line-item list so it renders as one QTY/Description/Amount table,
  // matching the reference layout. "type" drives the sign shown in Amount.
  const lineItems = [
    ...salaryItems.map(([label, value]) => ({ label, value, type: "add" })),
    ...additionItems.map(([label, value]) => ({ label, value, type: "add" })),
    ...deductionItems.map(([label, value]) => ({ label, value, type: "sub" })),
  ];

  const paymentDate = payroll?.payment_date
    ? new Date(payroll.payment_date).toLocaleDateString()
    : "-";

  return (
    <div
      id="payslip-print-area"
      ref={ref}
      className="w-[380px] bg-white text-[#0f172a] font-sans text-xs print:w-full"
    >
      <style>{`
        @media print {
          @page { size: A5; margin: 10mm; }
          #payslip-print-area { width: 100% !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>

      <div className="p-6">
        {/* Header: FROM block + RECEIPT title */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-[10px] font-bold text-[#1e3a5f] tracking-wide mb-1">
              FROM
            </p>
            <p className="font-semibold text-[13px]">
              {companyDetails.name}
            </p>
            {companyDetails.address && <p className="text-gray-600">{companyDetails.address}</p>}
            {companyDetails.phone && <p className="text-gray-600">{companyDetails.phone}</p>}
            {companyDetails.email && <p className="text-gray-600">{companyDetails.email}</p>}
            {companyDetails.website && <p className="text-gray-600">{companyDetails.website}</p>}
          </div>
          <h1 className="text-2xl font-bold text-[#1e3a5f] tracking-wide">
            PAYSLIP
          </h1>
        </div>

        {/* TO block + receipt meta */}
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-[10px] font-bold text-[#1e3a5f] tracking-wide mb-1">
              TO
            </p>
            <p className="font-semibold text-[13px]">
              {employee?.first_name} {employee?.last_name}
            </p>
            <p className="text-gray-600">Employee Code: {employee?.employee_code}</p>
          </div>
          <div className="text-right">
            <p>
              <span className="font-semibold text-[#1e3a5f]">Receipt #:</span>{" "}
              {payroll?.receipt_number}
            </p>
            <p>
              <span className="font-semibold text-[#1e3a5f]">Pay Period:</span>{" "}
              {payroll?.period_label}
            </p>
            <p>
              <span className="font-semibold text-[#1e3a5f]">Payment Date:</span>{" "}
              {paymentDate}
            </p>
            <p>
              <span className="font-semibold text-[#1e3a5f]">Payment Method:</span>{" "}
              {paymentMethodLabel(payroll?.payment_method)}
            </p>
          </div>
        </div>

        {/* Line items table */}
        <table className="w-full border-collapse mb-4">
          <thead>
            <tr className="bg-[#1e3a5f] text-white">
              <th className="text-left font-semibold py-1.5 px-2 w-2/3">
                Description
              </th>
              <th className="text-right font-semibold py-1.5 px-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-2 px-2 text-center text-gray-400">
                  No line items
                </td>
              </tr>
            ) : (
              lineItems.map((item, i) => (
                <tr
                  key={`${item.label}-${i}`}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-1 px-2 border-b border-gray-200">
                    {item.label}
                  </td>
                  <td
                    className={`py-1 px-2 text-right border-b border-gray-200 tabular-nums ${
                      item.type === "sub" ? "text-red-600" : ""
                    }`}
                  >
                    {item.type === "sub" ? "-" : ""}
                    {rs(item.value)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mb-6">
          <table className="w-1/2 text-xs">
            <tbody>
              <tr>
                <td className="py-1 px-2 text-gray-600">Gross Salary</td>
                <td className="py-1 px-2 text-right tabular-nums">
                  {rs(grossSalary)}
                </td>
              </tr>
              {totalAdditions !== 0 && (
                <tr>
                  <td className="py-1 px-2 text-gray-600">Total Additions</td>
                  <td className="py-1 px-2 text-right tabular-nums">
                    +{rs(totalAdditions)}
                  </td>
                </tr>
              )}
              {totalDeductions !== 0 && (
                <tr>
                  <td className="py-1 px-2 text-gray-600">Total Deductions</td>
                  <td className="py-1 px-2 text-right text-red-600 tabular-nums">
                    -{rs(totalDeductions)}
                  </td>
                </tr>
              )}
              <tr className="bg-[#1e3a5f] text-white font-bold">
                <td className="py-1.5 px-2 rounded-l">Net Pay</td>
                <td className="py-1.5 px-2 text-right tabular-nums rounded-r">
                  {rs(netPay)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Notes */}
        <div>
          <p className="text-[10px] font-bold text-[#1e3a5f] tracking-wide mb-1">
            NOTES
          </p>
          <p className="text-gray-600">
            This is a computer generated receipt. Thank you for your service!
          </p>
        </div>
      </div>
    </div>
  );
});

export default Receipt;