import { useState } from "react";

function PremiumButton({ onClick }) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (onClick) {
        await onClick();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`rounded-lg px-4 py-2 font-semibold transition-all duration-200 ${
        loading
          ? "cursor-not-allowed bg-gray-400 text-white"
          : "bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:scale-105 hover:shadow-lg"
      }`}
    >
      {loading ? "⏳ Processing..." : "👑 Premium"}
    </button>
  );
}

export default PremiumButton;