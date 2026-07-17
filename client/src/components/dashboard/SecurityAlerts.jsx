import useWalletStore from "../../store/walletStore";

export default function SecurityAlerts() {
  const { data, aiReport } = useWalletStore();

  if (!data?.success) return null;

  const alerts = [];

  if (data.riskScore?.level === "HIGH") {
    alerts.push({
      type: "danger",
      title: "High Risk Wallet",
      message: "This wallet has a high risk score. Review your assets carefully.",
    });
  }

  if (data.riskScore?.level === "MEDIUM") {
    alerts.push({
      type: "warning",
      title: "Medium Risk",
      message: "Some assets may require additional review.",
    });
  }

  if (data.riskScore?.level === "LOW") {
    alerts.push({
      type: "success",
      title: "Low Risk",
      message: "No major security issues detected.",
    });
  }

  if (data.tokenCount > 100) {
    alerts.push({
      type: "info",
      title: "Large Portfolio",
      message: "Consider reviewing inactive or low-value tokens.",
    });
  }

  if (aiReport && !aiReport.success) {
    alerts.push({
      type: "warning",
      title: "AI Report",
      message: "AI report could not be generated.",
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4">
        Security Alerts
      </h2>

      <div className="space-y-3">
        {alerts.map((alert, index) => (
          <div
            key={index}
            className="rounded-xl border border-slate-700 bg-slate-950 p-4"
          >
            <h3 className="font-semibold text-white">
              {alert.title}
            </h3>

            <p className="text-slate-400 mt-1">
              {alert.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}