function Navbar() {
  return (
    <nav className="w-full bg-black text-white px-6 py-4 flex justify-between items-center border-b border-gray-800">
      <h1 className="text-2xl font-bold">
        🚀 TokenOS
      </h1>

      <div className="flex gap-6 text-gray-300">
        <a href="#" className="hover:text-white">
          Dashboard
        </a>

        <a href="#" className="hover:text-white">
          Tokens
        </a>

        <a href="#" className="hover:text-white">
          Analytics
        </a>
      </div>
    </nav>
  );
}

export default Navbar;