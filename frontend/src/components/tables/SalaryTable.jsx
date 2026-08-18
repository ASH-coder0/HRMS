import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';

const SalaryTable = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  const fetchSalaryDetails = async () => {
    try {
      const res = await api.get('/salary/get');

      if (res.status === 200) {
        setSalaries(res.data.data || []);
      }
    } catch (err) {
      console.log('Error fetching salary details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryDetails();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredSalaries = salaries.filter((salary) => {
    const employeeName = salary.Employee
      ? `${salary.Employee.first_name} ${salary.Employee.last_name}`
      : '';

    const employeeCode = salary.Employee?.employee_code || '';

    return (
      employeeName.toLowerCase().includes(search.toLowerCase()) ||
      employeeCode.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredSalaries.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentSalaries = filteredSalaries.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="w-full p-8 space-y-4">
      {/* Search */}
      <div className="flex items-center justify-between">
        {/*Title */}
      <h1 className='font-semibold text-xl'>Salary Display</h1>
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

    <div className="w-full overflow-x-auto rounded-md border">
  <table className="w-full border-collapse">
    <thead>
      <tr className="border-b bg-blue-500">
        <th className="border-r border-blue-400 p-3 text-left text-white">
          Employee
        </th>
        <th className="border-r border-blue-400 p-3 text-left text-white">
          Employee Code
        </th>
        <th className="border-r border-blue-400 p-3 text-right text-white">
          Basic Salary
        </th>
        <th className="border-r border-blue-400 p-3 text-right text-white">
          Housing
        </th>
        <th className="border-r border-blue-400 p-3 text-right text-white">
          Transport
        </th>
        <th className="border-r border-blue-400 p-3 text-right text-white">
          Medical
        </th>
        <th className="border-r border-blue-400 p-3 text-right text-white">
          Other
        </th>
        <th className="p-3 text-left text-white">
          Effective Date
        </th>
      </tr>
    </thead>

    <tbody>
      {currentSalaries.map((salary) => (
        <tr key={salary.id} className="border-b">
          <td className="border-r p-3">
            {salary.Employee
              ? `${salary.Employee.first_name} ${salary.Employee.last_name}`
              : 'N/A'}
          </td>

          <td className="border-r p-3">
            {salary.Employee?.employee_code || 'N/A'}
          </td>

          <td className="border-r p-3 text-right">
            {salary.basic_salary}
          </td>

          <td className="border-r p-3 text-right">
            {salary.housing_allowance}
          </td>

          <td className="border-r p-3 text-right">
            {salary.transport_allowance}
          </td>

          <td className="border-r p-3 text-right">
            {salary.medical_allowance}
          </td>

          <td className="border-r p-3 text-right">
            {salary.other_allowance}
          </td>

          <td className="p-3">
            {salary.effective_date}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  {currentSalaries.length === 0 && (
    <div className="py-8 text-center text-gray-500">
      No salary records found.
    </div>
  )}
</div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredSalaries.length)} of{' '}
            {filteredSalaries.length}
          </p>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`rounded-md border px-3 py-1.5 text-sm ${
                    currentPage === page
                      ? 'border-primary bg-primary text-white'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              )
            )}

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
    </div>
  );
};

export default SalaryTable;