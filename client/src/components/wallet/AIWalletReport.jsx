export default function AIWalletReport({ report }) {

  if (!report) return null;


  const score =
    report.risk?.score ??
    report.score?.score ??
    "--";


  const level =
    report.risk?.level ??
    report.score?.riskLevel ??
    "--";


  const tokenCount =
    report.portfolio?.tokenCount ??
    report.portfolio?.totalTokens ??
    0;


  const content =
    report.aiReport ||
    report.report ||
    report.content ||
    "AI report unavailable.";


  const levelColor =
    level === "LOW"
      ? "text-green-400"
      : level === "MEDIUM"
      ? "text-yellow-400"
      : "text-red-400";


  return (
    <div className="
      mt-8
      bg-slate-900
      border
      border-purple-500/50
      rounded-2xl
      p-6
    ">


      <h3 className="
        text-2xl
        font-bold
        text-purple-400
        mb-6
      ">
        🤖 TokenOS AI Wallet Report
      </h3>



      <div className="
        grid
        md:grid-cols-3
        gap-4
        mb-6
      ">


        <div className="
          bg-slate-950
          border
          border-slate-800
          rounded-xl
          p-4
        ">

          <p className="text-slate-400 text-sm">
            Security Score
          </p>

          <p className="
            text-3xl
            font-bold
            text-green-400
          ">
            {score}/100
          </p>

        </div>



        <div className="
          bg-slate-950
          border
          border-slate-800
          rounded-xl
          p-4
        ">

          <p className="text-slate-400 text-sm">
            Risk Level
          </p>

          <p className={`
            text-3xl
            font-bold
            ${levelColor}
          `}>
            {level}
          </p>

        </div>




        <div className="
          bg-slate-950
          border
          border-slate-800
          rounded-xl
          p-4
        ">

          <p className="text-slate-400 text-sm">
            Assets Analyzed
          </p>


          <p className="
            text-3xl
            font-bold
            text-white
          ">
            {tokenCount}
          </p>

        </div>


      </div>



      <div className="
        bg-slate-950
        border
        border-slate-800
        rounded-xl
        p-6
        text-slate-300
        leading-8
        whitespace-pre-wrap
      ">

        {content}

      </div>


    </div>
  );
}