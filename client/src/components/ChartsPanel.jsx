import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";


const priceData = [
  { day: "Mon", price: 62000 },
  { day: "Tue", price: 63500 },
  { day: "Wed", price: 62800 },
  { day: "Thu", price: 65400 },
  { day: "Fri", price: 67100 },
  { day: "Sat", price: 66500 },
  { day: "Sun", price: 68900 },
];


const volumeData = [
  { day: "Mon", volume: 40 },
  { day: "Tue", volume: 55 },
  { day: "Wed", volume: 48 },
  { day: "Thu", volume: 70 },
  { day: "Fri", volume: 85 },
];


const chainData = [
  {
    name: "Ethereum",
    value: 45,
  },
  {
    name: "Base",
    value: 25,
  },
  {
    name: "Solana",
    value: 20,
  },
  {
    name: "BNB",
    value: 10,
  },
];


const COLORS = [
  "#22d3ee",
  "#818cf8",
  "#34d399",
  "#fb923c",
];


function ChartsPanel() {

  return (

    <section className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">


      {/* Price Chart */}

      <div className="
      xl:col-span-2
      bg-slate-900/80
      border
      border-slate-800
      rounded-2xl
      p-6">

        <h2 className="text-white font-bold text-xl mb-5">
          Market Trend
        </h2>


        <ResponsiveContainer width="100%" height={300}>

          <LineChart data={priceData}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="price"
              stroke="#22d3ee"
              strokeWidth={3}
            />

          </LineChart>

        </ResponsiveContainer>


      </div>




      {/* Volume */}

      <div className="
      bg-slate-900/80
      border
      border-slate-800
      rounded-2xl
      p-6">

        <h2 className="text-white font-bold text-xl mb-5">
          Volume
        </h2>


        <ResponsiveContainer width="100%" height={300}>

          <BarChart data={volumeData}>

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="volume"
              fill="#22d3ee"
              radius={[8,8,0,0]}
            />

          </BarChart>


        </ResponsiveContainer>


      </div>




      {/* Chain */}

      <div className="
      bg-slate-900/80
      border
      border-slate-800
      rounded-2xl
      p-6
      xl:col-span-3">

        <h2 className="text-white font-bold text-xl mb-5">
          Chain Distribution
        </h2>


        <ResponsiveContainer width="100%" height={320}>

          <PieChart>

            <Pie
              data={chainData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >

              {chainData.map((entry,index)=>(
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index]}
                />
              ))}

            </Pie>

            <Tooltip />

          </PieChart>


        </ResponsiveContainer>


      </div>


    </section>

  );
}


export default ChartsPanel;