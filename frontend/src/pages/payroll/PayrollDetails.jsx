import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

const PayrollDetails = () => {
  const [totalGross, setTotalGross] = useState(0);
  const [totalNet, setTotalNet] = useState(0);
  const [totalEmployeesPaid, setTotalEmployeesPaid] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchPayrollDetails = async () => {
    setLoading(true);
    try {
      const response = await api.get("/emplyee-payroll/total-paid");
      setTotalGross(response.data.totalGrossSalary || 0);
      setTotalNet(response.data.totalNetPaid || 0);
      setTotalEmployeesPaid(response.data.totalEmployeesPaid || 0);
    } catch (error) {
      console.error("FETCH TOTAL PAID ERROR:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollDetails();
  }, []);

  const rs = (n) =>
    `Rs. ${Number(n || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  return (
    <>
    {/**total gross vs paid  */}
    <div className="rounded-md border border-gray-300 bg-white p-6 text-sm">
      <p className="mb-3 text-base font-semibold">Total Payroll Paid</p>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span>Total Gross Salary Paid</span>
            <span className="font-bold">{rs(totalGross)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span>Total Net Salary Paid</span>
            <span className="font-bold">{rs(totalNet)}</span>
          </div>
          <div className="flex justify-between">
            <span>Employees Paid</span>
            <span className="font-bold">{totalEmployeesPaid}</span>
          </div>
        </div>
      )}
    </div>
    {/**Serch by recipt number and list all the paid details in table */}
    <Paid
  </>
  );
};

export default PayrollDetails;