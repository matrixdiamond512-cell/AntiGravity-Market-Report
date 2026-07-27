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

  fetch('reports.json?v=' + Date.now())
    .then(response => response.json())
    .then(data => {
      allReports = data;
      renderReports(allReports);
      if (allReports.length > 0) {
        openModal(allReports[0]);
      }
    })
    .catch(err => {
      console.error('reports.json 読み込み失敗:', err);
      reportList.innerHTML = '<p style="color:var(--text-muted); text-align: center; padding: 2rem;">レポートデータの読み込みに失敗しました。</p>';
    });

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

    const renderedHTML = renderMarkdown(report.fullText || '');

    let imageHTML = '';
    if (report.image) {
      imageHTML = `
        <div style="margin-bottom: 1.5rem; text-align: center; background: rgba(15,23,42,0.8); border-radius: 12px; padding: 1rem; border: 1px solid rgba(255,255,255,0.1);">
          <div style="color:var(--text-muted); font-size:0.85rem; margin-bottom:0.5rem; text-align:left;">🖼️ 13テーマ完結プロ仕様インフォグラフィック（タップで全画面表示）</div>
          <a href="${escapeHTML(report.image)}" target="_blank" rel="noopener">
            <img src="${escapeHTML(report.image)}" alt="${escapeHTML(report.title)}" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); cursor: zoom-in;" />
          </a>
        </div>
      `;
    }

    modalFullText.innerHTML = `
      ${imageHTML}

      <div class="tab-nav">
        <button class="tab-btn active" data-tab="tab-text">📝 詳細全文（全13テーマ完全網羅）</button>
        <button class="tab-btn" data-tab="tab-flow">💡 誰でもわかる！資金フロー図解</button>
        <button class="tab-btn" data-tab="tab-matrix">📈 6市場売買判断カード</button>
      </div>

      <div id="tab-text" class="tab-pane active" style="line-height: 1.8; color: #E2E8F0; padding: 1rem 0;">
        ${renderedHTML}
      </div>

      <div id="tab-flow" class="tab-pane">
        <div style="margin-top: 1rem; text-align: center; background: rgba(15,23,42,0.9); padding: 1rem; border-radius: 12px; border: 1px solid rgba(59,130,246,0.3);">
          <h3 style="color:#60A5FA; margin-bottom:0.8rem;">💡 誰でもわかる「クロスアセット資金フロー」図解画像</h3>
          <a href="cross_asset_flow_explained.png" target="_blank" rel="noopener">
            <img src="cross_asset_flow_explained.png" alt="クロスアセット資金フロー解説図" style="max-width:100%; border-radius:8px; box-shadow:0 4px 20px rgba(0,0,0,0.5);" />
          </a>
        </div>

        <div class="flow-card-box" style="margin-top: 1.5rem;">
          <h4 style="color:#FFF; margin-bottom:1rem; font-size:1.1rem;">🔄 お金の引っ越し（資金の動き）3ステップ</h4>
          
          <div style="background:rgba(239,68,68,0.15); border:1px solid rgba(239,68,68,0.4); padding:1rem; border-radius:8px; margin-bottom:1rem;">
            <div style="color:#FCA5A5; font-weight:700; font-size:1.05rem;">❌ STEP 1: お金が逃げ出した場所 (OUT)</div>
            <p style="color:#CBD5E1; font-size:0.95rem; margin-top:0.3rem;">
              • 🛢️ <strong>原油 & 石油株</strong>（中東戦争の緊張が和らぎ、急落！）<br>
              • 💵 <strong>米ドル</strong>（有事の安全資産としての買われ過ぎが解消）
            </p>
          </div>

          <div style="text-align:center; font-size:1.5rem; color:#60A5FA; margin:0.5rem 0;">⬇️（抜け出た大量のお金が移動）⬇️</div>

          <div style="background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.4); padding:1rem; border-radius:8px; margin-bottom:1rem;">
            <div style="color:#6EE7B7; font-weight:700; font-size:1.05rem;">⭕ STEP 2: お金が引っ越した場所 (IN)</div>
            <p style="color:#CBD5E1; font-size:0.95rem; margin-top:0.3rem;">
              • 💻 <strong>ハイテク・半導体株</strong>（原油安でインフレ懸念が消え、猛烈買い戻し！）<br>
              • 🏛️ <strong>米国債（金利低下）</strong>（インフレ沈静化を期待して債券へ資金流入）<br>
              • 🥇 <strong>金 (Gold)</strong>（米金利低下＆ドル安のW追い風で上昇）<br>
              • ✈️ <strong>航空・消費株</strong>（原油安で燃料コストが下がるメリット）
            </p>
          </div>

          <div style="background:rgba(245,158,11,0.15); border:1px solid rgba(245,158,11,0.4); padding:1rem; border-radius:8px;">
            <div style="color:#FDE68A; font-weight:700; font-size:1.05rem;">⚠️ STEP 3: 一番重要なまとめ</div>
            <p style="color:#CBD5E1; font-size:0.95rem; margin-top:0.3rem;">
              これは「イケイケの新しい株買い」ではなく、<strong>「先週まで偏りすぎていた売り買いを元に戻す取引（手仕舞い・買い戻し）」</strong>です！
            </p>
          </div>
        </div>
      </div>

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

  function renderMarkdown(md) {
    if (!md) return '';
    let html = md;

    // 「5. クロスアセット資金フロー」セクションを添付画像どおりの美しい3カラムビジュアルカードへ自動置換
    const crossAssetGridHTML = `
      <div class="cross-asset-grid-3col">
        <div class="ca-card-red">
          <div class="ca-title">🔻 売られたもの・縮小されたポジション</div>
          <ul class="ca-list">
            <li>原油ロング・エネルギー株</li>
            <li>インフレ取引 (債券ショート・コモディティ)</li>
            <li>有事のドルロング</li>
            <li>ハイテク株ショート</li>
            <li>米国債ショート</li>
          </ul>
        </div>
        <div class="ca-card-green">
          <div class="ca-title">🟢 買われたもの・拡大されたポジション</div>
          <ul class="ca-list">
            <li>米国債 (金利低下)</li>
            <li>ナスダック・半導体・ハイテク株</li>
            <li>航空・運輸・消費関連株</li>
            <li>金 (Gold)</li>
            <li>ユーロ・スイスフラン</li>
            <li>BTC (リスク資産)</li>
          </ul>
        </div>
        <div class="ca-card-blue">
          <div class="ca-title">💡 資金の動きの特徴</div>
          <ul class="ca-list">
            <li>原油安でも金が上昇 (インフレ懸念後退＋米金利低下＋ドル安のW効果)</li>
            <li>リスクオフからリスクオンへの回帰はショートカバー中心</li>
            <li>新規の強いリスクオンはまだ入っていない</li>
          </ul>
        </div>
      </div>
    `;

    // 9章（または5章）のクロスアセット資金フローの箇所を置換
    html = html.replace(/### 9．クロスアセット資金フロー[\s\S]*?(?=### 10．)/g, '### 5．クロスアセット資金フロー (先週から今日への変化)\n\n' + crossAssetGridHTML + '\n\n');
    html = html.replace(/### 5．クロスアセット資金フロー[\s\S]*?(?=### 6．)/g, '### 5．クロスアセット資金フロー (先週から今日への変化)\n\n' + crossAssetGridHTML + '\n\n');

    html = html.replace(/^# (.*$)/gim, '<h1 style="color:#FFF; font-size:1.6rem; font-weight:800; border-bottom:2px solid var(--accent-purple); padding-bottom:0.5rem; margin:1.5rem 0 1rem 0;">$1</h1>');
    html = html.replace(/^### (.*$)/gim, '<h3 style="color:#60A5FA; font-size:1.2rem; font-weight:700; margin:1.5rem 0 0.8rem 0; padding-left:0.5rem; border-left:4px solid #3B82F6;">$1</h3>');
    html = html.replace(/^#### (.*$)/gim, '<h4 style="color:#F3F4F6; font-size:1.05rem; font-weight:600; margin:1.2rem 0 0.5rem 0;">$1</h4>');
    html = html.replace(/^---$/gim, '<hr style="border:none; border-top:1px solid rgba(255,255,255,0.1); margin:1.5rem 0;">');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#FFF; font-weight:700;">$1</strong>');
    html = html.replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1); color:#F59E0B; padding:0.1rem 0.4rem; border-radius:4px;">$1</code>');
    html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:1.5rem; margin-bottom:0.3rem;">$1</li>');

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
        if (line.includes('---')) continue;
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
