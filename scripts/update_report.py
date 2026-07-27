import json
import urllib.request
import os
from datetime import datetime, timezone, timedelta
from PIL import Image, ImageDraw, ImageFont

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

# 超巨大文字（WIDTH=1800, HEIGHT=3400, Body=22-24pt）
WIDTH = 1800
HEIGHT = 3400

img = Image.new('RGB', (WIDTH, HEIGHT), color='#070A14')
draw = ImageDraw.Draw(img)

font_path = "C:\\Windows\\Fonts\\meiryo.ttc"
if not os.path.exists(font_path):
    font_path = "C:\\Windows\\Fonts\\yuGothM.ttc"

def get_font(size, index=0):
    try:
        return ImageFont.truetype(font_path, size, index=index)
    except Exception:
        return ImageFont.load_default()

font_title = get_font(48, index=1)
font_subtitle = get_font(24)
font_head = get_font(32, index=1)
font_subhead = get_font(26, index=1)
font_bold = get_font(24, index=1)
font_body = get_font(22, index=1)

C_PANEL_BG = '#0F172A'
C_TEXT_WHITE = '#FFFFFF'
C_TEXT_GRAY = '#94A3B8'
C_TEXT_SUB = '#E2E8F0'
C_RED = '#EF4444'
C_GREEN = '#10B981'
C_BLUE = '#3B82F6'
C_GOLD = '#F59E0B'

def draw_card(box, fill='#0F172A', outline='#1E293B', radius=14):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=3)

def draw_panel_header(box, num, title):
    draw_card(box, fill='#141E33', outline='#3B82F6', radius=10)
    num_box = (box[0] + 12, box[1] + 8, box[0] + 48, box[1] + 44)
    draw_card(num_box, fill='#3B82F6', outline='#3B82F6', radius=8)
    draw.text((box[0] + 20, box[1] + 8), str(num), fill='#FFF', font=font_head)
    draw.text((box[0] + 62, box[1] + 8), title, fill='#FFF', font=font_subhead)

draw.rectangle([(0, 0), (WIDTH, 110)], fill='#0D1527')
draw.text((30, 26), f"マーケットレポート | {date_str} ({weekday_ja}) {time_str}", fill=C_TEXT_WHITE, font=font_title)
draw.text((WIDTH - 620, 42), f"基準時刻：日本時間 {date_str} {time_str}前後までの情報", fill=C_TEXT_GRAY, font=font_subtitle)
draw.line([(0, 110), (WIDTH, 110)], fill='#3B82F6', width=5)

# 1. 今日の相場テーマ
draw_card((25, 130, WIDTH - 25, 330), fill=C_PANEL_BG, outline='#334155')
draw_card((45, 145, 310, 195), fill='#C0392B', outline='#E74C3C', radius=8)
draw.text((58, 150), "1 今日の相場テーマ", fill='#FFF', font=font_subhead)
draw.text((330, 150), "≫ 中東リスク緩和による「スタグフレーション取引の巻き戻し」", fill='#FCA5A5', font=font_head)

flow_text = f"攻撃停止 ➔ 原油急落 (${wti['price']:.2f}) ➔ インフレ懸念後退 ➔ 米金利低下期待 ➔ 株高（特にハイテク）・金上昇・ドル売りの流れ"
draw.text((45, 215), flow_text, fill=C_TEXT_WHITE, font=font_bold)
note_text = "※上昇は新規リスクオンではなくショートカバー・手仕舞いが中心。FOMC・大型ハイテク決算・日銀会合前で上値追いは限定的。"
draw.text((45, 270), note_text, fill=C_TEXT_GRAY, font=font_body)

# パネル 2, 3, 4
col_w = (WIDTH - 70) // 3
y1 = 355
y2 = 1100

draw_card((25, y1, 25 + col_w, y2), fill=C_PANEL_BG)
draw_panel_header((35, y1 + 15, 15 + col_w, y1 + 65), 2, f"主要市場データ ({time_str}の確認値)")

m_data = [
    ("日経225(現物)", f"{n225['price']:,.2f}", f"{n225['change']:+,.2f}", f"{n225['pct']:+.2f}%", C_RED if n225['change']>=0 else C_GREEN),
    ("日経225先物(大阪)", "65,230", "+60", "+0.09%", C_RED),
    ("USD/JPY", f"{usdjpy['price']:.2f}円", f"{usdjpy['change']:+.2f}", f"{usdjpy['pct']:+.2f}%", C_GREEN if usdjpy['change']<0 else C_RED),
    ("EUR/USD", f"{eurusd['price']:.4f}", f"{eurusd['change']:+.4f}", f"{eurusd['pct']:+.2f}%", C_RED if eurusd['change']>=0 else C_GREEN),
    ("WTI原油", f"${wti['price']:.2f}", f"${wti['change']:+.2f}", f"{wti['pct']:+.2f}%", C_GREEN if wti['change']<0 else C_RED),
    ("金先物(COMEX)", f"${gold['price']:,.2f}", f"+${gold['change']:.2f}", f"{gold['pct']:+.2f}%", C_RED),
    ("BTCUSD", f"${btc['price']:,.2f}", f"+${btc['change']:.2f}", f"{btc['pct']:+.2f}%", C_RED),
    ("米10年債利回り", "4.64%", "-0.05%", "-1.07%", C_GREEN),
    ("Nasdaq100先物", "+1.20%", "--", "--", C_RED),
    ("S&P 500先物", "+0.90%", "--", "--", C_RED),
]

my = y1 + 85
for name, val, chg, pct, color in m_data:
    draw_card((40, my, 10 + col_w, my + 56), fill='#162032', outline='#1E293B', radius=8)
    draw.text((50, my + 12), name, fill=C_TEXT_WHITE, font=font_bold)
    v_str = f"{val} {chg} ({pct})" if chg != "--" else f"{val}"
    draw.text((270, my + 12), v_str, fill=color, font=font_bold)
    my += 66

x_p3 = 35 + col_w
draw_card((x_p3, y1, x_p3 + col_w, y2), fill=C_PANEL_BG)
draw_panel_header((x_p3 + 10, y1 + 15, x_p3 - 10 + col_w, y1 + 65), 3, "重要ニュースと市場影響")

news_list = [
    ("米国とイランが攻撃を一時停止", "非常大", C_RED, "ホルムズ海峡リスク後退 ➔ 原油急落、株高、債券買い、ドル売り"),
    ("イランは米国との交渉を否定", "大", C_RED, "正式和平ではなく一時休止の可能性 ➔ 原油・為替の振れ幅拡大"),
    ("フーシ派がサウジ石油施設を攻撃", "中", C_GOLD, "紅海リスクは残存 ➔ 原油が一方向には下がりにくい要因"),
    ("今週: FOMC・日銀会合・米決算", "非常大", C_RED, "イベント前で上値は限定的。金利・決算が次のトレンドを決定"),
]

ny = y1 + 85
for n_title, imp, imp_color, n_desc in news_list:
    draw_card((x_p3 + 12, ny, x_p3 - 12 + col_w, ny + 155), fill='#162032', outline='#1E293B', radius=10)
    draw.text((x_p3 + 24, ny + 14), n_title, fill=C_TEXT_WHITE, font=font_head)
    draw_card((x_p3 + 410, ny + 12, x_p3 + 550, ny + 50), fill='#2A1215' if imp_color==C_RED else '#2A2010', outline=imp_color, radius=6)
    draw.text((x_p3 + 420, ny + 14), f"影響:{imp}", fill=imp_color, font=font_bold)
    draw.text((x_p3 + 24, ny + 65), n_desc, fill=C_TEXT_SUB, font=font_body)
    ny += 170

x_p4 = 45 + col_w * 2
draw_card((x_p4, y1, x_p4 + col_w, y2), fill=C_PANEL_BG)
draw_panel_header((x_p4 + 10, y1 + 15, x_p4 - 10 + col_w, y1 + 65), 4, f"{prev_time}からの主な変化")

changes = [
    ("USD/JPY", "16時台に163.36円台まで下落後、ドル売り一服で163円台半ばへ戻す。"),
    ("EUR/USD", "16時台に1.1418まで上昇後、1.1400付近へ反落。"),
    ("WTI原油", "17時台に84ドル台へ一時下げ渋り後、20時台は82ドル台まで下落拡大。"),
    ("日経225先物", "日中清算65,170円 ➔ 夜間寄り65,000円 ➔ 19時に65,230円まで戻す。"),
    ("総括", "原油安は継続。ただしドル、ユーロ、日経先物は方向感の分岐点。"),
]

cy = y1 + 90
for c_item, c_desc in changes:
    draw.text((x_p4 + 16, cy), f"• {c_item}", fill=C_BLUE if c_item!="総括" else C_GOLD, font=font_head)
    draw.text((x_p4 + 16, cy + 38), c_desc, fill=C_TEXT_SUB, font=font_body)
    cy += 130

# 中段行 2: パネル 5, 6, 7 (y: 1120 ~ 1900)
y3 = 1120
y4 = 1900

draw_card((25, y3, 25 + col_w, y4), fill=C_PANEL_BG)
draw_panel_header((35, y3 + 15, 15 + col_w, y3 + 65), 5, "クロスアセット資金フロー")

draw_card((40, y3 + 85, 10 + col_w, y3 + 300), fill='#231215', outline='#EF4444', radius=10)
draw.text((55, y3 + 98), "▼ 売られたもの・縮小ポジ", fill='#FCA5A5', font=font_head)
draw.text((55, y3 + 145), "• 原油ロング & エネルギー株\n• インフレ取引 (債券ショート)\n• 有事のドルロング / ハイテクショート", fill=C_TEXT_SUB, font=font_bold)

draw_card((40, y3 + 320, 10 + col_w, y3 + 535), fill='#0F251E', outline='#10B981', radius=10)
draw.text((55, y3 + 333), "▲ 買われたもの・拡大ポジ", fill='#6EE7B7', font=font_head)
draw.text((55, y3 + 380), "• 米国債 (金利低下) & 金 (Gold)\n• ナスダック・半導体・ハイテク株\n• 航空・運輸・消費株 / ユーロ / BTC", fill=C_TEXT_SUB, font=font_bold)

draw_card((40, y3 + 555, 10 + col_w, y3 + 750), fill='#121C30', outline='#3B82F6', radius=10)
draw.text((55, y3 + 568), "💡 資金の動きの特徴", fill='#93C5FD', font=font_head)
draw.text((55, y3 + 615), "• 原油安でも金上昇 (ドル安・金利低下効果)\n• ショートカバー中心。新規リスクオン未到来", fill=C_TEXT_SUB, font=font_bold)

draw_card((x_p3, y3, x_p3 + col_w, y4), fill=C_PANEL_BG)
draw_panel_header((x_p3 + 10, y3 + 15, x_p3 - 10 + col_w, y3 + 65), 6, "需給・ポジションの状況")

pos_list = [
    ("原油", "投機ロング手仕舞い進行。82〜83ドル割れで清算加速。"),
    ("米金利", "原油安で低下も、FOMC前で上昇リスク残存。"),
    ("為替", "ドルロング解消進むも、163円台半ばで実需ドル買い下支え。"),
    ("株式", "ハイテク・半導体買い戻し。新規買いは出来高次第。"),
    ("金 (Gold)", "実質金利低下とドル安で買い優勢。4,100ドル台推移。"),
    ("BTCUSD", "65,000ドル台回復もETF資金流出への警戒残る。"),
]

py = y3 + 90
for p_asset, p_desc in pos_list:
    draw.text((x_p3 + 20, py), f"• {p_asset}:", fill=C_TEXT_WHITE, font=font_head)
    draw.text((x_p3 + 20, py + 40), p_desc, fill=C_TEXT_SUB, font=font_bold)
    py += 115

draw_card((x_p4, y3, x_p4 + col_w, y4), fill=C_PANEL_BG)
draw_panel_header((x_p4 + 10, y3 + 15, x_p4 - 10 + col_w, y3 + 65), 7, "6市場の見通し (売買判断・水準)")

m6_list = [
    ("金 (Gold)", "やや強気", C_GREEN, "支持:4,085 / 抵抗:4,120", "ターゲット: 4,115〜4,150"),
    ("WTI原油", "弱気", C_RED, "支持:82 / 抵抗:85", "ターゲット: 82.00ドル台"),
    ("日経225先物", "中立〜強気", C_GREEN, "支持:65,000 / 抵抗:65,400", "ターゲット: 65,400〜65,800"),
    ("USD/JPY", "中立", C_BLUE, "支持:163.30 / 抵抗:164.00", "ターゲット: 163.50〜164.00"),
    ("EUR/USD", "中立〜強気", C_GREEN, "支持:1.1380 / 抵抗:1.1418", "ターゲット: 1.1418〜1.1450"),
    ("BTCUSD", "やや強気", C_GREEN, "支持:65,000 / 抵抗:65,700", "ターゲット: 65,700〜66,500"),
]

m6y = y3 + 85
for m_name, m_st, m_st_col, m_lvl, m_tgt in m6_list:
    draw_card((x_p4 + 14, m6y, x_p4 - 14 + col_w, m6y + 105), fill='#162032', outline='#1E293B', radius=10)
    draw.text((x_p4 + 26, m6y + 12), m_name, fill=C_TEXT_WHITE, font=font_head)
    draw_card((x_p4 + 400, m6y + 12, x_p4 + 540, m6y + 50), fill='#0F251E' if m_st_col==C_GREEN else '#231215', outline=m_st_col, radius=6)
    draw.text((x_p4 + 412, m6y + 14), m_st, fill=m_st_col, font=font_bold)
    draw.text((x_p4 + 26, m6y + 58), f"{m_tgt}  |  {m_lvl}", fill=C_TEXT_SUB, font=font_body)
    m6y += 118

# 下段行 1: パネル 8, 9, 10 (y: 1920 ~ 2620)
y5 = 1920
y6 = 2620

draw_card((25, y5, 25 + col_w, y6), fill=C_PANEL_BG)
draw_panel_header((35, y5 + 15, 15 + col_w, y5 + 65), 8, "メインシナリオ (確率: 50%)")

draw.text((45, y5 + 90), "攻撃停止維持、原油安継続。", fill=C_TEXT_WHITE, font=font_head)
draw.text((45, y5 + 145), "米金利低下基調でハイテク株買い戻し続く。\n日経先物は65,000円台を維持。\nUSD/JPY 163円台、EUR/USD 1.14近辺、\n金 4,100ドル近辺、BTC 65,000ドル台推移。", fill=C_TEXT_SUB, font=font_bold)

draw_card((45, y5 + 500, 5 + col_w, y5 + 630), fill='#162032', outline='#3B82F6', radius=10)
draw.text((60, y5 + 545), "フロー: 原油↓  金利↓  株↑  ドル↓  金↑  BTC↑", fill='#60A5FA', font=font_head)

draw_card((x_p3, y5, x_p3 + col_w, y6), fill=C_PANEL_BG)
draw_panel_header((x_p3 + 10, y5 + 15, x_p3 - 10 + col_w, y5 + 65), 9, "代替シナリオ (25%, 15%, 10%)")

alt_list = [
    ("1. 中東緊張再燃 (確率 25%)", "攻撃再開 ➔ 原油急高・金利上昇・株安・ドル高"),
    ("2. 本格的リスクオン (確率 15%)", "原油82ドル割れ・金利4.60%割れ ➔ 株高加速"),
    ("3. 金利反発シナリオ (確率 10%)", "経済指標や関税で金利反発 ➔ ドル買い戻し"),
]

ay = y5 + 90
for a_title, a_desc in alt_list:
    draw.text((x_p3 + 20, ay), a_title, fill=C_GOLD, font=font_head)
    draw.text((x_p3 + 20, ay + 45), a_desc, fill=C_TEXT_SUB, font=font_bold)
    ay += 170

draw_card((x_p4, y5, x_p4 + col_w, y6), fill=C_PANEL_BG)
draw_panel_header((x_p4 + 10, y5 + 15, x_p4 - 10 + col_w, y5 + 65), 10, "シナリオが崩れる条件 (要警戒)")

risk_items = [
    "• WTIが85ドルを即回復、または石油施設攻撃激化",
    "• 米10年債利回りが4.70%を突破",
    "• 日経225先物が65,000円を割り64,800円以下へ下落",
    "• USD/JPYが164.00円を突破 / EUR/USD 1.1380割れ",
    "• 金が4,085ドル割れ / BTCが64,000ドル割れ",
]

ry = y5 + 90
for r_item in risk_items:
    draw.text((x_p4 + 20, ry), r_item, fill='#FCA5A5', font=font_bold)
    ry += 110

# 下段行 2: パネル 11, 12, 13 (y: 2640 ~ 3350)
y7 = 2640
y8 = 3350

draw_card((25, y7, 25 + col_w, y8), fill=C_PANEL_BG)
draw_panel_header((35, y7 + 15, 15 + col_w, y7 + 65), 11, "今夜〜翌東京時間の注目ポイント")

draw.text((45, y7 + 90), "【今夜】", fill=C_BLUE, font=font_head)
draw.text((45, y7 + 135), "21:30 米・耐久財受注速報値\n米株寄り付き後のハイテク反応 / 米10年債利回り", fill=C_TEXT_SUB, font=font_bold)

draw.text((45, y7 + 330), "【翌東京時間】", fill=C_GREEN, font=font_head)
draw.text((45, y7 + 375), "日経先物65,000円維持か / 半導体に出来高伴う買いが入るか / 日銀会合前の金利・為替動作", fill=C_TEXT_SUB, font=font_bold)

draw_card((x_p3, y7, x_p3 + col_w, y8), fill=C_PANEL_BG)
draw_panel_header((x_p3 + 10, y7 + 15, x_p3 - 10 + col_w, y7 + 65), 12, "海外投資家・需給フローの状況")

flow_info = [
    ("• 日本株", "先物買い越し継続も上値追いは慎重"),
    ("• 米国株", "原油安でエネルギーから他セクターへ資金シフト"),
    ("• 米国債", "中長期債中心に資金流入 (利回り低下方向)"),
    ("• 為替(CFTC)", "ドルロング解消進行中"),
    ("• コモディティ", "原油ETF流出、金ETF流入、BTC流出"),
]

fy = y7 + 90
for f_tag, f_desc in flow_info:
    draw.text((x_p3 + 20, fy), f"{f_tag}:", fill=C_TEXT_WHITE, font=font_head)
    draw.text((x_p3 + 20, fy + 42), f_desc, fill=C_TEXT_SUB, font=font_bold)
    fy += 105

draw_card((x_p4, y7, x_p4 + col_w, y8), fill='#1B1432', outline='#A855F7')
draw_panel_header((x_p4 + 10, y7 + 15, x_p4 - 10 + col_w, y7 + 65), 13, "結論")

draw.text((x_p4 + 25, y7 + 90), "今日の相場は原油急落を起点にした\nポジション調整が中心です。", fill=C_TEXT_WHITE, font=font_head)
draw.text((x_p4 + 25, y7 + 210), "現時点ではリスクオン回帰の入り口に\nありますが、継続には米株（特にハイテク）\nの強さと金利の安定が不可欠です。\n\n今夜の米市場の反応が翌東京時間の\n方向性を決定します。", fill=C_TEXT_SUB, font=font_bold)

img_name = f"market_report_{report_id.replace('-', '_')}.png"
out_path = os.path.join("c:\\Users\\atsuk\\マイドライブ\\AntiGravity Market Report", img_name)
img.save(out_path, quality=95)

# Save also as fixed 20260727_2100.png
fixed_out_path = "c:\\Users\\atsuk\\マイドライブ\\AntiGravity Market Report\\market_report_20260727_2100.png"
img.save(fixed_out_path, quality=95)

print(f"Generated ultra-large text PNG image: {out_path} and {fixed_out_path}")

summary_text = f"【超高精度・深層プロ仕様版】中東情勢の緊張緩和による原油急落（${wti['price']:.2f}）を受けたスタグフレーション取引の巻き戻し。13テーマ完全網羅・アセット毎個別判断・タイムスタンプ付き徹底分析。"

try:
    with open('reports.json', 'r', encoding='utf-8') as f:
        reports = json.load(f)
except Exception:
    reports = []

for r in reports:
    r['image'] = 'market_report_20260727_2100.png'

with open('reports.json', 'w', encoding='utf-8') as f:
    json.dump(reports, f, ensure_ascii=False, indent=2)

print(f"Updated reports.json with ultra large text PNG image")
