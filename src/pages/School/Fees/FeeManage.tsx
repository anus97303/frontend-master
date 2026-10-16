import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Select from '@/components/form/Select';
import { TableSkeleton } from '@/components/school/LoadingSkeleton';
import EmptyState from '@/components/school/EmptyState';
import FeePaymentModal, { type FeePaymentFormData } from '@/components/school/FeePaymentModal';
import ReceiptModal, { type FeeReceiptData } from '@/components/school/ReceiptModal';
import { Modal } from '@/components/ui/modal';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import { useModal } from '@/hooks/useModal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { PlusIcon } from '@/icons';

export default function FeeManage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [fees, setFees] = useState<FeeReceiptData[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals
  const { isOpen: isPayModalOpen, openModal: openPayModal, closeModal: closePayModal } = useModal();
  const { isOpen: isReceiptOpen, openModal: openReceipt, closeModal: closeReceipt } = useModal();
  const { isOpen: isCancelOpen, openModal: openCancel, closeModal: closeCancel } = useModal();

  const [activeReceipt, setActiveReceipt] = useState<FeeReceiptData | null>(null);
  const [feeToCancel, setFeeToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch classes and students for dropdowns
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [clsData, stuData] = await Promise.all([
          api.get<any[]>('/classes'),
          api.get<{ students: any[] }>('/students?limit=100'),
        ]);
        setClasses(clsData);
        setStudents(stuData.students);
      } catch (err) {
        console.error('Failed to load classes or students', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch fees
  const fetchFees = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = `/fees?page=${currentPage}&limit=15`;
      if (selectedStatus) query += `&status=${selectedStatus}`;
      if (selectedClass) query += `&classId=${selectedClass}`;

      const res = await api.get<{
        fees: FeeReceiptData[];
        pagination: { pages: number; total: number };
      }>(query);

      setFees(res.fees);
      setTotalPages(res.pagination.pages || 1);
    } catch (err) {
      console.error('Failed to load fee records', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, selectedStatus, selectedClass]);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

  const handleRecordPayment = async (data: FeePaymentFormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/fees/pay', data);
      closePayModal();
      fetchFees();
    } catch (err) {
      console.error('Failed to record payment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenCancel = (id: string) => {
    setFeeToCancel(id);
    setCancelReason('');
    openCancel();
  };

  const handleConfirmCancel = async () => {
    if (!feeToCancel) return;
    setIsSubmitting(true);
    try {
      await api.put(`/fees/cancel/${feeToCancel}`, { cancelReason });
      closeCancel();
      fetchFees();
    } catch (err) {
      console.error('Failed to cancel fee record', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Paid', label: 'Paid in Full' },
    { value: 'Partial', label: 'Partial Payment' },
    { value: 'Pending', label: 'Pending Dues' },
    { value: 'Cancelled', label: 'Cancelled (Audit)' },
  ];

  const classFilterOptions = [
    { value: '', label: 'All Classes' },
    ...classes.map((c) => ({
      value: c._id,
      label: `${c.name} (${c.section})`,
    })),
  ];

  const statusColorMap = {
    Paid: 'success' as const,
    Partial: 'warning' as const,
    Pending: 'error' as const,
    Cancelled: 'dark' as const,
  };

  const canManage = user?.role === 'admin';

  return (
    <>
      <PageMeta
        title="Fee Management & Billing | TailAdmin - School Management"
        description="Track tuition fees, payments, receipt vouchers, and pending balances"
      />
      <PageBreadcrumb pageTitle={t('school.fees', 'Fee Management & Invoicing')} />

      {/* Control bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="w-full sm:w-48">
            <Select
              options={statusOptions}
              defaultValue={selectedStatus}
              onChange={(val) => {
                setSelectedStatus(val);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={classFilterOptions}
              defaultValue={selectedClass}
              onChange={(val) => {
                setSelectedClass(val);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {canManage && (
          <Button
            size="sm"
            startIcon={<PlusIcon className="size-4" />}
            onClick={openPayModal}
          >
            {t('school.collectFee', 'Collect Fee Payment')}
          </Button>
        )}
      </div>

      {/* Fees Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={7} />
          </div>
        ) : fees.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No fee records found"
              description="No fee vouchers or payments matched the selected filter."
              actionLabel={canManage ? t('school.collectFee', 'Collect Fee') : undefined}
              onAction={canManage ? openPayModal : undefined}
            />
          </div>
        ) : (
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full min-w-[750px] text-start text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3.5 text-start">{t('school.receiptNo', 'Receipt No')}</th>
                  <th className="px-5 py-3.5 text-start">{t('school.name', 'Student')}</th>
                  <th className="px-5 py-3.5 text-start">Description</th>
                  <th className="px-5 py-3.5 text-end">{t('school.amount', 'Billed')}</th>
                  <th className="px-5 py-3.5 text-end">{t('school.paid', 'Paid')}</th>
                  <th className="px-5 py-3.5 text-end">{t('school.balance', 'Balance')}</th>
                  <th className="px-5 py-3.5 text-center">{t('school.status', 'Status')}</th>
                  <th className="px-5 py-3.5 text-end">{t('school.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {fees.map((fee) => (
                  <tr
                    key={fee._id}
                    className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-5 py-3.5 font-bold text-brand-600 dark:text-brand-400">
                      {fee.receiptNo}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-800 dark:text-white/90">
                        {fee.studentId?.firstName} {fee.studentId?.lastName}
                      </div>
                      <span className="text-theme-xs text-gray-400">
                        {fee.classId?.name} ({fee.classId?.section})
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                      {fee.title}
                      <span className="block text-theme-xs text-gray-400">{fee.paymentMethod}</span>
                    </td>
                    <td className="px-5 py-3.5 text-end font-medium text-gray-700 dark:text-gray-300">
                      ${fee.amount}
                    </td>
                    <td className="px-5 py-3.5 text-end font-semibold text-success-600 dark:text-success-400">
                      ${fee.paidAmount}
                    </td>
                    <td className="px-5 py-3.5 text-end font-semibold text-error-500">
                      ${fee.balance}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <Badge variant="solid" color={statusColorMap[fee.status]} size="sm">
                        {fee.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setActiveReceipt(fee);
                            openReceipt();
                          }}
                        >
                          {t('school.receipt', 'Voucher')}
                        </Button>
                        {canManage && fee.status !== 'Cancelled' && (
                          <button
                            type="button"
                            onClick={() => handleOpenCancel(fee._id)}
                            className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-500 hover:border-error-300 hover:text-error-500 dark:border-gray-700 dark:text-gray-400"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 p-4 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Collect Fee Modal */}
      <FeePaymentModal
        isOpen={isPayModalOpen}
        onClose={closePayModal}
        onSubmit={handleRecordPayment}
        students={students}
        isLoading={isSubmitting}
      />

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={closeReceipt}
        receipt={activeReceipt}
      />

      {/* Cancellation Audit Modal */}
      <Modal isOpen={isCancelOpen} onClose={closeCancel} className="max-w-md p-6">
        <h3 className="mb-2 text-lg font-bold text-gray-800 dark:text-white">
          Cancel Fee Payment
        </h3>
        <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
          In accordance with financial compliance rules, fee payments are not hard deleted. They are permanently marked as Cancelled with audit trail.
        </p>

        <div className="mb-4">
          <Label htmlFor="cancelReason">Reason for Cancellation *</Label>
          <Input
            id="cancelReason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g. Duplicate entry / Incorrect student"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={closeCancel} disabled={isSubmitting}>
            Keep Record
          </Button>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg bg-error-500 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-error-600 disabled:bg-error-300"
            onClick={handleConfirmCancel}
            disabled={isSubmitting || !cancelReason.trim()}
          >
            {isSubmitting ? 'Cancelling...' : 'Confirm Cancel'}
          </button>
        </div>
      </Modal>
    </>
  );
}
