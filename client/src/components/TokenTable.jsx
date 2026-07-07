import { useEffect, useState } from "react";
import { getTokens } from "../services/api";

function TokenTable() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTokens();
  }, []);

  async function loadTokens() {
    const data = await getTokens();

    if (data.tokens) {
      setTokens(data.tokens);
    }

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="text-white mt-8">
        Token verileri yükleniyor...
      </div>
    );
  }

  return (
    <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">

      <table className="w-full text-left text-white">

        <thead className="bg-gray-800">
          <tr>
            <th className="px-5 py-3">
              Token
            </th>

            <th className="px-5 py-3">
              Sembol
            </th>

            <th className="px-5 py-3">
              Fiyat
            </th>

            <th className="px-5 py-3">
              Değişim
            </th>
          </tr>
        </thead>


        <tbody>

          {tokens.map((token, index) => (

            <tr
              key={index}
              className="border-t border-gray-800"
            >

              <td className="px-5 py-3">
                {token.name}
              </td>

              <td className="px-5 py-3">
                {token.symbol}
              </td>

              <td className="px-5 py-3">
                {token.price}
              </td>

              <td
                className={`px-5 py-3 ${
                  token.change.startsWith("+")
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {token.change}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}

export default TokenTable;