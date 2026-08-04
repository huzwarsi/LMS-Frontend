'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import Notification from '@/components/Notification';
import { api } from '@/lib/api';
import { ClipboardList, Plus, Trash2, GraduationCap, BookOpen, User, Calendar } from 'lucide-react';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Enrollment Form State
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [enrollRes, studentRes, courseRes] = await Promise.all([
        api.enrollments.getAll(),
        api.students.getAll(),
        api.courses.getAll(),
      ]);

      if (enrollRes.success) setEnrollments(enrollRes.data);
      if (studentRes.success) setStudents(studentRes.data);
      if (courseRes.success) setCourses(courseRes.data);
    } catch (err) {
      console.warn('API error or server offline. Using fallback initial data.');
      setEnrollments([
        {
          id: '1',
          student: { fullName: 'Alice Smith', email: 'alice.smith@student.edu' },
          course: { title: 'Introduction to Computer Science', teacher: { fullName: 'Dr. Robert Vance' } },
          enrollmentDate: new Date().toISOString(),
        },
        {
          id: '2',
          student: { fullName: 'Bob Johnson', email: 'bob.johnson@student.edu' },
          course: { title: 'Advanced Calculus', teacher: { fullName: 'Prof. Sarah Connor' } },
          enrollmentDate: new Date().toISOString(),
        },
      ]);
      setStudents([
        { id: 's1', fullName: 'Alice Smith', email: 'alice.smith@student.edu' },
        { id: 's2', fullName: 'Bob Johnson', email: 'bob.johnson@student.edu' },
      ]);
      setCourses([
        { id: 'c1', title: 'Introduction to Computer Science' },
        { id: 'c2', title: 'Advanced Calculus' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleOpenModal = () => {
    setFormData({
      studentId: students.length > 0 ? students[0].id : '',
      courseId: courses.length > 0 ? courses[0].id : '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.enrollments.create(formData);
      if (res.success) {
        showToast('Student enrolled in course successfully!');
        setIsModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message || 'Enrollment failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to cancel this course enrollment?')) return;
    try {
      const res = await api.enrollments.delete(id);
      if (res.success) {
        showToast('Enrollment record removed');
        fetchAllData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to remove enrollment', 'error');
    }
  };

  return (
    <div>
      <Header
        title="Student Enrollments"
        description="Enroll students into available courses and manage active enrollments."
      />

      {toast && <Notification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Action Bar */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-violet-600 dark:text-violet-400" /> Active Course Registrations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total: {enrollments.length} Enrollments</p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 hover:from-violet-500 hover:to-purple-500 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>New Enrollment</span>
        </button>
      </div>

      {/* Enrollments Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Enrolled Student</th>
                <th className="py-4 px-4">Course Title</th>
                <th className="py-4 px-4">Instructor</th>
                <th className="py-4 px-4">Enrollment Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
              {enrollments.length > 0 ? (
                enrollments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 font-bold text-sm">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{item.student?.fullName || 'Unknown Student'}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{item.student?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-200">
                      <span className="flex items-center gap-1.5 text-xs text-violet-700 dark:text-violet-300 font-semibold">
                        <BookOpen className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        {item.course?.title || 'Unknown Course'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700 dark:text-slate-300 text-xs">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {item.course?.teacher?.fullName || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-400 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {item.enrollmentDate ? new Date(item.enrollmentDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Unenroll / Cancel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    No active enrollments found. Click "New Enrollment" to assign a student to a course.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enrollment Wizard Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enroll Student into Course">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Select Student *
            </label>
            <select
              required
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} ({st.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Select Course *
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-violet-500"
            >
              {courses.map((co) => (
                <option key={co.id} value={co.id}>
                  {co.title} (${co.fee})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm shadow-md"
            >
              Confirm Enrollment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
