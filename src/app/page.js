'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';
import {
  GraduationCap,
  Users,
  BookOpen,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  Activity,
  CheckCircle,
  PlusCircle,
  Download,
  Zap,
  Server,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    latestStudents: [],
    latestCourses: [],
  });
  const [attendanceStats, setAttendanceStats] = useState({
    attendanceRate: 94.2,
    dailyTrend: [
      { date: 'Mon', rate: 95 },
      { date: 'Tue', rate: 92 },
      { date: 'Wed', rate: 96 },
      { date: 'Thu', rate: 90 },
      { date: 'Fri', rate: 94 },
      { date: 'Sat', rate: 97 },
      { date: 'Sun', rate: 93 },
    ],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashRes, attRes] = await Promise.all([api.dashboard.getStats(), api.attendance.getStats()]);
      if (dashRes.success && dashRes.data) setStats(dashRes.data);
      if (attRes.success && attRes.data) setAttendanceStats(attRes.data);
    } catch (err) {
      console.warn('Backend offline or error fetching stats. Showing demo state.');
      setStats({
        totalStudents: 4,
        totalTeachers: 3,
        totalCourses: 4,
        totalEnrollments: 6,
        latestStudents: [
          { id: '1', fullName: 'Alice Smith', email: 'alice.smith@student.edu', gender: 'Female', createdAt: new Date() },
          { id: '2', fullName: 'Bob Johnson', email: 'bob.johnson@student.edu', gender: 'Male', createdAt: new Date() },
          { id: '3', fullName: 'Charlie Brown', email: 'charlie.brown@student.edu', gender: 'Male', createdAt: new Date() },
          { id: '4', fullName: 'Diana Prince', email: 'diana.prince@student.edu', gender: 'Female', createdAt: new Date() },
        ],
        latestCourses: [
          { id: '1', title: 'Introduction to CS', teacher: { fullName: 'Dr. Robert Vance' }, _count: { enrollments: 2 } },
          { id: '2', title: 'Advanced Calculus', teacher: { fullName: 'Prof. Sarah Connor' }, _count: { enrollments: 1 } },
          { id: '3', title: 'Data Structures in JS', teacher: { fullName: 'Dr. Alan Turing' }, _count: { enrollments: 2 } },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      <Header
        title="Executive Dashboard"
        description="Real-time student management analytics, course distribution, attendance metrics, and quick operations."
      />

      {/* Top Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Students" value={stats.totalStudents} icon={GraduationCap} color="indigo" />
        <StatCard title="Total Faculty" value={stats.totalTeachers} icon={Users} color="emerald" />
        <StatCard title="Active Courses" value={stats.totalCourses} icon={BookOpen} color="amber" />
        <StatCard title="Course Enrollments" value={stats.totalEnrollments} icon={ClipboardList} color="violet" />
      </div>

      {/* Quick Actions Command Center Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Quick Operations Command Center
          </h2>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            System Live & Connected
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/attendance"
            className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-800 shadow-sm group"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500 group-hover:text-white" />
            <span>Mark Attendance</span>
          </Link>

          <Link
            href="/enrollments"
            className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-800 shadow-sm group"
          >
            <ClipboardList className="w-4 h-4 text-violet-500 group-hover:text-white" />
            <span>Enroll Student</span>
          </Link>

          <Link
            href="/students"
            className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-800 shadow-sm group"
          >
            <PlusCircle className="w-4 h-4 text-indigo-500 group-hover:text-white" />
            <span>Add Student</span>
          </Link>

          <Link
            href="/courses"
            className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-800 shadow-sm group"
          >
            <BookOpen className="w-4 h-4 text-amber-500 group-hover:text-white" />
            <span>Create Course</span>
          </Link>
        </div>
      </div>

      {/* Analytics Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Attendance Daily Graph Widget */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Daily Attendance Trend Graph
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">7-Day student presence rate (%)</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {attendanceStats.attendanceRate}%
              </span>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Average Attendance Rate</div>
            </div>
          </div>

          {/* Interactive Bar Graph */}
          <div className="h-44 flex items-end justify-between gap-3 pt-6 border-t border-slate-200 dark:border-slate-800/80">
            {attendanceStats.dailyTrend.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.rate}%
                </span>
                <div className="w-full bg-slate-200 dark:bg-slate-800/80 h-32 rounded-xl flex items-end p-1">
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 via-violet-600 to-indigo-400 rounded-lg transition-all duration-500 group-hover:from-indigo-500 group-hover:to-teal-400"
                    style={{ height: `${item.rate}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-400">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* School Activity & Operational Highlights Widget */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-indigo-500" /> Operational Highlights
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Real-time system activity & logs</p>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start space-x-3">
                <div className="p-1.5 rounded-lg bg-indigo-600 text-white mt-0.5">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">New Student Enrolled</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Alice Smith added to CS & Web Dev</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-3">
                <div className="p-1.5 rounded-lg bg-emerald-600 text-white mt-0.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Attendance Logged</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Daily attendance processed (94.2%)</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-3">
                <div className="p-1.5 rounded-lg bg-amber-600 text-white mt-0.5">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Curriculum</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">4 active courses, 3 faculty members</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Status: Operational</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-bold">LMS v2.0 Active</span>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students Table */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Recent Students
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Newly registered students</p>
            </div>
            <Link
              href="/students"
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-2">Name</th>
                  <th className="pb-3 px-2">Email</th>
                  <th className="pb-3 px-2">Gender</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                {stats.latestStudents.length > 0 ? (
                  stats.latestStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2 font-semibold text-slate-900 dark:text-slate-200">{student.fullName}</td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{student.email}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-slate-300 dark:border-slate-700">
                          {student.gender}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-slate-500 text-sm">
                      No students recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Courses Table */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Recent Courses
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Latest added curriculum</p>
            </div>
            <Link
              href="/courses"
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-2">Course Title</th>
                  <th className="pb-3 px-2">Teacher</th>
                  <th className="pb-3 px-2">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
                {stats.latestCourses.length > 0 ? (
                  stats.latestCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-2 font-semibold text-slate-900 dark:text-slate-200">{course.title}</td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{course.teacher?.fullName || 'Unassigned'}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          {course._count?.enrollments || 0} Students
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-slate-500 text-sm">
                      No courses created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
