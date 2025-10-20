export function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-3 px-4 shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <img src="/caddy.png" alt="Disc Caddy" className="w-10 h-10" />
          <h1 className="text-xl md:text-2xl font-bold">
            Disc Caddy
          </h1>
        </div>
      </div>
    </header>
  );
}
