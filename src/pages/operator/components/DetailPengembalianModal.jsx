import { CheckCircle, X, AlertTriangle, Clock } from 'lucide-react';

const DetailPengembalianModal = ({
  isOpen,
  onClose,
  transaksi: t,
  onTerima,
  loadingTerima,
  isLate,
  hitungSelisihHari,
  getNamaPeminjam,
  formatDate,
  activeTab,
}) => {
  if (!isOpen || !t) return null;

  const terlambat = isLate(t.tgl_deadline);
  const selisihHari = terlambat ? hitungSelisihHari(t.tgl_deadline) : 0;
  const estimasiDenda = selisihHari * 1000;

  const Row = ({ label, value, valueClass = '' }) => (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-xs font-medium text-gray-700 text-right ${valueClass}`}>{value}</span>
    </div>
  );

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-sm p-0 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-bold text-sm text-gray-800">Detail Pengembalian</h3>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">

          {/* Status Banner */}
          {terlambat ? (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-red-700">Terlambat {selisihHari} hari</p>
                <p className="text-xs text-red-500">Estimasi denda: <span className="font-bold">Rp {estimasiDenda.toLocaleString('id-ID')}</span></p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <Clock size={15} className="text-yellow-500 flex-shrink-0" />
              <p className="text-xs font-medium text-yellow-700">Sedang Dipinjam</p>
            </div>
          )}

          {/* Info Peminjam */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Peminjam</p>
            <div className="bg-gray-50 rounded-lg px-3 py-1">
              <Row label="Nama" value={getNamaPeminjam(t.user)} />
              <Row
                label={activeTab === 'siswa' ? 'NIS' : 'NIP'}
                value={activeTab === 'siswa' ? t.user?.siswa?.nomor_induk_siswa || '-' : t.user?.staff?.nomor_induk_pegawai || '-'}
              />
              {activeTab === 'siswa' && (
                <Row label="Kelas" value={t.user?.siswa ? `${t.user.siswa.tingkat} ${t.user.siswa.jurusan} ${t.user.siswa.kelas}` : '-'} />
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
              <Row label="Jumlah" value={`${t.jumlah} buku`} />
            </div>
          </div>

          {/* Info Tanggal */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tanggal</p>
            <div className="bg-gray-50 rounded-lg px-3 py-1">
              <Row label="Tgl Pinjam" value={formatDate(t.tgl_pinjam)} />
              <Row
                label="Deadline"
                value={formatDate(t.tgl_deadline)}
                valueClass={terlambat ? 'text-red-600' : ''}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Tutup</button>
          <button
            className="btn btn-sm bg-green-600 hover:bg-green-700 text-white border-none gap-1"
            onClick={() => onTerima(t)}
            disabled={loadingTerima === t.id}
            title="Terima Pengembalian"
          >
            {loadingTerima === t.id
              ? <span className="loading loading-spinner loading-xs"></span>
              : <CheckCircle size={15} />
            }
            Terima
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default DetailPengembalianModal;