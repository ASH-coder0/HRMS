import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Briefcase,
  Building2,
  BadgeCheck,
  HeartPulse,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import DefaultImage from "../assests/profile.jpg";
import PasswordresetForm from "../components/form/PasswordResetForm";

const Profile = () => {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/employees/me");
        const employeeData = res.data?.data;

        if (!employeeData) {
          throw new Error("No employee data received");
        }

        setEmployee(employeeData);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
        <p className="text-sm text-red-500">{error || "Profile not found"}</p>
      </div>
    );
  }

  const fullName = `${employee.first_name || ""} ${
    employee.last_name || ""
  }`.trim();

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatValue = (value) => {
    if (!value) return "—";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="group flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition hover:border-blue-100 hover:bg-blue-50/50 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-blue-900/50 dark:hover:bg-blue-950/20">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
          {value || "—"}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/*Basic Info */}
      <div className="min-h-full space-y-6 bg-slate-50/40 pb-8 dark:bg-slate-950/20">
        {/* Header */}
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-blue-900/30 dark:bg-slate-900">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            My Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            View your personal and employment information
          </p>
        </div>

        {/* Profile Header */}
        <div className="rounded-2xl border border-blue-100 bg-white shadow-sm dark:border-blue-900/30 dark:bg-slate-900">
          {/* Banner */}
          <div className="px-6 pb-6">
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {employee.profile_photo_url ? (
                  <img
                    src={employee.profile_photo_url}
                    alt={fullName}
                    className="h-32 w-32 shrink-0 rounded-2xl border-4 border-white object-cover shadow-lg dark:border-slate-900"
                  />
                ) : (
                  <img
                    src={DefaultImage}
                    alt={fullName}
                    className="h-32 w-32 shrink-0 rounded-2xl border-4 border-white object-cover shadow-lg dark:border-slate-900"
                  />
                )}

                <div className="pb-1">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {fullName || "—"}
                  </h2>

                  <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">
                    {employee.employee_code || "—"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {employee.Designation?.name && (
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/70 dark:text-blue-300">
                        {employee.Designation.name}
                      </span>
                    )}

                    {employee.Department?.name && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {employee.Department.name}
                      </span>
                    )}

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        employee.status === "active"
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {formatValue(employee.status)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-blue-900/30 dark:bg-slate-900">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <User className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Personal Information
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your basic personal details
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={User}
              label="First Name"
              value={employee.first_name}
            />

            <InfoItem
              icon={User}
              label="Last Name"
              value={employee.last_name}
            />

            <InfoItem icon={Mail} label="Email" value={employee.email} />

            <InfoItem icon={Phone} label="Phone" value={employee.phone} />

            <InfoItem
              icon={User}
              label="Gender"
              value={formatValue(employee.gender)}
            />

            <InfoItem
              icon={Calendar}
              label="Date of Birth"
              value={formatDate(employee.date_of_birth)}
            />

            <InfoItem
              icon={HeartPulse}
              label="Blood Group"
              value={employee.blood_group}
            />

            <InfoItem icon={MapPin} label="Address" value={employee.address} />
          </div>
        </div>

        {/* Employment Information */}
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-blue-900/30 dark:bg-slate-900">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Briefcase className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Employment Information
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your organization and employment details
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <InfoItem
              icon={BadgeCheck}
              label="Employee Code"
              value={employee.employee_code}
            />

            <InfoItem
              icon={Building2}
              label="Department"
              value={employee.Department?.name}
            />

            <InfoItem
              icon={Briefcase}
              label="Designation"
              value={employee.Designation?.name}
            />

            <InfoItem
              icon={ShieldCheck}
              label="Role"
              value={employee.Role?.name}
            />

            <InfoItem
              icon={Calendar}
              label="Date of Joining"
              value={formatDate(employee.date_of_joining)}
            />

            <InfoItem
              icon={Briefcase}
              label="Employment Type"
              value={formatValue(employee.employment_type)}
            />

            <InfoItem
              icon={BadgeCheck}
              label="Employment Status"
              value={formatValue(employee.status)}
            />
          </div>
        </div>

        {/* Medical Information */}
        {(employee.medical_license_no || employee.medical_license_expiry) && (
          <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm dark:border-blue-900/30 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                <HeartPulse className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Medical Information
                </h2>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Medical license information
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <InfoItem
                icon={BadgeCheck}
                label="Medical License Number"
                value={employee.medical_license_no}
              />

              <InfoItem
                icon={Calendar}
                label="License Expiry"
                value={formatDate(employee.medical_license_expiry)}
              />
            </div>
          </div>
        )}
        {/**Pass reset form */}

        <PasswordresetForm />
      </div>
    </>
  );
};

export default Profile;
