import React, { useState, useEffect } from "react";
import { Banknote, Users, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import PaidSalary from "../../components/tables/PaidSalary";


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
      console.error(
        "FETCH TOTAL PAID ERROR:",
        error.response?.data || error
      );
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
{/* Total gross vs paid */}
<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
  {loading ? (
    <p className="text-muted-foreground col-span-3">Loading...</p>
  ) : (
    <>
      {/* Card 1: Total Gross Salary */}
      <div className="rounded-md border border-blue-300 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Total Gross Salary</p>
        <div className="mt-2 flex items-center gap-2">
          <Banknote className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <p className="text-2xl font-bold">{rs(totalGross)}</p>
        </div>
      </div>

      {/* Card 2: Total Net Salary Paid */}
      <div className="rounded-md border border-blue-300 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Total Net Salary Paid</p>
        <div className="mt-2 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <p className="text-2xl font-bold">{rs(totalNet)}</p>
        </div>
      </div>

      {/* Card 3: Payment Done */}
      <div className="rounded-md border border-blue-300 bg-white p-6 shadow-sm">
        <p className="text-sm text-gray-500">Payment Done</p>
        <div className="mt-2 flex items-center gap-2">
          <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <p className="text-2xl font-bold">{totalEmployeesPaid}</p>
        </div>
      </div>
    </>
  )}
</div>
      <PaidSalary />
    </>
  );
};

export default PayrollDetails;