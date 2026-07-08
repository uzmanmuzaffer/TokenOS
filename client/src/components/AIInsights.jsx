import {
  FaRobot,
  FaChartLine,
  FaExclamationTriangle,
  FaWater,
} from "react-icons/fa";


const insights = [
  {
    title: "AI Market Score",
    value: "98%",
    description: "Market conditions are strong",
    icon: <FaRobot />,
    color: "text-cyan-400",
  },
  {
    title: "Market Sentiment",
    value: "Bullish",
    description: "Positive momentum detected",
    icon: <FaChartLine />,
    color: "text-green-400",
  },
  {
    title: "Risk Detection",
    value: "Low",
    description: "No critical threats found",
    icon: <FaExclamationTriangle />,
    color: "text-yellow-400",
  },
  {
    title: "Whale Activity",
    value: "Normal",
    description: "No unusual movements",
    icon: <FaWater />,
    color: "text-purple-400",
  },
];


function AIInsights() {

  return (

    <section className="mt-8">

      <div className="
      bg-slate-900/80
      border
      border-slate-800
      rounded-2xl
      p-6">


        <div className="flex items-center gap-3 mb-6">

          <FaRobot className="
          text-cyan-400
          text-2xl"
          />

          <div>

            <h2 className="
            text-xl
            font-bold
            text-white">

              AI Intelligence Center

            </h2>


            <p className="
            text-sm
            text-slate-400">

              Machine learning powered market analysis

            </p>

          </div>

        </div>



        <div className="
        grid
        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4
        gap-5">


          {insights.map((item)=>(

            <div
            key={item.title}
            className="
            bg-slate-950
            border
            border-slate-800
            rounded-xl
            p-5
            hover:border-cyan-500/40
            transition"
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


                  <h3 className={`
                  text-2xl
                  font-bold
                  mt-3
                  ${item.color}`}>

                    {item.value}

                  </h3>


                </div>


                <div className={`
                text-2xl
                ${item.color}
                bg-slate-800
                p-3
                rounded-xl`}>

                  {item.icon}

                </div>


              </div>


              <p className="
              text-xs
              text-slate-500
              mt-4">

                {item.description}

              </p>


            </div>

          ))}


        </div>


      </div>


    </section>

  );

}


export default AIInsights;