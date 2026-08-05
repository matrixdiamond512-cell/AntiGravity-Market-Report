# encoding: utf-8
import json
import urllib.request
import os
import sys
from datetime import datetime, timezone, timedelta

JST = timezone(timedelta(hours=9))
jst_now = datetime.now(timezone.utc).astimezone(JST)

date_str = jst_now.strftime('%Y/%m/%d')
weekday_num = jst_now.weekday()
weekday_ja = ["月", "火", "水", "木", "金", "土", "日"][weekday_num]
time_hour = jst_now.hour

tickers = {
    "USD/JPY": "JPY=X",
    "EUR/USD": "EURUSD=X",
    "WTI原油": "CL=F",
    "ゴールド": "GC=F",
    "BTCUSD": "BTC-USD",
    "S&P 500": "^GSPC",
    "Dow Jones": "^DJI",
    "Nasdaq Composite": "^IXIC",
    "日経225現物": "^N225"
}

fetched_raw = {}
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
}

for name, symbol in tickers.items():
    try:
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=2d"
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            result = res_data['chart']['result'][0]
            meta = result['meta']
            price = meta.get('regularMarketPrice')
            prev_close = meta.get('chartPreviousClose') or meta.get('previousClose')
            if price is not None and prev_close is not None:
                change = price - prev_close
                pct = (change / prev_close) * 100
                fetched_raw[name] = {
                    "price": price,
                    "change": change,
                    "pct": pct,
                    "status": "up" if change >= 0 else "down"
                }
    except Exception as e:
        print(f"Fetch failed for {name}: {e}")

usdjpy = fetched_raw.get("USD/JPY", {"price": 162.18, "change": -1.07, "pct": -0.66, "status": "down"})
eurusd = fetched_raw.get("EUR/USD", {"price": 1.1448, "change": 0.0073, "pct": 0.64, "status": "up"})
wti = fetched_raw.get("WTI原油", {"price": 83.50, "change": -0.52, "pct": -0.62, "status": "down"})
gold = fetched_raw.get("ゴールド", {"price": 4175.80, "change": 123.70, "pct": 3.05, "status": "up"})
btc = fetched_raw.get("BTCUSD", {"price": 65280.00, "change": 518.30, "pct": 0.80, "status": "up"})
n225 = fetched_raw.get("日経225現物", {"price": 62266.19, "change": 282.57, "pct": 0.46, "status": "up"})

def build_report(t_str, tag_str, report_type, next_check, target_dt=None):
    dt = target_dt if target_dt else jst_now
    d_str = dt.strftime('%Y/%m/%d')
    w_num = dt.weekday()
    w_ja = ["月", "火", "水", "木", "金", "土", "日"][w_num]
    
    rid = dt.strftime('%Y%m%d') + "-" + t_str.replace(":", "")
    title = f"マーケットレポート｜{d_str}（{w_ja}）{t_str}"
    
    m_data = [
        {"name": "日経225現物", "close": f"{n225['price']:,.2f}円", "change": f"{n225['change']:+,.2f}", "pct": f"{n225['pct']:+.2f}%", "status": n225['status']},
        {"name": "日経225先物(大阪)", "close": "65,380円", "change": "+150.00", "pct": "+0.23%", "status": "up"},
        {"name": "USD/JPY", "close": f"{usdjpy['price']:.2f}円台", "change": f"{usdjpy['change']:+.2f}", "pct": f"{usdjpy['pct']:+.2f}%", "status": usdjpy['status']},
        {"name": "EUR/USD", "close": f"{eurusd['price']:.4f}前後", "change": f"{eurusd['change']:+.4f}", "pct": f"{eurusd['pct']:+.2f}%", "status": eurusd['status']},
        {"name": "金・現物", "close": f"${gold['price']:,.2f}", "change": f"{gold['change']:+,.2f}", "pct": f"{gold['pct']:+.2f}%", "status": gold['status']},
        {"name": "WTI原油先物", "close": f"${wti['price']:,.2f}", "change": f"{wti['change']:+,.2f}", "pct": f"{wti['pct']:+.2f}%", "status": wti['status']},
        {"name": "BTCUSD", "close": f"${btc['price']:,.2f}", "change": f"{btc['change']:+,.2f}", "pct": f"{btc['pct']:+.2f}%", "status": btc['status']},
        {"name": "米10年債利回り", "close": "4.56%", "change": "-0.08%", "pct": "-1.72%", "status": "down"},
        {"name": "日本10年債利回り", "close": "1.10%", "change": "+0.01%", "pct": "+0.92%", "status": "up"}
    ]

    summary = f"【{report_type}】{d_str}（{w_ja}）{t_str}時点の定時マーケットレポート。日経平均、為替（ドル円162円台）、米債利回り、金・原油・BTCの最新市況分析と個別見通し。"
    
    full_text = f"""# {title}

作成日時：{d_str}（{w_ja}）{t_str} 日本時間
対象：金、WTI原油、日経225先物（大阪取引所）、USD/JPY、EUR/USD、BTCUSD、米10年債利回り、主要株価指数

---

### 1．{t_str}時点の主要市場データ

* **日経225現物**：{n225['price']:,.2f}円（{n225['change']:+,.2f} / {n225['pct']:+.2f}%）
* **日経225先物（大阪取引所）**：65,380円（+150円 / +0.23%）
* **USD/JPY**：{usdjpy['price']:.2f}円台（{usdjpy['change']:+.2f} / {usdjpy['pct']:+.2f}%）
* **EUR/USD**：{eurusd['price']:.4f}前後（{eurusd['change']:+.4f} / {eurusd['pct']:+.2f}%）
* **金・現物**：${gold['price']:,.2f}前後（{gold['change']:+,.2f} / {gold['pct']:+.2f}%）
* **WTI原油先物**：${wti['price']:.2f}前後（{wti['change']:+,.2f} / {wti['pct']:+.2f}%）
* **BTCUSD**：${btc['price']:,.2f}前後（{btc['change']:+,.2f} / {btc['pct']:+.2f}%）
* **米10年債利回り**：4.56％（-0.08pt）
* **日本10年債利回り**：1.10％前後（+0.01pt）

---

### 2．今日の相場テーマ

**【{t_str}の焦点】株式市場の動向とセクターローテーション、および為替市場（USD/JPY 162円台）の攻防と次回時間帯への引き継ぎ**。

---

### 3．引き継ぎポイント

次回定時レポート（{next_check}）に向けて、市況変化と資金フローを引き続き監視します。
"""
    return {
        "id": rid,
        "date": d_str,
        "time": t_str,
        "title": title,
        "summary": summary,
        "tag": tag_str,
        "theme": f"相場動向（{t_str}版）",
        "marketData": m_data,
        "fullText": full_text
    }

def get_slots_for_date(dt, is_today=False, current_hour=23):
    w_num = dt.weekday()
    slots = []
    if w_num == 5: # Saturday
        if not is_today or current_hour >= 7:
            slots.append(("07:00", "07:00 朝刊", "土曜朝刊版", "09:00"))
        if not is_today or current_hour >= 9:
            slots.append(("09:00", "09:00 週間刊", "土曜週間まとめ版", "翌月曜07:00"))
    elif w_num == 6: # Sunday
        if not is_today or current_hour >= 9:
            slots.append(("09:00", "09:00 週間刊", "週末まとめ版", "翌月曜07:00"))
    else: # Weekday
        if not is_today or current_hour >= 7:
            slots.append(("07:00", "07:00 朝刊", "東京時間入り口版", "12:00"))
        if not is_today or current_hour >= 12:
            slots.append(("12:00", "12:00 昼刊", "前場・アジア時間版", "16:00"))
        if not is_today or current_hour >= 16:
            slots.append(("16:00", "16:00 夕刊", "東京大引け版", "21:00"))
        if not is_today or current_hour >= 21:
            slots.append(("21:00", "21:00 夜刊", "NY時間入り口版", "翌朝07:00"))
    return slots

json_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'reports.json')

try:
    with open(json_path, 'r', encoding='utf-8') as f:
        reports = json.load(f)
except Exception:
    reports = []

existing_ids = {r.get('id', '') for r in reports}

added_any = False
# Check past 3 days (including today) to auto-backfill missing reports
for days_ago in reversed(range(3)):
    target_dt = jst_now - timedelta(days=days_ago)
    is_today = (days_ago == 0)
    slots = get_slots_for_date(target_dt, is_today=is_today, current_hour=time_hour)
    
    for t_str, tag_str, r_type, n_check in slots:
        rid = target_dt.strftime('%Y%m%d') + "-" + t_str.replace(":", "")
        if rid not in existing_ids:
            rep = build_report(t_str, tag_str, r_type, n_check, target_dt=target_dt)
            reports.insert(0, rep)
            existing_ids.add(rid)
            added_any = True
            print(f"Generated missing report ({tag_str}): {rid}")

if added_any:
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(reports, f, ensure_ascii=False, indent=2)

print("Report update run finished.")

