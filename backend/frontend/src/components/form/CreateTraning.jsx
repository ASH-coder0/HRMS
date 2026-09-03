import React, { useEffect, useState } from 'react';
import {
  Check, ChevronLeft, Users, Building2, UserCheck, X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { EmployeeSearchSelect } from '../common/EmployeeSearchSelect';

const emptyTrainingForm = {
  title: '',
  description: '',
  trainer: '',
  start_date: '',
  end_date: '',
  location: '',
  capacity: '',
};

const ASSIGN_METHODS = [
  { id: 'individual', label: 'Individual Employees', icon: UserCheck },
  { id: 'department', label: 'Whole Department', icon: Building2 },
  { id: 'role', label: 'By Role', icon: Users },
];

const CreateTraning = ({ onFinished }) => {
  const [step, setStep] = useState(1); // 1 = create training, 2 = assign employees

  // ---------- STEP 1: training details ----------
  const [form, setForm] = useState(emptyTrainingForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [createdTraining, setCreatedTraining] = useState(null); // holds training after creation

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

  const handleCreateTraining = async (e) => {
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
      const res = await api.post('/training', payload);
      const training = res.data.data;

      setCreatedTraining(training);
      setStep(2); // move to assign step
    } catch (err) {
      console.log('Error creating training', err);
      setFormError(
        err?.response?.data?.message || 'Failed to create training. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ---------- STEP 2: assign employees ----------
  const [assignMethod, setAssignMethod] = useState('individual');

  // individual picker
  const [selectedEmployees, setSelectedEmployees] = useState([]); // array of employee objects
  const [pickerValue, setPickerValue] = useState(''); // transient value fed into EmployeeSearchSelect

  const addEmployee = (emp) => {
    setSelectedEmployees((prev) => {
      if (prev.some((e) => e.id === emp.id)) return prev; // no duplicates
      return [...prev, emp];
    });
    setPickerValue(''); // reset so the picker is ready to add another
  };

  const removeEmployee = (id) => {
    setSelectedEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // department / role pickers
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [loadingAssignData, setLoadingAssignData] = useState(false);

  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignSuccess, setAssignSuccess] = useState(false);

  useEffect(() => {
    if (step !== 2) return;

    const loadAssignData = async () => {
      setLoadingAssignData(true);

      try {
        const [deptRes, empRes] = await Promise.all([
          api.get('/departments', { params: { limit: 100 } }),
          api.get('/employees', { params: { limit: 200, status: 'active' } }),
        ]);

        const deptList = deptRes.data?.data?.items || [];
        const empList = empRes.data?.data?.items || [];

        setDepartments(deptList);

     
        const uniqueRoles = [
          ...new Set(empList.map((e) => e.role).filter(Boolean)),
        ];
        setRoles(uniqueRoles);
      } catch (err) {
        console.log('Error loading assign data', err);
        setDepartments([]);
        setRoles([]);
      } finally {
        setLoadingAssignData(false);
      }
    };

    loadAssignData();
  }, [step]);

  const handleAssign = async () => {
    setAssignError('');

    let payload = {};

    if (assignMethod === 'individual') {
      if (selectedEmployees.length === 0) {
        setAssignError('Add at least one employee.');
        return;
      }
      payload.employee_ids = selectedEmployees.map((e) => e.id);
    } else if (assignMethod === 'department') {
      if (!selectedDepartmentId) {
        setAssignError('Select a department.');
        return;
      }
      payload.department_id = selectedDepartmentId;
    } else if (assignMethod === 'role') {
      if (!selectedRole) {
        setAssignError('Select a role.');
        return;
      }
      payload.role = selectedRole;
    }

    setAssigning(true);

    try {
      await api.post(`/training/${createdTraining.id}/enroll`, payload);
      setAssignSuccess(true);
      onFinished?.(createdTraining);
    } catch (err) {
      console.log('Error assigning training', err);
      setAssignError(
        err?.response?.data?.message || 'Failed to assign employees. Please try again.'
      );
    } finally {
      setAssigning(false);
    }
  };

  // full reset back to step 1 — used after success, and after "skip"
  const resetFlow = () => {
    setStep(1);
    setForm(emptyTrainingForm);
    setFormError('');
    setSaving(false);
    setCreatedTraining(null);

    setAssignMethod('individual');
    setSelectedEmployees([]);
    setPickerValue('');
    setDepartments([]);
    setRoles([]);
    setSelectedDepartmentId('');
    setSelectedRole('');
    setLoadingAssignData(false);

    setAssigning(false);
    setAssignError('');
    setAssignSuccess(false);
  };

  const handleSkipAssign = () => {
    onFinished?.(createdTraining);
    resetFlow();
  };

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6 p-8">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <StepDot active={step === 1} done={step > 1} label="1" />
        <div className="h-px flex-1 bg-gray-200" />
        <StepDot active={step === 2} done={assignSuccess} label="2" />
      </div>
      <div className="-mt-4 flex justify-between text-xs text-gray-500">
        <span>Training Details</span>
        <span>Assign Employees</span>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <form onSubmit={handleCreateTraining} className="space-y-4 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">Create Training</h2>

          {formError && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleFormChange('title', e.target.value)}
              maxLength={150}
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. CPR & Basic Life Support"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Trainer</label>
              <input
                type="text"
                value={form.trainer}
                onChange={(e) => handleFormChange('trainer', e.target.value)}
                maxLength={150}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                maxLength={150}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Start Date *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => handleFormChange('start_date', e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => handleFormChange('end_date', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Capacity</label>
              <input
                type="number"
                min="0"
                value={form.capacity}
                onChange={(e) => handleFormChange('capacity', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex justify-end border-t pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create & Continue to Assign →'}
            </button>
          </div>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && !assignSuccess && (
        <div className="space-y-4 rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Assign Employees</h2>
              <p className="text-sm text-gray-500">
                Training: <span className="font-medium text-gray-700">{createdTraining?.title}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          </div>

          {assignError && (
            <div className="rounded-md bg-red-50 p-2 text-sm text-red-700">{assignError}</div>
          )}

          {loadingAssignData && (
            <div className="rounded-md bg-gray-50 p-3 text-center text-sm text-gray-500">
              Loading departments and roles...
            </div>
          )}

          {/* Method selector */}
          <div className="grid grid-cols-3 gap-2">
            {ASSIGN_METHODS.map((method) => {
              const Icon = method.icon;
              const active = assignMethod === method.id;
              return (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setAssignMethod(method.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-md border p-3 text-xs font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {method.label}
                </button>
              );
            })}
          </div>

          {/* Individual employees — search & add via EmployeeSearchSelect */}
          {assignMethod === 'individual' && (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Add Employee
                </label>
                <EmployeeSearchSelect
                  value={pickerValue}
                  onChange={setPickerValue}
                  onSelect={addEmployee}
                  placeholder="Search employee by name or code..."
                />
              </div>

              {selectedEmployees.length > 0 ? (
                <div>
                  <p className="mb-2 text-xs text-gray-500">
                    {selectedEmployees.length} employee
                    {selectedEmployees.length > 1 ? 's' : ''} selected
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmployees.map((emp) => (
                      <span
                        key={emp.id}
                        className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                      >
                        {emp.first_name} {emp.last_name} ({emp.employee_code})
                        <button
                          type="button"
                          onClick={() => removeEmployee(emp.id)}
                          className="ml-1 text-primary hover:text-primary/70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400">No employees added yet.</p>
              )}
            </div>
          )}

          {/* Department */}
          {assignMethod === 'department' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Department</label>
              <select
                value={selectedDepartmentId}
                onChange={(e) => setSelectedDepartmentId(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select department...</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Every employee in this department will be enrolled.
              </p>
            </div>
          )}

          {/* Role */}
          {assignMethod === 'role' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Select role...</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-400">
                Every employee with this role will be enrolled, across all departments.
              </p>
            </div>
          )}

          <div className="flex justify-between border-t pt-4">
            <button
              type="button"
              onClick={handleSkipAssign}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>

            <button
              type="button"
              onClick={handleAssign}
              disabled={assigning}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {assigning ? 'Assigning...' : 'Assign Employees'}
            </button>
          </div>
        </div>
      )}

      {/* Success state */}
      {assignSuccess && (
        <div className="flex flex-col items-center gap-3 rounded-lg border p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Check className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold">Training Assigned</h2>
          <p className="text-sm text-gray-500">
            "{createdTraining?.title}" has been created and employees have been enrolled.
          </p>
          <button
            type="button"
            onClick={resetFlow}
            className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Create Another Training
          </button>
        </div>
      )}
    </div>
  );
};

const StepDot = ({ active, done, label }) => (
  <div
    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
      done
        ? 'bg-blue-500 text-white'
        : active
        ? 'bg-primary text-white'
        : 'bg-gray-200 text-gray-500'
    }`}
  >
    {done ? <Check className="h-4 w-4" /> : label}
  </div>
);

export default CreateTraning;