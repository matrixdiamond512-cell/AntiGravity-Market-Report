document.addEventListener('DOMContentLoaded', () => {
  const reportList = document.getElementById('reportList');
  const searchInput = document.getElementById('searchInput');
  const reportModal = document.getElementById('reportModal');
  const modalClose = document.getElementById('modalClose');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalMarketData = document.getElementById('modalMarketData');
  const modalFullText = document.getElementById('modalFullText');

  let allReports = [];

  fetch('reports.json')
    .then(response => response.json())
    .then(data => {
      allReports = data;
      renderReports(allReports);
    })
    .catch(err => {
      console.error('reports.json の読み込みに失敗しました:', err);
      reportList.innerHTML = '<p style="color:var(--text-muted)">レポートデータの読み込みに失敗しました。</p>';
    });

  function renderReports(reports) {
    reportList.innerHTML = '';
    if (reports.length === 0) {
      reportList.innerHTML = '<p style="color:var(--text-muted); padding: 2rem 0; text-align: center;">該当するレポートが見つかりませんでした。</p>';
      return;
    }

    reports.forEach(report => {
      const card = document.createElement('div');
      card.className = 'report-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');

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

    let boardHTML = '';

    // ビジュアルインフォグラフィックボードの構築（全レポート対応）
    const wti = report.marketData ? report.marketData.find(x => x.name.includes('原油')) : null;
    const gold = report.marketData ? report.marketData.find(x => x.name.includes('金') || x.name.includes('ゴールド')) : null;
    const usdjpy = report.marketData ? report.marketData.find(x => x.name.includes('USD/JPY')) : null;
    const n225 = report.marketData ? report.marketData.find(x => x.name.includes('日経225')) : null;

    const wtiClose = wti ? wti.close : '$83.53';
    const wtiPct = wti ? wti.pct : '-6.47%';
    const goldClose = gold ? gold.close : '$4,105.20';
    const usdjpyClose = usdjpy ? usdjpy.close : '163.62';

    boardHTML += `
      <div class="infographic-board">
        <div class="board-sec-title">
          <span class="board-sec-num">1</span>
          <span>因果関係マップ（相場の風が吹けば桶屋が儲かるフロー）</span>
        </div>
        
        <div class="flow-container">
          <div class="flow-step">
            <span>🕊️ 米・イラン攻撃停止 / 外交交渉期待</span>
            <span style="color:var(--accent-green); font-size:0.85rem;">地政学リスク後退</span>
          </div>
          <div class="flow-arrow">↓</div>
          <div class="flow-step" style="border-left-color: var(--accent-red);">
            <span>🛢️ WTI原油急落 (${wtiClose} / ${wtiPct})</span>
            <span class="down">インフレ懸念後退</span>
          </div>
          <div class="flow-arrow">↓</div>
          <div class="flow-step" style="border-left-color: var(--accent-blue);">
            <span>🏛️ 米長期金利 低下期待</span>
            <span style="color:var(--accent-blue); font-size:0.85rem;">金利高止まり一服</span>
          </div>
          <div class="flow-arrow">↓</div>
          <div class="flow-step" style="border-left-color: var(--accent-green);">
            <span>💻 Nasdaq100先物上昇 ➔ 日経225・半導体反発余地</span>
            <span class="up">ショートカバー買い</span>
          </div>
        </div>

        <div class="board-sec-title">
          <span class="board-sec-num">2</span>
          <span>何が買われ、何が売られたか</span>
        </div>

        <div class="buy-sell-grid">
          <div class="buy-card">
            <div class="buy-card-title">🟢 買われた・買戻しが入りやすい</div>
            <ul class="item-list">
              <li><strong>米国:</strong> 情報技術・半導体、一般消費財、航空</li>
              <li><strong>日本:</strong> 半導体製造装置、AI関連、電子部品、ソフトバンクG</li>
            </ul>
          </div>
          <div class="sell-card">
            <div class="sell-card-title">🔴 売られた・売りが入りやすい</div>
            <ul class="item-list">
              <li><strong>共通:</strong> エネルギー、素材・資源、石油元売り</li>
              <li><strong>背景:</strong> 原油高の巻き戻しによるセクターローテーション</li>
            </ul>
          </div>
        </div>

        <div class="board-sec-title">
          <span class="board-sec-num">3</span>
          <span>6主要アセットの売買判断マトリックス</span>
        </div>

        <div class="matrix-grid">
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-name">💴 USD/JPY</span>
              <span class="asset-price">${usdjpyClose}</span>
            </div>
            <div class="asset-detail">
              <div><strong>スタンス:</strong> 上値やや重い / 円安継続</div>
              <div><strong>支持:</strong> 163.00 / <strong>抵抗:</strong> 164.00</div>
            </div>
          </div>
          
          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-name">💶 EUR/USD</span>
              <span class="asset-price">1.1386</span>
            </div>
            <div class="asset-detail">
              <div><strong>スタンス:</strong> 中立〜やや強気</div>
              <div><strong>支持:</strong> 1.1350 / <strong>抵抗:</strong> 1.1450</div>
            </div>
          </div>

          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-name">🇯🇵 日経225</span>
              <span class="asset-price">${n225 ? n225.close : '64,611'}</span>
            </div>
            <div class="asset-detail">
              <div><strong>スタンス:</strong> 自律反発余地あり</div>
              <div><strong>支持:</strong> 64,000 / <strong>抵抗:</strong> 65,500</div>
            </div>
          </div>

          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-name">🛢️ WTI原油</span>
              <span class="asset-price down">${wtiClose}</span>
            </div>
            <div class="asset-detail">
              <div><strong>スタンス:</strong> 弱気（急反発警戒）</div>
              <div><strong>支持:</strong> 82〜83 / <strong>抵抗:</strong> 85.00</div>
            </div>
          </div>

          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-name">🥇 ゴールド</span>
              <span class="asset-price up">${goldClose}</span>
            </div>
            <div class="asset-detail">
              <div><strong>スタンス:</strong> やや強気 (FOMCヘッジ)</div>
              <div><strong>支持:</strong> 4,000 / <strong>抵抗:</strong> 4,130</div>
            </div>
          </div>

          <div class="asset-card">
            <div class="asset-header">
              <span class="asset-name">₿ BTCUSD</span>
              <span class="asset-price">64,982</span>
            </div>
            <div class="asset-detail">
              <div><strong>スタンス:</strong> やや強気レンジ内</div>
              <div><strong>支持:</strong> 64,000 / <strong>抵抗:</strong> 65,500</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // 市場データ表
    if (report.marketData && report.marketData.length > 0) {
      boardHTML += `
        <h4 style="color:#FFF; margin-bottom: 0.5rem; font-size: 1rem;">■ 主要市場データ詳細一覧</h4>
        <table class="data-table">
          <thead>
            <tr>
              <th>銘柄・指標</th>
              <th>最新確定値</th>
              <th>前日比</th>
              <th>騰落率 / 変化</th>
            </tr>
          </thead>
          <tbody>
      `;

      report.marketData.forEach(item => {
        const statusClass = item.status === 'up' ? 'up' : (item.status === 'down' ? 'down' : '');
        boardHTML += `
          <tr>
            <td style="color:#FFF; font-weight:600;">${escapeHTML(item.name)}</td>
            <td>${escapeHTML(item.close)}</td>
            <td class="${statusClass}">${escapeHTML(item.change)}</td>
            <td class="${statusClass}">${escapeHTML(item.pct)}</td>
          </tr>
        `;
      });

      boardHTML += `</tbody></table>`;
    }

    modalMarketData.innerHTML = boardHTML;
    modalFullText.innerHTML = formatMarkdown(report.fullText || report.summary);

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
    html = html.replace(/### (.*?)\n/g, '<h3 style="color:#FFF; font-size:1.1rem; margin-top:1.2rem; margin-bottom:0.5rem;">$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#FFF;">$1</strong>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }
});
