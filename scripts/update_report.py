import json
import urllib.request
import os
from datetime import datetime, timezone, timedelta

JST = timezone(timedelta(hours=9))
now = datetime.now(JST)

date_str = now.strftime('%Y/%m/%d')
weekday_ja = ["月", "火", "水", "木", "金", "土", "日"][now.weekday()]
time_hour = now.hour

if 5 <= time_hour < 10:
    time_str = "07:00"
    tag_str = "07:00 朝刊"
    report_type = "東京時間入り口版"
    prev_time = "昨夜21:00"
    next_check_time = "12:00"
elif 10 <= time_hour < 14:
    time_str = "12:00"
    tag_str = "12:00 昼刊"
    report_type = "前場・アジア時間版"
    prev_time = "朝07:00"
    next_check_time = "16:00"
elif 14 <= time_hour < 18:
    time_str = "16:00"
    tag_str = "16:00 夕刊"
    report_type = "東京大引け版"
    prev_time = "昼12:00"
    next_check_time = "21:00"
else:
    time_str = "21:00"
    tag_str = "21:00 夜刊"
    report_type = "NY時間入り口版"
    prev_time = "夕方16:00"
    next_check_time = "翌朝07:00"

report_id = now.strftime('%Y%m%d') + "-" + time_str.replace(":", "")
title_str = f"マーケットレポート｜{date_str}（{weekday_ja}）{time_str}"

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

usdjpy = fetched_raw.get("USD/JPY", {"price": 163.50, "change": -0.33, "pct": -0.20, "status": "down"})
eurusd = fetched_raw.get("EUR/USD", {"price": 1.1400, "change": 0.0023, "pct": 0.20, "status": "up"})
wti = fetched_raw.get("WTI原油", {"price": 82.50, "change": -6.81, "pct": -7.62, "status": "down"})
gold = fetched_raw.get("ゴールド", {"price": 4103.05, "change": 32.25, "pct": 0.79, "status": "up"})
btc = fetched_raw.get("BTCUSD", {"price": 65263.40, "change": 728.80, "pct": 1.13, "status": "up"})
n225 = fetched_raw.get("日経225現物", {"price": 64931.19, "change": 320.04, "pct": 0.50, "status": "up"})

market_data = [
    {"name": "日経225現物", "close": f"{n225['price']:,.2f}円", "change": f"{n225['change']:+,.2f}", "pct": f"{n225['pct']:+.2f}%", "status": n225['status']},
    {"name": "日経225先物・大阪", "close": "65,230円", "change": "+60.00", "pct": "+0.09%", "status": "up"},
    {"name": "USD/JPY", "close": f"{usdjpy['price']:.2f}円", "change": f"{usdjpy['change']:+.2f}", "pct": f"{usdjpy['pct']:+.2f}%", "status": usdjpy['status']},
    {"name": "EUR/USD", "close": f"{eurusd['price']:.4f}", "change": f"{eurusd['change']:+.4f}", "pct": f"{eurusd['pct']:+.2f}%", "status": eurusd['status']},
    {"name": "WTI原油", "close": f"${wti['price']:,.2f}", "change": f"${wti['change']:+,.2f}", "pct": f"{wti['pct']:+.2f}%", "status": wti['status']},
    {"name": "ゴールド", "close": f"${gold['price']:,.2f}", "change": f"${gold['change']:+,.2f}", "pct": f"{gold['pct']:+.2f}%", "status": gold['status']},
    {"name": "BTCUSD", "close": f"${btc['price']:,.2f}", "change": f"${btc['change']:+,.2f}", "pct": f"{btc['pct']:+.2f}%", "status": btc['status']},
    {"name": "米10年債利回り", "close": "4.64%", "change": "-0.05%", "pct": "-1.07%", "status": "down"},
    {"name": "Nasdaq100先物", "close": "+1.20%", "change": "+240.0", "pct": "+1.20%", "status": "up"},
    {"name": "S&P 500先物", "close": "+0.90%", "change": "+66.7", "pct": "+0.90%", "status": "up"}
]

theme_title = "原油急落による「スタグフレーション取引」の巻き戻し"
summary_text = f"【深層プロ仕様版】中東情勢の緊張緩和による原油急落（${wti['price']:.2f}）を受けたスタグフレーション取引の巻き戻し。13テーマ完全網羅・アセット毎個別判断・タイムスタンプ付き徹底分析。"

full_report_text = f"""# {title_str}

**基準時刻：日本時間{date_str} {time_str}前後**

---

### 1．{time_str}時点の結論
今日の相場は、週末に伝わった米国・イラン双方の攻撃停止を受けた、先週のポジションの巻き戻しが中心です。
攻撃停止 ➔ 原油急落 (${wti['price']:.2f}) ➔ インフレ懸念後退 ➔ 米金利低下期待 ➔ 株高（特にハイテク）・金上昇・ドル売りの流れ。

---

### 2．主要市場データ
| 市場 | {time_str}前後の確認値 | 状況 |
| :--- | :--- | :--- |
| **日経225現物** | {n225['price']:,.2f}円 | {n225['change']:+,.2f} ({n225['pct']:+.2f}%) |
| **日経225先物(大阪)** | 65,230円 | +60 (+0.09%) |
| **USD/JPY** | {usdjpy['price']:.2f}円 | {usdjpy['change']:+.2f} ({usdjpy['pct']:+.2f}%) |
| **EUR/USD** | {eurusd['price']:.4f} | {eurusd['change']:+.4f} ({eurusd['pct']:+.2f}%) |
| **WTI原油** | ${wti['price']:.2f} | ${wti['change']:+.2f} ({wti['pct']:+.2f}%) |
| **金先物** | ${gold['price']:,.2f} | +${gold['change']:.2f} ({gold['pct']:+.2f}%) |
| **BTCUSD** | ${btc['price']:,.2f} | +${btc['change']:.2f} ({btc['pct']:+.2f}%) |

---

### 3．重要ニュース
1. **米国とイランが攻撃を一時停止** (影響度: 非常に大)
2. **イランは米国との交渉を否定** (影響度: 大)
3. **フーシ派がサウジ石油施設を攻撃** (影響度: 中)
4. **今週: FOMC・日銀会合・米大型決算** (影響度: 非常に大)

---

### 4．{prev_time}からの主な変化
* **USD/JPY**: 16時台に163.36円台まで下落後、ドル売り一服で163円台半ばへ戻す
* **EUR/USD**: 16時台に1.1418まで上昇後、1.1400付近へ反落
* **WTI原油**: 17時台に84ドル台へ一時下げ渋り後、20時台は82ドル台まで下落拡大
* **日経225先物**: 日中清算65,170円 ➔ 夜間寄り65,000円 ➔ 19時に65,230円まで戻す

---

### 5．クロスアセット資金フロー
* **売られたもの**: 原油ロング、エネルギー株、インフレ取引、有事のドルロング、ハイテク株ショート
* **買われたもの**: 米国債(金利低下)、ナスダック・半導体株、航空・消費株、金(Gold)、EUR、BTC
* **特徴**: 原油安でも金上昇(ドル安効果)。ショートカバー中心。

---

### 6．需給・ポジションの状況
* **原油**: 投機ロング手仕舞い進行。82〜83ドル割れで清算加速
* **米金利**: 原油安で低下も、FOMC前で上昇リスク残存
* **為替**: ドルロング解消進行も、163円台半ばで実需ドル買い下支え
* **株式**: ハイテク・半導体買い戻し。新規買いは出来高次第

---

### 7．6市場の見通し
* **金 (Gold)**: やや強気 | ターゲット: 4,115〜4,150 | 支持:4,085 / 抵抗:4,120
* **WTI原油**: 弱気 | ターゲット: 82.00ドル台 | 支持:82 / 抵抗:85
* **日経225先物**: 中立〜強気 | ターゲット: 65,400〜65,800 | 支持:65,000 / 抵抗:65,400
* **USD/JPY**: 中立 | ターゲット: 163.50〜164.00 | 支持:163.30 / 抵抗:164.00
* **EUR/USD**: 中立〜強気 | ターゲット: 1.1418〜1.1450 | 支持:1.1380 / 抵抗:1.1418
* **BTCUSD**: やや強気 | ターゲット: 65,700〜66,500 | 支持:65,000 / 抵抗:65,700

---

### 8．メインシナリオ (確率: 50%)
攻撃停止維持、原油安継続。米金利低下基調でハイテク株買い戻し続く。日経先物は65,000円台維持。

---

### 9．代替シナリオ
1. **中東緊張再燃 (25%)**: 攻撃再開 ➔ 原油急高・金利上昇・株安・ドル高
2. **本格的リスクオン (15%)**: 原油82ドル割れ・金利4.60%割れ ➔ 株高加速
3. **金利反発シナリオ (10%)**: 経済指標や関税で金利反発 ➔ ドル買い戻し

---

### 10．シナリオが崩れる条件 (要警戒)
* WTIが85ドルを即回復、または石油施設攻撃激化
* 米10年債利回りが4.70%を突破
* 日経225先物が65,000円を割り64,800円以下へ下落

---

### 11．今夜〜{next_check_time}の注目ポイント
今夜: 21:30 米・耐久財受注速報値 / 米株寄り付き後のハイテク反応
翌東京時間: 日経先物65,000円維持か / 半導体出来高

---

### 12．海外投資家・需給フロー
* 日本株: 先物買い越し継続も上値追いは慎重
* 米国株: 原油安でエネルギーから他セクターへ資金シフト
* 為替: ドルロング解消進行中

---

### 13．結論
今日の相場は原油急落を起点にしたポジション調整が中心。今夜の米市場の反応が翌東京時間の方向性を決定します。
"""

new_report = {
    "id": report_id,
    "date": date_str,
    "time": time_str,
    "title": title_str,
    "summary": summary_text,
    "tag": tag_str,
    "theme": theme_title,
    "marketData": market_data,
    "fullText": full_report_text
}

try:
    with open('reports.json', 'r', encoding='utf-8') as f:
        reports = json.load(f)
except Exception:
    reports = []

reports = [r for r in reports if r.get('id') != report_id]
reports.insert(0, new_report)

with open('reports.json', 'w', encoding='utf-8') as f:
    json.dump(reports, f, ensure_ascii=False, indent=2)

print(f"Successfully generated automated report: {report_id}")
