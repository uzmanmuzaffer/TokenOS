import {
  FaCoins,
  FaChartLine,
  FaDatabase,
  FaRobot,
} from "react-icons/fa";

const stats = [
  {
    title: "Total Market Cap",
    value: "$2.45T",
    change: "+3.2%",
    icon: <FaCoins />,
    color: "text-cyan-400",
  },
  {
    title: "24H Volume",
    value: "$89.6B",
    change: "+8.4%",
    icon: <FaChartLine />,
    color: "text-green-400",
  },
  {
    title: "Tracked Tokens",
    value: "1,245",
    change: "+125",
    icon: <FaDatabase />,
    color: "text-purple-400",
  },
  {
    title: "AI Score",
    value: "98%",
    change: "Excellent",
    icon: <FaRobot />,
    color: "text-orange-400",
  },
];


function StatsCards() {
  return (
    <div className="
    grid 
    grid-cols-1 
    sm:grid-cols-2 
    xl:grid-cols-4 
    gap-6">

      {stats.map((item) => (

        <div
          key={item.title}
          className="
          bg-slate-900/80
          border border-slate-800
          rounded-2xl
          p-6
          hover:border-cyan-500/40
          transition-all
          duration-300
          hover:-translate-y-1"
        >

          <div className="
          flex 
          justify-between 
          items-start">

            <div>

              <p className="text-sm text-slate-400">
                {item.title}
              </p>

              <h2 className="text-3xl font-bold text-white mt-3">
                {item.value}
              </h2>

              <p className="
              text-sm 
              text-green-400 
              mt-2">
                {item.change}
              </p>

            </div>


            <div className={`
              text-3xl
              ${item.color}
              bg-slate-800
              p-3
              rounded-xl
            `}>
              {item.icon}
            </div>

          </div>

        </div>

      ))}

    </div>
  );
}

export default StatsCards;