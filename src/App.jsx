function App() {
  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-2xl text-center">
        <h1 className="text-3xl font-bold text-slate-800">PSPD Taruna Bhakti</h1>
        <p className="text-gray-500 mt-2">Tailwind v4 Berhasil Dipasang!</p>
        <div className="mt-6 flex gap-3 justify-center">
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">Portal Siswa</button>
          <button className="bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold">Portal Staff</button>
        </div>
      </div>
    </div>
  )
}

export default App