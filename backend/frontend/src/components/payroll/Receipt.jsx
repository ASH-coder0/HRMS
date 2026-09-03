import React, { forwardRef } from "react";

const rs = (n) =>
  `Rs. ${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const amount = (value) => Number(value || 0);

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
      ? [[`Overtime (${payroll?.overtime_hours || 0} hours)`, payroll.ot_pay]]
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
  const totalAdditions = additionItems.reduce((sum, [, value]) => sum + amount(value), 0);
  const totalDeductions = deductionItems.reduce((sum, [, value]) => sum + amount(value), 0);

  const renderRows = (items) =>
    items.map(([label, value]) => (
      <tr key={label}>
        <td className="py-1">{label}</td>
        <td className="py-1 text-right">{rs(value)}</td>
      </tr>
    ));

  return (
    <div id="payslip-print-area" ref={ref} className="w-[350px] p-6 font-sans">
      <h2 className="text-center text-lg font-bold mb-1">Salary Receipt</h2>
      <p className="text-center text-xs text-muted-foreground mb-4">Company Name Pvt. Ltd.</p>

      <hr className="my-3" />

      <div className="text-sm space-y-1 mb-3">
        <p><span className="font-semibold">Employee:</span> {employee?.first_name} {employee?.last_name}</p>
        <p><span className="font-semibold">Code:</span> {employee?.employee_code}</p>
        <p><span className="font-semibold">Period:</span> {payroll?.period_label}</p>
        <p><span className="font-semibold">Receipt No:</span> {payroll?.receipt_number}</p>
      </div>

      <hr className="my-3" />

      <table className="w-full text-sm">
        <tbody>
          {salaryItems.length > 0 && (
            <>
              <tr><td colSpan="2" className="pt-1 font-bold">Salary</td></tr>
              {renderRows(salaryItems)}
            </>
          )}
          <tr>
            <td className="py-1 font-semibold">Gross Salary</td>
            <td className="py-1 text-right font-semibold">{rs(payroll?.gross_pay)}</td>
          </tr>
          {additionItems.length > 0 && (
            <>
              <tr><td colSpan="2" className="pt-2 font-bold">Additions</td></tr>
              {renderRows(additionItems)}
            </>
          )}
          {deductionItems.length > 0 && (
            <>
              <tr><td colSpan="2" className="pt-2 font-bold">Deductions</td></tr>
              {renderRows(deductionItems)}
            </>
          )}
          {additionItems.length > 0 && (
            <tr>
              <td className="py-1 font-semibold">Total Additions</td>
              <td className="py-1 text-right font-semibold">{rs(totalAdditions)}</td>
            </tr>
          )}
          {deductionItems.length > 0 && (
            <tr>
              <td className="py-1 font-semibold">Total Deductions</td>
              <td className="py-1 text-right font-semibold">{rs(totalDeductions)}</td>
            </tr>
          )}
          <tr>
            <td className="py-2 font-bold">Net Pay</td>
            <td className="py-2 text-right font-bold">{rs(payroll?.net_pay)}</td>
          </tr>
        </tbody>
      </table>

      <hr className="my-3" />

      <p className="text-center text-[11px] text-muted-foreground">
        This is a computer generated receipt.
      </p>
    </div>
  );
});

export default Receipt;