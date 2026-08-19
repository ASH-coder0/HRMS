
import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { api } from '@/lib/api';

const statusColors = {
  applied: 'bg-blue-100 text-blue-700',
  shortlisted: 'bg-yellow-100 text-yellow-700',
  interviewing: 'bg-purple-100 text-purple-700',
  offered: 'bg-emerald-100 text-emerald-700',
  hired: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

const jobStatusColors = {
  open: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-700',
  on_hold: 'bg-yellow-100 text-yellow-700',
};

const RecruitmentTable = () => {
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const itemsPerPage = 10;

  const fetchRecruitments = async () => {
    try {
      const res = await api.get('/recruitment');
      if (res.status === 200) setRecruitments(res.data.data || []);
    } catch (err) {
      console.log('Error fetching recruitment details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruitments();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const updateStatus = async (id, payload) => {
    setUpdatingId(id);
    const previous = recruitments;

    setRecruitments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...payload } : item))
    );

    try {
      const res = await api.put(`/recruitment/${id}/status`, payload);
      if (res.status !== 200) throw new Error('Update failed');
    } catch (err) {
      console.log('Error updating status', err);
      setRecruitments(previous);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id, label) => {
    if (!window.confirm(`Delete "${label || 'this record'}"? This cannot be undone.`)) return;

    setDeletingId(id);
    const previous = recruitments;
    setRecruitments((prev) => prev.filter((item) => item.id !== id));

    try {
      const res = await api.delete(`/recruitment/${id}`);
      if (![200, 204].includes(res.status)) throw new Error('Delete failed');
    } catch (err) {
      console.log('Error deleting recruitment', err);
      setRecruitments(previous);
      alert('Failed to delete record. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRecruitments = recruitments.filter((item) => {
    const text = search.toLowerCase();

    return [
      item.job_title,
      item.candidate_name,
      item.candidate_email,
      item.Department?.name,
      item.Designation?.title,
    ].some((value) => (value || '').toLowerCase().includes(text));
  });

  const totalPages = Math.ceil(filteredRecruitments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRecruitments = filteredRecruitments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    if (currentPage > 1 && !currentRecruitments.length && filteredRecruitments.length) {
      setCurrentPage((page) => page - 1);
    }
  }, [currentPage, currentRecruitments.length, filteredRecruitments.length]);

  if (loading) {
    return <div className="p-6 text-sm text-gray-500">Loading recruitment...</div>;
  }

  return (
    <div className="w-full space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Recruitment</h1>
        <input
          type="text"
          placeholder="Search recruitment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="w-full overflow-x-auto rounded-md border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-blue-500">
              {[
                'Job Title',
                'Department',
                'Designation',
                'Job Status',
                'Candidate',
                'Email',
                'Phone',
                'Candidate Status',
                'Resume',
                'Actions',
              ].map((heading) => (
                <th key={heading} className="border-r border-blue-400 p-3 text-left text-white">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentRecruitments.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="border-r p-3 font-medium">{item.job_title || 'N/A'}</td>
                <td className="border-r p-3">{item.Department?.name || 'N/A'}</td>
                <td className="border-r p-3">{item.Designation?.title || 'N/A'}</td>

                <td className="border-r p-3">
                  <select
                    value={item.status || 'open'}
                    disabled={updatingId === item.id}
                    onChange={(e) => updateStatus(item.id, { status: e.target.value })}
                    className={`cursor-pointer rounded-full border-0 px-2 py-1 text-xs font-medium outline-none disabled:opacity-50 ${
                      jobStatusColors[item.status] || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {Object.keys(jobStatusColors).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>

                <td className="border-r p-3">{item.candidate_name || 'No applicant'}</td>
                <td className="border-r p-3 text-sm">{item.candidate_email || 'N/A'}</td>
                <td className="border-r p-3 text-sm">{item.candidate_phone || 'N/A'}</td>

                <td className="border-r p-3">
                  {item.candidate_name ? (
                    <select
                      value={item.candidate_status || 'applied'}
                      disabled={updatingId === item.id}
                      onChange={(e) =>
                        updateStatus(item.id, { candidate_status: e.target.value })
                      }
                      className={`cursor-pointer rounded-full border-0 px-2 py-1 text-xs font-medium outline-none disabled:opacity-50 ${
                        statusColors[item.candidate_status] || 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {Object.keys(statusColors).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : 'N/A'}
                </td>

                <td className="border-r p-3">
                  {item.resume_url ? (
                    <a
                      href={`http://localhost:5000${item.resume_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View Resume
                    </a>
                  ) : (
                    <span className="text-sm text-gray-400">No Resume</span>
                  )}
                </td>

                <td className="p-3">
                  <button
                    type="button"
                    title="Delete"
                    disabled={deletingId === item.id}
                    onClick={() =>
                      handleDelete(item.id, item.candidate_name || item.job_title)
                    }
                    className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!currentRecruitments.length && (
          <div className="py-8 text-center text-gray-500">
            No recruitment records found.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredRecruitments.length)} of {filteredRecruitments.length}
          </p>

          <div className="flex gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`rounded-md border px-3 py-1.5 text-sm ${
                  currentPage === page
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentTable;