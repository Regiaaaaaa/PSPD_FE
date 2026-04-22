import { X, CheckCircle, XCircle, BookOpen, AlertCircle, Calendar } from 'lucide-react';

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
  newDeadline,
  setNewDeadline,
  pesanDiterima,
  setPesanDiterima,
}) => {
  if (!isOpen || !t) return null;
  const today = new Date();
  const minDeadlineDate = today.toISOString().split('T')[0];

  const Row = ({ label, value, valueClass = '' }) => (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-xs font-medium text-gray-700 text-right ${valueClass}`}>{value}</span>
    </div>
  );

  const details = t.details || [];
  const allStokOk = details.every(d => (d.buku?.stok_tersedia ?? 0) >= (d.jumlah ?? 1));

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-sm p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-bold text-sm text-gray-800">Detail Verifikasi</h3>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className={`flex items-center gap-2 rounded-lg p-3 border ${
            allStokOk
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            {allStokOk
              ? <BookOpen size={15} className="text-green-500 flex-shrink-0" />
              : <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
            }
            <p className={`text-xs font-semibold ${allStokOk ? 'text-green-600' : 'text-red-700'}`}>
              {allStokOk ? 'Semua Stok Tersedia' : 'Ada Buku dengan Stok Tidak Mencukupi'}
            </p>
          </div>
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
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Buku ({details.length})
            </p>
            <div className="space-y-2">
              {details.length === 0 ? (
                <p className="text-xs text-gray-400 italic px-3">Tidak ada data buku</p>
              ) : (
                details.map((d, i) => {
                  const stokOk = (d.buku?.stok_tersedia ?? 0) >= (d.jumlah ?? 1);
                  return (
                    <div key={i} className="bg-gray-50 rounded-lg px-3 py-1">
                      <Row label="Judul" value={d.buku?.judul || '-'} />
                      <Row label="ISBN" value={d.buku?.isbn || '-'} />
                      <Row label="Jumlah" value={d.jumlah ?? 1} />
                      <Row
                        label="Stok Tersedia"
                        value={d.buku?.stok_tersedia ?? '-'}
                        valueClass={stokOk ? 'text-green-600' : 'text-red-600'}
                      />
                      {d.tgl_deadline && (
                        <Row label="Deadline" value={formatDate(d.tgl_deadline)} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          {t.tgl_deadline && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tanggal</p>
              <div className="bg-gray-50 rounded-lg px-3 py-2 space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-xs text-gray-400 flex-shrink-0">Deadline Awal</span>
                  <span className="text-xs font-medium text-gray-700">{formatDate(t.tgl_deadline)}</span>
                </div>
                {setNewDeadline && (
                  <div className="pt-2 border-t border-gray-200">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">
                      <Calendar size={12} className="text-gray-400" />
                      Ubah Deadline (Opsional)
                    </label>
                    <input
                      type="date"
                      value={newDeadline}
                      onChange={(e) => setNewDeadline(e.target.value)}
                      min={minDeadlineDate}
                      className="input input-bordered input-sm w-full bg-white text-xs focus:border-blue-400 focus:outline-none"
                      style={{ borderRadius: '8px' }}
                    />
                    <p className="text-xs text-gray-400 mt-1">Biarkan kosong untuk menggunakan deadline awal</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Kepentingan</p>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              {t.kepentingan ? (
                <p className="text-xs text-gray-700 leading-relaxed">{t.kepentingan}</p>
              ) : (
                <p className="text-xs text-gray-400 italic">Tidak ada keterangan</p>
              )}
            </div>
          </div>
          {setPesanDiterima && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Pesan Diterima (Opsional)</p>
              <textarea
                className="textarea textarea-bordered w-full text-xs bg-white focus:border-blue-400 focus:outline-none"
                rows={2}
                placeholder="Tuliskan pesan untuk peminjam (opsional)..."
                value={pesanDiterima || ''}
                onChange={(e) => setPesanDiterima(e.target.value)}
                maxLength={255}
              />
              <label className="label pt-1">
                <span className="label-text-alt text-gray-400">{(pesanDiterima || '').length}/255 karakter</span>
              </label>
            </div>
          )}

        </div>
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
            disabled={!allStokOk}
            title={!allStokOk ? 'Ada buku dengan stok tidak mencukupi' : 'Setujui'}
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