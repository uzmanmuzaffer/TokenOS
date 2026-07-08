import {
  FaSearch,
  FaBolt,
} from "react-icons/fa";


function SearchBar() {
  return (
    <div className="
    w-full
    bg-slate-900/80
    border
    border-slate-800
    rounded-2xl
    p-4
    flex
    flex-col
    md:flex-row
    gap-4
    items-center">

      {/* Search Input */}

      <div className="
      flex
      items-center
      flex-1
      w-full
      bg-slate-950
      border
      border-slate-800
      rounded-xl
      px-4
      py-3">

        <FaSearch
          className="text-slate-500 mr-3"
        />

        <input
          type="text"
          placeholder="Token ara, kontrat adresi veya wallet gir..."
          className="
          bg-transparent
          outline-none
          w-full
          text-white
          placeholder:text-slate-500"
        />

      </div>


      {/* Button */}

      <button
        className="
        w-full
        md:w-auto
        flex
        items-center
        justify-center
        gap-2
        bg-cyan-500
        hover:bg-cyan-400
        text-black
        font-semibold
        px-6
        py-3
        rounded-xl
        transition"
      >

        <FaBolt />

        Analyze

      </button>


    </div>
  );
}


export default SearchBar;