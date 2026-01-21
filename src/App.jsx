import { User, ShieldCheck, GraduationCap } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-blue-900">PSPD Taruna Bhakti</h1>
        <p className="text-slate-500 mt-2 text-lg">Perpustakaan Sekolah Digital Terpadu</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        
        {/* Card Siswa */}
        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-b-4 border-blue-500 text-center group cursor-pointer">
          <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <GraduationCap className="text-blue-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Portal Siswa</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">Akses buku pelajaran dan riwayat pinjam khusus siswa.</p>
          <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">Masuk</button>
        </div>

        {/* Card Staff */}
        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-b-4 border-slate-800 text-center group cursor-pointer">
          <div className="bg-slate-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <ShieldCheck className="text-slate-800" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Portal Staff</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">Kelola buku dan sirkulasi (Admin & Operator).</p>
          <button className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900 transition-colors">Masuk</button>
        </div>

        {/* Card Umum */}
        <div className="bg-white p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all border-b-4 border-emerald-500 text-center group cursor-pointer">
          <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
            <User className="text-emerald-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Portal Umum</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">Akses untuk Guru, Staf, dan Warga Sekolah lainnya.</p>
          <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors">Masuk</button>
        </div>

      </div>
    </div>
  );
}

export default App;