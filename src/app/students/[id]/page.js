'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { api } from '@/lib/api';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  User,
  Award,
  Activity,
  ClipboardList,
  Download,
  BarChart3,
  Target,
  Sparkles,
} from 'lucide-react';

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id;

  const [profile, setProfile] = useState(null);
  const [feeProfile, setFeeProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const [res, feeRes] = await Promise.all([
          api.students.getProfile(studentId),
          api.fees.getStudentProfile(studentId),
        ]);
        if (res.success) setProfile(res.data);
        if (feeRes.success) setFeeProfile(feeRes.data);
      } catch (err) {
        console.warn('Profile load error, using demo data');
        setProfile({
          id: studentId,
          fullName: 'Alice Smith',
          email: 'alice.smith@student.edu',
          phone: '+1 555-0201',
          gender: 'Female',
          dateOfBirth: '2002-05-14T00:00:00.000Z',
          address: '742 Evergreen Terrace, Springfield',
          createdAt: '2024-01-15T09:00:00.000Z',
          enrollments: [
            {
              id: 'e1',
              enrollmentDate: '2024-02-01T00:00:00.000Z',
              course: {
                id: 'c1',
                title: 'Introduction to Computer Science',
                description: 'Web dev, algorithms, DB design',
                duration: '16 Weeks',
                fee: 1200,
                teacher: { fullName: 'Dr. Robert Vance', specialization: 'Computer Science & AI' },
                _count: { enrollments: 12 },
              },
            },
            {
              id: 'e2',
              enrollmentDate: '2024-03-10T00:00:00.000Z',
              course: {
                id: 'c2',
                title: 'Data Structures & Algorithms in JS',
                description: 'Arrays, linked lists, trees, graphs',
                duration: '14 Weeks',
                fee: 1100,
                teacher: { fullName: 'Dr. Alan Turing', specialization: 'Quantum Computing' },
                _count: { enrollments: 8 },
              },
            },
          ],
          attendances: [
            { id: 'a1', date: new Date().toISOString(), status: 'PRESENT' },
            { id: 'a2', date: new Date(Date.now() - 86400000).toISOString(), status: 'PRESENT' },
            { id: 'a3', date: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'LATE' },
            { id: 'a4', date: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'ABSENT' },
            { id: 'a5', date: new Date(Date.now() - 86400000 * 4).toISOString(), status: 'PRESENT' },
          ],
          analytics: {
            totalAttendance: 28,
            presentCount: 20,
            absentCount: 3,
            lateCount: 4,
            excusedCount: 1,
            attendanceRate: 85.7,
            totalCoursesEnrolled: 2,
            totalFees: 2300,
            personalTrend: Array.from({ length: 14 }, (_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (13 - i));
              const statuses = ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'ABSENT', 'PRESENT'];
              return {
                date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                weekday: d.toLocaleDateString('en-US', { weekday: 'short' }),
                status: statuses[Math.floor(Math.random() * statuses.length)],
              };
            }),
          },
        });
      } finally {
        setLoading(false);
      }
    };

    if (studentId) loadProfile();
  }, [studentId]);

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading student profile...</p>
        </div>
      </div>
    );
  }

  const { analytics } = profile;
  const statusColorMap = {
    PRESENT: 'bg-emerald-500',
    ABSENT: 'bg-rose-500',
    LATE: 'bg-amber-500',
    EXCUSED: 'bg-violet-500',
  };
  const statusIcon = {
    PRESENT: <CheckCircle className="w-3.5 h-3.5" />,
    ABSENT: <XCircle className="w-3.5 h-3.5" />,
    LATE: <Clock className="w-3.5 h-3.5" />,
    EXCUSED: <AlertTriangle className="w-3.5 h-3.5" />,
  };

  const exportStudentReport = () => {
    const rows = [
      ['Student Profile Report'],
      [''],
      ['Name', profile.fullName],
      ['Email', profile.email],
      ['Phone', profile.phone],
      ['Gender', profile.gender],
      ['DOB', new Date(profile.dateOfBirth).toLocaleDateString()],
      ['Address', `"${profile.address}"`],
      ['Attendance Rate', `${analytics.attendanceRate}%`],
      ['Total Courses', analytics.totalCoursesEnrolled],
      ['Total Fees', `$${analytics.totalFees}`],
      [''],
      ['--- Attendance History ---'],
      ['Date', 'Status'],
      ...profile.attendances.map((a) => [new Date(a.date).toLocaleDateString(), a.status]),
      [''],
      ['--- Enrolled Courses ---'],
      ['Course', 'Teacher', 'Duration', 'Fee'],
      ...profile.enrollments.map((e) => [e.course.title, e.course.teacher?.fullName || 'N/A', e.course.duration, `$${e.course.fee}`]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Student_Report_${profile.fullName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: CheckCircle },
    { id: 'fees', label: 'Fees & Payments', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Back Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/students')}
          className="flex items-center space-x-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Directory</span>
        </button>
        <button
          onClick={exportStudentReport}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-colors"
        >
          <Download className="w-4 h-4 text-indigo-500" />
          <span>Export Full Report</span>
        </button>
      </div>

      {/* === HERO PROFILE CARD === */}
      <div className="glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Gradient Header Band */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        </div>

        <div className="px-6 md:px-8 pb-6 -mt-14 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            {/* Avatar + Identity */}
            <div className="flex items-end space-x-5">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-indigo-500/30 border-4 border-white dark:border-slate-900">
                {profile.fullName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{profile.fullName}</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                  <GraduationCap className="w-4 h-4 text-indigo-500" /> Student ID: <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{profile.id.slice(0, 8).toUpperCase()}</span>
                </p>
              </div>
            </div>

            {/* Quick Stat Badges */}
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">{analytics.attendanceRate}%</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attendance</div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                <div className="text-lg font-black text-indigo-600 dark:text-indigo-400">{analytics.totalCoursesEnrolled}</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Courses</div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                <div className="text-lg font-black text-amber-600 dark:text-amber-400">${analytics.totalFees.toLocaleString()}</div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Fees</div>
              </div>
            </div>
          </div>

          {/* Contact Info Bar */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Mail className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{profile.email}</span>
            </div>
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Phone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{profile.phone}</span>
            </div>
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Calendar className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                DOB: {new Date(profile.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <MapPin className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{profile.address}</span>
            </div>
          </div>
        </div>
      </div>

      {/* === TAB NAVIGATION === */}
      <div className="flex items-center space-x-1 glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 p-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* === TAB CONTENT === */}

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Attendance Donut Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown Cards */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-5">
                <BarChart3 className="w-4 h-4 text-indigo-500" /> Attendance Status Breakdown
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{analytics.presentCount}</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Present</div>
                </div>
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center">
                  <XCircle className="w-6 h-6 text-rose-500 mx-auto mb-1" />
                  <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{analytics.absentCount}</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Absent</div>
                </div>
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <Clock className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{analytics.lateCount}</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Late</div>
                </div>
                <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
                  <AlertTriangle className="w-6 h-6 text-violet-500 mx-auto mb-1" />
                  <div className="text-2xl font-black text-violet-600 dark:text-violet-400">{analytics.excusedCount}</div>
                  <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Excused</div>
                </div>
              </div>

              {/* Horizontal Stacked Bar */}
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  <span>Distribution</span>
                  <span>{analytics.totalAttendance} Total Records</span>
                </div>
                <div className="h-4 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800">
                  {analytics.totalAttendance > 0 && (
                    <>
                      <div className="bg-emerald-500 h-full transition-all" style={{ width: `${(analytics.presentCount / analytics.totalAttendance) * 100}%` }}></div>
                      <div className="bg-amber-500 h-full transition-all" style={{ width: `${(analytics.lateCount / analytics.totalAttendance) * 100}%` }}></div>
                      <div className="bg-rose-500 h-full transition-all" style={{ width: `${(analytics.absentCount / analytics.totalAttendance) * 100}%` }}></div>
                      <div className="bg-violet-500 h-full transition-all" style={{ width: `${(analytics.excusedCount / analytics.totalAttendance) * 100}%` }}></div>
                    </>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2 text-xs">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> <span className="text-slate-600 dark:text-slate-400">Present</span></span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> <span className="text-slate-600 dark:text-slate-400">Late</span></span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> <span className="text-slate-600 dark:text-slate-400">Absent</span></span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500"></span> <span className="text-slate-600 dark:text-slate-400">Excused</span></span>
                </div>
              </div>
            </div>

            {/* 14-Day Attendance Heatmap */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-5">
                <Target className="w-4 h-4 text-violet-500" /> 14-Day Attendance Heatmap
              </h3>

              <div className="grid grid-cols-7 gap-2 mb-4">
                {analytics.personalTrend.map((day, idx) => (
                  <div key={idx} className="group relative flex flex-col items-center gap-1">
                    <div
                      className={`w-full aspect-square rounded-xl flex items-center justify-center text-white text-xs font-bold transition-all cursor-pointer hover:scale-110 hover:shadow-lg ${
                        day.status === 'PRESENT'
                          ? 'bg-emerald-500 hover:shadow-emerald-500/30'
                          : day.status === 'ABSENT'
                          ? 'bg-rose-500 hover:shadow-rose-500/30'
                          : day.status === 'LATE'
                          ? 'bg-amber-500 hover:shadow-amber-500/30'
                          : day.status === 'EXCUSED'
                          ? 'bg-violet-500 hover:shadow-violet-500/30'
                          : 'bg-slate-300 dark:bg-slate-700'
                      }`}
                    >
                      {day.status ? day.status.charAt(0) : '—'}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-tight">{day.weekday}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 leading-tight">{day.date}</span>
                  </div>
                ))}
              </div>

              {/* Attendance Rate Progress */}
              <div className="mt-2 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Personal Attendance Score
                  </span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{analytics.attendanceRate}%</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      analytics.attendanceRate >= 90 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                      analytics.attendanceRate >= 75 ? 'bg-gradient-to-r from-amber-500 to-orange-400' :
                      'bg-gradient-to-r from-rose-500 to-red-400'
                    }`}
                    style={{ width: `${analytics.attendanceRate}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {analytics.attendanceRate >= 90 ? '🎯 Excellent! Above minimum threshold (90%)' :
                   analytics.attendanceRate >= 75 ? '⚠️ Needs improvement. Below 90% threshold.' :
                   '🚨 Critical! Attendance below 75%. Action required.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COURSES TAB */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" /> Enrolled Courses ({profile.enrollments.length})
            </h3>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
              Total Investment: <span className="text-amber-600 dark:text-amber-400">${analytics.totalFees.toLocaleString()}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.enrollments.map((enrollment) => (
              <div key={enrollment.id} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(enrollment.enrollmentDate).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1 line-clamp-1">{enrollment.course.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">{enrollment.course.description}</p>

                <div className="space-y-2.5 pt-3 border-t border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <User className="w-3.5 h-3.5 text-indigo-500" /> Instructor
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{enrollment.course.teacher?.fullName || 'Unassigned'}</span>
                  </div>
                  {enrollment.course.teacher?.specialization && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Award className="w-3.5 h-3.5 text-violet-500" /> Specialization
                      </span>
                      <span className="font-semibold text-slate-600 dark:text-slate-300">{enrollment.course.teacher.specialization}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-500" /> Duration
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{enrollment.course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <ClipboardList className="w-3.5 h-3.5 text-emerald-500" /> Total Enrolled
                    </span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">{enrollment.course._count?.enrollments || 0} Students</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-amber-500" /> Course Fee
                    </span>
                    <span className="text-base font-black text-amber-600 dark:text-amber-400">${enrollment.course.fee.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}

            {profile.enrollments.length === 0 && (
              <div className="col-span-full py-16 text-center glass-panel rounded-2xl border border-slate-200 dark:border-slate-800">
                <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">This student is not enrolled in any courses yet.</p>
                <Link href="/enrollments" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-2 inline-block hover:underline">
                  Go to Enrollment Page →
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" /> Full Attendance History (Last 30 Records)
            </h3>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Rate: {analytics.attendanceRate}%
            </span>
          </div>

          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-6">#</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Day</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                  {profile.attendances.length > 0 ? (
                    profile.attendances.map((att, idx) => {
                      const d = new Date(att.date);
                      return (
                        <tr key={att.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3.5 px-6 text-xs font-mono text-slate-400">{idx + 1}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-200 text-xs">
                            {d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 text-xs">
                            {d.toLocaleDateString('en-US', { weekday: 'long' })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white ${statusColorMap[att.status] || 'bg-slate-500'}`}>
                              {statusIcon[att.status]} {att.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 italic">
                            {att.remarks || '—'}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        No attendance records found for this student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* FEES & PAYMENTS TAB */}
      {activeTab === 'fees' && feeProfile && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Monthly Tuition Fee</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                ${feeProfile.monthlyTuitionFee || 150}
              </div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">Base Monthly Rate</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Current Month Status</div>
              <div className="mt-2">
                {feeProfile.currentMonthStatus === 'PAID' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    ✅ Paid
                  </span>
                )}
                {feeProfile.currentMonthStatus === 'UNPAID' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    ❌ Unpaid
                  </span>
                )}
                {feeProfile.currentMonthStatus === 'DUE_SOON' && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    🟡 Due Soon
                  </span>
                )}
                {feeProfile.currentMonthStatus !== 'PAID' &&
                  feeProfile.currentMonthStatus !== 'UNPAID' &&
                  feeProfile.currentMonthStatus !== 'DUE_SOON' && (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                      ⏳ {feeProfile.currentMonthStatus}
                    </span>
                  )}
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Paid Amount</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                ${feeProfile.totalPaidAmount.toLocaleString()}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">Lifetime Cleared</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Next Due Date</div>
              <div className="text-sm font-black text-slate-900 dark:text-white mt-2">
                {feeProfile.nextDueDate ? new Date(feeProfile.nextDueDate).toLocaleDateString() : 'All Fees Cleared 🎉'}
              </div>
              <div className="text-xs text-rose-500 dark:text-rose-400 font-semibold mt-1">
                Pending: ${feeProfile.totalPendingAmount}
              </div>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" /> Student Payment History & Invoices
              </h3>
              <Link href="/fees" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Go to Fee Console →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Month / Year</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Dynamic Status</th>
                    <th className="py-3.5 px-4">Payment Method</th>
                    <th className="py-3.5 px-4">Receipt #</th>
                    <th className="py-3.5 px-6 text-right">Payment Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                  {feeProfile.paymentHistory && feeProfile.paymentHistory.length > 0 ? (
                    feeProfile.paymentHistory.map((fee) => (
                      <tr key={fee.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-6 font-bold text-slate-900 dark:text-slate-200 text-xs">
                          Month {fee.month} / {fee.year}
                        </td>
                        <td className="py-3.5 px-4 font-black text-slate-900 dark:text-white text-xs">
                          ${fee.amount}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400">
                          {new Date(fee.dueDate).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4">
                          {fee.status === 'PAID' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              ✅ Paid
                            </span>
                          )}
                          {fee.status === 'UNPAID' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                              ❌ Unpaid
                            </span>
                          )}
                          {fee.status === 'DUE_SOON' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              🟡 Due Soon
                            </span>
                          )}
                          {fee.status !== 'PAID' && fee.status !== 'UNPAID' && fee.status !== 'DUE_SOON' && (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                              ⏳ {fee.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {fee.payment ? fee.payment.paymentMethod : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-indigo-600 dark:text-indigo-400">
                          {fee.payment ? fee.payment.receiptNumber : '—'}
                        </td>
                        <td className="py-3.5 px-6 text-right text-xs text-slate-500 dark:text-slate-400">
                          {fee.payment ? new Date(fee.payment.paymentDate).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500 text-xs">
                        No fee history recorded for this student.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
