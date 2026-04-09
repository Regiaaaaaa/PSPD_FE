import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Pencil, RotateCcw, Trash2, Users } from 'lucide-react';
import { getAllUsers, deleteUser, resetPasswordUser } from '../../../services/admin/manageuserService';
import AppLayout from '../../../components/AppLayout';
import CreateUserModal from './components/CreateUserModal';
import EditUserModal from './components/EditUserModal';
import DeleteModal from '../../../components/common/DeleteModal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import Pagination from '../../../components/common/Pagination';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState('operator');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTingkat, setFilterTingkat] = useState('all');
  const [filterJurusan, setFilterJurusan] = useState('all');
  const [filterKelas, setFilterKelas] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    setSearchTerm('');
    setFilterTingkat('all');
    setFilterJurusan('all');
    setFilterKelas('all');
  }, [activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data.data);
    } catch (error) {
      toast.error(error || 'Gagal memuat data user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => setShowCreateModal(true);
  const handleEdit = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteUser(selectedUser.id);
      toast.success('User berhasil dihapus');
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      toast.error(error || 'Gagal menghapus user');
    }
  };

  const handleResetClick = (user) => {
    setSelectedUser(user);
    setShowResetModal(true);
  };

  const handleResetPassword = async () => {
    try {
      const result = await resetPasswordUser(selectedUser.id);
      toast.success(`Password direset! ${result.default_password}`);
      setShowResetModal(false);
    } catch (error) {
      toast.error(error || 'Gagal reset password');
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
    if (shouldRefresh) fetchUsers();
  };

  const resetFilters = () => {
    setFilterTingkat('all');
    setFilterJurusan('all');
    setFilterKelas('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // ✅ hasActiveFilter di luar filter(), bukan di dalam
  const hasActiveFilter = searchTerm || filterTingkat !== 'all' || filterJurusan !== 'all' || filterKelas !== 'all';

  const filteredUsers = users
    .filter(user => user.role === activeTab)
    .filter(user => {
      const matchSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (activeTab !== 'siswa') return matchSearch;

      const matchTingkat = filterTingkat === 'all' || user.siswa?.tingkat === filterTingkat;
      const matchJurusan = filterJurusan === 'all' || user.siswa?.jurusan === filterJurusan;
      const matchKelas = filterKelas === 'all' || user.siswa?.kelas?.toString() === filterKelas;

      return matchSearch && matchTingkat && matchJurusan && matchKelas;
    });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kelola User</h1>
            <p className="text-sm text-gray-500 mt-1">Manage user operator, staff, dan siswa</p>
          </div>
          <button
            className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm hover:shadow-md transition-all"
            onClick={handleCreate}
          >
            + Tambah User
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" className="tabs tabs-lift tabs-sm mb-6">
          <a role="tab" className={`tab ${activeTab === 'operator' ? 'tab-active [--tab-bg:#dbeafe] [--tab-color:#1e40af]' : ''}`} onClick={() => setActiveTab('operator')}>
            Operator
          </a>
          <a role="tab" className={`tab ${activeTab === 'staff' ? 'tab-active [--tab-bg:#dbeafe] [--tab-color:#1e40af]' : ''}`} onClick={() => setActiveTab('staff')}>
            Staff
          </a>
          <a role="tab" className={`tab ${activeTab === 'siswa' ? 'tab-active [--tab-bg:#dbeafe] [--tab-color:#1e40af]' : ''}`} onClick={() => setActiveTab('siswa')}>
            Siswa
          </a>
        </div>

        {/* Filter Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tingkat</label>
                <select
                  className="select select-bordered bg-white w-full"
                  value={filterTingkat}
                  onChange={(e) => setFilterTingkat(e.target.value)}
                  disabled={activeTab !== 'siswa'}
                >
                  <option value="all">Semua Tingkat</option>
                  <option value="X">X</option>
                  <option value="XI">XI</option>
                  <option value="XII">XII</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Jurusan</label>
                <select
                  className="select select-bordered bg-white w-full"
                  value={filterJurusan}
                  onChange={(e) => setFilterJurusan(e.target.value)}
                  disabled={activeTab !== 'siswa'}
                >
                  <option value="all">Semua Jurusan</option>
                  <option value="RPL">RPL</option>
                  <option value="ANIMASI">ANIMASI</option>
                  <option value="TJKT">TJKT</option>
                  <option value="TE">TE</option>
                  <option value="PSPT">PSPT</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kelas</label>
                <select
                  className="select select-bordered bg-white w-full"
                  value={filterKelas}
                  onChange={(e) => setFilterKelas(e.target.value)}
                  disabled={activeTab !== 'siswa'}
                >
                  <option value="all">Semua Kelas</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>
            </div>

            <div>
              <button
                className="btn btn-ghost border border-gray-300 hover:bg-gray-50"
                onClick={resetFilters}
                disabled={activeTab !== 'siswa'}
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Pagination({
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: filteredUsers.length,
            searchTerm,
            onPageChange: goToPage,
            onItemsPerPageChange: (value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            },
            onSearchChange: setSearchTerm,
          }).TopControls()}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-gray-400">
              <Users size={40} className="mb-2 opacity-40" />
              <p className="text-sm">
                {hasActiveFilter ? 'Tidak ada user yang ditemukan' : 'Belum ada data user'}
              </p>
              {hasActiveFilter && (
                <button className="btn btn-ghost btn-sm mt-2 text-blue-600" onClick={resetFilters}>
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-white border-b-2 border-gray-200">
                      <th className="w-16 font-semibold text-gray-700">No</th>
                      <th className="font-semibold text-gray-700">Nama</th>
                      <th className="font-semibold text-gray-700">Email</th>
                      <th className="w-32 font-semibold text-gray-700">Role</th>
                      {activeTab !== 'operator' && <th className="font-semibold text-gray-700">Info</th>}
                      <th className="w-32 text-center font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user, index) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150">
                        <td>{startIndex + index + 1}</td>
                        <td className="font-medium">{user.name}</td>
                        <td className="text-gray-600">{user.email}</td>
                        <td>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            user.role === 'operator' ? 'bg-blue-100 text-blue-700' :
                            user.role === 'staff' ? 'bg-green-100 text-green-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        {activeTab === 'siswa' && (
                          <td>
                            {user.siswa && (
                              <div className="text-sm">
                                <div className="text-gray-600">NIS: {user.siswa.nomor_induk_siswa}</div>
                                <div className="text-gray-500">{user.siswa.tingkat} {user.siswa.jurusan} {user.siswa.kelas}</div>
                              </div>
                            )}
                          </td>
                        )}
                        {activeTab === 'staff' && (
                          <td>
                            {user.staff && (
                              <div className="text-sm">
                                <div className="text-gray-600">NIP: {user.staff.nomor_induk_pegawai || '-'}</div>
                                <div className="text-gray-500">{user.staff.jabatan}</div>
                              </div>
                            )}
                          </td>
                        )}
                        <td>
                          <div className="flex gap-2 justify-center">
                            <button className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50" onClick={() => handleEdit(user)} title="Edit">
                              <Pencil size={16} />
                            </button>
                            <button className="btn btn-ghost btn-xs text-orange-600 hover:bg-orange-50" onClick={() => handleResetClick(user)} title="Reset Password">
                              <RotateCcw size={16} />
                            </button>
                            <button className="btn btn-ghost btn-xs text-red-600 hover:bg-red-50" onClick={() => handleDeleteClick(user)} title="Hapus">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {Pagination({
                currentPage,
                totalPages,
                itemsPerPage,
                totalItems: filteredUsers.length,
                searchTerm,
                onPageChange: goToPage,
                onItemsPerPageChange: (value) => {
                  setItemsPerPage(value);
                  setCurrentPage(1);
                },
                onSearchChange: setSearchTerm,
              }).BottomControls()}
            </>
          )}
        </div>

        {/* Modals */}
        {showCreateModal && <CreateUserModal isOpen={showCreateModal} onClose={handleModalClose} defaultRole={activeTab} />}
        {showEditModal && <EditUserModal isOpen={showEditModal} onClose={handleModalClose} user={selectedUser} />}
        {showDeleteModal && (
          <DeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            itemName={selectedUser?.name}
            itemType="user"
          />
        )}
        {showResetModal && (
          <ConfirmModal
            isOpen={showResetModal}
            onClose={() => setShowResetModal(false)}
            onConfirm={handleResetPassword}
            title="Konfirmasi Reset Password"
            message={
              <>
                <p className="mb-4">Apakah Anda yakin ingin mereset password user <strong>{selectedUser?.name}</strong>?</p>
                <div className="alert alert-warning">
                  <span className="text-sm">Password akan direset ke: <strong>smktb123</strong></span>
                </div>
              </>
            }
            confirmText="Ya, Reset"
            type="warning"
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ManageUsers;