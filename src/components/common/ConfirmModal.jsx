const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Konfirmasi",
  message,
  confirmText = "Ya",
  cancelText = "Batal",
  type = "warning"
}) => {
  
  const getButtonClass = () => {
    switch(type) {
      case 'error': return 'btn-error';
      case 'warning': return 'btn-warning';
      case 'success': return 'btn-success';
      case 'info': return 'btn-info';
      default: return 'btn-primary';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">{title}</h3>
        <div className="py-4">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>
        <div className="modal-action">
          <button className="btn btn-ghost" onClick={onClose}>
            {cancelText}
          </button>
          <button className={`btn ${getButtonClass()}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default ConfirmModal;