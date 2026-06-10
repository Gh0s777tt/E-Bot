// Słownik /stocks (giełda — Etap J) — 14 języków. Placeholdery: {symbol}{shares}{price}{cost}
// {proceeds}{profit}{wallet}{value}{pnl}{sign}{emoji}{owned}{list}{user}.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const STOCKS_STRINGS: Record<Locale, Dict> = {
  pl: {
    'stocks.disabled': '🚫 Ekonomia jest wyłączona na tym serwerze.',
    'stocks.noCloud': '⚠️ Giełda wymaga połączenia z bazą (Supabase). Skonfiguruj chmurę.',
    'stocks.listTitle': '📈 Giełda — notowania',
    'stocks.listFooter': 'Kup: /stocks buy · Sprzedaj: /stocks sell · Portfel: /stocks portfolio',
    'stocks.badSymbol': '❓ Nie znam takiego symbolu. Dostępne: {list}.',
    'stocks.notEnough': '💸 Za mało środków — koszt {cost}, masz {wallet}.',
    'stocks.bought':
      '🟢 Kupiono **{shares}×** {emoji} {symbol} po {price} = {cost}. Portfel: {wallet}.',
    'stocks.notEnoughShares': '📉 Masz tylko **{owned}×** {symbol}.',
    'stocks.sold':
      '🔴 Sprzedano **{shares}×** {emoji} {symbol} po {price} = {proceeds} (wynik: {profit}). Portfel: {wallet}.',
    'stocks.portfolioEmpty': '📭 Nie masz żadnych akcji. Zacznij od `/stocks list`.',
    'stocks.portfolioTitle': '📊 Portfel akcji — {user}',
    'stocks.portfolioLine': '{emoji} **{symbol}** ×{shares} — wartość {value} · wynik {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 Razem',
    'stocks.portfolioTotalValue': 'Wartość: {value} · Wynik: {sign} {pnl}',
  },
  en: {
    'stocks.disabled': '🚫 Economy is disabled on this server.',
    'stocks.noCloud': '⚠️ The stock market needs a database (Supabase). Configure the cloud.',
    'stocks.listTitle': '📈 Stock market — quotes',
    'stocks.listFooter': 'Buy: /stocks buy · Sell: /stocks sell · Portfolio: /stocks portfolio',
    'stocks.badSymbol': '❓ Unknown symbol. Available: {list}.',
    'stocks.notEnough': '💸 Not enough funds — cost {cost}, you have {wallet}.',
    'stocks.bought':
      '🟢 Bought **{shares}×** {emoji} {symbol} at {price} = {cost}. Wallet: {wallet}.',
    'stocks.notEnoughShares': '📉 You only own **{owned}×** {symbol}.',
    'stocks.sold':
      '🔴 Sold **{shares}×** {emoji} {symbol} at {price} = {proceeds} (result: {profit}). Wallet: {wallet}.',
    'stocks.portfolioEmpty': '📭 You own no shares. Start with `/stocks list`.',
    'stocks.portfolioTitle': '📊 Stock portfolio — {user}',
    'stocks.portfolioLine': '{emoji} **{symbol}** ×{shares} — value {value} · result {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 Total',
    'stocks.portfolioTotalValue': 'Value: {value} · Result: {sign} {pnl}',
  },
  de: {
    'stocks.disabled': '🚫 Die Ökonomie ist auf diesem Server deaktiviert.',
    'stocks.noCloud': '⚠️ Die Börse benötigt eine Datenbank (Supabase). Richte die Cloud ein.',
    'stocks.listTitle': '📈 Börse — Kurse',
    'stocks.listFooter': 'Kaufen: /stocks buy · Verkaufen: /stocks sell · Depot: /stocks portfolio',
    'stocks.badSymbol': '❓ Unbekanntes Symbol. Verfügbar: {list}.',
    'stocks.notEnough': '💸 Nicht genug Guthaben — Kosten {cost}, du hast {wallet}.',
    'stocks.bought':
      '🟢 **{shares}×** {emoji} {symbol} zu {price} gekauft = {cost}. Geldbeutel: {wallet}.',
    'stocks.notEnoughShares': '📉 Du besitzt nur **{owned}×** {symbol}.',
    'stocks.sold':
      '🔴 **{shares}×** {emoji} {symbol} zu {price} verkauft = {proceeds} (Ergebnis: {profit}). Geldbeutel: {wallet}.',
    'stocks.portfolioEmpty': '📭 Du besitzt keine Aktien. Starte mit `/stocks list`.',
    'stocks.portfolioTitle': '📊 Aktiendepot — {user}',
    'stocks.portfolioLine': '{emoji} **{symbol}** ×{shares} — Wert {value} · Ergebnis {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 Gesamt',
    'stocks.portfolioTotalValue': 'Wert: {value} · Ergebnis: {sign} {pnl}',
  },
  es: {
    'stocks.disabled': '🚫 La economía está desactivada en este servidor.',
    'stocks.noCloud': '⚠️ La bolsa necesita una base de datos (Supabase). Configura la nube.',
    'stocks.listTitle': '📈 Bolsa — cotizaciones',
    'stocks.listFooter': 'Comprar: /stocks buy · Vender: /stocks sell · Cartera: /stocks portfolio',
    'stocks.badSymbol': '❓ Símbolo desconocido. Disponibles: {list}.',
    'stocks.notEnough': '💸 Fondos insuficientes — coste {cost}, tienes {wallet}.',
    'stocks.bought':
      '🟢 Compradas **{shares}×** {emoji} {symbol} a {price} = {cost}. Cartera: {wallet}.',
    'stocks.notEnoughShares': '📉 Solo tienes **{owned}×** {symbol}.',
    'stocks.sold':
      '🔴 Vendidas **{shares}×** {emoji} {symbol} a {price} = {proceeds} (resultado: {profit}). Cartera: {wallet}.',
    'stocks.portfolioEmpty': '📭 No tienes acciones. Empieza con `/stocks list`.',
    'stocks.portfolioTitle': '📊 Cartera de acciones — {user}',
    'stocks.portfolioLine':
      '{emoji} **{symbol}** ×{shares} — valor {value} · resultado {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 Total',
    'stocks.portfolioTotalValue': 'Valor: {value} · Resultado: {sign} {pnl}',
  },
  it: {
    'stocks.disabled': '🚫 L’economia è disattivata su questo server.',
    'stocks.noCloud': '⚠️ La borsa richiede un database (Supabase). Configura il cloud.',
    'stocks.listTitle': '📈 Borsa — quotazioni',
    'stocks.listFooter':
      'Compra: /stocks buy · Vendi: /stocks sell · Portafoglio: /stocks portfolio',
    'stocks.badSymbol': '❓ Simbolo sconosciuto. Disponibili: {list}.',
    'stocks.notEnough': '💸 Fondi insufficienti — costo {cost}, hai {wallet}.',
    'stocks.bought':
      '🟢 Comprate **{shares}×** {emoji} {symbol} a {price} = {cost}. Portafoglio: {wallet}.',
    'stocks.notEnoughShares': '📉 Possiedi solo **{owned}×** {symbol}.',
    'stocks.sold':
      '🔴 Vendute **{shares}×** {emoji} {symbol} a {price} = {proceeds} (risultato: {profit}). Portafoglio: {wallet}.',
    'stocks.portfolioEmpty': '📭 Non possiedi azioni. Inizia con `/stocks list`.',
    'stocks.portfolioTitle': '📊 Portafoglio azioni — {user}',
    'stocks.portfolioLine':
      '{emoji} **{symbol}** ×{shares} — valore {value} · risultato {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 Totale',
    'stocks.portfolioTotalValue': 'Valore: {value} · Risultato: {sign} {pnl}',
  },
  fr: {
    'stocks.disabled': '🚫 L’économie est désactivée sur ce serveur.',
    'stocks.noCloud': '⚠️ La bourse nécessite une base de données (Supabase). Configure le cloud.',
    'stocks.listTitle': '📈 Bourse — cotations',
    'stocks.listFooter':
      'Acheter : /stocks buy · Vendre : /stocks sell · Portefeuille : /stocks portfolio',
    'stocks.badSymbol': '❓ Symbole inconnu. Disponibles : {list}.',
    'stocks.notEnough': '💸 Fonds insuffisants — coût {cost}, tu as {wallet}.',
    'stocks.bought':
      '🟢 Achat de **{shares}×** {emoji} {symbol} à {price} = {cost}. Portefeuille : {wallet}.',
    'stocks.notEnoughShares': '📉 Tu ne possèdes que **{owned}×** {symbol}.',
    'stocks.sold':
      '🔴 Vente de **{shares}×** {emoji} {symbol} à {price} = {proceeds} (résultat : {profit}). Portefeuille : {wallet}.',
    'stocks.portfolioEmpty': '📭 Tu ne possèdes aucune action. Commence par `/stocks list`.',
    'stocks.portfolioTitle': '📊 Portefeuille d’actions — {user}',
    'stocks.portfolioLine':
      '{emoji} **{symbol}** ×{shares} — valeur {value} · résultat {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 Total',
    'stocks.portfolioTotalValue': 'Valeur : {value} · Résultat : {sign} {pnl}',
  },
  pt: {
    'stocks.disabled': '🚫 A economia está desativada neste servidor.',
    'stocks.noCloud': '⚠️ A bolsa precisa de um banco de dados (Supabase). Configure a nuvem.',
    'stocks.listTitle': '📈 Bolsa — cotações',
    'stocks.listFooter':
      'Comprar: /stocks buy · Vender: /stocks sell · Carteira: /stocks portfolio',
    'stocks.badSymbol': '❓ Símbolo desconhecido. Disponíveis: {list}.',
    'stocks.notEnough': '💸 Fundos insuficientes — custo {cost}, você tem {wallet}.',
    'stocks.bought':
      '🟢 Compradas **{shares}×** {emoji} {symbol} a {price} = {cost}. Carteira: {wallet}.',
    'stocks.notEnoughShares': '📉 Você só tem **{owned}×** {symbol}.',
    'stocks.sold':
      '🔴 Vendidas **{shares}×** {emoji} {symbol} a {price} = {proceeds} (resultado: {profit}). Carteira: {wallet}.',
    'stocks.portfolioEmpty': '📭 Você não tem ações. Comece com `/stocks list`.',
    'stocks.portfolioTitle': '📊 Carteira de ações — {user}',
    'stocks.portfolioLine':
      '{emoji} **{symbol}** ×{shares} — valor {value} · resultado {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 Total',
    'stocks.portfolioTotalValue': 'Valor: {value} · Resultado: {sign} {pnl}',
  },
  zh: {
    'stocks.disabled': '🚫 本服务器的经济系统已关闭。',
    'stocks.noCloud': '⚠️ 股市需要数据库（Supabase）。请配置云端。',
    'stocks.listTitle': '📈 股市 — 行情',
    'stocks.listFooter': '买入：/stocks buy · 卖出：/stocks sell · 持仓：/stocks portfolio',
    'stocks.badSymbol': '❓ 未知代码。可用：{list}。',
    'stocks.notEnough': '💸 资金不足 — 需 {cost}，你有 {wallet}。',
    'stocks.bought': '🟢 以 {price} 买入 **{shares}×** {emoji} {symbol} = {cost}。钱包：{wallet}。',
    'stocks.notEnoughShares': '📉 你只持有 **{owned}×** {symbol}。',
    'stocks.sold':
      '🔴 以 {price} 卖出 **{shares}×** {emoji} {symbol} = {proceeds}（盈亏：{profit}）。钱包：{wallet}。',
    'stocks.portfolioEmpty': '📭 你没有持仓。先看 `/stocks list`。',
    'stocks.portfolioTitle': '📊 股票持仓 — {user}',
    'stocks.portfolioLine': '{emoji} **{symbol}** ×{shares} — 市值 {value} · 盈亏 {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 合计',
    'stocks.portfolioTotalValue': '市值：{value} · 盈亏：{sign} {pnl}',
  },
  ko: {
    'stocks.disabled': '🚫 이 서버에서는 경제가 비활성화되어 있습니다.',
    'stocks.noCloud': '⚠️ 주식은 데이터베이스(Supabase)가 필요합니다. 클라우드를 설정하세요.',
    'stocks.listTitle': '📈 주식 시장 — 시세',
    'stocks.listFooter': '매수: /stocks buy · 매도: /stocks sell · 포트폴리오: /stocks portfolio',
    'stocks.badSymbol': '❓ 알 수 없는 종목. 사용 가능: {list}.',
    'stocks.notEnough': '💸 잔액 부족 — 비용 {cost}, 보유 {wallet}.',
    'stocks.bought': '🟢 {price}에 **{shares}×** {emoji} {symbol} 매수 = {cost}. 지갑: {wallet}.',
    'stocks.notEnoughShares': '📉 {symbol}을(를) **{owned}×**만 보유 중입니다.',
    'stocks.sold':
      '🔴 {price}에 **{shares}×** {emoji} {symbol} 매도 = {proceeds} (손익: {profit}). 지갑: {wallet}.',
    'stocks.portfolioEmpty': '📭 보유 주식이 없습니다. `/stocks list`로 시작하세요.',
    'stocks.portfolioTitle': '📊 주식 포트폴리오 — {user}',
    'stocks.portfolioLine': '{emoji} **{symbol}** ×{shares} — 가치 {value} · 손익 {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 합계',
    'stocks.portfolioTotalValue': '가치: {value} · 손익: {sign} {pnl}',
  },
  ru: {
    'stocks.disabled': '🚫 Экономика отключена на этом сервере.',
    'stocks.noCloud': '⚠️ Бирже нужна база данных (Supabase). Настройте облако.',
    'stocks.listTitle': '📈 Биржа — котировки',
    'stocks.listFooter':
      'Купить: /stocks buy · Продать: /stocks sell · Портфель: /stocks portfolio',
    'stocks.badSymbol': '❓ Неизвестный символ. Доступно: {list}.',
    'stocks.notEnough': '💸 Недостаточно средств — стоимость {cost}, у вас {wallet}.',
    'stocks.bought':
      '🟢 Куплено **{shares}×** {emoji} {symbol} по {price} = {cost}. Кошелёк: {wallet}.',
    'stocks.notEnoughShares': '📉 У вас только **{owned}×** {symbol}.',
    'stocks.sold':
      '🔴 Продано **{shares}×** {emoji} {symbol} по {price} = {proceeds} (итог: {profit}). Кошелёк: {wallet}.',
    'stocks.portfolioEmpty': '📭 У вас нет акций. Начните с `/stocks list`.',
    'stocks.portfolioTitle': '📊 Портфель акций — {user}',
    'stocks.portfolioLine':
      '{emoji} **{symbol}** ×{shares} — стоимость {value} · итог {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 Итого',
    'stocks.portfolioTotalValue': 'Стоимость: {value} · Итог: {sign} {pnl}',
  },
  uk: {
    'stocks.disabled': '🚫 Економіку вимкнено на цьому сервері.',
    'stocks.noCloud': '⚠️ Біржі потрібна база даних (Supabase). Налаштуйте хмару.',
    'stocks.listTitle': '📈 Біржа — котирування',
    'stocks.listFooter':
      'Купити: /stocks buy · Продати: /stocks sell · Портфель: /stocks portfolio',
    'stocks.badSymbol': '❓ Невідомий символ. Доступні: {list}.',
    'stocks.notEnough': '💸 Недостатньо коштів — вартість {cost}, у вас {wallet}.',
    'stocks.bought':
      '🟢 Куплено **{shares}×** {emoji} {symbol} по {price} = {cost}. Гаманець: {wallet}.',
    'stocks.notEnoughShares': '📉 У вас лише **{owned}×** {symbol}.',
    'stocks.sold':
      '🔴 Продано **{shares}×** {emoji} {symbol} по {price} = {proceeds} (підсумок: {profit}). Гаманець: {wallet}.',
    'stocks.portfolioEmpty': '📭 У вас немає акцій. Почніть з `/stocks list`.',
    'stocks.portfolioTitle': '📊 Портфель акцій — {user}',
    'stocks.portfolioLine':
      '{emoji} **{symbol}** ×{shares} — вартість {value} · підсумок {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 Разом',
    'stocks.portfolioTotalValue': 'Вартість: {value} · Підсумок: {sign} {pnl}',
  },
  ja: {
    'stocks.disabled': '🚫 このサーバーでは経済が無効です。',
    'stocks.noCloud':
      '⚠️ 株式市場にはデータベース（Supabase）が必要です。クラウドを設定してください。',
    'stocks.listTitle': '📈 株式市場 — 相場',
    'stocks.listFooter':
      '購入: /stocks buy · 売却: /stocks sell · ポートフォリオ: /stocks portfolio',
    'stocks.badSymbol': '❓ 不明な銘柄です。利用可能: {list}。',
    'stocks.notEnough': '💸 資金不足 — 費用 {cost}、所持 {wallet}。',
    'stocks.bought':
      '🟢 {price} で **{shares}×** {emoji} {symbol} を購入 = {cost}。財布: {wallet}。',
    'stocks.notEnoughShares': '📉 {symbol} は **{owned}×** しか保有していません。',
    'stocks.sold':
      '🔴 {price} で **{shares}×** {emoji} {symbol} を売却 = {proceeds}（損益: {profit}）。財布: {wallet}。',
    'stocks.portfolioEmpty': '📭 株式を保有していません。`/stocks list` から始めましょう。',
    'stocks.portfolioTitle': '📊 株式ポートフォリオ — {user}',
    'stocks.portfolioLine': '{emoji} **{symbol}** ×{shares} — 評価額 {value} · 損益 {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 合計',
    'stocks.portfolioTotalValue': '評価額: {value} · 損益: {sign} {pnl}',
  },
  ar: {
    'stocks.disabled': '🚫 الاقتصاد معطّل في هذا الخادم.',
    'stocks.noCloud': '⚠️ تحتاج البورصة إلى قاعدة بيانات (Supabase). أعدّ السحابة.',
    'stocks.listTitle': '📈 البورصة — الأسعار',
    'stocks.listFooter': 'شراء: /stocks buy · بيع: /stocks sell · المحفظة: /stocks portfolio',
    'stocks.badSymbol': '❓ رمز غير معروف. المتاح: {list}.',
    'stocks.notEnough': '💸 رصيد غير كافٍ — التكلفة {cost}، لديك {wallet}.',
    'stocks.bought':
      '🟢 تم شراء **{shares}×** {emoji} {symbol} بسعر {price} = {cost}. المحفظة: {wallet}.',
    'stocks.notEnoughShares': '📉 تملك فقط **{owned}×** {symbol}.',
    'stocks.sold':
      '🔴 تم بيع **{shares}×** {emoji} {symbol} بسعر {price} = {proceeds} (النتيجة: {profit}). المحفظة: {wallet}.',
    'stocks.portfolioEmpty': '📭 لا تملك أسهمًا. ابدأ بـ `/stocks list`.',
    'stocks.portfolioTitle': '📊 محفظة الأسهم — {user}',
    'stocks.portfolioLine':
      '{emoji} **{symbol}** ×{shares} — القيمة {value} · النتيجة {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 الإجمالي',
    'stocks.portfolioTotalValue': 'القيمة: {value} · النتيجة: {sign} {pnl}',
  },
  id: {
    'stocks.disabled': '🚫 Ekonomi dinonaktifkan di server ini.',
    'stocks.noCloud': '⚠️ Bursa butuh basis data (Supabase). Konfigurasikan cloud.',
    'stocks.listTitle': '📈 Bursa saham — harga',
    'stocks.listFooter': 'Beli: /stocks buy · Jual: /stocks sell · Portofolio: /stocks portfolio',
    'stocks.badSymbol': '❓ Simbol tidak dikenal. Tersedia: {list}.',
    'stocks.notEnough': '💸 Dana kurang — biaya {cost}, kamu punya {wallet}.',
    'stocks.bought':
      '🟢 Membeli **{shares}×** {emoji} {symbol} di {price} = {cost}. Dompet: {wallet}.',
    'stocks.notEnoughShares': '📉 Kamu hanya punya **{owned}×** {symbol}.',
    'stocks.sold':
      '🔴 Menjual **{shares}×** {emoji} {symbol} di {price} = {proceeds} (hasil: {profit}). Dompet: {wallet}.',
    'stocks.portfolioEmpty': '📭 Kamu tidak punya saham. Mulai dengan `/stocks list`.',
    'stocks.portfolioTitle': '📊 Portofolio saham — {user}',
    'stocks.portfolioLine': '{emoji} **{symbol}** ×{shares} — nilai {value} · hasil {sign} {pnl}',
    'stocks.portfolioTotalName': '💼 Total',
    'stocks.portfolioTotalValue': 'Nilai: {value} · Hasil: {sign} {pnl}',
  },
};
