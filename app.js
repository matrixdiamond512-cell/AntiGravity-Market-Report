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

    // 完璧な動的日本語HTMLダッシュボード
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
            <div class="theme-title">≫ ${escapeHTML(report.theme || '中東リスク緩和による「スタグフレーション取引の巻き戻し」')}</div>
            <div class="theme-flow">
              攻撃停止 ➔ 原油急落 ➔ インフレ懸念後退 ➔ 米金利低下期待 ➔ 株高（特にハイテク）・金上昇・ドル売りの流れ<br>
              <span style="color:#94A3B8; font-size:0.8rem;">（※上昇は新規リスクオンではなく、ショートカバーやポジション調整が中心。FOMC・大型決算・日銀会合前で上値追いは限定的。）</span>
            </div>
          </div>
        </div>

        <!-- 2. 主要市場データ & 3. 重要ニュース & 4. 主な変化 -->
        <div class="dash-grid-3col">
          <div class="dash-panel">
            <div class="panel-title"><span class="num">2</span> 主要市場データ</div>
            <div class="market-grid-dash">
              ${mGridHTML}
            </div>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">3</span> 重要ニュース</div>
            <div class="news-item-dash">
              <div class="news-head"><span>米国とイランが攻撃を一時停止</span><span class="badge-impact high">非常に大</span></div>
              <div style="color:#94A3B8;">ホルムズ海峡リスク後退 ➔ 原油急落、株高、債券買い、ドル売り</div>
            </div>
            <div class="news-item-dash">
              <div class="news-head"><span>イランは米国との交渉を否定</span><span class="badge-impact high">大</span></div>
              <div style="color:#94A3B8;">正式和平ではなく一時休止の可能性 ➔ 原油・為替の振れ幅拡大</div>
            </div>
            <div class="news-item-dash">
              <div class="news-head"><span>今週後半: FOMC・日銀・米GAFAM決算</span><span class="badge-impact high">非常に大</span></div>
              <div style="color:#94A3B8;">イベント前でポジション調整 ➔ 決算が次のトレンドを決定</div>
            </div>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">4</span> 直近の主な変化</div>
            <ul style="font-size:0.8rem; color:#CBD5E1; list-style:none; padding:0;">
              <li style="margin-bottom:0.4rem;">• <strong>USD/JPY</strong>: 163円台半ば〜後半の狭いレンジで推移</li>
              <li style="margin-bottom:0.4rem;">• <strong>EUR/USD</strong>: 1.1375付近で揉み合い</li>
              <li style="margin-bottom:0.4rem;">• <strong>WTI原油</strong>: 83.35ドル前後で低水準横ばい</li>
              <li>• <strong>総括</strong>: イベント前で方向感の探り合いが継続</li>
            </ul>
          </div>
        </div>

        <!-- 5. クロスアセット資金フロー & 6. 需給・ポジションの状況 -->
        <div class="dash-grid-2col">
          <div class="dash-panel">
            <div class="panel-title"><span class="num">5</span> クロスアセット資金フロー</div>
            <div class="ca-3col-dash">
              <div class="ca-col-dash red">
                <div class="h">🔻 売られたもの</div>
                <div>• 原油ロング & エネルギー株</div>
                <div>• インフレ取引 (債券ショート)</div>
                <div>• 有事のドルロング / ハイテクショート</div>
              </div>
              <div class="ca-col-dash green">
                <div class="h">🟢 買われたもの</div>
                <div>• 米国債 (金利低下)</div>
                <div>• ナスダック・半導体株</div>
                <div>• 航空・運輸・消費株 / 金 / BTC</div>
              </div>
              <div class="ca-col-dash blue">
                <div class="h">💡 特徴</div>
                <div>• 原油安でも金上昇 (ドル安効果)</div>
                <div>• ショートカバー中心の回帰</div>
                <div>• 新規の強いリスクオンはまだない</div>
              </div>
            </div>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">6</span> 需給・ポジションの状況</div>
            <ul style="font-size:0.8rem; color:#CBD5E1; list-style:none; padding:0;">
              <li style="margin-bottom:0.35rem;">🛢️ <strong>原油</strong>: 投機ロング手仕舞い進行。82〜83ドル割れで清算加速</li>
              <li style="margin-bottom:0.35rem;">🏛️ <strong>米金利</strong>: 原油安で低下も、FOMC前で上昇リスク残存</li>
              <li style="margin-bottom:0.35rem;">💴 <strong>為替</strong>: ドルロング解消進むも、163円台半ばで実需ドル買い下支え</li>
              <li style="margin-bottom:0.35rem;">💻 <strong>株式</strong>: ハイテク・半導体買い戻し。新規買いは出来高次第</li>
              <li style="margin-bottom:0.35rem;">🥇 <strong>金</strong>: 実質金利低下とドル安で買い優勢。4,100ドル台推移</li>
              <li>₿ <strong>BTC</strong>: 64,000〜65,000ドル台回復もETF資金流出への警戒残る</li>
            </ul>
          </div>
        </div>

        <!-- 7. 6市場の見通し -->
        <div class="dash-panel" style="margin-bottom:0.85rem;">
          <div class="panel-title"><span class="num">7</span> 6市場の見通し (売買判断・注目材料・重要水準)</div>
          <div class="market6-grid-dash">
            <div class="m6-card">
              <div class="m6-head"><span>🥇 金 (Gold)</span><span class="stance bull">やや強気</span></div>
              <div><strong>ターゲット:</strong> 4,080〜4,120ドル</div>
              <div><strong>支持:</strong> 4,050 / <strong>抵抗:</strong> 4,100</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>🛢️ WTI原油</span><span class="stance bear">弱気</span></div>
              <div><strong>ターゲット:</strong> 82.00〜84.00ドル</div>
              <div><strong>支持:</strong> 82 / <strong>抵抗:</strong> 85</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>🇯🇵 日経225先物</span><span class="stance neu">中立〜やや強気</span></div>
              <div><strong>ターゲット:</strong> 65,000〜65,500円</div>
              <div><strong>支持:</strong> 64,800 / <strong>抵抗:</strong> 65,500</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>💴 USD/JPY</span><span class="stance neu">中立</span></div>
              <div><strong>ターゲット:</strong> 163.20〜164.00円</div>
              <div><strong>支持:</strong> 163.00 / <strong>抵抗:</strong> 164.20</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>💶 EUR/USD</span><span class="stance neu">中立</span></div>
              <div><strong>ターゲット:</strong> 1.1350〜1.1420</div>
              <div><strong>支持:</strong> 1.1320 / <strong>抵抗:</strong> 1.1420</div>
            </div>
            <div class="m6-card">
              <div class="m6-head"><span>₿ BTCUSD</span><span class="stance neu">中立</span></div>
              <div><strong>ターゲット:</strong> 64,000〜65,500ドル</div>
              <div><strong>支持:</strong> 63,800 / <strong>抵抗:</strong> 66,000</div>
            </div>
          </div>
        </div>

        <!-- 8. メインシナリオ & 9. 代替シナリオ & 10. シナリオが崩れる条件 -->
        <div class="dash-grid-3col">
          <div class="dash-panel">
            <div class="panel-title"><span class="num">8</span> メインシナリオ (確率: 50%)</div>
            <div style="font-size:0.8rem; color:#CBD5E1;">
              攻撃停止維持、原油安継続。米金利低下基調でハイテク株買い戻し続く。日経先物は65,000円台を維持。<br>
              <div style="margin-top:0.4rem; padding:0.4rem; background:rgba(255,255,255,0.05); border-radius:4px; text-align:center; color:#60A5FA;">
                原油↓ 金利↓ 株↑ ドル↓ 金↑ BTC↑
              </div>
            </div>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">9</span> 代替シナリオ</div>
            <ul style="font-size:0.78rem; color:#CBD5E1; list-style:none; padding:0;">
              <li style="margin-bottom:0.3rem;">1️⃣ <strong>中東情勢再燃 (25%)</strong>: 攻撃再開 ➔ 原油急高・金利上昇・株安</li>
              <li style="margin-bottom:0.3rem;">2️⃣ <strong>FOMC後リスクオン (15%)</strong>: パウエルハト派 ➔ 株高加速</li>
              <li>3️⃣ <strong>日銀利上げ警戒 (10%)</strong>: 政策変更観測 ➔ 円高・株調整</li>
            </ul>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">10</span> シナリオが崩れる条件 (要警戒)</div>
            <ul style="font-size:0.78rem; color:#FCA5A5; list-style:none; padding:0;">
              <li style="margin-bottom:0.25rem;">• WTIが86ドルを超えて急反発</li>
              <li style="margin-bottom:0.25rem;">• 米10年債利回りが4.72%を突破</li>
              <li style="margin-bottom:0.25rem;">• 日経225先物が64,800円以下へ下落</li>
              <li style="margin-bottom:0.25rem;">• USD/JPYが164.20円突破</li>
              <li>• 金が4,050ドル割れ / BTCが63,800ドル割れ</li>
            </ul>
          </div>
        </div>

        <!-- 11. 注目ポイント & 12. 海外投資家・需給 & 13. 結論 -->
        <div class="dash-grid-3col">
          <div class="dash-panel">
            <div class="panel-title"><span class="num">11</span> 注目ポイント</div>
            <div style="font-size:0.78rem; color:#CBD5E1;">
              <strong>今夜:</strong> 米・消費者信頼感指数 / 米GAFAM決算発表<br>
              <strong>明日〜今週:</strong> FOMC声明・パウエル会見 / 日銀金融政策決定会合
            </div>
          </div>

          <div class="dash-panel">
            <div class="panel-title"><span class="num">12</span> 海外投資家・需給フロー</div>
            <div style="font-size:0.78rem; color:#CBD5E1;">
              • <strong>日本株</strong>: 海外勢の先物買い越し継続も慎重姿勢<br>
              • <strong>米国株</strong>: ハイテク大型株へ資金再流入<br>
              • <strong>為替(CFTC)</strong>: ドルロング解消一巡
            </div>
          </div>

          <div class="dash-panel" style="background:linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.9) 100%); border-color:var(--accent-purple);">
            <div class="panel-title" style="background:var(--accent-purple); color:#FFF;"><span class="num" style="background:#FFF; color:#A855F7;">13</span> 結論</div>
            <div style="font-size:0.78rem; color:#FFF; line-height:1.5;">
              原油急落によるスタグフレーション懸念の後退が相場の下支え要因です。今夜の米GAFAM決算と明日以降のFOMC・日銀政策決定会合を見極める展開が続きます。
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
