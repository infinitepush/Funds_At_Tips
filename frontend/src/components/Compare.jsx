import React, { useEffect, useState } from 'react'
import { fetchAllFunds } from '../api.js'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const Compare = () => {
  const [funds, setFunds] = useState([])
  const [selected, setSelected] = useState([]) 
  const [error, setError] = useState(null)
  const [period, setPeriod] = useState('1Y')

  useEffect(() => {
    fetchAllFunds()
      .then(data => setFunds(data))
      .catch(err => setError(err.message || String(err)))
  }, [])

  const top20 = React.useMemo(() => {
    if (!Array.isArray(funds) || funds.length === 0) return []

    const fieldMap = {
      '1Y': 'one_year_return_num',
      '3Y': 'three_year_return_num',
      '5Y': 'cagr_num'
    }

    const field = fieldMap[period] || 'one_year_return_num'

    const list = funds.map(f => ({ ...f, _v: f[field] }))
    list.sort((a, b) => {
      const an = Number.isFinite(a._v) ? a._v : -Infinity
      const bn = Number.isFinite(b._v) ? b._v : -Infinity
      return bn - an
    })
    return list.slice(0, 20)
  }, [funds, period])

  const toggleSelect = (name) => {
    setSelected(prev => {
      if (prev.includes(name)) return prev.filter(x => x !== name)
      if (prev.length >= 3) return prev 
      return [...prev, name]
    })
  }

  const selectedFunds = selected
    .map(name => funds.find(f => f.name === name))
    .filter(Boolean)

  const lineData = {
    labels: ['1Y', '3Y', '5Y'],
    datasets: selectedFunds.map((f, i) => {
      const colors = [
        'rgba(99,102,241,0.8)',
        'rgba(16,185,129,0.8)',
        'rgba(245,158,11,0.8)'
      ]
      return {
        label: f.name,
        data: [
          f.one_year_return_num,
          f.three_year_return_num,
          f.cagr_num
        ],
        borderColor: colors[i],
        backgroundColor: colors[i],
        fill: false,
        tension: 0.1
      }
    })
  }

  return (
    <section className="p-4 md:p-8">
      <h2 className="text-3xl font-bold mb-4">Compare Funds</h2>

      {error && <div className="text-red-600 mb-4">Error loading funds: {error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* LEFT PANEL */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
          <p className="font-semibold mb-2">Select up to 3 funds (Top 20)</p>

          {/* FIXED PERIOD DROPDOWN */}
          <div className="mb-3">
            <label className="text-xs mr-2 text-gray-600 dark:text-gray-300">Period:</label>

            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="
                p-2 text-sm rounded-lg 
                bg-gray-100 dark:bg-gray-700
                text-gray-800 dark:text-gray-200
                border border-gray-300 dark:border-gray-600
                focus:outline-none focus:ring-2 focus:ring-indigo-500
              "
            >
              <option value="1Y">1Y</option>
              <option value="3Y">3Y</option>
              <option value="5Y">5Y</option>
            </select>
          </div>

          <div className="max-h-96 overflow-auto">
            {top20.map(f => (
              <label key={f.name} className="flex items-center space-x-2 py-2 border-b last:border-b-0">
                <input
                  type="checkbox"
                  checked={selected.includes(f.name)}
                  onChange={() => toggleSelect(f.name)}
                />
                <div>
                  <div className="font-medium">{f.name}</div>
                  <div className="text-xs text-gray-500">{f.category || 'Unknown'}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="md:col-span-2 space-y-4">

          {/* OVERVIEW */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <p className="font-semibold mb-2">Overview</p>

            {selectedFunds.length === 0 && (
              <p className="text-sm text-gray-500">Pick 1–3 funds to compare their returns.</p>
            )}

            {selectedFunds.length > 0 && (
              <Line data={lineData} />
            )}
          </div>

          {/* DETAILS */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
            <p className="font-semibold mb-2">Details</p>

            {selectedFunds.length === 0 && (
              <p className="text-sm text-gray-500">No funds selected.</p>
            )}

            {selectedFunds.length > 0 && (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500">
                    <th className="px-2 py-1">Name</th>
                    <th className="px-2 py-1">1Y</th>
                    <th className="px-2 py-1">3Y</th>
                    <th className="px-2 py-1">5Y</th>
                    <th className="px-2 py-1">Expense Ratio</th>
                    <th className="px-2 py-1">AUM</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFunds.map(f => (
                    <tr key={f.name} className="border-t">
                      <td className="px-2 py-2 font-medium">{f.name}</td>
                      <td className="px-2 py-2">{f.one_year_return || 'NA'}</td>
                      <td className="px-2 py-2">{f.three_year_return || 'NA'}</td>
                      <td className="px-2 py-2">{f.five_year_return || 'NA'}</td>
                      <td className="px-2 py-2">{f.expense_ratio || 'NA'}</td>
                      <td className="px-2 py-2">{f.aum || 'NA'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}

export default Compare
