import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  MapPin,
  Users,
  Pencil,
  Trash2,
  Eye,
  Loader2,
  Search,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '../../context/AuthContext';
const TrainingTable = ({ canManage = false }) => {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth(); 
  const itemsPerPage = 10;

  // Edit modal state (only used if canManage)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    trainer: '',
    start_date: '',
    end_date: '',
    location: '',
    capacity: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      setError('');
      let res;
      if (canManage) {
        // Admin/HR: fetch all trainings
        res = await api.get('/training');
        const data = res.data?.data;
        const items = Array.isArray(data) ? data : data?.items || [];
        setTrainings(items);
      } else {
        // Employee: fetch only trainings they are enrolled in
        // Assuming /training/my returns the enrollments with training details
        res = await api.get('/training/my');
        // The response might be { data: [ { training: {...}, ... } ] }
        // Extract the training objects
        let enrollments = res.data?.data || [];
        // If the API returns an array of enrollments, map to training objects
        const items = enrollments.map(enrollment => enrollment.Training || enrollment.training).filter(Boolean);
        setTrainings(items);
      }
    } catch (err) {
      console.error('Error fetching trainings:', err);
      setError(err?.response?.data?.message || 'Failed to load trainings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [canManage]); // refetch if permission changes

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const formatDate = (date) => {
    if (!date) return '-';
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return '-';
    return parsedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this training?')) return;
    try {
      await api.delete(`/training/${id}`);
      setTrainings((prev) => prev.filter((training) => training.id !== id));
    } catch (err) {
      console.error('Error deleting training:', err);
      alert(err?.response?.data?.message || 'Failed to delete training.');
    }
  };

  const handleView = (training) => {
    // For employees, maybe navigate to a detail page
    console.log('View training:', training);
  };

  // ---- Edit handlers (only if canManage) ----
  const handleEditClick = (training) => {
    setEditingTraining(training);
    setEditForm({
      title: training.title || '',
      description: training.description || '',
      trainer: training.trainer || '',
      start_date: formatDateInput(training.start_date),
      end_date: formatDateInput(training.end_date),
      location: training.location || '',
      capacity: training.capacity !== null && training.capacity !== undefined ? String(training.capacity) : '',
    });
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateEditForm = () => {
    if (!editForm.title.trim()) return 'Title is required.';
    if (!editForm.start_date) return 'Start date is required.';
    if (editForm.end_date && new Date(editForm.end_date) < new Date(editForm.start_date)) {
      return 'End date cannot be before start date.';
    }
    if (editForm.capacity !== '' && Number(editForm.capacity) < 0) {
      return 'Capacity cannot be negative.';
    }
    return '';
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const error = validateEditForm();
    if (error) {
      setEditError(error);
      return;
    }

    setEditLoading(true);
    setEditError('');

    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim() || null,
      trainer: editForm.trainer.trim() || null,
      start_date: editForm.start_date,
      end_date: editForm.end_date || null,
      location: editForm.location.trim() || null,
      capacity: editForm.capacity === '' ? null : Number(editForm.capacity),
    };

    try {
      const res = await api.put(`/training/${editingTraining.id}`, payload);
      const updatedTraining = res.data.data;
      setTrainings((prev) =>
        prev.map((t) => (t.id === updatedTraining.id ? updatedTraining : t))
      );
      setIsEditModalOpen(false);
      setEditingTraining(null);
      alert('Training updated successfully!');
    } catch (err) {
      console.error('Error updating training:', err);
      setEditError(err?.response?.data?.message || 'Failed to update training.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setEditingTraining(null);
    setEditError('');
  };

  // ---- Filters & Pagination ----
  const filteredTrainings = trainings.filter((training) => {
    const title = training.title?.toLowerCase() || '';
    const trainer = training.trainer?.toLowerCase() || '';
    const location = training.location?.toLowerCase() || '';
    const query = search.toLowerCase();
    return title.includes(query) || trainer.includes(query) || location.includes(query);
  });

  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTrainings = filteredTrainings.slice(startIndex, startIndex + itemsPerPage);

  // ---- Loading and Error states ----
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border bg-white p-10">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        <span className="text-sm text-gray-500">Loading trainings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-600">{error}</p>
        <button
          type="button"
          onClick={fetchTrainings}
          className="mt-3 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ---- Main Render ----
  return (
    <>
      <div className="w-full space-y-4 p-8">
        {/* Header with Search */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">
            {canManage ? 'All Trainings' : 'My Trainings'}
          </h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto rounded-md border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-blue-500">
                <th className="border-r border-blue-400 p-3 text-left text-white">Training</th>
                <th className="border-r border-blue-400 p-3 text-left text-white">Trainer</th>
                <th className="border-r border-blue-400 p-3 text-left text-white">Start Date</th>
                <th className="border-r border-blue-400 p-3 text-left text-white">End Date</th>
                <th className="border-r border-blue-400 p-3 text-left text-white">Location</th>
                <th className="border-r border-blue-400 p-3 text-left text-white">Capacity</th>
                <th className="p-3 text-left text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTrainings.map((training) => (
                <tr key={training.id} className="border-b hover:bg-gray-50">
                  <td className="border-r p-3">
                    <p className="font-medium text-gray-900">{training.title || '-'}</p>
                    {training.description && (
                      <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">
                        {training.description}
                      </p>
                    )}
                  </td>
                  <td className="border-r p-3 text-gray-700">{training.trainer || '-'}</td>
                  <td className="border-r p-3 text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-gray-400" />
                      <span>{formatDate(training.start_date)}</span>
                    </div>
                  </td>
                  <td className="border-r p-3 text-gray-700">{formatDate(training.end_date)}</td>
                  <td className="border-r p-3 text-gray-700">
                    {training.location ? (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        <span>{training.location}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="border-r p-3 text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      <span>
                        {training.capacity !== null && training.capacity !== undefined
                          ? training.capacity
                          : 'Unlimited'}
                      </span>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-0.5">
                      {/* View button for everyone */}
                      <button
                        type="button"
                        onClick={() => handleView(training)}
                        title="View"
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {/* Edit and Delete only if canManage */}
                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEditClick(training)}
                            title="Edit"
                            className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(training.id)}
                            title="Delete"
                            className="rounded p-1.5 text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentTrainings.length === 0 && (
            <div className="py-8 text-center text-gray-500">
              {search ? 'No trainings match your search.' : 'No trainings found.'}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTrainings.length)} of{' '}
              {filteredTrainings.length}
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
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
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
              ))}
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

      {/* Edit Modal (only when canManage and modal open) */}
      {canManage && isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">Edit Training</h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">
                  {editError}
                </div>
              )}
              {/* ... form fields as before ... */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => handleEditChange('title', e.target.value)}
                  maxLength={150}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleEditChange('description', e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Trainer</label>
                  <input
                    type="text"
                    value={editForm.trainer}
                    onChange={(e) => handleEditChange('trainer', e.target.value)}
                    maxLength={150}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => handleEditChange('location', e.target.value)}
                    maxLength={150}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Start Date *</label>
                  <input
                    type="date"
                    value={editForm.start_date}
                    onChange={(e) => handleEditChange('start_date', e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    value={editForm.end_date}
                    onChange={(e) => handleEditChange('end_date', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Capacity</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.capacity}
                    onChange={(e) => handleEditChange('capacity', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TrainingTable;