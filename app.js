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

  // キャッシュバスター付きで常に最新の reports.json を取得
  fetch('reports.json?v=' + Date.now())
    .then(response => response.json())
    .then(data => {
      allReports = data;
      renderReports(allReports);
      // 最初の（最新の）レポートをデフォルトでモーダルまたはメインビューに展開して表示
      if (allReports.length > 0) {
        openModal(allReports[0]);
      }
    })
    .catch(err => {
      console.error('reports.json 読み込み失敗:', err);
      reportList.innerHTML = '<p style="color:var(--text-muted); text-align: center; padding: 2rem;">レポートデータの読み込みに失敗しました。</p>';
    });

  // 検索フィルター
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = allReports.filter(r => 
        r.title.toLowerCase().includes(term) || 
        r.summary.toLowerCase().includes(term) ||
        (r.fullText && r.fullText.toLowerCase().includes(term))
      );
      renderReports(filtered);
    });
  }

  // モーダル閉じる
  if (modalClose) {
    modalClose.addEventListener('click', () => {
      reportModal.classList.remove('active');
    });
  }

  if (reportModal) {
    reportModal.addEventListener('click', (e) => {
      if (e.target === reportModal) {
        reportModal.classList.remove('active');
      }
    });
  }

  function renderReports(reports) {
    reportList.innerHTML = '';
    if (reports.length === 0) {
      reportList.innerHTML = '<p style="color:var(--text-muted); text-align: center; padding: 2rem;">該当するレポートが見つかりませんでした。</p>';
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
    if (!reportModal) return;

    modalTag.textContent = report.tag || report.time;
    modalTitle.textContent = report.title;

    // 市場データサマリーバッジ
    modalMarketData.innerHTML = '';
    if (report.marketData && Array.isArray(report.marketData)) {
      report.marketData.forEach(item => {
        const badge = document.createElement('div');
        badge.className = `market-badge ${item.status || 'up'}`;
        badge.innerHTML = `
          <span class="market-name">${escapeHTML(item.name)}</span>
          <span class="market-price">${escapeHTML(item.close)}</span>
          <span class="market-change">${escapeHTML(item.change)} (${escapeHTML(item.pct)})</span>
        `;
        modalMarketData.appendChild(badge);
      });
    }

    // Markdown フルテキストをパースしてHTML化
    const renderedHTML = renderMarkdown(report.fullText || '');

    // タブ切替UI構造（「📝 詳細全文（全17セクション）」をデフォルト最優先アクティブ）
    modalFullText.innerHTML = `
      <div class="tab-nav">
        <button class="tab-btn active" data-tab="tab-text">📝 詳細全文（全17セクション）</button>
        <button class="tab-btn" data-tab="tab-flow">📊 因果関係図解</button>
        <button class="tab-btn" data-tab="tab-matrix">📈 6市場売買判断カード</button>
      </div>

      <!-- タブ1: 全17セクション詳細全文（デフォルト） -->
      <div id="tab-text" class="tab-pane active" style="line-height: 1.8; color: #E2E8F0; padding: 1rem 0;">
        ${renderedHTML}
      </div>

      <!-- タブ2: 因果関係図解 -->
      <div id="tab-flow" class="tab-pane">
        <div class="flow-card-box" style="margin-top: 1rem;">
          <h4 style="color:#FFF; margin-bottom:1rem; font-size:1.1rem;">■ 相場の因果関係フロー</h4>
          <div class="flow-step-item">
            <span>🕊️ 米・イラン攻撃停止 / 外交期待</span>
            <span style="color:var(--accent-green);">地政学リスク後退</span>
          </div>
          <div class="flow-step-arrow">↓</div>
          <div class="flow-step-item">
            <span>🛢️ WTI原油急落 (82ドル台 / -7.62%)</span>
            <span class="down">インフレ懸念後退</span>
          </div>
          <div class="flow-step-arrow">↓</div>
          <div class="flow-step-item">
            <span>🏛️ 米長期金利 低下期待 (4.64%)</span>
            <span style="color:var(--accent-blue);">金利高止まり一服</span>
          </div>
          <div class="flow-step-arrow">↓</div>
          <div class="flow-step-item">
            <span>💻 Nasdaq先物高 (+1.2%) ➔ 日経225・半導体買戻し</span>
            <span class="up">ショートカバー優先</span>
          </div>
        </div>
      </div>

      <!-- タブ3: 6市場売買判断 -->
      <div id="tab-matrix" class="tab-pane">
        <div class="market-grid-large" style="margin-top: 1rem;">
          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>💴 USD/JPY</span>
              <span>163円台半ば</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> 中立 (円安トレンド未崩壊)</div>
              <div><strong>支持:</strong> 163.30円 / <strong>抵抗:</strong> 164.00円</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">日米金利差・円キャリーが下値を強力サポート</div>
            </div>
          </div>

          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>💶 EUR/USD</span>
              <span>1.1400近辺</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> 中立〜やや強気</div>
              <div><strong>支持:</strong> 1.1380 / <strong>抵抗:</strong> 1.1418</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">有事のドル買い解消も上値は限定的</div>
            </div>
          </div>

          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>🇯🇵 日経225先物</span>
              <span>65,230円</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> 中立〜やや強気</div>
              <div><strong>支持:</strong> 65,000円 / <strong>抵抗:</strong> 65,400円</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">ショートカバー買い中心、米国株の寄り付き注視</div>
            </div>
          </div>

          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>🛢️ WTI原油</span>
              <span>82ドル台</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> 弱気 (急反発リスクあり)</div>
              <div><strong>支持:</strong> 82.00ドル / <strong>抵抗:</strong> 85.00ドル</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">地政学プレミアム剥落と投機ロングの手仕舞い</div>
            </div>
          </div>

          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>🥇 金先物</span>
              <span>4,103.05ドル</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> やや強気</div>
              <div><strong>支持:</strong> 4,085ドル / <strong>抵抗:</strong> 4,115ドル</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">原油安・金利低下・ドル安が買いを強力後押し</div>
            </div>
          </div>

          <div class="large-asset-card">
            <div class="large-asset-title">
              <span>₿ BTCUSD</span>
              <span>65,263.4ドル</span>
            </div>
            <div class="large-asset-body">
              <div><strong>スタンス:</strong> やや強気 (レンジ内)</div>
              <div><strong>支持:</strong> 65,000ドル / <strong>抵抗:</strong> 65,700ドル</div>
              <div style="color:var(--text-muted); font-size:0.85rem; margin-top:0.3rem;">6万5,000ドル台回復もFOMC前の慎重さ残る</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // タブ切替イベントのバインド
    const tabBtns = modalFullText.querySelectorAll('.tab-btn');
    const tabPanes = modalFullText.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const activePane = modalFullText.querySelector(`#${targetTab}`);
        if (activePane) activePane.classList.add('active');
      });
    });

    reportModal.classList.add('active');
  }

  // Markdownテキストを綺麗なHTML構造へ変換するレンダラー
  function renderMarkdown(md) {
    if (!md) return '';
    
    let html = md;

    // ヘッダー #, ##, ###
    html = html.replace(/^# (.*$)/gim, '<h1 style="color:#FFF; font-size:1.6rem; font-weight:800; border-bottom:2px solid var(--accent-purple); padding-bottom:0.5rem; margin:1.5rem 0 1rem 0;">$1</h1>');
    html = html.replace(/^### (.*$)/gim, '<h3 style="color:#60A5FA; font-size:1.2rem; font-weight:700; margin:1.5rem 0 0.8rem 0; padding-left:0.5rem; border-left:4px solid #3B82F6;">$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4 style="color:#F3F4F6; font-size:1.05rem; font-weight:600; margin:1.2rem 0 0.5rem 0;">$1</h4>');

    // 水平線 ---
    html = html.replace(/^---$/gim, '<hr style="border:none; border-top:1px solid rgba(255,255,255,0.1); margin:1.5rem 0;">');

    // 強調 **bold**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#FFF; font-weight:700;">$1</strong>');

    // コードスタイル `code`
    html = html.replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1); color:#F59E0B; padding:0.1rem 0.4rem; border-radius:4px;">$1</code>');

    // リスト項目 * 
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:1.5rem; margin-bottom:0.3rem;">$1</li>');

    // テーブルパース (| header | ... |)
    const lines = html.split('\n');
    let inTable = false;
    let tableHTML = '';
    let newLines = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line.startsWith('|') && line.endsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableHTML = '<div style="overflow-x:auto; margin:1rem 0;"><table style="width:100%; border-collapse:collapse; background:rgba(15,23,42,0.6); border-radius:8px; overflow:hidden;">';
        }
        if (line.includes('---')) {
          continue; // 区切り行スキップ
        }
        const cells = line.split('|').slice(1, -1);
        const isHeader = (tableHTML.includes('<thead>') === false);
        
        if (isHeader) {
          tableHTML += '<thead style="background:rgba(30,41,59,0.9); border-bottom:1px solid rgba(255,255,255,0.1);"><tr style="color:#94A3B8; text-align:left;">';
          cells.forEach(c => tableHTML += `<th style="padding:0.75rem 1rem;">${c.trim()}</th>`);
          tableHTML += '</tr></thead><tbody>';
        } else {
          tableHTML += '<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">';
          cells.forEach(c => tableHTML += `<td style="padding:0.75rem 1rem;">${c.trim()}</td>`);
          tableHTML += '</tr>';
        }
      } else {
        if (inTable) {
          inTable = false;
          tableHTML += 'tbody></table></div>';
          newLines.push(tableHTML);
          tableHTML = '';
        }
        newLines.push(line);
      }
    }
    if (inTable) {
      tableHTML += 'tbody></table></div>';
      newLines.push(tableHTML);
    }

    return newLines.join('\n').replace(/\n\n/g, '<br/>');
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
});
