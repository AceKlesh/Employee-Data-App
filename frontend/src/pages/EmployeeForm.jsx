import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const initialState = {
  firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '',
  gender: '', address: '', jobTitle: '', departmentId: '', dateHired: '',
  salary: '', status: 'active',
};

export default function EmployeeForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [form, setForm] = useState(initialState);
  const [file, setFile] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/departments').then((res) => setDepartments(res.data));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    api.get(`/employees/${id}`)
      .then((res) => {
        const emp = res.data;
        setForm({
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          email: emp.email || '',
          phone: emp.phone || '',
          dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split('T')[0] : '',
          gender: emp.gender || '',
          address: emp.address || '',
          jobTitle: emp.jobTitle || '',
          departmentId: String(emp.departmentId || ''),
          dateHired: emp.dateHired ? emp.dateHired.split('T')[0] : '',
          salary: emp.salary || '',
          status: emp.status || 'active',
        });
      })
      .catch(() => toast.error('Failed to load employee'))
      .finally(() => setLoading(false));
  }, [id, isEditMode]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      if (isEditMode) {
        await api.put(`/employees/${id}`, form);
        toast.success('Employee updated successfully');
        navigate(`/employees/${id}`);
      } else {
        const formData = new FormData();
        Object.entries(form).forEach(([key, value]) => {
          if (value) formData.append(key, value);
        });
        if (file) formData.append('profilePicture', file);

        await api.post('/employees', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Employee added successfully');
        navigate('/employees');
      }
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const fieldErrors = {};
        apiErrors.forEach((e) => { fieldErrors[e.path] = e.msg; });
        setErrors(fieldErrors);
        toast.error('Please fix the errors below');
      } else {
        toast.error(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'add'} employee`);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const backLink = isEditMode ? `/employees/${id}` : '/employees';

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-sm text-slate-500">Loading...</p>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <Link to={backLink} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-3">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <h1 className="text-xl font-semibold text-slate-900">
            {isEditMode ? 'Edit Employee' : 'Add Employee'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isEditMode ? "Update the employee's details below." : "Enter the employee's details below."}
          </p>
        </div>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" error={errors.firstName}>
                  <Input value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)} required />
                </Field>
                <Field label="Last Name" error={errors.lastName}>
                  <Input value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)} required />
                </Field>
              </div>

              <Field label="Email" error={errors.email}>
                <Input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} required />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Phone">
                  <Input value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                </Field>
                <Field label="Date of Birth">
                  <Input type="date" value={form.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} />
                </Field>
              </div>

              <Field label="Gender">
                <Select value={form.gender} onValueChange={(v) => handleChange('gender', v)}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Address">
                <Textarea value={form.address} onChange={(e) => handleChange('address', e.target.value)} rows={2} />
              </Field>

              <Field label="Job Title" error={errors.jobTitle}>
                <Input value={form.jobTitle} onChange={(e) => handleChange('jobTitle', e.target.value)} required />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Department" error={errors.departmentId}>
                  <Select value={form.departmentId} onValueChange={(v) => handleChange('departmentId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Date Hired" error={errors.dateHired}>
                  <Input type="date" value={form.dateHired} onChange={(e) => handleChange('dateHired', e.target.value)} required />
                </Field>
              </div>

              {isEditMode && (
                <Field label="Status">
                  <Select value={form.status} onValueChange={(v) => handleChange('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}

              <Field label="Salary">
                <Input type="number" step="0.01" value={form.salary} onChange={(e) => handleChange('salary', e.target.value)} />
              </Field>

              {!isEditMode && (
                <Field label="Profile Picture">
                  <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
                </Field>
              )}

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : isEditMode ? 'Update Employee' : 'Save Employee'}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link to={backLink}>Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}