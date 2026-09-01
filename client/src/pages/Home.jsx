import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Wallet,
  Bot,
  LineChart,
  Search,
  ArrowRight,
  Globe,
  Zap,
} from "lucide-react";

import PublicHeader from "../components/layout/PublicHeader";
import PublicFooter from "../components/layout/PublicFooter";

const features = [
  {
    title: "Wallet Analyzer",
    description: "Paste any EVM address and pull live holdings across supported chains.",
    icon: Wallet,
  },
  {
    title: "Risk Score",
    description: "Surface contract, approval and concentration risks before you interact.",
    icon: Shield,
  },
  {
    title: "AI Briefing",
    description: "Turn raw on-chain data into a short, readable wallet briefing.",
    icon: Bot,
  },
  {
    title: "Portfolio View",
    description: "See diversification, largest holdings and chain exposure in one place.",
    icon: LineChart,
  },
];

const steps = [
  {
    n: "01",
    title: "Paste an address",
    text: "Use any 0x wallet. No deposit required.",
  },
  {
    n: "02",
    title: "Scan on-chain data",
    text: "TokenOS reads balances, tokens and security signals.",
  },
  {
    n: "03",
    title: "Read the briefing",
    text: "Get risk, holdings and an AI summary you can act on.",
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [address, setAddress] = useState("");

  function handleAnalyze(e) {
    e.preventDefault();
    const value = address.trim();
    if (!value) return;
    navigate(`/analyze?address=${encodeURIComponent(value)}`);
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <PublicHeader />

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 lg:grid-cols-2 lg:py-24">
        <div>
          <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300">
            Free AI wallet terminal
          </span>

          <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Analyze wallets.
            <br />
            Detect risks.
            <br />
            Stay informed.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-7 text-slate-400">
            TokenOS combines on-chain analytics and AI briefings so you can
            understand a wallet before you follow it, fund it, or ape into it.
          </p>

          <form onSubmit={handleAnalyze} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Paste wallet address (0x...)"
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3.5 pl-10 pr-4 text-sm outline-none ring-cyan-500/40 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Analyze
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Globe className="h-4 w-4 text-cyan-400" />
              Base · Ethereum · Arbitrum · Optimism · Polygon · BSC
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white">Sample preview</p>
              <p className="text-xs text-slate-500">Illustrative layout, not live funds</p>
            </div>
            <span className="rounded-md border border-slate-700 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-400">
              Demo
            </span>
          </div>

          <div className="space-y-4 text-sm">
            <Row label="Risk score" value="84 / 100" valueClass="text-emerald-400" />
            <Row label="Portfolio value" value="$28,450" />
            <Row label="Tokens" value="38" />
            <Row label="Stablecoins" value="5" />
            <Row label="AI status" value="Healthy" valueClass="text-emerald-400" />
          </div>

          <Link
            to="/analyze"
            className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-200 hover:border-cyan-500/50 hover:text-white"
          >
            Open live analyzer
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          What you get
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-400">
          A focused workspace for wallet research. No paywall required to start a scan.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-cyan-500/40"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-16">
        <h2 className="text-center text-3xl font-semibold tracking-tight">
          How it works
        </h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6"
            >
              <p className="text-xs font-semibold tracking-[0.2em] text-cyan-400">
                {step.n}
              </p>
              <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-slate-900 to-slate-950 p-10 text-center">
          <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500/10 text-cyan-400">
            <Zap className="h-5 w-5" />
          </div>
          <h2 className="text-3xl font-semibold">Start with a free scan</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Create an account for the full terminal, or analyze a wallet right now
            without connecting funds.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/analyze"
              className="rounded-xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
            >
              Analyze a wallet
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-slate-700 px-6 py-3 text-sm font-semibold text-white hover:border-slate-500"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

function Row({ label, value, valueClass = "text-white" }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800 pb-3 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}