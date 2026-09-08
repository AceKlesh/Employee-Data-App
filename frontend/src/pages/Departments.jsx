import { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { canManageDepartments, canDeleteDepartments } from '../lib/permissions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Building2, Plus, MoreVertical, Pencil, Trash2, RotateCcw, Users } from 'lucide-react';

const initialForm = { name: '', description: '' }; 

export default function Departments() {
  const { user } = useAuth();
  const role = user?.role;

  if (!canManageDepartments(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchDepartments = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/departments')
      .then((res) => setDepartments(res.data))
      .catch(() => setError('Failed to load departments.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    setForm({ name: dept.name, description: dept.description || '' });
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) {
        await api.put(`/departments/${editing.id}`, form);
        toast.success('Department updated');
      } else {
        await api.post('/departments', form);
        toast.success('Department created');
      }
      setDialogOpen(false);
      fetchDepartments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/departments/${deleteTarget.id}`);
      toast.success(`${deleteTarget.name} removed`);
      setDepartments((prev) => prev.filter((d) => d.id !== deleteTarget.id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete department');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Departments</h1>
            <p className="text-sm text-slate-500 mt-1">Organize your teams and structure</p>
          </div>
          {canManageDepartments(role) && (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Department
            </Button>
          )}
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 p-14 bg-white border border-slate-200 rounded-lg text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button onClick={fetchDepartments} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
              <RotateCcw className="h-3.5 w-3.5" />Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="shadow-sm border-slate-200">
                <CardContent className="pt-6 space-y-3">
                  <div className="h-9 w-9 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="h-4 w-32 rounded bg-slate-100 animate-pulse" />
                  <div className="h-3 w-full rounded bg-slate-100 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-14 bg-white border border-slate-200 rounded-lg text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-1">
              <Building2 className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-700">No departments yet</p>
            <p className="text-sm text-slate-500">Start by creating your first department.</p>
            {canManageDepartments(role) && (
              <Button size="sm" className="mt-2" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />Add Department
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <Card key={dept.id} className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                      <Building2 className="h-4.5 w-4.5 text-blue-600" />
                    </div>
                    {(canManageDepartments(role) || canDeleteDepartments(role)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canManageDepartments(role) && (
                            <DropdownMenuItem onClick={() => openEdit(dept)}>
                              <Pencil className="h-4 w-4 mr-2" />Edit
                            </DropdownMenuItem>
                          )}
                          {canDeleteDepartments(role) && (
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteTarget(dept)}>
                              <Trash2 className="h-4 w-4 mr-2" />Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                  <h3 className="font-medium text-slate-900 mt-3">{dept.name}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {dept.description || 'No description'}
                  </p>
                  {dept.employeeCount !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
                      <Users className="h-3.5 w-3.5" />
                      {dept.employeeCount} employee{dept.employeeCount !== 1 ? 's' : ''}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Department' : 'Add Department'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="dept-name">Name</Label>
              <Input
                id="dept-name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dept-description">Description</Label>
              <Textarea
                id="dept-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Employees in this department will need to be reassigned first if any exist. This action cannot be undone.
            </AlertDialogDescription>
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