import React from 'react';
import {
  ShoppingCart, X, BookOpen, Trash2, Info,
  AlertTriangle, ArrowRight, Calendar, FileText,
} from 'lucide-react';

const KeranjangDrawer = ({
  showDrawer,
  setShowDrawer,
  cart,
  removeFromCart,
  tglDeadline,
  setTglDeadline,
  kepentingan,
  setKepentingan,
  submitLoading,
  handleSubmitKeranjang,
  cannotBorrow,
  hasPinjamanAktif,
  isBlocked,
  isBukuTelat,
  dendaInfo,
  pinjamanMenunggu,
  pinjamanDipinjam,
  formatRupiah,
  getCoverUrl,
  todayStr,

}) => {
  const readyToSubmit = cart.length > 0 && !!tglDeadline;

  return (
    <>
      {/* Backdrop */}
      {showDrawer && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-[1000]"
          onClick={() => setShowDrawer(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-[1001] flex flex-col
          transition-transform duration-300 ease-in-out
          ${showDrawer ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ boxShadow: '-8px 0 40px rgba(0,0,0,0.08)' }}
      >

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
              <ShoppingCart size={15} className="text-blue-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm leading-tight">Keranjang</h2>
              <p className="text-xs text-gray-400 leading-tight">
                {cart.length === 0 ? 'Kosong' : `${cart.length} dari 3 buku`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowDrawer(false)}
            className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Thin progress bar */}
        {cart.length > 0 && (
          <div className="px-5 mb-1">
            <div className="h-0.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${(cart.length / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="w-full h-px bg-gray-100" />

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 min-h-0">

          {/* Empty state */}
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center pb-16">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <ShoppingCart size={22} className="text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-400">Belum ada buku</p>
              <p className="text-xs text-gray-300 mt-1">Tambahkan dari katalog</p>
            </div>
          ) : (
            <>
              {/* Daftar buku */}
              <div className="space-y-2">
                {cart.map((item, idx) => {
                  const coverUrl = getCoverUrl(item.cover);
                  return (
                    <div
                      key={item.buku_id}
                      className="flex items-center gap-3 py-2.5 px-3 rounded-2xl bg-gray-50 hover:bg-gray-100/80 transition-colors"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>

                      {/* Cover */}
                      <div className="w-8 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-blue-100 flex items-center justify-center shadow-sm">
                        {coverUrl ? (
                          <img src={coverUrl} alt={item.judul} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen size={14} className="text-blue-400" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.judul}</p>
                        {item.penulis && (
                          <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.penulis}</p>
                        )}
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item.buku_id)}
                        className="w-6 h-6 rounded-full hover:bg-red-100 flex items-center justify-center text-gray-300 hover:text-red-400 transition-all flex-shrink-0"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
              {cart.length < 3 && (
                <p className="text-xs text-gray-400 text-center">
                  Bisa tambah {3 - cart.length} buku lagi
                </p>
              )}

              {/* Form Detail Peminjaman */}
              <div className="space-y-4 pt-1">

                {/* Tanggal kembali */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
                    <Calendar size={12} className="text-gray-400" />
                    Tanggal Pengembalian
                    <span className="text-red-400 ml-0.5">*</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={tglDeadline}
                    onChange={(e) => setTglDeadline(e.target.value)}
                    className="input input-bordered input-sm w-full bg-white text-sm focus:border-blue-400 focus:outline-none"
                    style={{ borderRadius: '12px' }}
                  />
                  <p className="text-xs text-gray-400 mt-1.5 ml-0.5">
                    Berlaku untuk semua buku
                  </p>
                </div>

                {/* Kepentingan */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-2">
                    <FileText size={12} className="text-gray-400" />
                    Kepentingan
                    <span className="text-gray-400 font-normal ml-0.5">(opsional)</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Misal: untuk tugas penelitian..."
                    value={kepentingan}
                    onChange={(e) => setKepentingan(e.target.value)}
                    className="textarea textarea-bordered textarea-sm w-full bg-white text-sm resize-none focus:border-blue-400 focus:outline-none"
                    style={{ borderRadius: '12px' }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 pb-5 pt-3 space-y-3 bg-white">
            <div className="w-full h-px bg-gray-100" />
            {hasPinjamanAktif && (
              <div className="flex items-start gap-2 py-2.5 px-3.5 bg-blue-50 rounded-xl">
                <Info size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-600 leading-relaxed">
                  {pinjamanMenunggu.length > 0 && pinjamanDipinjam.length === 0
                    ? 'Ada pengajuan yang sedang menunggu verifikasi operator.'
                    : 'Kembalikan semua buku yang dipinjam terlebih dahulu.'}
                </p>
              </div>
            )}
            {isBlocked && !hasPinjamanAktif && (
              <div className="flex items-start gap-2 py-2.5 px-3.5 bg-amber-50 rounded-xl">
                <AlertTriangle size={12} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-600 leading-relaxed">
                  {isBukuTelat
                    ? 'Kembalikan buku yang telat sebelum meminjam lagi.'
                    : <>Selesaikan denda <span className="font-semibold">{formatRupiah(dendaInfo?.denda?.nominal)}</span> terlebih dahulu.</>}
                </p>
              </div>
            )}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{cart.length} buku dipilih</span>
              <span className={tglDeadline ? 'text-emerald-600 font-semibold' : 'text-amber-500'}>
                {tglDeadline
                  ? `Kembali ${new Date(tglDeadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : 'Tanggal belum diisi'}
              </span>
            </div>

            {/* Submit button */}
            <button
              onClick={handleSubmitKeranjang}
              disabled={submitLoading || cannotBorrow || !readyToSubmit}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all duration-200
                ${submitLoading || cannotBorrow || !readyToSubmit
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98] shadow-sm shadow-blue-200'
                }`}
            >
              {submitLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs" />
                  Mengajukan...
                </>
              ) : hasPinjamanAktif ? (
                'Ada Peminjaman Aktif'
              ) : (
                <>
                  Ajukan {cart.length} Peminjaman
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default KeranjangDrawer;