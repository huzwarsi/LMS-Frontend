'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import Notification from '@/components/Notification';
import { api } from '@/lib/api';
import { BookOpen, Plus, Search, Edit2, Trash2, Clock, User, Users } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    fee: '',
    teacherId: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchCoursesAndTeachers = async (search = '') => {
    try {
      setLoading(true);
      const [courseRes, teacherRes] = await Promise.all([api.courses.getAll(search), api.teachers.getAll()]);
      if (courseRes.success) setCourses(courseRes.data);
      if (teacherRes.success) setTeachers(teacherRes.data);
    } catch (err) {
      console.warn('API error or server offline. Using fallback initial data.');
      setCourses([
        {
          id: '1',
          title: 'Introduction to Computer Science & Web Dev',
          description: 'Learn modern Web development, algorithms, and database design fundamentals.',
          duration: '16 Weeks',
          fee: 1200,
          teacher: { fullName: 'Dr. Robert Vance' },
          _count: { enrollments: 2 },
        },
        {
          id: '2',
          title: 'Advanced Calculus & Linear Algebra',
          description: 'Comprehensive study of multi-variable calculus and vector spaces.',
          duration: '12 Weeks',
          fee: 950,
          teacher: { fullName: 'Prof. Sarah Connor' },
          _count: { enrollments: 1 },
        },
      ]);
      setTeachers([
        { id: 't1', fullName: 'Dr. Robert Vance' },
        { id: 't2', fullName: 'Prof. Sarah Connor' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoursesAndTeachers(searchTerm);
  }, [searchTerm]);

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      duration: '',
      fee: '',
      teacherId: teachers.length > 0 ? teachers[0].id : '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      duration: course.duration,
      fee: course.fee.toString(),
      teacherId: course.teacherId || (course.teacher ? course.teacher.id : ''),
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        fee: parseFloat(formData.fee),
        teacherId: formData.teacherId || null,
      };

      if (editingCourse) {
        const res = await api.courses.update(editingCourse.id, payload);
        if (res.success) {
          showToast('Course updated successfully!');
        }
      } else {
        const res = await api.courses.create(payload);
        if (res.success) {
          showToast('Course created successfully!');
        }
      }
      setIsModalOpen(false);
      fetchCoursesAndTeachers(searchTerm);
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await api.courses.delete(id);
      if (res.success) {
        showToast('Course deleted successfully');
        fetchCoursesAndTeachers(searchTerm);
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete course', 'error');
    }
  };

  return (
    <div>
      <Header title="Course Catalog" description="Manage school courses, duration, fees, and assigned instructors." />

      {toast && <Notification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors shadow-sm"
          />
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-sm shadow-lg shadow-amber-500/25 hover:from-amber-500 hover:to-orange-500 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Course</span>
        </button>
      </div>

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <div key={course.id} className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-all">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditModal(course)}
                      className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Course"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(course.id)}
                      className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">{course.description}</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <User className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Instructor
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{course.teacher?.fullName || 'Unassigned'}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Duration
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{course.duration}</span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {course._count?.enrollments || 0} Enrolled
                  </span>
                  <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 flex items-center">
                    ${Number(course.fee).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center glass-panel rounded-2xl border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 text-sm">No courses found. Click "Add Course" to create a curriculum.</p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCourse ? 'Edit Course Curriculum' : 'Add New Course'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Course Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Intro to Computer Science"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Description *
            </label>
            <textarea
              required
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed syllabus overview..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Duration *
              </label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 16 Weeks / 4 Months"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Course Fee ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                placeholder="1200.00"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Assigned Teacher (1 Teacher → Many Courses)
            </label>
            <select
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
            >
              <option value="">-- Unassigned --</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName} ({t.specialization})
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
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm shadow-md"
            >
              {editingCourse ? 'Save Changes' : 'Create Course'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
