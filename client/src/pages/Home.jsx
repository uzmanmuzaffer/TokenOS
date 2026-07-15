
import { Link } from "react-router-dom";

export default function Home() {
  const features = [
    {
      title: "Wallet Analyzer",
      description:
        "Analyze any EVM wallet instantly using real blockchain data.",
      icon: "💼",
    },
    {
      title: "Risk Score",
      description:
        "Detect risky wallets using TokenOS AI Risk Engine.",
      icon: "🛡️",
    },
    {
      title: "AI Reports",
      description:
        "Generate premium AI-powered wallet reports.",
      icon: "🤖",
    },
    {
      title: "Portfolio Intelligence",
      description:
        "Track diversification and portfolio health.",
      icon: "📈",
    },
  ];

  return (
    <div style={{
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  padding: "40px"
}}>

      {/* Navbar */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          <div>
            <h1 className="text-3xl font-bold text-blue-500">
              TokenOS
            </h1>
          </div>

          <nav className="flex items-center gap-4">

            <Link
              to="/login"
              className="text-gray-300 hover:text-white"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-lg font-semibold"
            >
              Get Started
            </Link>

          </nav>

        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="grid lg:grid-cols-2 gap-14 items-center">

          <div>

            <span className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-full">
              AI Powered Web3 Platform
            </span>

            <h2 className="text-6xl font-extrabold mt-8 leading-tight">

              Analyze Wallets

              <br />

              Detect Risks

              <br />

              Discover Opportunities

            </h2>

            <p className="text-gray-400 text-xl mt-8 leading-8">

              TokenOS combines blockchain analytics,
              AI intelligence and premium reports
              into one powerful Web3 platform.

            </p>

            <div className="flex gap-4 mt-10">

              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold"
              >
                Start Free
              </Link>

              <Link
                to="/login"
                className="border border-gray-700 hover:border-blue-500 px-8 py-4 rounded-xl"
              >
                Login
              </Link>

            </div>

          </div>

          <div>

            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8">

              <h3 className="text-2xl font-bold mb-6">
                AI Wallet Overview
              </h3>

              <div className="space-y-5">

                <div className="flex justify-between">
                  <span>Risk Score</span>
                  <span className="text-green-400 font-bold">
                    84 / 100
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Portfolio</span>
                  <span>$28,450</span>
                </div>

                <div className="flex justify-between">
                  <span>Tokens</span>
                  <span>38</span>
                </div>

                <div className="flex justify-between">
                  <span>Stablecoins</span>
                  <span>5</span>
                </div>

                <div className="flex justify-between">
                  <span>AI Status</span>
                  <span className="text-green-400">
                    Healthy
                  </span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-4xl font-bold text-center mb-14">
          Platform Features
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {features.map((feature) => (

            <div
              key={feature.title}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 hover:border-blue-500 transition"
            >

              <div className="text-5xl mb-5">
                {feature.icon}
              </div>

              <h3 className="text-xl font-bold mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-400">
                {feature.description}
              </p>

            </div>

          ))}

        </div>

      </section>

      {/* Premium */}
      <section className="max-w-6xl mx-auto px-6 py-20">

        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 rounded-3xl p-12 text-center">

          <h2 className="text-5xl font-bold mb-6">

            Premium AI Reports

          </h2>

          <p className="text-xl text-blue-100 mb-10">

            Unlock advanced blockchain intelligence
            powered by AI and x402 payments.

          </p>

          <Link
            to="/register"
            className="bg-white text-blue-700 px-8 py-4 rounded-xl font-bold"
          >
            Upgrade Now
          </Link>

        </div>

      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-20">

        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between">

          <div>

            <h3 className="text-2xl font-bold text-blue-500">
              TokenOS
            </h3>

            <p className="text-gray-500 mt-3">
              AI-powered Web3 Intelligence Platform
            </p>

          </div>

          <div className="text-gray-500 mt-6 md:mt-0">
            © 2026 TokenOS. All rights reserved.
          </div>

        </div>

      </footer>

    </div>
  );
}

