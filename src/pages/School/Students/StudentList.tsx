import { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import PageMeta from '@/components/common/PageMeta';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import { TableSkeleton } from '@/components/school/LoadingSkeleton';
import EmptyState from '@/components/school/EmptyState';
import StudentModal, { type StudentFormData } from '@/components/school/StudentModal';
import DeleteConfirmModal from '@/components/school/DeleteConfirmModal';
import { useModal } from '@/hooks/useModal';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { PlusIcon, PencilIcon, TrashBinIcon, EyeIcon } from '@/icons';

interface StudentItem {
  _id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dob: string;
  bloodGroup: string;
  classId: {
    _id: string;
    name: string;
    section: string;
  };
  section: string;
  rollNumber: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  guardianEmail: string;
  address: string;
  isActive: boolean;
}

interface ClassItem {
  _id: string;
  name: string;
  grade: string;
  section: string;
}

export default function StudentList() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Modals
  const { isOpen: isFormOpen, openModal: openForm, closeModal: closeForm } = useModal();
  const { isOpen: isDeleteOpen, openModal: openDelete, closeModal: closeDelete } = useModal();
  const [selectedStudent, setSelectedStudent] = useState<StudentFormData | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const clsData = await api.get<ClassItem[]>('/classes');
        setClasses(clsData);
      } catch (err) {
        console.error('Failed to load classes', err);
      }
    };
    fetchClasses();
  }, []);

  // Fetch students
  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      let query = `/students?page=${currentPage}&limit=10`;
      if (search) query += `&search=${encodeURIComponent(search)}`;
      if (selectedClass) query += `&classId=${selectedClass}`;

      const res = await api.get<{
        students: StudentItem[];
        pagination: { pages: number; total: number };
      }>(query);

      setStudents(res.students);
      setTotalPages(res.pagination.pages || 1);
    } catch (err) {
      console.error('Failed to load students', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, search, selectedClass]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleOpenAdd = () => {
    setSelectedStudent(null);
    openForm();
  };

  const handleOpenEdit = (stu: StudentItem) => {
    setSelectedStudent({
      _id: stu._id,
      firstName: stu.firstName,
      lastName: stu.lastName,
      email: stu.email,
      gender: stu.gender,
      dob: stu.dob,
      bloodGroup: stu.bloodGroup,
      classId: stu.classId?._id || '',
      section: stu.section,
      rollNumber: stu.rollNumber,
      guardianName: stu.guardianName,
      guardianRelation: stu.guardianRelation,
      guardianPhone: stu.guardianPhone,
      guardianEmail: stu.guardianEmail,
      address: stu.address,
    });
    openForm();
  };

  const handleOpenDelete = (id: string) => {
    setStudentToDelete(id);
    openDelete();
  };

  const handleSaveStudent = async (formData: StudentFormData) => {
    setIsSubmitting(true);
    try {
      if (formData._id) {
        await api.put(`/students/${formData._id}`, formData);
      } else {
        await api.post('/students', formData);
      }
      closeForm();
      fetchStudents();
    } catch (err) {
      console.error('Error saving student', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setIsSubmitting(true);
    try {
      await api.delete(`/students/${studentToDelete}`);
      closeDelete();
      fetchStudents();
    } catch (err) {
      console.error('Error deleting student', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const classFilterOptions = [
    { value: '', label: 'All Classes' },
    ...classes.map((c) => ({
      value: c._id,
      label: `${c.name} (${c.section})`,
    })),
  ];

  const canManage = user?.role === 'admin';

  return (
    <>
      <PageMeta
        title="Students Directory | TailAdmin - School Management"
        description="Manage enrolled students, search, filter, and view academic records"
      />
      <PageBreadcrumb pageTitle={t('school.students', 'Students Directory')} />

      {/* Control bar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="w-full sm:w-64">
            <Input
              type="text"
              placeholder={t('school.searchPlaceholder', 'Search by name or ID...')}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
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
          <Button size="sm" startIcon={<PlusIcon className="size-4" />} onClick={handleOpenAdd}>
            {t('school.addStudent', 'Add Student')}
          </Button>
        )}
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-theme-xs dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={8} cols={6} />
          </div>
        ) : students.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={t('school.noData', 'No students found')}
              description="No student records match your query criteria."
              actionLabel={canManage ? t('school.addStudent', 'Add Student') : undefined}
              onAction={canManage ? handleOpenAdd : undefined}
            />
          </div>
        ) : (
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full min-w-[700px] text-start text-sm">
              <thead className="border-b border-gray-100 bg-gray-50/75 text-xs uppercase text-gray-500 dark:border-gray-800 dark:bg-gray-800 dark:text-gray-400">
                <tr>
                  <th className="px-5 py-3.5 text-start">{t('school.studentId', 'Student ID')}</th>
                  <th className="px-5 py-3.5 text-start">{t('school.name', 'Student Name')}</th>
                  <th className="px-5 py-3.5 text-start">{t('school.class', 'Class')}</th>
                  <th className="px-5 py-3.5 text-start">{t('school.rollNumber', 'Roll No')}</th>
                  <th className="px-5 py-3.5 text-start">{t('school.guardian', 'Guardian')}</th>
                  <th className="px-5 py-3.5 text-start">{t('school.status', 'Status')}</th>
                  <th className="px-5 py-3.5 text-end">{t('school.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {students.map((student) => (
                  <tr
                    key={student._id}
                    className="transition hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-5 py-3.5 font-bold text-brand-600 dark:text-brand-400">
                      {student.studentId}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-gray-800 dark:text-white/90">
                        {student.firstName} {student.lastName}
                      </div>
                      <span className="text-theme-xs text-gray-400">
                        {student.email || student.gender}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">
                      {student.classId?.name} ({student.classId?.section})
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-700 dark:text-gray-300">
                      #{student.rollNumber || '-'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="text-gray-800 dark:text-white/90">
                        {student.guardianName}
                      </div>
                      <span className="text-theme-xs text-gray-400">{student.guardianPhone}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="light" color={student.isActive ? 'success' : 'error'} size="sm">
                        {student.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-end">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/school/students/${student._id}`}
                          title="View Profile"
                          className="flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                          <EyeIcon className="size-4" />
                        </Link>
                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(student)}
                              title="Edit Student"
                              className="flex size-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              <PencilIcon className="size-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDelete(student._id)}
                              title="Delete Student"
                              className="flex size-8 items-center justify-center rounded-lg border border-error-200 text-error-500 hover:bg-error-50 dark:border-error-500/20 dark:hover:bg-error-500/10"
                            >
                              <TrashBinIcon className="size-4" />
                            </button>
                          </>
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

      {/* Student Add/Edit Modal */}
      <StudentModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSaveStudent}
        initialData={selectedStudent}
        classes={classes}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        title={t('school.deleteStudent', 'Delete Student')}
        message={t(
          'school.confirmDelete',
          'Are you sure you want to delete this student? The student and their user login will be marked inactive.'
        )}
        isDeleting={isSubmitting}
      />
    </>
  );
}
