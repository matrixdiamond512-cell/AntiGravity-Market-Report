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

  // レポートデータの読み込み
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

  // レポートカード一覧のレンダリング
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

  // モーダル表示
  function openModal(report) {
    modalTag.textContent = report.tag || report.time;
    modalTitle.textContent = report.title;
    
    // 市場データ表の構築
    if (report.marketData && report.marketData.length > 0) {
      let tableHTML = `
        <h4 style="color:#FFF; margin-bottom: 0.5rem; font-size: 1rem;">■ 主要市場データ</h4>
        <table class="data-table">
          <thead>
            <tr>
              <th>銘柄・指標</th>
              <th>終値 / 現在値</th>
              <th>前日比</th>
              <th>騰落率 / 変化</th>
            </tr>
          </thead>
          <tbody>
      `;

      report.marketData.forEach(item => {
        const statusClass = item.status === 'up' ? 'up' : (item.status === 'down' ? 'down' : '');
        tableHTML += `
          <tr>
            <td style="color:#FFF; font-weight:600;">${escapeHTML(item.name)}</td>
            <td>${escapeHTML(item.close)}</td>
            <td class="${statusClass}">${escapeHTML(item.change)}</td>
            <td class="${statusClass}">${escapeHTML(item.pct)}</td>
          </tr>
        `;
      });

      tableHTML += `</tbody></table>`;
      modalMarketData.innerHTML = tableHTML;
    } else {
      modalMarketData.innerHTML = '';
    }

    // 本文フォーマット
    modalFullText.innerHTML = formatMarkdown(report.fullText || report.summary);

    reportModal.classList.add('active');
    reportModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  // モーダルを閉じる
  function closeModal() {
    reportModal.classList.remove('active');
    reportModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modalClose.addEventListener('click', closeModal);
  reportModal.addEventListener('click', (e) => {
    if (e.target === reportModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reportModal.classList.contains('active')) {
      closeModal();
    }
  });

  // リアルタイム検索フィルター
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

  // エスケープHTML
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

  // 簡易マークダウン風フォーマット
  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHTML(text);
    html = html.replace(/### (.*?)\n/g, '<h3 style="color:#FFF; font-size:1.1rem; margin-top:1.2rem; margin-bottom:0.5rem;">$1</h3>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#FFF;">$1</strong>');
    html = html.replace(/\n/g, '<br>');
    return html;
  }
});
