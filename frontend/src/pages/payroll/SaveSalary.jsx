import React from "react";
import { SetSalaryForm } from "@/components/form/SetSalaryForm";
import SalaryTable from "../../components/tables/SalaryTable";
const SaveSalary = () => {
  return (
    <div>
      <SetSalaryForm />
      <SalaryTable/>
    </div>
  );
};

export default SaveSalary;
