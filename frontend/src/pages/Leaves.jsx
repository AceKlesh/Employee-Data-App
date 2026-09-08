import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  ClipboardList, Plus, Check, X, RotateCcw, Clock, CheckCircle2, XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { canReviewLeaves } from '../lib/permissions';

const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const avatarColors = [
  'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-cyan-100 text-cyan-700',
];
const getAvatarColor = (name) => {
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length;
  return avatarColors[index];
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
};

const initialForm = { employeeId: '', leaveType: '', startDate: '', endDate: '', reason: '' };

export default function Leaves() {
  const { user } = useAuth();
  const role = user?.role;

  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [actioningId, setActioningId] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([api.get('/leaves'), api.get('/employees')])
      .then(([leaveRes, empRes]) => {
        setLeaves(leaveRes.data);
        setEmployees(empRes.data);
      })
      .catch(() => setError('Failed to load leave requests.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const stats = {
    pending: leaves.filter((l) => l.status === 'pending').length,
    approved: leaves.filter((l) => l.status === 'approved').length,
    rejected: leaves.filter((l) => l.status === 'rejected').length,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/leaves', form);
      const employee = employees.find((emp) => emp.id === Number(form.employeeId));
      setLeaves((prev) => [{ ...res.data, Employee: employee }, ...prev]);
      toast.success('Leave request submitted');
      setDialogOpen(false);
      setForm(initialForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActioningId(id);
    try {
      const res = await api.patch(`/leaves/${id}/status`, { status });
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, ...res.data } : l)));
      toast.success(`Leave request ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update leave request');
    } finally {
      setActioningId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {canReviewLeaves(role) ? 'Leave Requests' : 'My Leave Requests'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {canReviewLeaves(role) ? 'Review and manage employee leave' : 'Track your submitted leave requests'}
            </p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Request Leave
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Pending</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{loading ? '—' : stats.pending}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="h-4.5 w-4.5 text-amber-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Approved</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{loading ? '—' : stats.approved}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Rejected</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{loading ? '—' : stats.rejected}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
                <XCircle className="h-4.5 w-4.5 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button onClick={fetchData} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
                <RotateCcw className="h-3.5 w-3.5" />Try again
              </button>
            </div>
          ) : !loading && leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-14 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                <ClipboardList className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">No leave requests yet</p>
              <p className="text-sm text-slate-500">Requests will appear here once submitted.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-3.5 w-32 rounded bg-slate-100 animate-pulse" /></TableCell>
                        <TableCell><div className="h-3.5 w-16 rounded bg-slate-100 animate-pulse" /></TableCell>
                        <TableCell><div className="h-3.5 w-28 rounded bg-slate-100 animate-pulse" /></TableCell>
                        <TableCell><div className="h-3.5 w-24 rounded bg-slate-100 animate-pulse" /></TableCell>
                        <TableCell><div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse" /></TableCell>
                        <TableCell />
                      </TableRow>
                    ))
                  ) : (
                    leaves.map((leave) => {
                      const fullName = leave.Employee ? `${leave.Employee.firstName} ${leave.Employee.lastName}` : 'Unknown';
                      return (
                        <TableRow key={leave.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={`text-xs ${getAvatarColor(fullName)}`}>
                                  {fullName.split(' ').map((n) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-slate-900">{fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 capitalize">{leave.leaveType}</TableCell>
                          <TableCell className="text-slate-600 text-sm">
                            {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                          </TableCell>
                          <TableCell className="text-slate-600 text-sm max-w-48 truncate">{leave.reason || '—'}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={statusStyles[leave.status]}>{leave.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {leave.status === 'pending' && canReviewLeaves(role) && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm" variant="outline"
                                  className="h-8 text-green-700 border-green-200 hover:bg-green-50"
                                  disabled={actioningId === leave.id}
                                  onClick={() => handleStatusChange(leave.id, 'approved')}
                                >
                                  <Check className="h-3.5 w-3.5 mr-1" />Approve
                                </Button>
                                <Button
                                  size="sm" variant="outline"
                                  className="h-8 text-red-700 border-red-200 hover:bg-red-50"
                                  disabled={actioningId === leave.id}
                                  onClick={() => handleStatusChange(leave.id, 'rejected')}
                                >
                                  <X className="h-3.5 w-3.5 mr-1" />Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Leave</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <Select value={form.employeeId} onValueChange={(v) => setForm((p) => ({ ...p, employeeId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={String(emp.id)}>{emp.firstName} {emp.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Leave Type</Label>
              <Select value={form.leaveType} onValueChange={(v) => setForm((p) => ({ ...p, leaveType: v }))}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sick">Sick</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Start Date</Label>
                <Input type="date" value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} required />
              </div>
              <div className="space-y-1.5">
                <Label>End Date</Label>
                <Input type="date" value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Reason (optional)</Label>
              <Textarea value={form.reason} onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))} rows={3} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}