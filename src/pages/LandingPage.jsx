import { User, ShieldCheck, GraduationCap, ArrowRight, HelpCircle } from 'lucide-react';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <img src="/icon1.png" alt="Logo Taruna Bhakti" className="w-10 h-10 md:w-11 md:h-11" />
            <div>
              <h1 className="text-sm md:text-base font-semibold text-gray-900">PSPD Taruna Bhakti</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Portal Sistem Perpustakaan Digital</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16 max-w-3xl mx-auto">
            <div className="inline-block bg-blue-50 text-blue-600 px-3 md:px-4 py-1.5 rounded-full text-xs md:text-sm mb-4 md:mb-6">
              Portal Sistem Perpustakaan Digital Taruna Bhakti
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-5 leading-tight px-4">
              Portal Perpustakaan Digital
            </h1>
            <p className="text-base md:text-lg text-gray-600 leading-relaxed px-4">
              Silakan pilih jenis akun yang sesuai dengan peran Anda untuk memulai proses<br className="hidden md:block" />
              akses sistem perpustakaan digital.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 max-w-5xl mx-auto mb-12">
            
            {/* Card Siswa */}
            <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 h-full">
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <GraduationCap className="text-blue-600" size={24} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Siswa</h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Untuk peserta didik yang ingin mengakses katalog buku dan melakukan peminjaman.
                </p>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
                  Masuk Akun Siswa
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Card Staff */}
            <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 h-full">
              <div className="p-6">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheck className="text-gray-700" size={24} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Petugas</h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Untuk pihak petugas yang akan mengelola data katalog dan sirkulasi perpustakaan.
                </p>
                <button className="w-full bg-gray-700 hover:bg-gray-800 text-white py-2.5 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
                  Masuk Akun Petugas
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Card Staff */}
            <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200 h-full">
              <div className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <User className="text-green-600" size={24} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Staff</h2>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Untuk guru, staff administrasi, dan seluruh warga sekolah lainnya.
                </p>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-md font-semibold transition-colors flex items-center justify-center gap-2 text-sm">
                  Masuk Akun Staff
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

          </div>

          {/* Help Card */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-md border border-gray-200 p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="text-blue-600" size={24} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">Butuh Bantuan?</h3>
                <p className="text-sm text-gray-600 mb-4 max-w-xl mx-auto">
                  Jika Anda mengalami kendala saat melakukan akses sistem, silakan kunjungi pusat bantuan atau hubungi layanan helpdesk kami.
                </p>
                <div className="flex items-center justify-center gap-3 text-sm">
                  <a href="#faq" className="text-blue-600 hover:text-blue-700 font-medium">
                    Lihat FAQ
                  </a>
                  <span className="text-gray-300">|</span>
                  <a href="#helpdesk" className="text-blue-600 hover:text-blue-700 font-medium">
                    Hubungi Helpdesk
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="container mx-auto px-4 md:px-6 py-4 md:py-5">
          <p className="text-center text-xs md:text-sm text-gray-600">
            © 2025 SMA Taruna Bhakti. Portal Sistem Perpustakaan Digital (PSPD).
          </p>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;