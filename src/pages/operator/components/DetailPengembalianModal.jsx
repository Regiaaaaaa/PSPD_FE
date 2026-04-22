import { useState } from 'react';
import { CheckCircle, X, AlertTriangle, Clock, CheckCheck } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'kembali_normal',      label: 'Kembali Normal' },
  { value: 'kembali_rusak_ringan', label: 'Kembali Rusak Ringan' },
  { value: 'kembali_rusak_sedang', label: 'Kembali Rusak Sedang' },
  { value: 'kembali_rusak_berat',  label: 'Kembali Rusak Berat' },
  { value: 'hilang',               label: 'Hilang' },
];

const formatRupiah = (amount) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(num);
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'kembali_normal':       return { label: 'Kembali Normal',      cls: 'bg-green-100 text-green-700 border-green-200' };
    case 'kembali_rusak_ringan': return { label: 'Rusak Ringan',        cls: 'bg-orange-100 text-orange-700 border-orange-200' };
    case 'kembali_rusak_sedang': return { label: 'Rusak Sedang',        cls: 'bg-orange-100 text-orange-700 border-orange-200' };
    case 'kembali_rusak_berat':  return { label: 'Rusak Berat',         cls: 'bg-red-100 text-red-700 border-red-200' };
    case 'hilang':               return { label: 'Hilang',              cls: 'bg-red-100 text-red-700 border-red-200' };
    default:                     return { label: status,                cls: 'bg-gray-100 text-gray-700 border-gray-200' };
  }
};

const getEstimasiDendaKerusakan = (detail, status) => {
  const buku = detail?.buku;
  if (!buku || status === 'kembali_normal') return 0;
  if (status === 'hilang') return buku.harga_buku || 0;
  const keyMap = {
    'kembali_rusak_ringan': 'persen_rusak_ringan',
    'kembali_rusak_sedang': 'persen_rusak_sedang',
    'kembali_rusak_berat':  'persen_rusak_berat',
  };
  const persen = buku[keyMap[status]];
  if (!persen || !buku.harga_buku) return null;
  return (buku.harga_buku * persen) / 100;
};

const DetailPengembalianModal = ({
  isOpen, onClose, transaksi: t,
  onTerima, onTerimaAll,
  loadingTerima, loadingTerimaAll,
  isLate, hitungSelisihHari,
  getNamaPeminjam, formatDate, activeTab,
}) => {
  const [kondisiPerDetail, setKondisiPerDetail] = useState({});

  if (!isOpen || !t) return null;

  const terlambat = isLate(t.tgl_deadline);
  const selisihHari = terlambat ? hitungSelisihHari(t.tgl_deadline) : 0;
  const activeDetails = (t.details || []).filter(d => d.status === 'dipinjam');
  const returnedDetails = (t.details || []).filter(d => d.status !== 'dipinjam' && d.status !== 'menunggu' && d.status !== 'ditolak' && d.status !== 'dibatalkan');

  const dendaTelat = selisihHari * 1000;
  const estimasiDendaTelat = dendaTelat * activeDetails.length;

  const getKondisi = (detailId) => kondisiPerDetail[detailId] || 'kembali_normal';
  const setKondisi = (detailId, val) => setKondisiPerDetail(prev => ({ ...prev, [detailId]: val }));

  const handleTerimaWithKondisi = (detail) => {
    onTerima(t, detail, getKondisi(detail.id));
  };

  const handleTerimaAllWithKondisi = () => {
    const detailsWithStatus = activeDetails.map(d => ({
      ...d,
      _selectedStatus: getKondisi(d.id),
    }));
    onTerimaAll(t, detailsWithStatus);
  };

  const Row = ({ label, value, valueClass = '' }) => (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-xs font-medium text-gray-700 text-right ${valueClass}`}>{value}</span>
    </div>
  );

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-sm p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-bold text-sm text-gray-800">Detail Pengembalian</h3>
          <button className="btn btn-ghost btn-xs btn-circle" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="px-4 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {terlambat ? (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div className="w-full">
                <p className="text-xs font-semibold text-red-700">Terlambat {selisihHari} hari</p>
                {activeDetails.length > 0 && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {activeDetails.length} buku × {formatRupiah(dendaTelat)} / buku
                  </p>
                )}
                <p className="text-xs font-bold text-red-700 mt-1 pt-1 border-t border-red-200">
                  Total estimasi denda telat: {formatRupiah(estimasiDendaTelat)}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <Clock size={15} className="text-yellow-500 flex-shrink-0" />
              <p className="text-xs font-medium text-yellow-700">Sedang Dipinjam</p>
            </div>
          )}
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
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Tanggal</p>
            <div className="bg-gray-50 rounded-lg px-3 py-1">
              <Row label="Tgl Pinjam" value={formatDate(t.tgl_pinjam)} />
              <Row label="Deadline" value={formatDate(t.tgl_deadline)} valueClass={terlambat ? 'text-red-600' : ''} />
            </div>
          </div>
          {activeDetails.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Belum Dikembalikan ({activeDetails.length})
                </p>
                {activeDetails.length > 1 && (
                  <button
                    className="btn btn-xs bg-green-600 hover:bg-green-700 text-white border-none gap-1"
                    onClick={handleTerimaAllWithKondisi}
                    disabled={loadingTerimaAll || loadingTerima !== null}
                  >
                    {loadingTerimaAll ? <span className="loading loading-spinner loading-xs"></span> : <CheckCheck size={12} />}
                    Terima Semua
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {activeDetails.map((d) => {
                  const kondisi = getKondisi(d.id);
                  const estDendaKerusakan = getEstimasiDendaKerusakan(d, kondisi);
                  return (
                    <div key={d.id} className="bg-gray-50 rounded-lg px-3 py-2.5 space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-800 line-clamp-1">{d.buku?.judul || '-'}</p>
                        {d.buku?.isbn && <p className="text-xs text-gray-400">{d.buku.isbn}</p>}
                        {terlambat && (
                          <p className="text-xs text-red-500 font-medium">Denda telat: {formatRupiah(dendaTelat)}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Kondisi Buku</label>
                        <select
                          className="select select-bordered select-xs bg-white w-full"
                          value={kondisi}
                          onChange={(e) => setKondisi(d.id, e.target.value)}
                          disabled={loadingTerima === d.id || loadingTerimaAll}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {kondisi !== 'kembali_normal' && (
                        <div className="text-xs">
                          {estDendaKerusakan === null ? (
                            <p className="text-orange-600">* Denda dihitung otomatis dari harga buku</p>
                          ) : estDendaKerusakan > 0 ? (
                            <p className="text-orange-600 font-medium">
                              Estimasi denda: {formatRupiah(estDendaKerusakan)}
                            </p>
                          ) : null}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          className="btn btn-xs bg-green-600 hover:bg-green-700 text-white border-none gap-1"
                          onClick={() => handleTerimaWithKondisi(d)}
                          disabled={loadingTerima === d.id || loadingTerimaAll}
                        >
                          {loadingTerima === d.id ? <span className="loading loading-spinner loading-xs"></span> : <CheckCircle size={12} />}
                          Terima
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {returnedDetails.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Sudah Dikembalikan ({returnedDetails.length})
              </p>
              <div className="space-y-2">
                {returnedDetails.map((d) => {
                  const badge = getStatusBadge(d.status);
                  return (
                    <div key={d.id} className="bg-gray-50 rounded-lg px-3 py-2 flex items-start justify-between gap-2 opacity-70">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 line-clamp-1">{d.buku?.judul || '-'}</p>
                        {d.tgl_kembali && (
                          <p className="text-xs text-gray-400">Kembali: {formatDate(d.tgl_kembali)}</p>
                        )}
                        {parseFloat(d.denda_telat) > 0 && (
                          <p className="text-xs text-red-500">Denda telat: {formatRupiah(d.denda_telat)}</p>
                        )}
                        {parseFloat(d.denda_kerusakan) > 0 && (
                          <p className="text-xs text-orange-500">Denda kerusakan: {formatRupiah(d.denda_kerusakan)}</p>
                        )}
                        {parseFloat(d.denda_hilang) > 0 && (
                          <p className="text-xs text-red-500">Denda hilang: {formatRupiah(d.denda_hilang)}</p>
                        )}
                        {parseFloat(d.total_denda_item) > 0 && (
                          <p className="text-xs font-semibold text-gray-700 mt-0.5">Total: {formatRupiah(d.total_denda_item)}</p>
                        )}
                      </div>
                      <span className={`badge badge-xs flex-shrink-0 ${badge.cls}`}>{badge.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Tutup</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
};

export default DetailPengembalianModal;