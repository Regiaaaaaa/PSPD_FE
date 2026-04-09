import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Pencil, Trash2, Tag } from 'lucide-react';
import { getAllCategories, deleteCategory } from '../../../services/admin/managecategoryService';
import AppLayout from '../../../components/AppLayout';
import CreateCategoryModal from './components/CreateCategoryModal';
import EditCategoryModal from './components/EditCategoryModal';
import DeleteModal from '../../../components/common/DeleteModal';
import Pagination from '../../../components/common/Pagination';

const ManageCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data.data);
    } catch (error) {
      toast.error(error || 'Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => setShowCreateModal(true);

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteClick = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(selectedCategory.id);
      toast.success('Kategori berhasil dihapus');
      setShowDeleteModal(false);
      fetchCategories();
    } catch (error) {
      toast.error(error || 'Gagal menghapus kategori');
    }
  };

  const handleModalClose = (shouldRefresh) => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedCategory(null);
    if (shouldRefresh) fetchCategories();
  };

  // ✅ hasActiveFilter di level komponen
  const hasActiveFilter = !!searchTerm;

  const resetFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const filteredCategories = categories.filter(category =>
    category.nama_kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kelola Kategori</h1>
            <p className="text-sm text-gray-500 mt-1">Manage kategori buku perpustakaan</p>
          </div>
          <button
            className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-sm hover:shadow-md transition-all"
            onClick={handleCreate}
          >
            + Tambah Kategori
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {Pagination({
            currentPage,
            totalPages,
            itemsPerPage,
            totalItems: filteredCategories.length,
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
          ) : paginatedCategories.length === 0 ? (
            <div className="flex flex-col justify-center items-center py-16 text-gray-400">
              <Tag size={40} className="mb-2 opacity-40" />
              <p className="text-sm">
                {hasActiveFilter ? 'Tidak ada kategori yang ditemukan' : 'Belum ada data kategori'}
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
                      <th className="font-semibold text-gray-700">Nama Kategori</th>
                      <th className="w-32 text-center font-semibold text-gray-700">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCategories.map((category, index) => (
                      <tr
                        key={category.id}
                        className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150"
                      >
                        <td>{startIndex + index + 1}</td>
                        <td className="font-medium">{category.nama_kategori}</td>
                        <td>
                          <div className="flex gap-2 justify-center">
                            <button
                              className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50"
                              onClick={() => handleEdit(category)}
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-red-600 hover:bg-red-50"
                              onClick={() => handleDeleteClick(category)}
                              title="Hapus"
                            >
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
                totalItems: filteredCategories.length,
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
        {showCreateModal && (
          <CreateCategoryModal isOpen={showCreateModal} onClose={handleModalClose} />
        )}
        {showEditModal && (
          <EditCategoryModal isOpen={showEditModal} onClose={handleModalClose} category={selectedCategory} />
        )}
        {showDeleteModal && (
          <DeleteModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDelete}
            itemName={selectedCategory?.nama_kategori}
            itemType="kategori"
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ManageCategory;