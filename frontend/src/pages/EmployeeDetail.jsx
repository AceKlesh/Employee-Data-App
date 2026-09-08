import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { canManageEmployees, canDeleteEmployees } from '../lib/permissions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ChevronRight, Pencil, Trash2, Mail, Phone, MapPin, Calendar, Briefcase, Building2, DollarSign } from 'lucide-react';

const statusStyles = {
  active: 'bg-green-50 text-green-700 border-green-200',
  on_leave: 'bg-amber-50 text-amber-700 border-amber-200',
  terminated: 'bg-slate-100 text-slate-600 border-slate-200',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
};

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    api.get(`/employees/${id}`)
      .then((res) => setEmployee(res.data))
      .catch(() => toast.error('Failed to load employee'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    try {
      await api.delete(`/employees/${id}`);
      toast.success('Employee removed');
      navigate('/employees');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-sm text-slate-500">Loading...</p>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <p className="text-sm text-slate-500">Employee not found.</p>
      </DashboardLayout>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <Link to="/employees" className="hover:text-slate-900">Employees</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 font-medium">{fullName}</span>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={employee.profilePicture ? `http://localhost:5000${employee.profilePicture}` : undefined} />
              <AvatarFallback className="text-lg bg-blue-100 text-blue-700">{employee.firstName[0]}{employee.lastName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">{fullName}</h1>
              <p className="text-sm text-slate-500">{employee.jobTitle}</p>
              <Badge variant="outline" className={`${statusStyles[employee.status]} mt-2`}>
                {employee.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canManageEmployees(role) && (
              <Button variant="outline" size="sm" onClick={() => navigate(`/employees/${id}/edit`)}>
                <Pencil className="h-4 w-4 mr-2" />Edit
              </Button>
            )}
            {canDeleteEmployees(role) && (
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-600" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="h-4 w-4 mr-2" />Delete
              </Button>
            )}
          </div>
        </div>

        <Card className="shadow-sm border-slate-200">
          <CardContent className="pt-6 grid grid-cols-2 gap-x-8 gap-y-5">
            <DetailItem icon={Mail} label="Email" value={employee.email} />
            <DetailItem icon={Phone} label="Phone" value={employee.phone || '—'} />
            <DetailItem icon={Building2} label="Department" value={employee.Department?.name || '—'} />
            <DetailItem icon={Briefcase} label="Job Title" value={employee.jobTitle} />
            {canManageEmployees(role) && (
              <DetailItem icon={Calendar} label="Date Hired" value={formatDate(employee.dateHired)} />
            )}
            <DetailItem icon={MapPin} label="Address" value={employee.address || '—'} />
            {canManageEmployees(role) && employee.salary && (
              <DetailItem icon={DollarSign} label="Salary" value={`$${Number(employee.salary).toLocaleString()}`} />
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {fullName}?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-8 w-8 rounded-md bg-slate-50 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-slate-900 font-medium">{value}</p>
      </div>
    </div>
  );
}