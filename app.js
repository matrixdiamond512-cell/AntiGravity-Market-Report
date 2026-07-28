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

    // 動的な市場データグリッド生成
    let mGridHTML = '';
    if (report.marketData && Array.isArray(report.marketData)) {
      report.marketData.forEach(item => {
        const cls = item.status === 'down' ? 'down' : 'up';
        mGridHTML += `<div class="market-item-dash"><span>${escapeHTML(item.name)}</span><span class="val ${cls}">${escapeHTML(item.close)} (${escapeHTML(item.pct)})</span></div>`;
      });
    }

    // 全16セクション完全対応プロ仕様動的ダッシュボード
    const dashboardHTML = `
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h2>${escapeHTML(report.title || 'マーケットレポート')}</h2>
          <div class="timestamp">基準時刻：日本時間 ${escapeHTML(report.date || '')} ${escapeHTML(report.time || '')}前後までの情報</div>
        </div>

        <!-- 1. 今日の相場テーマ -->
        <div class="dash-panel" style="margin-bottom:0.85rem;">
          <div class="panel-title"><span class="num">1</span> 今日の相場テーマ</div>
          <div class="theme-box">
            <div class="theme-title">≫ ${escapeHTML(report.theme || 'アジア半導体株急落とAI投資不安・FOMC利上げ警戒によるリスク縮小')}</div>
            <div class="theme-flow">
              中国競争警戒＋AI投資負担懸念＋FOMC利上げリスク ➔ 韓国半導体サーキットブレーカー ➔ アジア・レバレッジ解消 ➔ 日本の半導体・値がさ株へ売り波及 ➔ 日経225先物急落
            </div>
          </div>
        </div>

        <!-- 2. 主要市場データ & 3. 重要ニュース & 4. 12:00からの主な変化 -->
        <div class="dash-grid-3col">
          <div class="dash-panel">
            <div class="panel-title"><span class="num">2</span> 主要市場データ (16:00確認値)</div>
            <div class="market-grid-dash">
              ${mGridHTML}
            </div>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">3</span> 主な動向と整合性</div>
            <div class="news-item-dash">
              <div class="news-head"><span>第1位：アジア半導体株急落</span><span class="badge-impact high">非常大</span></div>
              <div style="color:#94A3B8;">韓国サーキットブレーカー、日本の半導体・値がさ株へ売り波及</div>
            </div>
            <div class="news-item-dash">
              <div class="news-head"><span>第2位：AI投資・資金負担懸念</span><span class="badge-impact high">大</span></div>
              <div style="color:#94A3B8;">巨額投資の持続可能性・キャッシュフロー・回収への懸念</div>
            </div>
            <div class="news-item-dash">
              <div class="news-head"><span>第3位：FOMC利上げ警戒</span><span class="badge-impact med">大</span></div>
              <div style="color:#94A3B8;">利上げ確率上昇 ➔ ドル支援、金・高PER株・BTC上値抑制</div>
            </div>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">4</span> 12:00からの変化</div>
            <ul style="font-size:0.8rem; color:#CBD5E1; list-style:none; padding:0;">
              <li style="margin-bottom:0.4rem;">• <strong>日経先物</strong>: 安値から約280円戻すも、半導体への新規買い入らず</li>
              <li style="margin-bottom:0.4rem;">• <strong>USD/JPY</strong>: 163.70円台で小幅揉み合い</li>
              <li style="margin-bottom:0.4rem;">• <strong>WTI原油</strong>: 81.2〜81.4ドルへ下落推移</li>
              <li>• <strong>総括</strong>: 投げ売り後、短期買い戻しにとどまりテーマ不変</li>
            </ul>
          </div>
        </div>

        <!-- 5. クロスアセット資金フロー & 6. 需給・ポジションの状況 -->
        <div class="dash-grid-2col">
          <div class="dash-panel">
            <div class="panel-title"><span class="num">5</span> クロスアセット資金フロー</div>
            <div class="ca-3col-dash">
              <div class="ca-col-dash red">
                <div class="h">🔻 資金流出元</div>
                <div>• 韓国・日本半導体株</div>
                <div>• AI関連高PER株</div>
                <div>• BTC等高ベータ資産 / 金 / 原油</div>
                <div>• 半導体レバレッジポジション</div>
              </div>
              <div class="ca-col-dash green">
                <div class="h">🟢 資金流入先</div>
                <div>• 現金・米ドル</div>
                <div>• 一部短期国債</div>
                <div>• 航空・陸運・小売等原油安メリット株</div>
                <div>• 通信・医薬品ディフェンシブ株</div>
              </div>
              <div class="ca-col-dash blue">
                <div class="h">💡 ローテーション変化</div>
                <div>• 昨日の「エネルギー➔株・航空・消費」から</div>
                <div>• 今日は「半導体・AI・BTC➔現金・ドル・ディフェンシブ」へ</div>
              </div>
            </div>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">6</span> 需給・ポジションの状況</div>
            <ul style="font-size:0.8rem; color:#CBD5E1; list-style:none; padding:0;">
              <li style="margin-bottom:0.35rem;">🏯 <strong>日経先物</strong>: 海外勢売り・現物売り・CTA売り・レバレッジ縮小が重なる</li>
              <li style="margin-bottom:0.35rem;">💴 <strong>為替</strong>: 米利上げ警戒と円キャリー縮小・買い戻しが拮抗</li>
              <li style="margin-bottom:0.35rem;">💶 <strong>ユーロ</strong>: ドル高重しも原油安による交易条件改善が下支え</li>
              <li style="margin-bottom:0.35rem;">🥇 <strong>金</strong>: ドル高でロング利確優勢</li>
              <li style="margin-bottom:0.35rem;">🛢️ <strong>原油</strong>: プレミアム剥落・短期ロング清算継続</li>
              <li>₿ <strong>BTC</strong>: アジア株・半導体株とともにリスク縮小の影響</li>
            </ul>
          </div>
        </div>

        <!-- 7. 6市場の見通し -->
        <div class="dash-panel" style="margin-bottom:0.85rem;">
          <div class="panel-title"><span class="num">7</span> 6市場の見通し (売買判断・重要水準)</div>
          <div class="market6-grid-dash">
            <div class="m6-card">
              <div class="m6-head"><span>🥇 金 (Gold)</span><span class="stance bear">中立〜やや弱気</span></div>
              <div><strong>ターゲット:</strong> 4,040〜4,075ドル</div>
              <div><strong>支持:</strong> 4,040 / <strong>抵抗:</strong> 4,075</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>🛢️ WTI原油</span><span class="stance bear">弱気継続</span></div>
              <div><strong>ターゲット:</strong> 81.2〜82.6ドル</div>
              <div><strong>支持:</strong> 81.0 / <strong>抵抗:</strong> 82.6</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>🇯🇵 日経225先物</span><span class="stance bear">弱気 (短期戻し注意)</span></div>
              <div><strong>ターゲット:</strong> 62,000〜63,000円</div>
              <div><strong>支持:</strong> 62,000 / <strong>抵抗:</strong> 63,000</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>💴 USD/JPY</span><span class="stance neu">中立</span></div>
              <div><strong>ターゲット:</strong> 163.65〜164.00円</div>
              <div><strong>支持:</strong> 163.65 / <strong>抵抗:</strong> 164.00</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>💶 EUR/USD</span><span class="stance bear">中立〜やや弱気</span></div>
              <div><strong>ターゲット:</strong> 1.1360〜1.1380</div>
              <div><strong>支持:</strong> 1.1360 / <strong>抵抗:</strong> 1.1380</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>₿ BTCUSD</span><span class="stance bear">弱気〜中立</span></div>
              <div><strong>ターゲット:</strong> 参考1,034万円(日中-3%)</div>
              <div><strong>支持:</strong> 1,000万 / <strong>抵抗:</strong> 1,050万</div>
            </div>
          </div>
        </div>

        <!-- 8. メインシナリオ & 9. 代替シナリオ & 10. シナリオが崩れる条件 -->
        <div class="dash-grid-3col">
          <div class="dash-panel">
            <div class="panel-title"><span class="num">8</span> 全体メインシナリオ</div>
            <div style="font-size:0.8rem; color:#CBD5E1;">
              NY市場でアジアの半導体急落を受けてハイテク・AI株に売り先行。寄り付き後はポジション調整で短期買い戻し。<br>
              <div style="margin-top:0.4rem; padding:0.4rem; background:rgba(255,255,255,0.05); border-radius:4px; text-align:center; color:#FCA5A5;">
                半導体売り➔Nasdaq下落➔日経先物抑制➔BTC下落➔円キャリー解消➔ドル円抑制
              </div>
            </div>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">9</span> 代替シナリオ (3パターン)</div>
            <ul style="font-size:0.78rem; color:#CBD5E1; list-style:none; padding:0;">
              <li style="margin-bottom:0.3rem;">1️⃣ <strong>半導体自律反発</strong>: Nvidia/SOX反発 ➔ 日経先物63,000〜63,500円</li>
              <li style="margin-bottom:0.3rem;">2️⃣ <strong>世界的位置解消</strong>: 米半導体続落 ➔ 日経先物62,000円割れ</li>
              <li>3️⃣ <strong>中東緊張再燃</strong>: 協議決裂 ➔ 原油・金・金利高、株下落</li>
            </ul>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">10</span> シナリオが崩れる条件 (要警戒)</div>
            <ul style="font-size:0.78rem; color:#FCA5A5; list-style:none; padding:0;">
              <li style="margin-bottom:0.25rem;">• 【弱気修正】日経先物63,500円回復、SOX/Nvidiaプラ転</li>
              <li style="margin-bottom:0.25rem;">• 【弱気修正】米10年債4.60%割れ、EUR/USD 1.1420上抜け</li>
              <li style="margin-bottom:0.25rem;">• 【弱気強化】日経先物62,000円明確割れ、Nvidia/SOX続落</li>
              <li>• 【弱気強化】USD/JPY 163円割れ、VIX急上昇</li>
            </ul>
          </div>
        </div>

        <!-- 11. 注目ポイント & 12. 引き継ぎ & 13. 結論 -->
        <div class="dash-grid-3col">
          <div class="dash-panel">
            <div class="panel-title"><span class="num">11</span> 今後のイベント</div>
            <div style="font-size:0.78rem; color:#CBD5E1;">
              <strong>今夜NY:</strong> 米消費者信頼感、FOMC初日、米大型企業決算<br>
              <strong>今週:</strong> FOMC金利発表、米GDP、GAFAM決算、日銀決定会合
            </div>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">12</span> NY時間への引き継ぎ</div>
            <div style="font-size:0.78rem; color:#CBD5E1;">
              • Nvidia・SOX・Nasdaqの寄り付き動向<br>
              • 最重要: アジアの半導体投げ売りが米国半導体株へ連鎖するか、NY勢が押し目買いするか
            </div>
          </div>

          <div class="dash-panel" style="background:linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%); border-color:var(--accent-purple);">
            <div class="panel-title" style="background:var(--accent-purple); color:#FFF;"><span class="num" style="background:#FFF; color:#A855F7;">13</span> 結論</div>
            <div style="font-size:0.78rem; color:#FFF; line-height:1.5;">
              本日の相場を動かしているのは原油ではなく、AI投資の持続可能性・半導体レバレッジ解消・FOMC利上げ警戒。今夜の最大判断軸は「原油安を好感できるか」ではなく「半導体株の売りを吸収できるか」である。
            </div>
          </div>
        </div>
      </div>
    `;

    const renderedHTML = renderMarkdown(report.fullText || '');

    modalFullText.innerHTML = `
      <div class="tab-nav">
        <button class="tab-btn active" data-tab="tab-dash">📊 全13パネル インフォグラフィック・ダッシュボード</button>
        <button class="tab-btn" data-tab="tab-text">📝 詳細全文テキスト (全16セクション完全版)</button>
      </div>

      <div id="tab-dash" class="tab-pane active">
        ${dashboardHTML}
      </div>

      <div id="tab-text" class="tab-pane" style="line-height: 1.8; color: #E2E8F0; padding: 1rem 0;">
        ${renderedHTML}
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
