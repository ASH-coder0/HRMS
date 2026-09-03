import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle } from "lucide-react";

const initialForm = {
  job_title: "",
  department_id: "",
  designation_id: "",
  status: "open",
  candidate_name: "",
  candidate_email: "",
  candidate_phone: "",
  candidate_status: "applied",
  offer_letter_url: "",
};

const RecurimentForm = ({ onSaved }) => {
  const queryClient = useQueryClient();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [resume, setResume] = useState(null);

  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () =>
      (await api.get("/departments")).data.data,
  });

  const { data: designations } = useQuery({
    queryKey: ["designations"],
    queryFn: async () =>
      (await api.get("/designations")).data.data,
  });


  const mutation = useMutation({
  mutationFn: async () => {
    const formData = new FormData();

    formData.append("job_title", form.job_title);
    formData.append("department_id", form.department_id);
    formData.append("designation_id", form.designation_id);
    formData.append("status", form.status);
    formData.append("candidate_name", form.candidate_name);
    formData.append("candidate_email", form.candidate_email);
    formData.append("candidate_phone", form.candidate_phone);
    formData.append("candidate_status", form.candidate_status);
    formData.append("offer_letter_url", form.offer_letter_url);

    if (resume) {
      formData.append("resume", resume);
    }

    console.log("RECRUITMENT DATA:", {
      job_title: form.job_title,
      department_id: form.department_id,
      designation_id: form.designation_id,
      status: form.status,
      candidate_name: form.candidate_name,
      candidate_email: form.candidate_email,
      candidate_phone: form.candidate_phone,
      candidate_status: form.candidate_status,
      resume,
    });

    return api.post("/recruitment", formData);
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["recruitments"],
    });

    setForm(initialForm);
    setErrors({});
    setResume(null);

    onSaved?.();
  },
});

  const handleChange = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

    if (errors[key]) {
      setErrors((prev) => ({
        ...prev,
        [key]: undefined,
      }));
    }
  };

  const validate = () => {
    const next = {};

    if (!form.job_title.trim()) {
      next.job_title = "Job title is required";
    }

    if (!form.department_id) {
      next.department_id = "Select a department";
    }

    if (!form.designation_id) {
      next.designation_id = "Select a designation";
    }


    if (
      form.candidate_email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.candidate_email)
    ) {
      next.candidate_email = "Enter a valid email";
    }

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    mutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create recruitment</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">

          <div className="space-y-1.5">
            <Label>Job title</Label>

            <Input
              value={form.job_title}
              onChange={handleChange("job_title")}
              placeholder="Enter job title"
            />

            {errors.job_title && (
              <p className="text-xs text-destructive">
                {errors.job_title}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Department</Label>

            <Select
              value={form.department_id}
              onChange={handleChange("department_id")}
            >
              <option value="">Select…</option>

              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>

            {errors.department_id && (
              <p className="text-xs text-destructive">
                {errors.department_id}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Designation</Label>

            <Select
              value={form.designation_id}
              onChange={handleChange("designation_id")}
            >
              <option value="">Select…</option>

              {designations?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </Select>

            {errors.designation_id && (
              <p className="text-xs text-destructive">
                {errors.designation_id}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label>Recruitment status</Label>

            <Select
              value={form.status}
              onChange={handleChange("status")}
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="on_hold">On hold</option>
            </Select>
          </div>

          <div className="md:col-span-2 border-t pt-5">
            <h3 className="mb-4 font-semibold">
              Candidate information
            </h3>
          </div>

          <div className="space-y-1.5">
            <Label>Candidate name</Label>

            <Input
              value={form.candidate_name}
              onChange={handleChange("candidate_name")}
              placeholder="Enter candidate name"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Candidate email</Label>

            <Input
              type="email"
              value={form.candidate_email}
              onChange={handleChange("candidate_email")}
              placeholder="candidate@example.com"
            />

            {errors.candidate_email && (
              <p className="text-xs text-destructive">
                {errors.candidate_email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Candidate phone</Label>

            <Input
              value={form.candidate_phone}
              onChange={handleChange("candidate_phone")}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Candidate status</Label>

            <Select
              value={form.candidate_status}
              onChange={handleChange("candidate_status")}
            >
              <option value="applied">Applied</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewing">Interviewing</option>
              <option value="offered">Offered</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Resume</Label>

            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setResume(e.target.files?.[0] || null)
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Offer letter URL</Label>

            <Input
              value={form.offer_letter_url}
              onChange={handleChange("offer_letter_url")}
              placeholder="Enter offer letter URL"
            />
          </div>

          {mutation.isSuccess && (
            <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm md:col-span-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Recruitment saved successfully
            </div>
          )}

          {mutation.isError && (
            <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive md:col-span-2">
              <AlertCircle className="h-4 w-4" />
              {mutation.error?.response?.data?.message ||
                "Could not save recruitment"}
            </div>
          )}

          <div className="flex justify-end md:col-span-2">
            <Button
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending
                ? "Saving..."
                : "Save recruitment"}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
};

export default RecurimentForm;