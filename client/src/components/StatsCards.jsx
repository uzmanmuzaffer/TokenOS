function StatsCards() {
  const stats = [
    {
      title: "Toplam Token",
      value: "1,245"
    },
    {
      title: "Aktif Zincir",
      value: "12"
    },
    {
      title: "24s Hacim",
      value: "$45.8M"
    },
    {
      title: "AI Skor",
      value: "98%"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
      {stats.map((item, index) => (
        <div
          key={index}
          className="bg-gray-900 border border-gray-800 rounded-xl p-5"
        >
          <p className="text-gray-400 text-sm">
            {item.title}
          </p>

          <h2 className="text-2xl text-white font-bold mt-2">
            {item.value}
          </h2>
        </div>
      ))}
    </div>
  );
}

export default StatsCards;