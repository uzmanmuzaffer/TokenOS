import { useState } from "react";

function SearchBar() {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();

    console.log("Token search:", search);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="w-full flex gap-3 mt-6"
    >
      <input
        type="text"
        placeholder="Token ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700 outline-none focus:border-blue-500"
      />

      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
      >
        Ara
      </button>
    </form>
  );
}

export default SearchBar;