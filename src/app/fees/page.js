'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Modal from '@/components/Modal';
import Notification from '@/components/Notification';
import StatCard from '@/components/StatCard';
import { api } from '@/lib/api';
import {
  DollarSign,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Download,
  PlusCircle,
  FileText,
  Calendar,
  User,
  Zap,
  TrendingUp,
  Receipt,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function FeesPage() {
  const [fees, setFees] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalPendingFees: 0,
    totalPaidFeesCount: 0,
    unpaidCount: 0,
    dueSoonCount: 0,
    monthlyCollectionChart: [],
  });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFeeForPay, setSelectedFeeForPay] = useState(null);

  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedFeeForReceipt, setSelectedFeeForReceipt] = useState(null);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'CASH',
    paymentDate: new Date().toISOString().slice(0, 10),
    receiptNumber: '',
    amountPaid: 0,
    notes: '',
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchFeesData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedMonth) params.month = selectedMonth;
      if (selectedYear) params.year = selectedYear;
      if (selectedStatus) params.status = selectedStatus;

      const [feesRes, statsRes] = await Promise.all([
        api.fees.getAll(params),
        api.fees.getStats(),
      ]);

      if (feesRes.success && feesRes.data) setFees(feesRes.data);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
    } catch (err) {
      console.warn('API fetch error or offline, fallback to demo fee state');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeesData();
  }, [searchTerm, selectedMonth, selectedYear, selectedStatus]);

  const handleGenerateMonthlyFees = async () => {
    try {
      setGenerating(true);
      const now = new Date();
      const res = await api.fees.generate({ month: now.getMonth() + 1, year: now.getFullYear() });
      if (res.success) {
        showToast(`Generated monthly fees for ${res.data.generatedCount} active students!`);
        fetchFeesData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate monthly fees', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleOpenPayModal = (fee) => {
    setSelectedFeeForPay(fee);
    setPaymentForm({
      paymentMethod: 'CASH',
      paymentDate: new Date().toISOString().slice(0, 10),
      receiptNumber: `REC-${fee.year}${String(fee.month).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`,
      amountPaid: fee.amount,
      notes: `Tuition fee payment for Month ${fee.month}/${fee.year}`,
    });
    setIsPayModalOpen(true);
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    if (!selectedFeeForPay) return;

    try {
      const res = await api.fees.pay(selectedFeeForPay.id, paymentForm);
      if (res.success) {
        showToast(`Payment of $${paymentForm.amountPaid} recorded successfully!`);
        setIsPayModalOpen(false);
        fetchFeesData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to record payment', 'error');
    }
  };

  const handleOpenReceiptModal = (fee) => {
    setSelectedFeeForReceipt(fee);
    setIsReceiptModalOpen(true);
  };

  // Report Exporters
  const exportReport = async (type) => {
    try {
      showToast('Generating CSV report from database...', 'success');
      const res = await api.fees.getAll();
      const allFeeData = (res && res.success && res.data && res.data.length > 0) ? res.data : [...fees];

      let filteredData = allFeeData;
      if (type === 'unpaid') filteredData = allFeeData.filter((f) => f.status === 'UNPAID');
      if (type === 'paid') filteredData = allFeeData.filter((f) => f.status === 'PAID');
      if (type === 'due_soon') filteredData = allFeeData.filter((f) => f.status === 'DUE_SOON');

      if (filteredData.length === 0) {
        showToast('No records match this report filter', 'error');
        return;
      }

      const rows = [
        ['Student Name', 'Email', 'Phone', 'Month', 'Year', 'Amount', 'Due Date', 'Status', 'Payment Method', 'Receipt Number', 'Payment Date'],
        ...filteredData.map((f) => [
          `"${f.student?.fullName || 'N/A'}"`,
          `"${f.student?.email || 'N/A'}"`,
          `"${f.student?.phone || 'N/A'}"`,
          monthNames[f.month - 1] || f.month,
          f.year,
          f.amount,
          `"${new Date(f.dueDate).toLocaleDateString()}"`,
          f.status,
          `"${f.payment ? f.payment.paymentMethod : 'N/A'}"`,
          `"${f.payment ? f.payment.receiptNumber : 'N/A'}"`,
          `"${f.payment ? new Date(f.payment.paymentDate).toLocaleDateString() : 'N/A'}"`,
        ]),
      ];

      const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `Fee_Report_${type.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported ${filteredData.length} records to CSV!`);
    } catch (err) {
      console.error('Export Error:', err);
      showToast('Failed to generate CSV export', 'error');
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Fee Management System"
        description="Automated monthly tuition tracking, dynamic status calculation, payment processing & financial reporting."
      />

      {toast && <Notification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Top Stat Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Collected
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">${stats.totalRevenue.toLocaleString()}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Revenue Collected</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <CreditCard className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              Outstanding
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">${stats.totalPendingFees.toLocaleString()}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Pending Fees</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <CheckCircle className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
              Verified
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.totalPaidFeesCount}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Paid Fee Records</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              <XCircle className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
              Overdue
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.unpaidCount}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Unpaid Students</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              Action Req.
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{stats.dueSoonCount}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">Due Soon (&lt; 5 Days)</div>
          </div>
        </div>
      </div>

      {/* Reports & Collection Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Collection Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" /> Monthly Collection Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Revenue collected vs pending tuition fees</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Active Term 2026
            </span>
          </div>

          <div className="h-44 flex items-end justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800/80">
            {stats.monthlyCollectionChart.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-slate-100 dark:bg-slate-900 h-32 rounded-xl flex items-end p-1 relative overflow-hidden">
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-lg transition-all"
                    style={{ height: `${Math.min(100, (item.collected / (item.collected + item.pending || 1)) * 100)}%` }}
                  ></div>
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.monthYear}</span>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">${item.collected.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Reports Quick Center */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-indigo-500" /> Financial CSV Reports
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => exportReport('all')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-800"
              >
                <span className="flex items-center gap-2"><Download className="w-4 h-4 text-indigo-500" /> Full Monthly Fee Report</span>
                <span className="text-xs opacity-75">CSV</span>
              </button>

              <button
                onClick={() => exportReport('unpaid')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-800"
              >
                <span className="flex items-center gap-2"><Download className="w-4 h-4 text-rose-500" /> Pending / Unpaid Fee Report</span>
                <span className="text-xs opacity-75">CSV</span>
              </button>

              <button
                onClick={() => exportReport('paid')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all border border-slate-200 dark:border-slate-800"
              >
                <span className="flex items-center gap-2"><Download className="w-4 h-4 text-emerald-500" /> Verified Paid Fee Report</span>
                <span className="text-xs opacity-75">CSV</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleGenerateMonthlyFees}
            disabled={generating}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{generating ? 'Generating Fees...' : 'Auto-Generate Current Month Fees'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Command Control Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Filters Dropdown Row */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Months</option>
            {monthNames.map((m, idx) => (
              <option key={idx} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          {/* Dynamic Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="PAID">✅ Paid</option>
            <option value="UNPAID">❌ Unpaid</option>
            <option value="DUE_SOON">🟡 Due Soon</option>
            <option value="PENDING">⏳ Pending</option>
          </select>

          <button
            onClick={fetchFeesData}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-800 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Fee Records Table */}
      <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">#</th>
                <th className="py-4 px-4">Student</th>
                <th className="py-4 px-4">Month / Year</th>
                <th className="py-4 px-4">Tuition Fee</th>
                <th className="py-4 px-4">Due Date</th>
                <th className="py-4 px-4">Calculated Status</th>
                <th className="py-4 px-4">Payment Method</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-sm">
              {fees.length > 0 ? (
                fees.map((fee, idx) => {
                  const isPaid = fee.status === 'PAID';
                  const isUnpaid = fee.status === 'UNPAID';
                  const isDueSoon = fee.status === 'DUE_SOON';

                  return (
                    <tr key={fee.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 text-xs font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-4 px-4">
                        <Link
                          href={`/students/${fee.student?.id}`}
                          className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{fee.student?.fullName || 'N/A'}</span>
                        </Link>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{fee.student?.email}</div>
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {monthNames[fee.month - 1]} {fee.year}
                      </td>
                      <td className="py-4 px-4 font-black text-slate-900 dark:text-white text-xs">
                        ${fee.amount.toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="w-3.5 h-3.5" /> Paid
                          </span>
                        )}
                        {isUnpaid && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3.5 h-3.5" /> Unpaid
                          </span>
                        )}
                        {isDueSoon && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3.5 h-3.5" /> Due Soon
                          </span>
                        )}
                        {!isPaid && !isUnpaid && !isDueSoon && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
                            <Clock className="w-3.5 h-3.5" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {fee.payment ? (
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-bold">
                            {fee.payment.paymentMethod}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        {isPaid ? (
                          <button
                            onClick={() => handleOpenReceiptModal(fee)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white font-bold text-xs transition-colors border border-slate-200 dark:border-slate-800"
                          >
                            Receipt
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenPayModal(fee)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
                          >
                            Pay Fee
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-500 text-sm">
                    {loading ? 'Loading fee records...' : 'No fee records match the selected filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* === PAY FEE MODAL === */}
      <Modal isOpen={isPayModalOpen} onClose={() => setIsPayModalOpen(false)} title="Record Fee Payment">
        {selectedFeeForPay && (
          <form onSubmit={handleProcessPayment} className="space-y-4">
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Student</div>
              <div className="text-base font-black text-slate-900 dark:text-white">{selectedFeeForPay.student?.fullName}</div>
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
                Month: {monthNames[selectedFeeForPay.month - 1]} {selectedFeeForPay.year} | Amount: ${selectedFeeForPay.amount}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Payment Method
              </label>
              <select
                required
                value={paymentForm.paymentMethod}
                onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500"
              >
                <option value="CASH">💵 Cash</option>
                <option value="BANK_TRANSFER">🏦 Bank Transfer</option>
                <option value="EASYPAISA">📱 EasyPaisa</option>
                <option value="JAZZCASH">📱 JazzCash</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Receipt Number
                </label>
                <input
                  type="text"
                  required
                  value={paymentForm.receiptNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, receiptNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Amount Paid ($)
              </label>
              <input
                type="number"
                required
                value={paymentForm.amountPaid}
                onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm font-black text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Notes / Remarks
              </label>
              <textarea
                rows="2"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
              ></textarea>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setIsPayModalOpen(false)}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20"
              >
                Confirm Payment
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* === VIEW RECEIPT INVOICE MODAL === */}
      <Modal isOpen={isReceiptModalOpen} onClose={() => setIsReceiptModalOpen(false)} title="Payment Invoice Receipt">
        {selectedFeeForReceipt && selectedFeeForReceipt.payment && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h4 className="text-lg font-black text-white">Academy LMS</h4>
                  <p className="text-xs text-slate-400">Official Payment Invoice</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  PAID IN FULL
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block uppercase font-bold">Receipt #</span>
                  <span className="font-mono text-indigo-400 font-bold">{selectedFeeForReceipt.payment.receiptNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold">Payment Date</span>
                  <span className="font-semibold">{new Date(selectedFeeForReceipt.payment.paymentDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold">Student Name</span>
                  <span className="font-bold text-white">{selectedFeeForReceipt.student?.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block uppercase font-bold">Payment Method</span>
                  <span className="font-bold text-indigo-300">{selectedFeeForReceipt.payment.paymentMethod}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">Amount Paid:</span>
                <span className="text-2xl font-black text-emerald-400">${selectedFeeForReceipt.payment.amountPaid}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
