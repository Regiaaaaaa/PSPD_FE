const DeleteModal = ({ isOpen, onClose, onConfirm, itemName, itemType = 'item' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Konfirmasi Hapus {itemType}</h3>
        <p className="py-4">
          Apakah Anda yakin ingin menghapus {itemType} <strong>{itemName}</strong>?
        </p>
        <p className="text-error text-sm mb-4">
          ⚠️ Tindakan ini tidak dapat dibatalkan!
        </p>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            Batal
          </button>
          <button className="btn btn-error" onClick={onConfirm}>
            Ya, Hapus
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default DeleteModal;