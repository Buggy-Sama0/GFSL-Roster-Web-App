import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, Legend, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts';
import supabase from '../services/supabase/client';

const LINE_COLORS = {
  uv: '#8884d8',
  pv: '#82ca9d',
  amt: '#ffc658',
};

const DEFAULT_OPACITY = {
  uv: 1,
  pv: 1,
  amt: 1,
};

export default function AccountsReceivablePage() {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [itemsPerPage] = useState(7);
  const [currentPage, setCurrentPage] = useState(0);
  const [invoicesData, setInvoicesData] = useState([]);

  // 1. Single JOIN query replacing separate client & invoice fetches
  useEffect(() => {
    async function fetchInvoices() {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select('*, clients(client_name)');

        if (error) throw error;
        console.log('Fetched Data: ', data)
        setInvoicesData(data || []);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    }
    fetchInvoices();
  }, []);

  const formatToCurrency = (value) => {
    if (value === 0) return '$0';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const formatXAxis = (value) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date(value);
    const month = monthNames[date.getMonth()]; // Return month name
    return month;
  }

  const chartData = useMemo(() => {
    // Group and accumulate totals by date 
    const groupedData = invoicesData.reduce((acc, invoice) => {
      const date = invoice.issue_date
      const invoiced = Number(invoice.applied_amount) || 0;
      const collected = Number(invoice.received_amount) || 0;

      if (!acc[date]) {
        acc[date] = { date, Invoiced: 0, Collected: 0 };
      }
      acc[date].Invoiced += invoiced;
      acc[date].Collected += collected;
      return acc;
    }, {});
    console.log(groupedData);
    
    return Object.values(groupedData).sort((a, b) => a.date.localeCompare(b.date))
  }, [invoicesData]);
  console.log('chartData:', chartData);

  const monthOptions = useMemo(() => {
    const uniqueMonths = new Set();

    invoicesData.forEach((invoice) => {
      if (!invoice.issue_date) return;
      const date = new Date(invoice.issue_date);
      if (Number.isNaN(date.getTime())) return;
      uniqueMonths.add(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    });

    return ['All', ...Array.from(uniqueMonths).sort((a, b) => b.localeCompare(a))];
  }, [invoicesData]);

  const formatMonthLabel = (monthKey) => {
    if (monthKey === 'All') return 'All Months';
    const [year, month] = monthKey.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  };

  const filteredInvoices = useMemo(() => {
    return invoicesData.filter((invoice) => {
      const query = searchQuery.toLowerCase().trim();
      const clientName = invoice.clients?.client_name?.toLowerCase() || '';
      const matchesSearch = !query || clientName.includes(query);

      const invoiceDate = invoice.issue_date ? new Date(invoice.issue_date) : null;
      const invoiceMonth = invoiceDate && !Number.isNaN(invoiceDate.getTime())
        ? `${invoiceDate.getFullYear()}-${String(invoiceDate.getMonth() + 1).padStart(2, '0')}`
        : null;     
      const matchesMonth = selectedMonth === 'All' || invoiceMonth === selectedMonth;
      // If the active tab is 'All', return all invoices that match the search query
      if (activeTab == 'All') return matchesSearch && matchesMonth;
      return matchesSearch && matchesMonth && invoice.status?.toLowerCase() === activeTab.toLowerCase();
    });
  }, [invoicesData, searchQuery, activeTab, selectedMonth]);
  //   console.log('filteredInvoices:', filteredInvoices);

  const totalReceivables = useMemo(() => {
    return filteredInvoices.reduce((sum, invoice) => {
      if (invoice.status?.toLowerCase() !== 'paid') {
        const amount = Number(invoice.applied_amount) || 0;
        return sum + amount;
      }
      return sum;
      
    }, 0)
  }, [filteredInvoices]);

  const paymentReceived = useMemo(() => {
    return filteredInvoices.reduce((sum, invoice) => {
      if (invoice.status?.toLowerCase() === 'paid') {
        const amount = Number(invoice.received_amount) || 0;
        return sum + amount;
      }
      return sum;
    }, 0)
  }, [filteredInvoices]);

  const collectionRate = totalReceivables > 0 
    ? ((paymentReceived / totalReceivables) * 100).toFixed(2) 
    : '0.00';

  const overdueInvoices = useMemo(() => {
    return filteredInvoices.reduce((sum, invoice) => {
    if (invoice.status?.toLowerCase() === 'overdue') {
      return sum + 1;
    }
    return sum;
    }, 0)
  }, [filteredInvoices]);

  const overdueClients = useMemo(() => {
    const clients = filteredInvoices.reduce((acc, invoice) => {
    if (invoice.status?.toLowerCase() === 'overdue') {
      if (!acc[invoice.client_id]) {
        acc[invoice.client_id] = invoice;
      }
    }
    return acc;
    }, {})
    return Object.values(clients).length;
  }, [filteredInvoices]);
  // console.log('overdueClients:', overdueClients);

  const numOfPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const totalInvoices = filteredInvoices.length;
  const startItem = totalInvoices === 0 ? 0 : currentPage * itemsPerPage + 1;
  const endItem = Math.min((currentPage + 1) * itemsPerPage, totalInvoices);

  const visiblePages = useMemo(() => {
    if (numOfPages <= 6) {
      return Array.from({ length: numOfPages }, (_, idx) => idx);
    }

    const pages = new Set([0, numOfPages - 1, currentPage - 1, currentPage, currentPage + 1]);
    const normalized = [...pages].filter((p) => p >= 0 && p < numOfPages).sort((a, b) => a - b);

    const output = [];
    for (let i = 0; i < normalized.length; i += 1) {
      const page = normalized[i];
      const prev = normalized[i - 1];
      if (i > 0 && page - prev > 1) {
        output.push('ellipsis');
      }
      output.push(page);
    }

    return output;
  }, [currentPage, numOfPages]);

  const paginatedInvoices = useMemo(() => {
    const start = currentPage * itemsPerPage;
    return filteredInvoices.slice(start, start + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, activeTab, selectedMonth, invoicesData.length]);

  
  const barChartData = useMemo(() => {
    const agingData = [
      { label: '1-30 days', amount: 0 },
      { label: '31-60 days', amount: 0 },
      { label: '61-90 days', amount: 0 },
      { label: '90+ days', amount: 0 },
    ];

    const today= new Date()
    invoicesData.forEach((invoice) => {
      const due_date = new Date(invoice.due_date)
      const diffTime = today - due_date;
      const overdueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (overdueDays <= 0 || invoice?.status?.toLowerCase()==='paid') return;
      if (overdueDays<=30) {
        agingData[0].amount += invoice.applied_amount
      } else if (overdueDays>30 && overdueDays<=60) {
        agingData[1].amount += invoice.applied_amount
      } else if (overdueDays>60 && overdueDays<=90) {
        agingData[2].amount += invoice.applied_amount
      } else {
        agingData[3].amount += invoice.applied_amount
      }
    })
    return agingData.map((data) => ({...data, amount: data.amount.toFixed(2) }) )
  }, [invoicesData])


  const getOverdueTime = (status, dueDate) => {
    if (status?.toLowerCase() === 'paid') return 'Settled';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    if (today<= due) return '-'

    const diffTime = today - due
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays<30) return `${diffDays} Days`
    const months = Math.floor(diffDays/30)
    return `${months} ${months === 1 ? 'Month' : 'Months'}`;
  }

  // console.log(barChartData)

  // const expiryDate = useMemo(() => {
  //   const today = new Date()
  //   for (const client of clients) {
  //     if (client.client_name=='China Harbour Enf Co. Ltd') {
  //       console.log(client)
  //       const end_date = new Date(client.end_date)
  //       return Math.ceil((end_date - today)/(1000 * 60 * 60 * 24))
  //     }
  //   }
  // })

  // console.log(expiryDate)


  return (
    <div className="flex-1 bg-[#0B0E14] text-slate-100 min-h-screen p-6 font-sans overflow-y-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E2638] pb-5">
          <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Accounts Receivable Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
              Monitoring outstanding invoices and payment status.
          </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
          <button className="bg-[#121824] hover:bg-[#1A2234] border border-[#1E2638] text-slate-300 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors">
              Export Report
          </button>
          </div>
      </div>
    
      {/* 1. TOP KPI METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Receivables */}
        <div className="bg-[#121824] border border-[#1E2638] p-5 rounded-lg shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Total Receivables</div>
          <div className="text-2xl font-bold text-white mt-1">${totalReceivables.toLocaleString()}</div>
          {/* <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <span>↗ +12.4%</span> <span className="text-slate-500">vs last month</span>
          </div> */}
        </div>

        {/* Cash Collected */}
        <div className="bg-[#121824] border border-[#1E2638] p-5 rounded-lg shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Payment Collected</div>
          <div className="text-2xl font-bold text-white mt-1">${paymentReceived.toLocaleString()}</div>
          {/* <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <span>↗ +12.4%</span> <span className="text-slate-500">vs last month</span>
          </div> */}
        </div>

        {/* Overdue */}
        <div className="bg-[#121824] border border-[#1E2638] p-5 rounded-lg shadow-sm relative">
          <div className="flex justify-between items-center">
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Overdue Invoices</div>
          </div>
          <div className="text-2xl font-bold text-white mt-1">{overdueInvoices}</div>
          {/* <div className="text-xs text-rose-400 font-medium mt-2 flex items-center gap-1">
            <span>↘ +3.1%</span> <span className="text-slate-500">72 invoices</span>
          </div> */}
        </div>

        {/* Collected MTD */}
        <div className="bg-[#121824] border border-[#1E2638] p-5 rounded-lg shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Overdue Clients</div>
          <div className="text-2xl font-bold text-white mt-1">{overdueClients}</div>
          {/* <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <span>↗ +18.7%</span> <span className="text-slate-500">of $1.4M target</span>
          </div> */}
        </div>

        {/* DSO */}
        <div className="bg-[#121824] border border-[#1E2638] p-5 rounded-lg shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Collection Rate (%)</div>
          <div className="text-2xl font-bold text-white mt-1">{collectionRate}%</div>
          <div className="text-xs text-emerald-400 font-medium mt-2 flex items-center gap-1">
            <span>↗ -2.1d</span> <span className="text-slate-500">vs 40.5 prior period</span>
          </div>
        </div>
      </div>

      {/* 2. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cash Flow Line Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-[#121824] border border-[#1E2638] p-5 rounded-lg flex flex-col justify-between">
          <div>
            {/* <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Cash Flow</div> */}
            <div className="flex items-center justify-between mt-1">
              <h2 className="text-sm font-bold text-white">Invoiced vs. Collected</h2>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-0.5 bg-red-500 inline-block"></span> Invoiced
                </span>
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span> Collected
                </span>
              </div>
            </div>
          </div>

          {/* Line Chart Representation */}
          <LineChart
            style={{ width: '100%', maxWidth: '700px', height: '280px'}}
            responsive
            data={ chartData.map((item) => ({ name: item.date, Invoiced: item.Invoiced, Collected: item.Collected })) }
            margin={{
              top: 10,
              right: 10,
              left: 35,
              bottom: 5,
            }}
            >
            <XAxis 
              dataKey="name" 
              stroke="var(--color-text-500)"
              tick={{ fill: "var(--color-slate-400)", fontSize: 12 }}
              tickFormatter={formatXAxis}
            />
            <YAxis 
              width="auto" 
              stroke="var(--color-text-15)" 
              tick={{ fill: "var(--color-slate-400)", fontSize: 12 }} 
              tickFormatter={formatToCurrency}
            />
            <Tooltip
              cursor={{
                stroke: '#94a3b8',
                strokeWidth: 2,
              }}
              contentStyle={{
                backgroundColor: 'var(--color-surface-raised)',
                borderColor: 'var(--color-border-2)',
              }}
            />
            <Legend />
            <Line
              name="Invoiced"
              type="monotone"
              dataKey="Invoiced"
              stroke="var(--color-red-400)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-blue-400)', r: 4 }}
              activeDot={{ r: 4 }}
              formatter={formatToCurrency}
            />
            <Line
              name="Collected"
              type="monotone"
              dataKey="Collected"
              stroke="var(--color-amber-400)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-green-400)', r: 4 }}
              activeDot={{ r: 4 }}
              formatter={formatToCurrency}
            />
          </LineChart>
        </div>

        {/* Aging Analysis Bar Chart (1 Col) */}
        <div className="bg-[#121824] border border-[#1E2638] p-5 rounded-lg flex flex-col justify-between">
          <div>
            {/* <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Aging Analysis</div> */}
            <h2 className="text-sm font-bold text-white mt-1">Accounts Receivable Analysis</h2>
          </div>

          {/* Bar Chart Visual */}
          <BarChart
              style={{ width: '100%', maxWidth: '700px', maxHeight: '70vh', aspectRatio: 1.618 }}
              responsive
              data={barChartData}
              margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 5,
              }}
            >
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            <XAxis dataKey="label" />
            <YAxis 
            width="auto" 
            tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}/>
            <Tooltip />
            <Legend />
            <Bar dataKey="amount" radius={[4, 4, 0, 0]} fill="#3b82f6" formatter={formatToCurrency} />
          </BarChart>
        </div>

      </div>

      {/* 3. TABLE AND WATCHLIST ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Outstanding Invoices Table (2 Cols) */}
        <div className="lg:col-span-2 bg-[#121824] border border-[#1E2638] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
              <div>
                {/* <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Invoices</div> */}
                <h2 className="text-sm font-bold text-white mt-0.5">Invoices</h2>
              </div>
              
              {/* Search & Filter Buttons */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0B0E14] border border-[#1E2638] text-xs text-slate-200 px-3 py-1.5 rounded focus:outline-none focus:border-slate-600"
                />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-[#0B0E14] border border-[#1E2638] text-xs text-slate-300 px-3 py-1.5 rounded focus:outline-none focus:border-slate-600"
                >
                  {monthOptions.map((monthKey) => (
                    <option key={monthKey} value={monthKey}>
                      {formatMonthLabel(monthKey)}
                    </option>
                  ))}
                </select>
                <button className="bg-[#0B0E14] border border-[#1E2638] text-xs text-slate-300 px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-slate-800">
                  <span>⚙</span> Filter
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-6 border-b border-[#1E2638] text-xs font-semibold pb-2 mb-4">
              {['All', 'Pending', 'Overdue', 'Paid'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab ? 'text-amber-400 border-b-2 border-amber-400 pb-2 -mb-2.5' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-[#1E2638] font-semibold">
                    <th className="pb-3 uppercase">Client</th>
                    <th className="pb-3 uppercase">Invoice Month</th>
                    <th className="pb-3 uppercase">Amount</th>
                    <th className="pb-3 uppercase">Overdue By</th>
                    <th className="pb-3 uppercase">Due</th>
                    <th className="pb-3 uppercase text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E2638]">
                  {paginatedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 text-slate-200 font-medium">{inv.clients?.client_name || 'Unknown Client'}</td>
                      <td className="py-3 text-slate-400">{inv.issue_date}</td>
                      <td className="py-3 text-white font-bold">${inv.applied_amount.toLocaleString()}</td>
                      <td className={`py-3 ${inv.status.toLocaleString() === 'paid' ? 'text-green-400' : inv.status.toLocaleString()==='pending'? 'text-amber-400' : 'text-red-400'}`}>
                        {getOverdueTime(inv.status, inv.due_date)}
                      </td>
                      <td className="py-3 text-slate-400">{inv.due_date}</td>
                      {/* <td className="py-3 text-slate-400">{inv.age}</td> */}
                      <td className="py-3 text-right">
                        {(() => {
                          const isPaid = inv.status?.toLowerCase() === 'paid';
                          const isOverdue = !isPaid && new Date().setHours(0, 0, 0, 0) > new Date(inv.due_date).setHours(0, 0, 0, 0);
                          
                          const label = isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending';
                          const style = isPaid
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                            : isOverdue
                            ? 'bg-red-950/60 text-red-300 border border-red-800/50'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800/50';

                          return (
                            <span className={`px-2 py-0.5 rounded text-[12px] font-bold ${style}`}>
                              {label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                Showing {startItem}-{endItem} of {totalInvoices} invoices
              </p>

              {numOfPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    aria-label="Previous page"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                    disabled={currentPage === 0}
                    className="h-7 w-7 rounded-md border border-[#1E2638] bg-[#0B0E14] text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    &lt;
                  </button>

                  {visiblePages.map((item, idx) => (
                    item === 'ellipsis' ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-slate-500 text-xs">...</span>
                    ) : (
                      <button
                        type="button"
                        key={item}
                        onClick={() => setCurrentPage(item)}
                        className={`min-w-7 h-7 px-2 rounded-md text-xs font-medium transition ${
                          currentPage === item
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-[#0B0E14] border border-[#1E2638] text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {item + 1}
                      </button>
                    )
                  ))}

                  <button
                    type="button"
                    aria-label="Next page"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, numOfPages - 1))}
                    disabled={currentPage === numOfPages - 1}
                    className="h-7 w-7 rounded-md border border-[#1E2638] bg-[#0B0E14] text-slate-300 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}