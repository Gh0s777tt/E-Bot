// Słownik mostów eko + /math — 14 języków. {tax}{user}{amount}{level}{expr}{result} = placeholdery.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

// math.result jest uniwersalny (sama notacja) — identyczny we wszystkich językach.
const MATH_RESULT = '🧮 `{expr}` = **{result}**';

export const BRIDGES_STRINGS: Record<Locale, Dict> = {
  pl: {
    'eco.payTax': '🧾 Podatek: **{tax}**.',
    'eco.levelReward': '💰 {user} dostaje **{amount}** za awans na poziom {level}!',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ Nieprawidłowe wyrażenie. Dozwolone: liczby, + − × ÷ ( ) . %',
  },
  en: {
    'eco.payTax': '🧾 Tax: **{tax}**.',
    'eco.levelReward': '💰 {user} gets **{amount}** for reaching level {level}!',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ Invalid expression. Allowed: numbers, + − × ÷ ( ) . %',
  },
  de: {
    'eco.payTax': '🧾 Steuer: **{tax}**.',
    'eco.levelReward': '💰 {user} erhält **{amount}** für Level {level}!',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ Ungültiger Ausdruck. Erlaubt: Zahlen, + − × ÷ ( ) . %',
  },
  es: {
    'eco.payTax': '🧾 Impuesto: **{tax}**.',
    'eco.levelReward': '💰 ¡{user} recibe **{amount}** por alcanzar el nivel {level}!',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ Expresión no válida. Permitido: números, + − × ÷ ( ) . %',
  },
  it: {
    'eco.payTax': '🧾 Tassa: **{tax}**.',
    'eco.levelReward': '💰 {user} riceve **{amount}** per il livello {level}!',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ Espressione non valida. Consentiti: numeri, + − × ÷ ( ) . %',
  },
  fr: {
    'eco.payTax': '🧾 Taxe : **{tax}**.',
    'eco.levelReward': '💰 {user} reçoit **{amount}** pour le niveau {level} !',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ Expression invalide. Autorisés : nombres, + − × ÷ ( ) . %',
  },
  pt: {
    'eco.payTax': '🧾 Imposto: **{tax}**.',
    'eco.levelReward': '💰 {user} recebe **{amount}** por alcançar o nível {level}!',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ Expressão inválida. Permitido: números, + − × ÷ ( ) . %',
  },
  zh: {
    'eco.payTax': '🧾 税：**{tax}**。',
    'eco.levelReward': '💰 {user} 升到 {level} 级，获得 **{amount}**！',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ 表达式无效。允许：数字、+ − × ÷ ( ) . %',
  },
  ko: {
    'eco.payTax': '🧾 세금: **{tax}**.',
    'eco.levelReward': '💰 {user}님이 레벨 {level} 달성으로 **{amount}**을(를) 받았어요!',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ 잘못된 수식입니다. 허용: 숫자, + − × ÷ ( ) . %',
  },
  ru: {
    'eco.payTax': '🧾 Налог: **{tax}**.',
    'eco.levelReward': '💰 {user} получает **{amount}** за уровень {level}!',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ Недопустимое выражение. Разрешены: числа, + − × ÷ ( ) . %',
  },
  uk: {
    'eco.payTax': '🧾 Податок: **{tax}**.',
    'eco.levelReward': '💰 {user} отримує **{amount}** за рівень {level}!',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ Неприпустимий вираз. Дозволено: числа, + − × ÷ ( ) . %',
  },
  ja: {
    'eco.payTax': '🧾 税：**{tax}**。',
    'eco.levelReward': '💰 {user} はレベル {level} 到達で **{amount}** を獲得！',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ 無効な式です。使用可能：数字、+ − × ÷ ( ) . %',
  },
  ar: {
    'eco.payTax': '🧾 الضريبة: **{tax}**.',
    'eco.levelReward': '💰 يحصل {user} على **{amount}** لبلوغ المستوى {level}!',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ تعبير غير صالح. المسموح: أرقام، + − × ÷ ( ) . %',
  },
  id: {
    'eco.payTax': '🧾 Pajak: **{tax}**.',
    'eco.levelReward': '💰 {user} mendapat **{amount}** karena mencapai level {level}!',
    'math.result': MATH_RESULT,
    'math.invalid': '⚠️ Ekspresi tidak valid. Diizinkan: angka, + − × ÷ ( ) . %',
  },
};
