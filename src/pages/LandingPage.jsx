import { BookOpen, GraduationCap, User, HelpCircle, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <img src="/icon1.png" alt="Logo Taruna Bhakti" className="w-10 h-10 md:w-11 md:h-11" />
              <div>
                <h1 className="text-sm md:text-base font-semibold text-gray-900">PPSD Taruna Bhakti</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Portal Perpustakaan Sekolah Digital</p>
              </div>
            </div>
            
            {/* Header Actions - White Button */}
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-md text-xs sm:text-sm text-gray-700 hover:bg-gray-100 font-medium transition-all"
            >
              <LogIn size={16} />
              Masuk
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-4">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              Portal Resmi Perputakaan Sekolah Digital Taruna Bhakti
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 leading-tight">
              Portal Perpustakaan Digital
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
             Kelola peminjaman buku perpustakaan sekolah dengan sistem digital yang mudah, cepat, dan efisien.
            </p>
          </div>

          {/* Auth Links */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-gray-600">
              <span>
                Belum punya akun?{" "}
                <button
                  onClick={() => navigate('/portal/register')}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                >
                  Daftar di sini
                </button>
              </span>
              <span className="hidden sm:inline text-gray-400">|</span>
              <span>
                Sudah punya akun?{" "}
                <button
                  onClick={() => navigate('/login')}
                  className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                >
                  Masuk di sini
                </button>
              </span>
            </div>
          </div>

          {/* Stats Section - Smaller Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mb-8 sm:mb-10">
            {/* Card 1 */}
            <div className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md p-4 text-center transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-100 transition-colors">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">1000+</p>
              <p className="text-xs text-gray-600 font-medium">Koleksi Buku</p>
            </div>

            {/* Card 2 */}
            <div className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md p-4 text-center transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-100 transition-colors">
                <GraduationCap className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">500+</p>
              <p className="text-xs text-gray-600 font-medium">Siswa Aktif</p>
            </div>

            {/* Card 3 */}
            <div className="group bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md p-4 text-center transition-all duration-300 hover:-translate-y-0.5">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:bg-blue-100 transition-colors">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">50+</p>
              <p className="text-xs text-gray-600 font-medium">Staff</p>
            </div>
          </div>

          {/* Help Card - White Background */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 sm:p-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <HelpCircle className="text-blue-600" size={22} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">Butuh Bantuan?</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 max-w-xl mx-auto leading-relaxed">
                  Jika Anda mengalami kendala saat melakukan akses sistem, silakan kunjungi pusat bantuan atau hubungi layanan helpdesk kami.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
                  <a 
                    href="#faq" 
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                  >
                    Lihat FAQ
                  </a>
                  <span className="hidden sm:inline text-gray-400">|</span>
                  <a 
                    href="#helpdesk" 
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                  >
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
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <p className="text-center text-xs sm:text-sm text-gray-600">
            © 2025 SMK Taruna Bhakti. Portal Perpustakaan Sekolah Digital (PPSD).
          </p>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;