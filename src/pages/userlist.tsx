import { useState, useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useSelector } from 'react-redux';
import { useGetAllUsers, useDeleteUser } from '../axios/useraxios';
import { RootState } from '../redux/store';
import RegisterFormModal from '../component/signupcomponent/signup';
import { showErrorToast, showSuccessToast } from '../utils/commonfunc/toast';
import { CommonTable } from '../component/commontable';
import moment from 'moment';
import UserDetailsModal from '../component/userdetail';

interface IUser {
  _id: string;
  username: string;
  email: string;
  contactNumber: string;
  role: string;
  shiftStart: string;
  shiftEnd: string;
  address: string;
  gender: string;
  isAvailable: boolean;
  profilePicture?: File | null | string;
  lastUpdated: string;
  deleted?: boolean;
}
export default function UserList() {
  const reduxUser = useSelector((state: RootState) => state.user);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [deleted, setDeleted] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false)

  const { data, isLoading, refetch } = useGetAllUsers(page, limit, search, role, deleted);
  const deleteUser = useDeleteUser();

  useEffect(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleDeleteUser = async (userId: string, deleted: boolean) => {
    try {
      const deletedStatus = await deleteUser.mutateAsync({ userId, deleted });
      if (deletedStatus) {
        showSuccessToast('User Status Changed Successfully');
        refetch();
      } else {
        showErrorToast('Failed to Change Status');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      showErrorToast('Failed to Change Status');
    }
  };

  const columns: ColumnDef<IUser>[] = useMemo(() => [
    { accessorKey: 'username', header: 'Username' },
    { accessorKey: 'email', header: 'Email' },
    { accessorKey: 'role', header: 'Role' },
    {
      accessorKey: 'isAvailable',
      header: 'Available',
      cell: ({ getValue }) => (getValue() ? 'Yes' : 'No'),
    },
    {
      accessorKey: 'lastUpdated',
      header: 'Last Updated',
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return moment(value).format('DD MMM YYYY, hh:mm A');
      },
    },
    {
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-3">
          <button
            onClick={() => {
              setSelectedUser(row.original);
              setModalOpen(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Edit
          </button>
          <button
            onClick={() => handleDeleteUser(row.original._id, !row.original.deleted)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {row.original.deleted ? 'Enable' : 'Disable'}
          </button>
        </div>
      ),
    },
  ], []);

  return (
    <>
      {(reduxUser.role !== "Admin") ? (
        <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-indigo-700 mb-6 border-b pb-2">My Profile</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-gray-700">
            <div><span className="font-semibold">Email:</span> {reduxUser.email}</div>
            <div><span className="font-semibold">Role:</span> {reduxUser.role}</div>
            <div><span className="font-semibold">Joining Date:</span> {moment(reduxUser.createdAt).format('DD MMM YYYY, hh:mm A')}</div>
          </div>

          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={() => {
                setSelectedUser(reduxUser);
                setModalOpen(true);
              }}
              className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg shadow-lg hover:bg-blue-700 transition duration-200"
            >
              Edit Profile
            </button>
          </div>

          <RegisterFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setModalOpen(false);
              refetch();
            }}
            user={{ ...reduxUser, password: '', shift: `${reduxUser.shiftStart} - ${reduxUser.shiftEnd}` }}
            mode="edit"
          />
          <UserDetailsModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            mode="edit"
            userData={reduxUser}
          />
        </div>
      ) : (
        <div className="p-6 max-w-screen-xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">User List</h2>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <select
                value={role}
                onChange={e => {
                  setRole(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option value="">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Researchers">Researchers</option>
                <option value="Patient">Patient</option>
              </select>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition duration-200"
              >
                Add User
              </button>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={deleted}
                  onChange={e => {
                    setDeleted(e.target.checked);
                    setPage(1);
                    refetch();
                  }}
                  className="w-4 h-4 accent-red-500"
                />
                Show Deleted Users
              </label>
            </div>

            <CommonTable
              columns={columns}
              data={data?.data || []}
              total={data?.total || 0}
              isLoading={isLoading}
              exportFileName="User_List"
              page={page}
              limit={limit}
              search={search}
              sortBy={undefined}
              order={undefined}
              onPageChange={setPage}
              onLimitChange={() => { }}
              onSearchChange={setSearchInput}
            />
          </div>

          <RegisterFormModal
            isOpen={isModalOpen}
            onClose={() => {
              setModalOpen(false);
              refetch();
            }}
            user={selectedUser ? { ...selectedUser, password: '', shift: `${selectedUser.shiftStart} - ${selectedUser.shiftEnd}` } : undefined}
            mode={selectedUser ? 'edit' : 'add'}
          />
        </div>
      )}
    </>
  );
}
