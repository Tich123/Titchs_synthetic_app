/* Enhanced main.js - now integrates with backend APIs for live data and trades.
   It attempts to preserve original UI hooks; if your HTML doesn't have the expected
   elements, add them (see README).
*/

async function apiGet(path){
  const res = await fetch(path);
  if(!res.ok) throw new Error('Network error: '+res.status);
  return res.json();
}

async function apiPost(path, data){
  const res = await fetch(path, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  if(!res.ok) throw new Error('Network error: '+res.status);
  return res.json();
}

async function refreshDashboard(){
  try{
    const perf = await apiGet('/api/performance');
    const strategies = await apiGet('/api/strategies');
    const tradesData = await apiGet('/api/trades');

    // Populate performance
    const perfEl = document.getElementById('performance-metrics');
    if(perfEl){
      perfEl.innerHTML = `
        <div>Total Trades: ${perf.performance.totalTrades}</div>
        <div>Win Rate: ${(perf.performance.winRate*100).toFixed(1)}%</div>
        <div>Profit: ${perf.performance.profit.toFixed(2)}</div>
        <div>Timeframe: ${perf.performance.timeframe}</div>
      `;
    }

    // Populate strategies
    const stratEl = document.getElementById('strategies-list');
    if(stratEl){
      stratEl.innerHTML = strategies.strategies.map(s=>`<li><strong>${s.name}</strong>: ${s.description}</li>`).join('');
    }

    // Populate trades
    const tradesEl = document.getElementById('trades-list');
    if(tradesEl){
      tradesEl.innerHTML = tradesData.trades.map(t=>`
        <li>
          <strong>${t.symbol||'N/A'}</strong> - ${t.type||'N/A'} - amount: ${t.amount||0}
          <button data-id="${t.id}" class="delete-trade">Delete</button>
        </li>
      `).join('');
      // attach delete handlers
      tradesEl.querySelectorAll('.delete-trade').forEach(btn=>{
        btn.addEventListener('click', async (e)=>{
          const id = btn.getAttribute('data-id');
          await fetch('/api/trades/'+id, { method: 'DELETE' });
          refreshDashboard();
        });
      });
    }

  }catch(err){
    console.error('Failed to refresh dashboard', err);
  }
}

async function init(){
  // Hook up trade submission form if present
  const form = document.getElementById('trade-form');
  if(form){
    form.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const formData = new FormData(form);
      const payload = {};
      formData.forEach((v,k)=> payload[k]=v);
      try{
        await apiPost('/api/submit-trade', payload);
        form.reset();
        await refreshDashboard();
        alert('Trade submitted and saved.');
      }catch(err){
        console.error(err);
        alert('Failed to submit trade: '+err.message);
      }
    });
  }

  // initial load
  await refreshDashboard();
}

// start when DOM ready
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
}else{
  init();
}