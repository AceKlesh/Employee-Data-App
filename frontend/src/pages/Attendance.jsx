import { useEffect, useState, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Calendar, RotateCcw, CheckCircle2, Clock, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { canMarkAttendance } from '../lib/permissions';

const statusStyles = {
  present: 'bg-green-50 text-green-700 border-green-200',
  absent: 'bg-red-50 text-red-700 border-red-200',
  late: 'bg-amber-50 text-amber-700 border-amber-200',
  half_day: 'bg-blue-50 text-blue-700 border-blue-200',
};

const avatarColors = [
  'bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700', 'bg-emerald-100 text-emerald-700', 'bg-cyan-100 text-cyan-700',
];
const getAvatarColor = (name) => {
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % avatarColors.length;
  return avatarColors[index];
};

const todayStr = () => new Date().toISOString().split('T')[0];

const formatTime = (timeStr) => {
  if (!timeStr) return '—';
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(hours, minutes);
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
};

export default function Attendance() {
  const { user } = useAuth();
  const role = user?.role;

  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingId, setMarkingId] = useState(null);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([api.get('/employees'), api.get('/attendance')])
      .then(([empRes, attRes]) => {
        setEmployees(empRes.data);
        setRecords(attRes.data);
      })
      .catch(() => setError('Failed to load attendance data.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dayRecords = useMemo(() => {
    const map = {};
    records.filter((r) => r.attendanceDate === date).forEach((r) => { map[r.employeeId] = r; });
    return map;
  }, [records, date]);

  const stats = useMemo(() => {
    const todays = Object.values(dayRecords);
    return {
      present: todays.filter((r) => r.status === 'present').length,
      absent: todays.filter((r) => r.status === 'absent').length,
      unmarked: employees.length - todays.length,
    };
  }, [dayRecords, employees]);

  const markAttendance = async (employeeId, status) => {
    setMarkingId(employeeId);
    try {
      const res = await api.post('/attendance', {
        employeeId,
        attendanceDate: date,
        status,
        checkInTime: status === 'present' || status === 'late' ? new Date().toTimeString().slice(0, 5) : undefined,
      });
      setRecords((prev) => [...prev, res.data]);
      toast.success('Attendance marked');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setMarkingId(null);
    }
  };

  const isToday = date === todayStr();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Attendance</h1>
            <p className="text-sm text-slate-500 mt-1">Track daily employee attendance</p>
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <Input
              type="date"
              value={date}
              max={todayStr()}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9 w-44"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Present</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{loading ? '—' : stats.present}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Absent</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{loading ? '—' : stats.absent}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-red-50 flex items-center justify-center">
                <UserX className="h-4.5 w-4.5 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Not Marked</p>
                <p className="text-2xl font-semibold text-slate-900 mt-1">{loading ? '—' : stats.unmarked}</p>
              </div>
              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                <Clock className="h-4.5 w-4.5 text-slate-500" />
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
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><div className="h-3.5 w-32 rounded bg-slate-100 animate-pulse" /></TableCell>
                        <TableCell><div className="h-3.5 w-20 rounded bg-slate-100 animate-pulse" /></TableCell>
                        <TableCell><div className="h-5 w-16 rounded-full bg-slate-100 animate-pulse" /></TableCell>
                        <TableCell><div className="h-3.5 w-12 rounded bg-slate-100 animate-pulse" /></TableCell>
                        <TableCell />
                      </TableRow>
                    ))
                  ) : (
                    employees.map((emp) => {
                      const record = dayRecords[emp.id];
                      const fullName = `${emp.firstName} ${emp.lastName}`;
                      return (
                        <TableRow key={emp.id} className="hover:bg-slate-50 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className={`text-xs ${getAvatarColor(fullName)}`}>
                                  {emp.firstName[0]}{emp.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-slate-900">{fullName}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600">{emp.Department?.name || '—'}</TableCell>
                          <TableCell>
                            {record ? (
                              <Badge variant="outline" className={statusStyles[record.status]}>
                                {record.status.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <span className="text-sm text-slate-400">Not marked</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {record?.checkInTime ? (
                              <div className="flex items-center gap-1.5 text-sm text-slate-700">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                <span className="font-medium">{formatTime(record.checkInTime)}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {!record && isToday && canMarkAttendance(role) && (
                              <Select onValueChange={(status) => markAttendance(emp.id, status)} disabled={markingId === emp.id}>
                                <SelectTrigger className="w-32 h-8 ml-auto">
                                  <SelectValue placeholder="Mark as..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="present">Present</SelectItem>
                                  <SelectItem value="absent">Absent</SelectItem>
                                  <SelectItem value="late">Late</SelectItem>
                                  <SelectItem value="half_day">Half Day</SelectItem>
                                </SelectContent>
                              </Select>
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
    </DashboardLayout>
  );
}