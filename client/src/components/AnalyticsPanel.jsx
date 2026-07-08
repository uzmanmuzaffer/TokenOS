import {
  FaChartLine,
  FaChartBar,
  FaGlobe,
  FaFire,
} from "react-icons/fa";


const analytics = [
  {
    title: "Market Trend",
    value: "Bullish",
    detail: "+12.5% Momentum",
    icon: <FaChartLine />,
    color: "text-green-400",
  },
  {
    title: "Trading Volume",
    value: "$89.6B",
    detail: "24H Volume",
    icon: <FaChartBar />,
    color: "text-cyan-400",
  },
  {
    title: "Active Chains",
    value: "12",
    detail: "Networks tracked",
    icon: <FaGlobe />,
    color: "text-purple-400",
  },
  {
    title: "Hot Tokens",
    value: "148",
    detail: "Trending assets",
    icon: <FaFire />,
    color: "text-orange-400",
  },
];


function AnalyticsPanel() {

  return (

    <section className="mt-8">

      <div className="
      grid
      grid-cols-1
      md:grid-cols-2
      xl:grid-cols-4
      gap-6">

        {analytics.map((item)=>(

          <div
          key={item.title}
          className="
          bg-slate-900/80
          border
          border-slate-800
          rounded-2xl
          p-6
          hover:border-cyan-500/40
          transition
          hover:-translate-y-1"
          >

            <div className="
            flex
            justify-between
            items-start">

              <div>

                <p className="
                text-sm
                text-slate-400">

                  {item.title}

                </p>


                <h3 className="
                text-3xl
                font-bold
                text-white
                mt-3">

                  {item.value}

                </h3>


                <p className="
                text-sm
                text-slate-500
                mt-2">

                  {item.detail}

                </p>


              </div>


              <div className={`
              text-3xl
              ${item.color}
              bg-slate-800
              p-3
              rounded-xl`}>

                {item.icon}

              </div>


            </div>


          </div>

        ))}

      </div>



      {/* Chart Area */}

      <div className="
      mt-8
      bg-slate-900/80
      border
      border-slate-800
      rounded-2xl
      p-6">

        <h2 className="
        text-xl
        font-bold
        text-white">

          Market Intelligence Chart

        </h2>


        <p className="
        text-slate-400
        mt-2">

          Real-time blockchain analytics visualization

        </p>


        <div className="
        mt-6
        h-72
        rounded-xl
        border-2
        border-dashed
        border-slate-700
        flex
        items-center
        justify-center
        text-slate-500">

          Chart Module Ready

        </div>


      </div>


    </section>

  );

}


export default AnalyticsPanel;