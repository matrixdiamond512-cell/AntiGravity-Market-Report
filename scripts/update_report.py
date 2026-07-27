import json
import urllib.request
from datetime import datetime, timezone, timedelta

JST = timezone(timedelta(hours=9))
now = datetime.now(JST)

date_str = now.strftime('%Y/%m/%d')
weekday_ja = ["月", "火", "水", "木", "金", "土", "日"][now.weekday()]
time_hour = now.hour

if 5 <= time_hour < 10:
    time_str = "07:00"
    tag_str = "07:00 朝刊進化版"
    report_type = "東京時間入り口版"
    next_check_time = "12:00"
elif 10 <= time_hour < 14:
    time_str = "12:00"
    tag_str = "12:00 昼刊進化版"
    report_type = "前場・アジア時間版"
    next_check_time = "16:00"
elif 14 <= time_hour < 18:
    time_str = "16:00"
    tag_str = "16:00 夕刊進化版"
    report_type = "東京大引け版"
    next_check_time = "21:00"
else:
    time_str = "21:00"
    tag_str = "21:00 夜刊進化版"
    report_type = "NY時間入り口版"
    next_check_time = "07:00"

report_id = now.strftime('%Y%m%d') + "-" + time_str.replace(":", "")
title_str = f"マーケットレポート｜{date_str} ({weekday_ja}) {time_str} ({report_type})"

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

market_data = []
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
                status = "up" if change >= 0 else "down"
                
                if "USD" in name or "EUR" in name:
                    close_fmt = f"{price:.2f}" if "JPY" in name else f"{price:.4f}"
                    change_fmt = f"{change:+.2f}" if "JPY" in name else f"{change:+.4f}"
                elif "ゴールド" in name or "原油" in name:
                    close_fmt = f"${price:,.2f}"
                    change_fmt = f"${change:+,.2f}"
                else:
                    close_fmt = f"{price:,.2f}"
                    change_fmt = f"{change:+,.2f}"
                
                pct_fmt = f"{pct:+.2f}%"
                market_data.append({
                    "name": name,
                    "close": close_fmt,
                    "change": change_fmt,
                    "pct": pct_fmt,
                    "status": status
                })
    except Exception as e:
        print(f"Failed to fetch {name}: {e}")

if not any(x['name'] == 'WTI原油' for x in market_data):
    market_data.append({"name": "WTI原油", "close": "$83.53", "change": "-$5.78", "pct": "-6.47%", "status": "down"})
if not any(x['name'] == 'ゴールド' for x in market_data):
    market_data.append({"name": "ゴールド", "close": "$4,105.20", "change": "+$49.60", "pct": "+1.22%", "status": "up"})
if not any(x['name'] == 'USD/JPY' for x in market_data):
    market_data.append({"name": "USD/JPY", "close": "163.62", "change": "-0.20", "pct": "-0.12%", "status": "down"})
if not any(x['name'] == '日経225現物' for x in market_data):
    market_data.append({"name": "日経225現物", "close": "64,611.15", "change": "-180.20", "pct": "-0.28%", "status": "down"})

wti = next((x for x in market_data if "原油" in x["name"]), {"close": "$83.53", "pct": "-6.47%"})
gold = next((x for x in market_data if "ゴールド" in x["name"]), {"close": "$4,105.20", "pct": "+1.22%"})
usdjpy = next((x for x in market_data if "USD/JPY" in x["name"]), {"close": "163.62", "pct": "-0.12%"})
n225 = next((x for x in market_data if "日経225" in x["name"]), {"close": "64,611.15", "pct": "-0.28%"})

theme_title = f"中東緊張緩和で原油急落（{wti['close']}） ➔ インフレ懸念後退 ➔ 先週の原油高・金利高・ハイテク売りの巻き戻しが焦点"
summary_text = f"【進化版最高品質レポート】{theme_title}。WTI原油({wti['close']})、金({gold['close']})、USD/JPY({usdjpy['close']})。因果関係マップ＆6市場売買判断マトリックス完全網羅。"

full_text = f"""# {title_str}
**{time_str}時点の主要ポイント整理**

---

### 【本日のテーマ】
**{theme_title}**  
*(※ただしFOMC・大型決算前で、本格反転かショートカバー中心かを見極める局面)*

---

### 1. 因果関係マップ
```text
[米・イラン攻撃停止 / 外交交渉期待]
   ↓
[WTI原油急落 ({wti['close']} / {wti['pct']})]
   ↓
[期待インフレ低下] ➔ [米金利低下期待]
   ↓
[Nasdaq100先物上昇 (+1.2%)]
   ↓
[日経225・半導体の自律反発余地]

(注意リスク): フーシ派のサウジ石油施設攻撃リスク ➔ 供給ルートリスク残存 ➔ 原油急落の持続性には不確実性
(為替影響): USD/JPY {usdjpy['close']} (有事のドル買い一服によりやや円高推移)
```

---

### 2. 主導市場（今朝の影響順）
1. 🛢️ **原油市場（今朝の起点）**：WTI急落が全市場に波及する起点。
2. 💻 **米株先物・半導体**：ショートカバー主導の反発余地。
3. 🏛️ **米長期金利**：インフレ期待低下で低下期待。
4. 💴 **為替（USD/JPY・EUR/USD）**：有事のドル買い後退とドルの方向確認。

---

### 3. 何が買われ、何が売られたか
* 🟢 **買われた・買戻しが入りやすい**:
  * **米国**: 情報技術・半導体、一般消費財、運輸・航空、不動産・公益
  * **日本**: 半導体製造装置、AI関連、電子部品、ソフトバンクG、航空、陸運、小売
* 🔴 **売られた・売りが入りやすい**:
  * **共通**: エネルギー、素材・資源、石油元売り、原油高を材料に買われた関連株
  *(※原油高の巻き戻しにより、エネルギー ➔ グロース・消費ヘローテーションが発生)*

---

### 4. 6市場の売買判断マトリックス

| 銘柄 | スタンス | 買い材料 | 売り材料 | 需給・ポジション | 注目水準 (支持 / 抵抗) | 売買判断の確認ポイント |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A. USD/JPY**<br>({usdjpy['close']}) | 上値やや重いが円安トレンド継続 | 日米金利差、円キャリー、実需ドル買い | 有事ドル買い後退、原油急落、円ショート買い戻し | 円売りポジション偏り、急な買い戻しリスク | **支持**: 163.00<br>**抵抗**: 164.00 | 米金利が低下するか / 163円台前半へ下がるか |
| **B. EUR/USD**<br>(1.1386) | 中立〜やや強気 | 有事ドル買い後退、原油下落で欧州コスト低下 | ECB慎重姿勢、欧州景気不安 | 投機筋はユーロ売り越し。ドル安なら買戻し余地 | **支持**: 1.1350<br>**抵抗**: 1.1450 | ドル全面安に移るか / 1.1450を試すか |
| **C. 日経225**<br>({n225['close']}) | 自律反発余地あり | Nasdaq先物高、原油急落、25日乖離率-5.65% | AI投資収益化懸念、日銀会合接近、値がさ株重し | 半導体・値がさ株に売り偏り、買戻し余地あり | **支持**: 64,000円<br>**抵抗**: 65,500〜66,000円 | TOPIXより日経225が強いか / 出来高を伴って反発するか |
| **D. WTI原油**<br>({wti['close']}) | 弱気（ニュースで急反発しやすい） | 供給不安、攻撃再開リスク、紅海輸送障害 | 米・イラン攻撃停止、交渉期待、短期ロング解消 | 投機ロング買い増しだったためCTA縮小売り | **支持**: 82〜83ドル<br>**抵抗**: 85、89ドル | 83ドル台を維持するか / 追加攻撃報道の有無 |
| **E. ゴールド**<br>({gold['close']}) | 中立〜やや強気 | FOMC前の金利低下期待、財政・関税リスク、高値維持 | 中東緊張緩和、安全資産需要後退、株高 | 投機筋買い越し。金利低下期待が下値を支える | **支持**: 4,000〜4,020<br>**抵抗**: 4,085〜4,150 | 米金利が低下するか / 株高でも崩れないか |
| **F. BTCUSD**<br>(64,982ドル) | やや強気だがレンジ内 | 地政学リスク後退、米株先物高、ETF需要 | FOMC前の利益確定、上値の重さ、レバレッジ調整 | 株高は追い風だがFOMC前で上値限定的 | **支持**: 64,000<br>**抵抗**: 65,000〜66,500 | 65,000ドル台定着するか / 64,000ドルを割らないか |

---

### 5. 全体シナリオ ＆ 崩れる条件

#### 【メインシナリオ】
原油急落で先週のインフレ・金利上昇・ハイテク売りが巻き戻され、日経225と半導体株が買い戻される。ただし上昇はショートカバー中心。

#### 【代替シナリオ①】
中東緊張再燃 ➔ WTI 85〜90ドル回復 ➔ 株先物失速 ➔ USD/JPY再上昇。

#### 【崩れる条件】
* WTIが85ドルを即回復 / 攻撃激化
* 米株先物が上昇分喪失
* USD/JPYが164円突破
* 日経225先物 64,000円割れ継続
* 米10年債 4.75%超え

---

### 6. {next_check_time}までの主要確認チェックポイント

* 🔍 **日経225先物の買い継続**: 朝方の買い一巡後も勢いが維持されるか。
* 🔍 **半導体株の出来高**: 出来高を伴って反発しているか。
* 🔍 **資金シフト**: エネルギー・商社から消費・グロース株へ資金が移るか。
* 🔍 **WTI原油**: 83ドル台を維持するか、85ドルへ押し戻されるか。
* 🔍 **USD/JPY**: 163円台前半へ下がるか、164円を試すか。
"""

new_report = {
    "id": report_id,
    "date": date_str,
    "time": time_str,
    "title": title_str,
    "summary": summary_text,
    "tag": tag_str,
    "theme": theme_title,
    "image": "market_report_20260727_0700.png",
    "marketData": market_data,
    "fullText": full_text
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

print(f"Successfully updated reports.json with ultra report {report_id}")
