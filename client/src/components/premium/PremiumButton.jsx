function PremiumButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 font-semibold text-black transition hover:scale-105"
    >
      👑 Premium
    </button>
  );
}

export default PremiumButton;