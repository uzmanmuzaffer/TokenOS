export default function RiskAnalysis({
  security,
  score,
}) {

  if (!security && !score) return null;


  const riskLevel =
    score?.riskLevel || "UNKNOWN";


  const levelColor =
    riskLevel === "LOW"
      ? "text-green-400"
      : riskLevel === "MEDIUM"
      ? "text-yellow-400"
      : riskLevel === "HIGH"
      ? "text-orange-400"
      : "text-red-400";


  return (

    <div className="mt-8 bg-slate-900 border border-slate-800 rounded-2xl p-6">


      <h3 className="text-xl font-bold text-white mb-6">
        Wallet Security Analysis
      </h3>



      {/* Score */}

      <div className="flex items-center gap-8">


        <div className="text-5xl font-bold text-cyan-400">

          {score?.score ?? 0}

          <span className="text-2xl text-slate-400">
            /100
          </span>

        </div>



        <div>

          <p className="text-slate-400">
            Risk Level
          </p>


          <p className={`text-2xl font-bold ${levelColor}`}>

            {riskLevel}

          </p>

        </div>


      </div>




      {/* Security Stats */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">


        <div className="bg-slate-950 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Stablecoin
          </p>

          <p className="text-xl font-bold text-white">
            {security?.stablecoinRatio ?? 0}%
          </p>

        </div>



        <div className="bg-slate-950 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Dust Tokens
          </p>

          <p className="text-xl font-bold text-white">
            {security?.dustTokens ?? 0}
          </p>

        </div>



        <div className="bg-slate-950 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Suspicious
          </p>

          <p className="text-xl font-bold text-white">
            {security?.suspiciousTokens ?? 0}
          </p>

        </div>



        <div className="bg-slate-950 rounded-xl p-4">

          <p className="text-slate-400 text-sm">
            Largest Holding
          </p>

          <p className="text-xl font-bold text-white">
            {security?.largestHolding ?? 0}%
          </p>

        </div>


      </div>




      {/* Alerts */}

      {security?.alerts?.length > 0 && (

        <div className="mt-8">

          <h4 className="font-semibold text-white mb-3">
            Security Alerts
          </h4>


          <div className="space-y-2">


            {security.alerts.map((alert,index)=>(

              <div
                key={index}
                className="
                  bg-red-950/40
                  border
                  border-red-800
                  rounded-lg
                  p-3
                  text-red-300
                "
              >

                ⚠️ {alert}

              </div>

            ))}


          </div>


        </div>

      )}


    </div>

  );
}