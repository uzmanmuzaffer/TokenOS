// server/engine/reportEngine.js


export function buildWalletReport({
  wallet,
  chains,
  portfolio,
  security,
  score,
  ai,
}) {

  const doctorReport = {

    title:
      "TokenOS AI Portfolio Doctor",

    summary: {

      healthScore:
        score?.score ?? 0,

      grade:
        score?.grade ?? "Unknown",

      status:
        score?.status ?? "Unknown",

    },


    diagnosis: {

      security,

      portfolioHealth:
        score,

    },


    recommendations:
      ai?.report || null,


    generatedBy:
      "TokenOS AI",

  };


  return {

    success: true,


    generatedAt:
      new Date().toISOString(),


    wallet,


    analyzedChains:
      chains,


    // Mevcut sistem korunuyor
    portfolio,

    security,

    score,

    ai,


    // Yeni ürün katmanı
    doctorReport,

  };

}