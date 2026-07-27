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

    // 完璧な日本語で描画される全13パネル統合インフォグラフィック・ダッシュボードHTML
    const dashboardHTML = `
      <div class="dashboard-container">
        <div class="dashboard-header">
          <h2>マーケットレポート | 2026/07/27 (月) 21:00</h2>
          <div class="timestamp">基準時刻：日本時間 2026/07/27 21:00前後までの情報</div>
        </div>

        <!-- 1. 今日の相場テーマ -->
        <div class="dash-panel" style="margin-bottom:0.85rem;">
          <div class="panel-title"><span class="num">1</span> 今日の相場テーマ</div>
          <div class="theme-box">
            <div class="theme-title">中東リスク緩和による「スタグフレーション取引の巻き戻し」</div>
            <div class="theme-flow">
              攻撃停止 ➔ 原油急落 ➔ インフレ懸念後退 ➔ 米金利低下期待 ➔ 株高（特にハイテク）・金上昇・ドル売りの流れ<br>
              <span style="color:#94A3B8; font-size:0.8rem;">（※ただし、上昇は新規の強いリスクオンではなく、ショートカバーやポジション調整が中心。FOMC・大型ハイテク決算・日銀会合を控え、上値追いは限定的。）</span>
            </div>
          </div>
        </div>

        <!-- 2. 主要市場データ & 3. 重要ニュース & 4. 16:00からの主な変化 -->
        <div class="dash-grid-3col">
          <!-- 2. 主要市場データ -->
          <div class="dash-panel">
            <div class="panel-title"><span class="num">2</span> 主要市場データ</div>
            <div class="market-grid-dash">
              <div class="market-item-dash"><span>🇯🇵 日経225(現物)</span><span class="val up">64,931.19 (+0.50%)</span></div>
              <div class="market-item-dash"><span>🏯 日経225先物(大阪)</span><span class="val up">65,230 (+60)</span></div>
              <div class="market-item-dash"><span>💵 USD/JPY</span><span class="val down">163円台半ば</span></div>
              <div class="market-item-dash"><span>💶 EUR/USD</span><span class="val up">1.1400近辺</span></div>
              <div class="market-item-dash"><span>🛢️ WTI原油</span><span class="val down">82ドル台</span></div>
              <div class="market-item-dash"><span>🥇 金先物(COMEX)</span><span class="val up">4,103.05ドル (+0.79%)</span></div>
              <div class="market-item-dash"><span>₿ BTCUSD</span><span class="val up">65,263.4ドル (+1.13%)</span></div>
              <div class="market-item-dash"><span>🏛️ 米10年債利回り</span><span class="val down">4.64%台</span></div>
            </div>
          </div>

          <!-- 3. 重要ニュース -->
          <div class="dash-panel">
            <div class="panel-title"><span class="num">3</span> 重要ニュース</div>
            <div class="news-item-dash">
              <div class="news-head"><span>米国とイランが攻撃を一時停止</span><span class="badge-impact high">非常に大</span></div>
              <div style="color:#94A3B8;">ホルムズ海峡リスク後退 ➔ 原油急落、株高、債券買い、ドル売り</div>
            </div>
            <div class="news-item-dash">
              <div class="news-head"><span>イランは米国との交渉を否定</span><span class="badge-impact high">大</span></div>
              <div style="color:#94A3B8;">正式な和平ではなく一時休止の可能性 ➔ 原油・為替の振れ幅拡大</div>
            </div>
            <div class="news-item-dash">
              <div class="news-head"><span>フーシ派がサウジ石油施設を攻撃</span><span class="badge-impact med">中</span></div>
              <div style="color:#94A3B8;">紅海リスクは残存 ➔ 原油が一方向には下がりにくい要因</div>
            </div>
          </div>

          <!-- 4. 16:00からの主な変化 -->
          <div class="dash-panel">
            <div class="panel-title"><span class="num">4</span> 16:00からの主な変化</div>
            <ul style="font-size:0.8rem; color:#CBD5E1; list-style:none; padding:0;">
              <li style="margin-bottom:0.4rem;">• <strong>USD/JPY</strong>: 16時台に163.36円台まで下落後、ドル売り一服で163円台半ばへ戻す</li>
              <li style="margin-bottom:0.4rem;">• <strong>EUR/USD</strong>: 16時台に1.1418まで上昇後、1.1400付近へ反落</li>
              <li style="margin-bottom:0.4rem;">• <strong>WTI原油</strong>: 17時台に84ドル台へ一時下げ渋り後、20時台は82ドル台まで下落拡大</li>
              <li>• <strong>総括</strong>: ドル、ユーロ、日経先物は方向感の分岐点で推移</li>
            </ul>
          </div>
        </div>

        <!-- 5. クロスアセット資金フロー & 6. 需給・ポジションの状況 -->
        <div class="dash-grid-2col">
          <!-- 5. クロスアセット資金フロー -->
          <div class="dash-panel">
            <div class="panel-title"><span class="num">5</span> クロスアセット資金フロー</div>
            <div class="ca-3col-dash">
              <div class="ca-col-dash red">
                <div class="h">🔻 売られたもの</div>
                <div>• 原油・エネルギー株</div>
                <div>• インフレ取引 (債券ショート)</div>
                <div>• 有事のドルロング</div>
                <div>• ハイテク株ショート</div>
              </div>
              <div class="ca-col-dash green">
                <div class="h">🟢 買われたもの</div>
                <div>• 米国債 (金利低下)</div>
                <div>• ナスダック・半導体株</div>
                <div>• 航空・運輸・消費株</div>
                <div>• 金 (Gold) / ユーロ / BTC</div>
              </div>
              <div class="ca-col-dash blue">
                <div class="h">💡 特徴</div>
                <div>• 原油安でも金が上昇 (ドル安効果)</div>
                <div>• ショートカバー中心の回帰</div>
                <div>• 新規の強いリスクオンはまだない</div>
              </div>
            </div>
          </div>

          <!-- 6. 需給・ポジションの状況 -->
          <div class="dash-panel">
            <div class="panel-title"><span class="num">6</span> 需給・ポジションの状況</div>
            <ul style="font-size:0.8rem; color:#CBD5E1; list-style:none; padding:0;">
              <li style="margin-bottom:0.35rem;">🛢️ <strong>原油</strong>: 投機ロングが積み上がり手仕舞い進行。82〜83ドル割れで清算加速</li>
              <li style="margin-bottom:0.35rem;">🏛️ <strong>米金利</strong>: 原油安で低下も、FOMC前で上昇リスク残存</li>
              <li style="margin-bottom:0.35rem;">💴 <strong>為替</strong>: ドルロング手仕舞い進行も163円台半ばで実需ドル買い下支え</li>
              <li style="margin-bottom:0.35rem;">💻 <strong>株式</strong>: ハイテク・半導体買い戻し。新規の強い買いは出来高次第</li>
              <li style="margin-bottom:0.35rem;">🥇 <strong>金</strong>: 実質金利低下とドル安で買い優勢。4,100ドル台推移</li>
              <li>₿ <strong>BTC</strong>: 65,000ドル台回復もETF資金流出への警戒残る</li>
            </ul>
          </div>
        </div>

        <!-- 7. 6市場の見通し -->
        <div class="dash-panel" style="margin-bottom:0.85rem;">
          <div class="panel-title"><span class="num">7</span> 6市場の見通し (売買判断・注目材料・重要水準)</div>
          <div class="market6-grid-dash">
            <div class="m6-card">
              <div class="m6-head"><span>🥇 金 (Gold)</span><span class="stance bull">やや強気</span></div>
              <div><strong>ターゲット:</strong> 4,115〜4,150ドル</div>
              <div><strong>支持:</strong> 4,085 / <strong>抵抗:</strong> 4,120</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>🛢️ WTI原油</span><span class="stance bear">弱気 (急反発注意)</span></div>
              <div><strong>ターゲット:</strong> 82.00ドル台</div>
              <div><strong>支持:</strong> 82 / 80 / <strong>抵抗:</strong> 85</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>🇯🇵 日経225先物</span><span class="stance neu">中立〜やや強気</span></div>
              <div><strong>ターゲット:</strong> 65,400〜65,800円</div>
              <div><strong>支持:</strong> 65,000 / <strong>抵抗:</strong> 65,400</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>💴 USD/JPY</span><span class="stance neu">中立</span></div>
              <div><strong>ターゲット:</strong> 163.50〜164.00円</div>
              <div><strong>支持:</strong> 163.30 / <strong>抵抗:</strong> 164.00</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>💶 EUR/USD</span><span class="stance neu">中立〜やや強気</span></div>
              <div><strong>ターゲット:</strong> 1.1418〜1.1450</div>
              <div><strong>支持:</strong> 1.1380 / <strong>抵抗:</strong> 1.1418</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>₿ BTCUSD</span><span class="stance bull">やや強気</span></div>
              <div><strong>ターゲット:</strong> 65,700〜66,500ドル</div>
              <div><strong>支持:</strong> 65,000 / <strong>抵抗:</strong> 65,700</div>
            </div>
          </div>
        </div>

        <!-- 8. メインシナリオ & 9. 代替シナリオ & 10. シナリオが崩れる条件 -->
        <div class="dash-grid-3col">
          <!-- 8. メインシナリオ -->
          <div class="dash-panel">
            <div class="panel-title"><span class="num">8</span> メインシナリオ (確率: 50%)</div>
            <div style="font-size:0.8rem; color:#CBD5E1;">
              攻撃停止維持、原油安が継続。米金利は低下基調で推移し、米株（特にハイテク）の買い戻し続く。日経先物は65,000円台を維持。<br>
              <div style="margin-top:0.4rem; padding:0.4rem; background:rgba(255,255,255,0.05); border-radius:4px; text-align:center; color:#60A5FA;">
                原油↓ 金利↓ 株↑ ドル↓ 金↑ BTC↑
              </div>
            </div>
          </div>

          <!-- 9. 代替シナリオ -->
          <div class="dash-panel">
            <div class="panel-title"><span class="num">9</span> 代替シナリオ</div>
            <ul style="font-size:0.78rem; color:#CBD5E1; list-style:none; padding:0;">
              <li style="margin-bottom:0.3rem;">1️⃣ <strong>中東緊張再燃 (25%)</strong>: 攻撃再開 ➔ 原油急高・金利上昇・株安・ドル高</li>
              <li style="margin-bottom:0.3rem;">2️⃣ <strong>本格的リスクオン (15%)</strong>: 原油82ドル割れ・金利4.60%割れ ➔ 株高加速</li>
              <li>3️⃣ <strong>金利反発シナリオ (10%)</strong>: 経済指標や関税で金利反発 ➔ ドル買い戻し</li>
            </ul>
          </div>

          <!-- 10. シナリオが崩れる条件 -->
          <div class="dash-panel">
            <div class="panel-title"><span class="num">10</span> シナリオが崩れる条件 (要警戒)</div>
            <ul style="font-size:0.78rem; color:#FCA5A5; list-style:none; padding:0;">
              <li style="margin-bottom:0.25rem;">• WTIが85ドルを即回復、または石油施設攻撃激化</li>
              <li style="margin-bottom:0.25rem;">• 米10年債利回りが4.70%を突破</li>
              <li style="margin-bottom:0.25rem;">• 日経225先物が65,000円を割り64,800円以下へ下落</li>
              <li style="margin-bottom:0.25rem;">• USD/JPYが164.00円を突破 / EUR/USDが1.1380割れ</li>
              <li>• 金が4,085ドル割れ / BTCが64,000ドル割れ</li>
            </ul>
          </div>
        </div>

        <!-- 11. 注目ポイント & 12. 海外投資家・需給 & 13. 結論 -->
        <div class="dash-grid-3col">
          <!-- 11. 注目ポイント -->
          <div class="dash-panel">
            <div class="panel-title"><span class="num">11</span> 今夜〜翌東京時間の注目ポイント</div>
            <div style="font-size:0.78rem; color:#CBD5E1;">
              <strong>今夜:</strong> 21:30 米・耐久財受注速報値 / 米株寄り付き後のハイテク反応 / 米10年債利回り<br>
              <strong>翌東京時間:</strong> 日経先物65,000円維持か / 半導体に出来高を伴う買いが入るか / 日銀会合を前に金利・為替がどう動くか
            </div>
          </div>

          <!-- 12. 海外投資家・需給 -->
          <div class="dash-panel">
            <div class="panel-title"><span class="num">12</span> 海外投資家・需給フロー</div>
            <div style="font-size:0.78rem; color:#CBD5E1;">
              • <strong>日本株</strong>: 先物買い越し継続も上値追いは慎重<br>
              • <strong>米国株</strong>: 原油安でエネルギーから他セクターへ資金シフト<br>
              • <strong>為替(CFTC)</strong>: ドルロング解消進行中
            </div>
          </div>

          <!-- 13. 結論 -->
          <div class="dash-panel" style="background:linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%); border-color:var(--accent-purple);">
            <div class="panel-title" style="background:var(--accent-purple); color:#FFF;"><span class="num" style="background:#FFF; color:#A855F7;">13</span> 結論</div>
            <div style="font-size:0.78rem; color:#FFF; line-height:1.5;">
              今日の相場は原油急落を起点にしたポジション調整が中心。現時点ではリスクオン回帰の入り口にあるが、継続には米株（特にハイテク）の強さと金利の安定が不可欠。今夜の米市場の反応が翌東京時間の方向性を決める。
            </div>
          </div>
        </div>
      </div>
    `;

    const renderedHTML = renderMarkdown(report.fullText || '');

    modalFullText.innerHTML = `
      <div class="tab-nav">
        <button class="tab-btn active" data-tab="tab-dash">📊 全13パネル インフォグラフィック・ダッシュボード</button>
        <button class="tab-btn" data-tab="tab-text">📝 詳細全文テキスト</button>
      </div>

      <!-- タブ1: 全13パネル インフォグラフィック・ダッシュボード（デフォルト表示） -->
      <div id="tab-dash" class="tab-pane active">
        ${dashboardHTML}
      </div>

      <!-- タブ2: 詳細全文テキスト -->
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
