import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { canManageEmployees, canDeleteEmployees } from '../lib/permissions';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Search, RotateCcw, X, Plus, ArrowUp, ArrowDown, ArrowUpDown,
  MoreVertical, Eye, Pencil, Trash2, Users, UserCheck, UserMinus, Building2, Download,
} from 'lucide-react';

const statusStyles = {
  active: 'bg-green-50 text-green-700 border-green-200',
  on_leave: 'bg-amber-50 text-amber-700 border-amber-200',
  terminated: 'bg-slate-100 text-slate-600 border-slate-200',
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

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-full bg-slate-100 animate-pulse" /><div className="h-3.5 w-32 rounded bg-slate-100 animate-pulse" /></div></TableCell>
          <TableCell><div className="h-3.5 w-24 rounded bg-slate-100 animate-pulse" /></TableCell>
          <TableCell><div className="h-3.5 w-20 rounded bg-slate-100 animate-pulse" /></TableCell>
          <TableCell><div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse" /></TableCell>
          <TableCell><div className="h-3.5 w-20 rounded bg-slate-100 animate-pulse" /></TableCell>
          <TableCell><div className="h-4 w-4 rounded bg-slate-100 animate-pulse" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

function SortableHead({ label, sortKey, currentSort, onSort }) {
  const isActive = currentSort.key === sortKey;
  const Icon = isActive ? (currentSort.direction === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead>
      <button onClick={() => onSort(sortKey)} className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors">
        {label}
        <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
      </button>
    </TableHead>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'lastName', direction: 'asc' });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role;

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([api.get('/employees'), api.get('/departments')])
      .then(([empRes, deptRes]) => {
        setEmployees(empRes.data);
        setDepartments(deptRes.data);
      })
      .catch(() => setError('Failed to load employees.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSort = (key) => {
    setSort((prev) => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/employees/${deleteTarget.id}`);
      toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} was removed`);
      setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete employee');
    } finally {
      setDeleteTarget(null);
    }
  };

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter((e) => e.status === 'active').length,
    onLeave: employees.filter((e) => e.status === 'on_leave').length,
    departments: departments.length,
  }), [employees, departments]);

  const filtered = useMemo(() => {
    let result = employees.filter((emp) => {
      const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase());
      const matchesDept = deptFilter === 'all' || String(emp.departmentId) === deptFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });

    result.sort((a, b) => {
      let valA, valB;
      if (sort.key === 'department') { valA = a.Department?.name || ''; valB = b.Department?.name || ''; }
      else { valA = a[sort.key]; valB = b[sort.key]; }
      if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [employees, search, deptFilter, statusFilter, sort]);

  const isFiltering = search.trim().length > 0 || deptFilter !== 'all' || statusFilter !== 'all';
  const clearFilters = () => { setSearch(''); setDeptFilter('all'); setStatusFilter('all'); };

  const statCards = [
    { label: 'Total Employees', value: stats.total, icon: Users, iconColor: 'text-blue-600 bg-blue-50', sub: 'across all departments' },
    { label: 'Active', value: stats.active, icon: UserCheck, iconColor: 'text-green-600 bg-green-50', sub: stats.total ? `${Math.round((stats.active/stats.total)*100)}% of workforce` : '—' },
    { label: 'On Leave', value: stats.onLeave, icon: UserMinus, iconColor: 'text-amber-600 bg-amber-50', sub: 'currently away' },
    { label: 'Departments', value: stats.departments, icon: Building2, iconColor: 'text-violet-600 bg-violet-50', sub: 'active teams' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Employees</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your organization's workforce</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat) => (
            <Card key={stat.label} className="shadow-sm border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="text-2xl font-semibold text-slate-900 mt-1">{loading ? '—' : stat.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
                  </div>
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.iconColor}`}>
                    <stat.icon className="h-4.5 w-4.5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-lg p-3 flex flex-wrap items-center gap-2">
          <div className="relative w-64">
            <label htmlFor="employee-search" className="sr-only">Search employees by name</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input id="employee-search" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-9" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="on_leave">On Leave</SelectItem>
              <SelectItem value="terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>

          {isFiltering && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-slate-500">
              Clear filters
            </Button>
          )}

          <div className="flex-1" />

          <Button variant="outline" size="sm" disabled title="Export coming soon">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {canManageEmployees(role) && (
            <Button asChild size="sm">
              <Link to="/employees/new" className="inline-flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Link>
            </Button>
          )}
        </div>

        {!loading && !error && (
          <p className="text-sm text-slate-500 -mt-2">
            {isFiltering ? `Showing ${filtered.length} of ${employees.length} employees` : `${employees.length} total employees`}
          </p>
        )}

        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button onClick={fetchData} className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
                <RotateCcw className="h-3.5 w-3.5" />Try again
              </button>
            </div>
          ) : !loading && filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-14 text-center">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-1">
                <Users className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700">
                {isFiltering ? 'No employees match your filters' : 'No employees yet'}
              </p>
              <p className="text-sm text-slate-500">
                {isFiltering ? 'Try adjusting your search or filters.' : 'Start by adding your first employee.'}
              </p>
              {isFiltering ? (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2">Clear filters</Button>
              ) : (
                canManageEmployees(role) && (
                  <Button asChild size="sm" className="mt-2">
                    <Link to="/employees/new" className="inline-flex items-center">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Employee
                    </Link>
                  </Button>
                )
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <SortableHead label="Name" sortKey="lastName" currentSort={sort} onSort={handleSort} />
                    <SortableHead label="Job Title" sortKey="jobTitle" currentSort={sort} onSort={handleSort} />
                    <SortableHead label="Department" sortKey="department" currentSort={sort} onSort={handleSort} />
                    <SortableHead label="Status" sortKey="status" currentSort={sort} onSort={handleSort} />
                    {canManageEmployees(role) && (
                      <SortableHead label="Date Hired" sortKey="dateHired" currentSort={sort} onSort={handleSort} />
                    )}
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? <TableSkeleton /> : filtered.map((emp) => {
                    const fullName = `${emp.firstName} ${emp.lastName}`;
                    return (
                      <TableRow key={emp.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate(`/employees/${emp.id}`)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={emp.profilePicture ? `http://localhost:5000${emp.profilePicture}` : undefined} />
                              <AvatarFallback className={`text-xs ${getAvatarColor(fullName)}`}>{emp.firstName[0]}{emp.lastName[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900">{fullName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-600">{emp.jobTitle}</TableCell>
                        <TableCell className="text-slate-600">{emp.Department?.name || '—'}</TableCell>
                        <TableCell><Badge variant="outline" className={statusStyles[emp.status]}>{emp.status.replace('_', ' ')}</Badge></TableCell>
                        {canManageEmployees(role) && (
                          <TableCell className="text-slate-600">{formatDate(emp.dateHired)}</TableCell>
                        )}
                        {(canManageEmployees(role) || canDeleteEmployees(role)) ? (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4 text-slate-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/employees/${emp.id}`)}>
                                  <Eye className="h-4 w-4 mr-2" />View
                                </DropdownMenuItem>
                                {canManageEmployees(role) && (
                                  <DropdownMenuItem onClick={() => navigate(`/employees/${emp.id}/edit`)}>
                                    <Pencil className="h-4 w-4 mr-2" />Edit
                                  </DropdownMenuItem>
                                )}
                                {canDeleteEmployees(role) && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteTarget(emp)}>
                                      <Trash2 className="h-4 w-4 mr-2" />Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        ) : (
                          <TableCell />
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {deleteTarget?.firstName} {deleteTarget?.lastName} and their records. This action cannot be undone.
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