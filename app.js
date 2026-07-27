document.addEventListener('DOMContentLoaded', () => {
  const reportList = document.getElementById('reportList');
  const searchInput = document.getElementById('searchInput');
  const reportModal = document.getElementById('reportModal');
  const modalClose = document.getElementById('modalClose');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalMarketData = document.getElementById('modalMarketData');

  let allReports = [];

  fetch('reports.json')
    .then(response => response.json())
    .then(data => {
      allReports = data;
      renderReports(allReports);
    })
    .catch(err => {
      console.error('reports.json 読み込み失敗:', err);
    });

  function renderReports(reports) {
    reportList.innerHTML = '';
    if (reports.length === 0) {
      reportList.innerHTML = '<p style="color:var(--text-muted); text-align: center; padding: 2rem;">レポートが見つかりません。</p>';
      return;
    }

    reports.forEach(report => {
      const card = document.createElement('div');
      card.className = 'report-card';
      card.setAttribute('tabindex', '0');

      card.innerHTML = `
        <div class="card-title">${escapeHTML(report.title)}</div>
        <div class="card-summary">${escapeHTML(report.summary)}</div>
        <div class="card-footer">
          <span class="tag">${escapeHTML(report.tag || report.time)}</span>
          <span>${escapeHTML(report.date)}</span>
        </div>
      `;

      card.addEventListener('click', () => openModal(report));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(report);
        }
      });

      reportList.appendChild(card);
    });
  }

  function openModal(report) {
    modalTag.textContent = report.tag || report.time;
    modalTitle.textContent = report.title;

    const wti = report.marketData ? report.marketData.find(x => x.name.includes('原油')) : null;
    const gold = report.marketData ? report.marketData.find(x => x.name.includes('金') || x.name.includes('ゴールド')) : null;
    const usdjpy = report.marketData ? report.marketData.find(x => x.name.includes('USD/JPY')) : null;
    const n225 = report.marketData ? report.marketData.find(x => x.name.includes('日経225')) : null;

    const wtiClose = wti ? wti.close : '$83.53';
    const wtiPct = wti ? wti.pct : '-6.47%';
    const goldClose = gold ? gold.close : '$4,105.20';
    const usdjpyClose = usdjpy ? usdjpy.close : '163.62';

    // タブ切替UI構造の生成
    let contentHTML = `
      <div class="tab-nav">
        <button class="tab-btn active" data-tab="tab-flow">📊 因果関係・図解</button>
        <button class="tab-btn" data-tab="tab-matrix">📈 6市場売買判断</button>
        <button class="tab-btn" data-tab="tab-text">📝 詳細全文</button>
      </div>

      <!-- タブ1: 因果関係図解 -->
      <div id="tab-flow" class="tab-pane active">
        <div class="flow-card-box">
          <h4 style="color:#FFF; margin-bottom:1rem; font-size:1.1rem;">■ 相場の因果関係フロー</h4>
          <div class="flow-step-item">
            <span>🕊️ 米・イラン攻撃停止 / 外交期待</span>
            <span style="color:var(--accent-green);">地政学リスク後退</span>
          </div>
          <div class="flow-step-arrow">↓</div>
          <div class="flow-step-item">
            <span>🛢️ WTI原油急落 (${wtiClose} / ${wtiPct})</span>
            <span class="down">インフレ懸念後退</span>
          </div>
          <div class="flow-step-arrow">↓</div>
          <div class="flow-step-item">
            <span>🏛️ 米長期金利 低下期待</span>
            <span style="color:var(--accent-blue);">金利高止まり一服</span>
          </div>
          <div class="flow-step-arrow">↓</div>
          <div class="flow-step-item">
            <span>💻 Nasdaq先物高 ➔ 日経225・半導体買戻し</span>
            <span class="up">ショートカバー優先</span>
          </div>
        </div>

        <div class="buy-sell-grid">
          <div class="buy-card">
            <div class="buy-card-title">🟢 買われた・買戻し優勢</div>
            <ul class="item-list">
              <li>半導体製造装置・AI関連</li>
              <li>電子部品、一般消費財、航空</li>
            </ul>
          </div>
          <div class="sell-card">
            <div class="sell-card-title">🔴 売られた・売り優勢</div>
            <ul class="item-list">
              <li>エネルギー、素材・資源</li>
              <li>石油元売り関連銘柄</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- タブ2: 6市場売買判断 -->
      <div id="tab-matrix" class="tab-pane">
        <div class="market-grid-large">
          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>💴 USD/JPY</span>
              <span>${usdjpyClose}</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> 上値やや重い / 円安継続</div>
              <div><strong>支持:</strong> 163.00 / <strong>抵抗:</strong> 164.00</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">米金利低下か 163円台前半へ下がるか注視</div>
            </div>
          </div>

          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>💶 EUR/USD</span>
              <span>1.1386</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> 中立〜やや強気</div>
              <div><strong>支持:</strong> 1.1350 / <strong>抵抗:</strong> 1.1450</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">ドル全面安に移るか 1.1450を試すか</div>
            </div>
          </div>

          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>🇯🇵 日経225</span>
              <span>${n225 ? n225.close : '64,611'}</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> 自律反発余地あり</div>
              <div><strong>支持:</strong> 64,000 / <strong>抵抗:</strong> 65,500</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">半導体株の出来高を伴った反発に注目</div>
            </div>
          </div>

          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>🛢️ WTI原油</span>
              <span class="down">${wtiClose}</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> 弱気（急反発警戒）</div>
              <div><strong>支持:</strong> 82.00 / <strong>抵抗:</strong> 85.00</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">83ドル台維持か 追加ニュースに警戒</div>
            </div>
          </div>

          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>🥇 ゴールド</span>
              <span class="up">${goldClose}</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> やや強気（FOMCヘッジ）</div>
              <div><strong>支持:</strong> 4,000 / <strong>抵抗:</strong> 4,130</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">$4,100台定着か 米金利低下が支え</div>
            </div>
          </div>

          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>₿ BTCUSD</span>
              <span>64,982</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> やや強気レンジ内</div>
              <div><strong>支持:</strong> 64,000 / <strong>抵抗:</strong> 65,500</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">株高連動継続か 65,000ドル定着注視</div>
            </div>
          </div>
        </div>
      </div>

      <!-- タブ3: 詳細全文 -->
      <div id="tab-text" class="tab-pane">
        <div class="report-body-text">${formatMarkdown(report.fullText || report.summary)}</div>
      </div>
    `;

    modalMarketData.innerHTML = contentHTML;

    // タブ切替イベントリスナーの登録
    const tabBtns = modalMarketData.querySelectorAll('.tab-btn');
    const tabPanes = modalMarketData.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = modalMarketData.querySelector('#' + btn.getAttribute('data-tab'));
        if (targetPane) targetPane.classList.add('active');
      });
    });

    reportModal.classList.add('active');
    reportModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    reportModal.classList.remove('active');
    reportModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  reportModal.addEventListener('click', (e) => {
    if (e.target === reportModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reportModal.classList.contains('active')) closeModal();
  });

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      renderReports(allReports);
      return;
    }

    const filtered = allReports.filter(r => 
      r.title.toLowerCase().includes(query) ||
      r.summary.toLowerCase().includes(query) ||
      (r.theme && r.theme.toLowerCase().includes(query)) ||
      (r.fullText && r.fullText.toLowerCase().includes(query))
    );

    renderReports(filtered);
  });

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, match => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[match]));
  }

  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHTML(text);
    html = html.replace(/# (.*?)\n/g, '<h2 style="color:#FFF; font-size:1.4rem; margin-top:1.5rem; margin-bottom:0.5rem;">$1</h2>');
    html = html.replace(/### (.*?)\n/g, '<h3 style="color:var(--accent-purple); font-size:1.15rem; margin-top:1.25rem; margin-bottom:0.5rem;">$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#FFF;">$1</strong>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }
});
