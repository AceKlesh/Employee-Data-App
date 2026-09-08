import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Building2, ClipboardList, CheckCircle2, Calendar, Clock } from 'lucide-react';

const statusStyles = {
  present: 'bg-green-50 text-green-700 border-green-200',
  absent: 'bg-red-50 text-red-700 border-red-200',
  late: 'bg-amber-50 text-amber-700 border-amber-200',
  half_day: 'bg-blue-50 text-blue-700 border-blue-200',
};

const leaveStatusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(dateStr));
};

const isManagerRole = (role) => ['Admin', 'HR Manager', 'Department Manager'].includes(role);

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role;
  const [orgStats, setOrgStats] = useState({ employees: null, departments: null, pendingLeaves: null, presentToday: null });
  const [myAttendance, setMyAttendance] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    if (isManagerRole(role)) {
      Promise.all([
        api.get('/employees'),
        api.get('/departments'),
        api.get('/leaves'),
        api.get('/attendance'),
      ])
        .then(([empRes, deptRes, leaveRes, attRes]) => {
          setOrgStats({
            employees: empRes.data.length,
            departments: deptRes.data.length,
            pendingLeaves: leaveRes.data.filter((l) => l.status === 'pending').length,
            presentToday: attRes.data.filter((a) => a.attendanceDate === today && a.status === 'present').length,
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (user?.employeeId) {
      Promise.all([
        api.get(`/attendance/employee/${user.employeeId}`),
        api.get(`/leaves/employee/${user.employeeId}`),
      ])
        .then(([attRes, leaveRes]) => {
          const todayRecord = attRes.data.find((a) => a.attendanceDate === today);
          setMyAttendance(todayRecord || null);
          setMyLeaves(leaveRes.data.slice(0, 3));
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [role, user]);

  const greeting = user?.email ? `, ${user.email.split('@')[0]}` : '';

  if (isManagerRole(role)) {
    const statCards = [
      { label: 'Total Employees', value: orgStats.employees, icon: Users, iconColor: 'text-blue-600 bg-blue-50' },
      { label: 'Departments', value: orgStats.departments, icon: Building2, iconColor: 'text-violet-600 bg-violet-50' },
      { label: 'Pending Leave Requests', value: orgStats.pendingLeaves, icon: ClipboardList, iconColor: 'text-amber-600 bg-amber-50' },
      { label: 'Present Today', value: orgStats.presentToday, icon: CheckCircle2, iconColor: 'text-green-600 bg-green-50' },
    ];

    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Welcome back{greeting}</h1>
            <p className="text-sm text-slate-500 mt-1">Here's an overview of The organization.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className="shadow-sm border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                      <p className="text-2xl font-semibold text-slate-900 mt-1">
                        {loading ? '—' : stat.value ?? '—'}
                      </p>
                    </div>
                    <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.iconColor}`}>
                      <stat.icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Employee personal view
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Welcome back{greeting}</h1>
          <p className="text-sm text-slate-500 mt-1">Here's your overview for today.</p>
        </div>

        {!user?.employeeId ? (
          <Card className="shadow-sm border-slate-200">
            <CardContent className="pt-6">
              <p className="text-sm text-slate-500">
                Your account isn't linked to an employee profile yet. Contact an administrator to get set up.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="shadow-sm border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Today's Attendance</p>
                  </div>
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Clock className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                </div>
                {loading ? (
                  <p className="text-sm text-slate-400">Loading...</p>
                ) : myAttendance ? (
                  <Badge variant="outline" className={statusStyles[myAttendance.status]}>
                    {myAttendance.status.replace('_', ' ')}
                  </Badge>
                ) : (
                  <p className="text-sm text-slate-400">Not marked yet</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-slate-500">Recent Leave Requests</p>
                  <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Calendar className="h-4.5 w-4.5 text-amber-600" />
                  </div>
                </div>
                {loading ? (
                  <p className="text-sm text-slate-400">Loading...</p>
                ) : myLeaves.length === 0 ? (
                  <p className="text-sm text-slate-400">No leave requests yet.</p>
                ) : (
                  <div className="space-y-2">
                    {myLeaves.map((leave) => (
                      <div key={leave.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600 capitalize">{leave.leaveType} · {formatDate(leave.startDate)}</span>
                        <Badge variant="outline" className={leaveStatusStyles[leave.status]}>{leave.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link to="/leaves" className="inline-flex items-center">View all requests</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}