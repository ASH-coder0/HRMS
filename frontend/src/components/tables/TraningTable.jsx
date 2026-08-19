import React, { useEffect, useState } from 'react';
import { Trash2, Pencil, Plus, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const EDIT_ROLES = ['super_admin', 'hospital_admin', 'hr_manager'];

const emptyForm = {
  title: '',
  description: '',
  trainer: '',
  start_date: '',
  end_date: '',
  location: '',
  capacity: '',
};

const TrainingTable = () => {
  const { user } = useAuth();
  const canEdit = user && EDIT_ROLES.includes(user.role);

  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const itemsPerPage = 10;

  const fetchTrainings = async () => {
    try {
      const res = await api.get('/training');

      if (res.status === 200) {
        setTrainings(res.data.data || []);
      }
    } catch (err) {
      console.log('Error fetching trainings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (training) => {
    setEditingId(training.id);
    setForm({
      title: training.title || '',
      description: training.description || '',
      trainer: training.trainer || '',
      start_date: training.start_date || '',
      end_date: training.end_date || '',
      location: training.location || '',
      capacity: training.capacity ?? '',
    });
    setFormError('');
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormError('');
  };

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.title.trim()) return 'Title is required.';
    if (!form.start_date) return 'Start date is required.';
    if (
      form.end_date &&
      form.start_date &&
      new Date(form.end_date) < new Date(form.start_date)
    ) {
      return 'End date cannot be before start date.';
    }
    if (form.capacity !== '' && Number(form.capacity) < 0) {
      return 'Capacity cannot be negative.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validateForm();
    if (error) {
      setFormError(error);
      return;
    }

    setSaving(true);
    setFormError('');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      trainer: form.trainer.trim() || null,
      start_date: form.start_date,
      end_date: form.end_date || null,
      location: form.location.trim() || null,
      capacity: form.capacity === '' ? null : Number(form.capacity),
    };

    try {
      if (editingId) {
        const res = await api.put(`/training/${editingId}`, payload);
        const updated = res.data.data || { id: editingId, ...payload };

        setTrainings((prev) =>
          prev.map((t) => (t.id === editingId ? updated : t))
        );
      } else {
        const res = await api.post('/training', payload);
        const created = res.data.data;

        setTrainings((prev) => [created, ...prev]);
      }

      setShowModal(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      console.log('Error saving training', err);
      setFormError(
        err?.response?.data?.message || 'Failed to save training. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    const confirmed = window.confirm(
      `Delete "${title || 'this training'}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(id);

    const previousTrainings = trainings;

    setTrainings((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await api.delete(`/training/${id}`);

      if (res.status !== 200 && res.status !== 204) {
        throw new Error('Delete failed');
      }
    } catch (err) {
      console.log('Error deleting training', err);
      setTrainings(previousTrainings);
      alert('Failed to delete training. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTrainings = trainings.filter((training) => {
    const searchText = search.toLowerCase();

    return [
      training.title,
      training.trainer,
      training.location,
      training.description,
    ].some((value) => (value || '').toLowerCase().includes(searchText));
  });

  const totalPages = Math.ceil(filteredTrainings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTrainings = filteredTrainings.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    if (
      currentPage > 1 &&
      currentTrainings.length === 0 &&
      filteredTrainings.length > 0
    ) {
      setCurrentPage((page) => page - 1);
    }
  }, [currentTrainings.length, currentPage, filteredTrainings.length]);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (isNaN(d)) return value;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatus = (training) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = training.start_date ? new Date(training.start_date) : null;
    const end = training.end_date ? new Date(training.end_date) : start;

    if (!start) return { label: 'N/A', color: 'bg-gray-100 text-gray-700' };
    if (end && end < today) return { label: 'Completed', color: 'bg-gray-100 text-gray-700' };
    if (start > today) return { label: 'Upcoming', color: 'bg-blue-100 text-blue-700' };
    return { label: 'Ongoing', color: 'bg-green-100 text-green-700' };
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-500">
        Loading trainings...
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Training</h1>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search trainings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />

          {canEdit && (
            <button
              type="button"
              onClick={openAddModal}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Add Training
            </button>
          )}
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-md border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-blue-500">
              {[
                'Title',
                'Trainer',
                'Start Date',
                'End Date',
                'Location',
                'Capacity',
                'Status',
                ...(canEdit ? ['Actions'] : []),
              ].map((heading) => (
                <th
                  key={heading}
                  className="border-r border-blue-400 p-3 text-left text-white last:border-r-0"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {currentTrainings.map((training) => {
              const status = getStatus(training);

              return (
                <tr key={training.id} className="border-b hover:bg-gray-50">
                  <td className="border-r p-3 font-medium">
                    {training.title || 'N/A'}
                    {training.description && (
                      <p className="mt-0.5 max-w-xs truncate text-xs font-normal text-gray-500">
                        {training.description}
                      </p>
                    )}
                  </td>

                  <td className="border-r p-3">{training.trainer || 'N/A'}</td>

                  <td className="border-r p-3 text-sm">
                    {formatDate(training.start_date)}
                  </td>

                  <td className="border-r p-3 text-sm">
                    {formatDate(training.end_date)}
                  </td>

                  <td className="border-r p-3">{training.location || 'N/A'}</td>

                  <td className="border-r p-3">
                    {training.capacity ?? 'N/A'}
                  </td>

                  <td className="border-r p-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </td>

                  {canEdit && (
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Edit"
                          onClick={() => openEditModal(training)}
                          className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          title="Delete"
                          disabled={deletingId === training.id}
                          onClick={() => handleDelete(training.id, training.title)}
                          className="rounded-md p-1.5 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>

        {currentTrainings.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            No training records found.
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredTrainings.length)} of{' '}
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

      {showModal && canEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-lg">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">
                {editingId ? 'Edit Training' : 'Add Training'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-4">
              {formError && (
                <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange('title', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  maxLength={150}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    handleFormChange('description', e.target.value)
                  }
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Trainer
                  </label>
                  <input
                    type="text"
                    value={form.trainer}
                    onChange={(e) => handleFormChange('trainer', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    maxLength={150}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => handleFormChange('location', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    maxLength={150}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      handleFormChange('start_date', e.target.value)
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={(e) => handleFormChange('end_date', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Capacity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.capacity}
                    onChange={(e) => handleFormChange('capacity', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingTable;