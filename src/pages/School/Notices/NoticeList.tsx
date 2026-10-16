import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import { CardSkeleton } from '@/components/school/LoadingSkeleton';
import EmptyState from '@/components/school/EmptyState';
import NoticeModal, { type NoticeFormData } from '@/components/school/NoticeModal';
import DeleteConfirmModal from '@/components/school/DeleteConfirmModal';
import { useModal } from '@/hooks/useModal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { PlusIcon, TrashBinIcon } from '@/icons';

interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  targetRole: 'all' | 'teacher' | 'student' | 'parent';
  priority: 'low' | 'medium' | 'high';
  date: string;
  author?: {
    name: string;
    email: string;
  };
}

export default function NoticeList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modals
  const { isOpen: isAddOpen, openModal: openAdd, closeModal: closeAdd } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDelete, closeModal: closeDelete } = useModal();
  const [noticeToDelete, setNoticeToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchNotices = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.get<NoticeItem[]>('/notices');
      setNotices(data);
    } catch (err) {
      console.error('Failed to load notices', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleCreateNotice = async (formData: NoticeFormData) => {
    setIsSubmitting(true);
    try {
      await api.post('/notices', formData);
      closeAdd();
      fetchNotices();
    } catch (err) {
      console.error('Failed to post notice', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDelete = (id: string) => {
    setNoticeToDelete(id);
    openDelete();
  };

  const handleConfirmDelete = async () => {
    if (!noticeToDelete) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/notices/${noticeToDelete}`);
      closeDelete();
      fetchNotices();
    } catch (err) {
      console.error('Failed to delete notice', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityColor = (p: string) => {
    if (p === 'high') return 'error' as const;
    if (p === 'medium') return 'warning' as const;
    return 'info' as const;
  };

  const filteredNotices = notices.filter((n) => {
    if (roleFilter === 'all') return true;
    return n.targetRole === roleFilter;
  });

  const canManage = user?.role === 'admin';

  return (
    <>
      <PageMeta
        title="Notice Board & Announcements | TailAdmin - School Management"
        description="Official school announcements, events, and departmental circulars"
      />
      <PageBreadcrumb pageTitle={t('school.notices', 'Notices & Announcements')} />

      {/* Control & Tab Filter */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-wrap gap-2">
          {['all', 'teacher', 'student', 'parent'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold capitalize transition ${
                roleFilter === role
                  ? 'bg-brand-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {role === 'all' ? 'All Audiences' : `${role}s Only`}
            </button>
          ))}
        </div>

        {canManage && (
          <Button size="sm" startIcon={<PlusIcon className="size-4" />} onClick={openAdd}>
            {t('school.postNotice', 'Create Announcement')}
          </Button>
        )}
      </div>

      {/* Notices Grid */}
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : filteredNotices.length === 0 ? (
        <EmptyState
          title="No notices found"
          description="There are currently no active circulars matching this audience filter."
          actionLabel={canManage ? t('school.postNotice', 'Post Notice') : undefined}
          onAction={canManage ? openAdd : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredNotices.map((notice) => (
            <div
              key={notice._id}
              className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-xs transition hover:shadow-theme-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="solid" color={priorityColor(notice.priority)} size="sm">
                      {notice.priority} priority
                    </Badge>
                    <Badge variant="light" color="primary" size="sm">
                      Audience: {notice.targetRole}
                    </Badge>
                  </div>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(notice._id)}
                      title="Delete Announcement"
                      className="text-gray-400 hover:text-error-500"
                    >
                      <TrashBinIcon className="size-4" />
                    </button>
                  )}
                </div>

                <h3 className="mt-3 text-lg font-bold text-gray-800 dark:text-white/90">
                  {notice.title}
                </h3>
                <p className="mt-2 whitespace-pre-line text-sm text-gray-600 dark:text-gray-300">
                  {notice.content}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-400 dark:border-gray-800">
                <span>By: {notice.author?.name || 'School Administration'}</span>
                <span>{new Date(notice.date).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Notice Modal */}
      <NoticeModal
        isOpen={isAddOpen}
        onClose={closeAdd}
        onSubmit={handleCreateNotice}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Announcement"
        message="Are you sure you want to remove this notice? It will no longer be visible to users."
        isDeleting={isSubmitting}
      />
    </>
  );
}
