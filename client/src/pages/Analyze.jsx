
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "https://tokenos-api.onrender.com";

export default function Analyze() {
  const [searchParams] = useSearchParams();

  const rawAddress = searchParams.get("address");
  const address = rawAddress ? rawAddress.trim() : null;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    if (!address) {
      setError("Geçerli bir cüzdan adresi belirtilmedi.");
      setLoading(false);
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      setError("Geçersiz Ethereum/EVM adresi formatı.");
      setLoading(false);
      return;
    }

    async function fetchAnalysis() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_URL}/api/analyze-v2`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            wallet: address,
          }),
        });

        if (!response.ok) {
          throw new Error(`API hatası: HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Analiz başarısız.");
        }

        setAnalysisData(data);
      } catch (err) {
        console.error("Analiz hatası:", err);
        setError(err.message || "Analiz yapılırken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [address]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "4rem 2rem",
          textAlign: "center",
          background: "#0b0f19",
          color: "#fff",
        }}
      >
        <h2>🔍 Cüzdan Analiz Ediliyor...</h2>
        <p>{address}</p>
        <p>Blockchain verileri ve tokenlar taranıyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          padding: "4rem 2rem",
          textAlign: "center",
          background: "#0b0f19",
          color: "#fff",
        }}
      >
        <h2 style={{ color: "#ff4d4f" }}>❌ Analiz Başarısız</h2>
        <p>{error}</p>
        <p>{address}</p>
      </div>
    );
  }

  const portfolio = analysisData?.portfolio || {};
  const security = analysisData?.security || {};
  const score = analysisData?.score || {};
  const chains = analysisData?.chains || [];
  const results = analysisData?.results || [];

  const totalTokens =
    portfolio.totalTokens ?? analysisData?.totalTokens ?? 0;

  const totalChains =
    portfolio.totalChains ?? analysisData?.analyzedChains ?? 0;

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "2rem",
        background: "#0b0f19",
        color: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1>💰 TokenOS Wallet Analysis</h1>

        <p
          style={{
            wordBreak: "break-all",
            opacity: 0.8,
          }}
        >
          <strong>Wallet:</strong> {address}
        </p>

        {/* SUMMARY */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          <div style={cardStyle}>
            <div style={labelStyle}>Portfolio Value</div>
            <div style={valueStyle}>
              ${Number(portfolio.totalValue || 0).toFixed(2)}
            </div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>Chains</div>
            <div style={valueStyle}>{totalChains}</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>Tokens</div>
            <div style={valueStyle}>{totalTokens}</div>
          </div>

          <div style={cardStyle}>
            <div style={labelStyle}>Security Score</div>
            <div style={valueStyle}>
              {score.score ?? security.score ?? "N/A"}
            </div>
          </div>
        </div>

        {/* SECURITY */}
        <div style={sectionStyle}>
          <h2>🛡️ Security</h2>

          <div style={gridStyle}>
            <div style={cardStyle}>
              <div style={labelStyle}>Health</div>
              <div style={valueStyle}>
                {security.health || "Unknown"}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={labelStyle}>Stablecoin Ratio</div>
              <div style={valueStyle}>
                {security.stablecoinRatio ?? 0}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={labelStyle}>Dust Tokens</div>
              <div style={valueStyle}>
                {security.dustTokens ?? 0}
              </div>
            </div>

            <div style={cardStyle}>
              <div style={labelStyle}>Suspicious Tokens</div>
              <div style={valueStyle}>
                {security.suspiciousTokens ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* CHAINS */}
        <div style={sectionStyle}>
          <h2>⛓️ Networks</h2>

          <div style={gridStyle}>
            {chains.map((chain, index) => (
              <div key={`${chain.chainId}-${index}`} style={cardStyle}>
                <h3>{chain.chain}</h3>

                <p>
                  <strong>Tokens:</strong>{" "}
                  {chain.tokenCount ?? 0}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {chain.success ? "✅ Success" : "❌ Failed"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* TOKEN DATA */}
        <div style={sectionStyle}>
          <h2>🪙 Token Data</h2>

          <p>
            <strong>{results.length}</strong> network results received.
          </p>

          {results.map((result, index) => (
            <div
              key={`${result.chainId}-${index}`}
              style={{
                ...cardStyle,
                marginBottom: "1rem",
              }}
            >
              <h3>{result.chain}</h3>

              <p>
                Token Count: <strong>{result.tokenCount ?? 0}</strong>
              </p>

              {Array.isArray(result.tokens) &&
                result.tokens.length > 0 && (
                  <div
                    style={{
                      maxHeight: "300px",
                      overflowY: "auto",
                      marginTop: "1rem",
                    }}
                  >
                    {result.tokens.slice(0, 20).map((token, tokenIndex) => (
                      <div
                        key={tokenIndex}
                        style={{
                          padding: "0.75rem",
                          borderBottom: "1px solid #252b3a",
                        }}
                      >
                        <strong>
                          {token.symbol ||
                            token.name ||
                            "Unknown Token"}
                        </strong>

                        {token.name &&
                          token.symbol && (
                            <span style={{ opacity: 0.6 }}>
                              {" "}
                              — {token.name}
                            </span>
                          )}
                      </div>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>

        {/* SCORE */}
        <div style={sectionStyle}>
          <h2>📊 Risk Assessment</h2>

          <div style={cardStyle}>
            <p>
              <strong>Score:</strong>{" "}
              {score.score ?? "N/A"}
            </p>

            <p>
              <strong>Grade:</strong>{" "}
              {score.grade ?? "N/A"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {score.status ?? "Unknown"}
            </p>
          </div>
        </div>

        {/* RAW API INFO - temporary debugging */}
        <div style={sectionStyle}>
          <h2>🔧 Analysis Status</h2>

          <p>
            API: <strong>Connected</strong> ✅
          </p>

          <p>
            Successful Chains:{" "}
            <strong>
              {analysisData?.successfulChains ?? 0}
            </strong>
          </p>

          <p>
            Failed Chains:{" "}
            <strong>
              {analysisData?.failedChains ?? 0}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}

const cardStyle = {
  background: "#151b29",
  border: "1px solid #252b3a",
  borderRadius: "12px",
  padding: "1.25rem",
};

const labelStyle = {
  fontSize: "0.9rem",
  opacity: 0.65,
  marginBottom: "0.5rem",
};

const valueStyle = {
  fontSize: "1.5rem",
  fontWeight: "700",
};

const sectionStyle = {
  marginTop: "2rem",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "1rem",
};

