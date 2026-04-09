import { X, CheckCircle, XCircle, BookOpen, AlertCircle } from 'lucide-react';

const DetailVerifikasiModal = ({
  isOpen,
  onClose,
  transaksi: t,
  onApprove,
  onReject,
  getNama,
  getRole,
  getSubInfo,
  getSubInfoLabel,
  formatDate,
  activeTab,
}) => {
  if (!isOpen || !t) return null;

  const Row = ({ label, value, valueClass = '' }) => (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-xs font-medium text-gray-700 text-right ${valueClass}`}>{value}</span>
    </div>
  );

  const stokOk = (t.buku?.stok_tersedia ?? 0) > 0;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-sm p-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-bold text-sm text-gray-800">Detail Verifikasi</h3>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">

             {/* Status Banner — stok */}
          <div className={`flex items-center gap-2 rounded-lg p-3 border ${
            stokOk
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            {stokOk
              ? <BookOpen size={15} className="text-green-500 flex-shrink-0" />
              : <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
            }
            <p className={`text-xs font-semibold ${stokOk ? 'text-green-600' : 'text-red-700'}`}>
              {stokOk ? `Stok Tersedia (${t.buku?.stok_tersedia})` : 'Stok Tidak Mencukupi'}
            </p>
          </div>

          {/* Info Peminjam */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Peminjam</p>
            <div className="bg-gray-50 rounded-lg px-3 py-1">
              <Row label="Nama" value={getNama(t)} />
              <Row
                label={activeTab === 'siswa' ? 'NIS' : 'NIP'}
                value={
                  activeTab === 'siswa'
                    ? t.user?.siswa?.nomor_induk_siswa || '-'
                    : t.user?.staff?.nomor_induk_pegawai || '-'
                }
              />
              {activeTab === 'siswa' && t.user?.siswa && (
                <Row
                  label="Kelas"
                  value={
                    t.user.siswa.tingkat && t.user.siswa.jurusan
                      ? `${t.user.siswa.tingkat} ${t.user.siswa.jurusan} ${t.user.siswa.kelas || ''}`
                      : t.user.siswa.kelas || '-'
                  }
                />
              )}
              {activeTab === 'staff' && t.user?.staff?.jabatan && (
                <Row label="Jabatan" value={t.user.staff.jabatan} />
              )}
            </div>
          </div>

          {/* Info Buku */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Buku</p>
            <div className="bg-gray-50 rounded-lg px-3 py-1">
              <Row label="Judul" value={t.buku?.judul || '-'} />
              <Row label="ISBN" value={t.buku?.isbn || '-'} />
              <Row label="Jumlah" value={`${t.jumlah || 1} buku`} />
            </div>
          </div>

          {/* Info Transaksi */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tanggal</p>
            <div className="bg-gray-50 rounded-lg px-3 py-1">
              <Row label="Deadline" value={formatDate(t.tgl_deadline)} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Tutup</button>
          <button
            className="btn btn-sm btn-error gap-1 text-white"
            onClick={() => onReject(t)}
          >
            <XCircle size={14} />
            Tolak
          </button>
          <button
            className="btn btn-sm btn-success gap-1 text-white"
            onClick={() => onApprove(t)}
            disabled={!stokOk}
            title={!stokOk ? 'Stok tidak mencukupi' : 'Setujui'}
          >
            <CheckCircle size={14} />
            Setujui
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default DetailVerifikasiModal;