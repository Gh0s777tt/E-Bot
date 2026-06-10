// Słownik /heat (adaptacyjny anty-spam) — 14 języków. {threshold}{action}{user}{score} = placeholdery.
import type { Locale } from './locales.mts';

type Dict = Record<string, string>;

export const HEAT_STRINGS: Record<Locale, Dict> = {
  pl: {
    'heat.on': '🔥 Heat system WŁĄCZONY — próg {threshold}, akcja: {action}.',
    'heat.off': '✅ Heat system wyłączony.',
    'heat.statusOn': '🔥 Heat: włączony — próg {threshold}, akcja {action}.',
    'heat.statusOff': 'ℹ️ Heat: wyłączony.',
    'heat.alert': '🔥 **Heat:** {user} przekroczył próg ({score}/{threshold}) → {action}.',
  },
  en: {
    'heat.on': '🔥 Heat system ON — threshold {threshold}, action: {action}.',
    'heat.off': '✅ Heat system disabled.',
    'heat.statusOn': '🔥 Heat: enabled — threshold {threshold}, action {action}.',
    'heat.statusOff': 'ℹ️ Heat: disabled.',
    'heat.alert': '🔥 **Heat:** {user} crossed the threshold ({score}/{threshold}) → {action}.',
  },
  de: {
    'heat.on': '🔥 Heat-System AN — Schwelle {threshold}, Aktion: {action}.',
    'heat.off': '✅ Heat-System deaktiviert.',
    'heat.statusOn': '🔥 Heat: aktiv — Schwelle {threshold}, Aktion {action}.',
    'heat.statusOff': 'ℹ️ Heat: deaktiviert.',
    'heat.alert':
      '🔥 **Heat:** {user} hat die Schwelle überschritten ({score}/{threshold}) → {action}.',
  },
  es: {
    'heat.on': '🔥 Sistema Heat ACTIVADO — umbral {threshold}, acción: {action}.',
    'heat.off': '✅ Sistema Heat desactivado.',
    'heat.statusOn': '🔥 Heat: activado — umbral {threshold}, acción {action}.',
    'heat.statusOff': 'ℹ️ Heat: desactivado.',
    'heat.alert': '🔥 **Heat:** {user} superó el umbral ({score}/{threshold}) → {action}.',
  },
  it: {
    'heat.on': '🔥 Sistema Heat ATTIVO — soglia {threshold}, azione: {action}.',
    'heat.off': '✅ Sistema Heat disattivato.',
    'heat.statusOn': '🔥 Heat: attivo — soglia {threshold}, azione {action}.',
    'heat.statusOff': 'ℹ️ Heat: disattivato.',
    'heat.alert': '🔥 **Heat:** {user} ha superato la soglia ({score}/{threshold}) → {action}.',
  },
  fr: {
    'heat.on': '🔥 Système Heat ACTIVÉ — seuil {threshold}, action : {action}.',
    'heat.off': '✅ Système Heat désactivé.',
    'heat.statusOn': '🔥 Heat : activé — seuil {threshold}, action {action}.',
    'heat.statusOff': 'ℹ️ Heat : désactivé.',
    'heat.alert': '🔥 **Heat :** {user} a dépassé le seuil ({score}/{threshold}) → {action}.',
  },
  pt: {
    'heat.on': '🔥 Sistema Heat ATIVADO — limite {threshold}, ação: {action}.',
    'heat.off': '✅ Sistema Heat desativado.',
    'heat.statusOn': '🔥 Heat: ativado — limite {threshold}, ação {action}.',
    'heat.statusOff': 'ℹ️ Heat: desativado.',
    'heat.alert': '🔥 **Heat:** {user} ultrapassou o limite ({score}/{threshold}) → {action}.',
  },
  zh: {
    'heat.on': '🔥 热度系统已开启 — 阈值 {threshold}，动作：{action}。',
    'heat.off': '✅ 热度系统已关闭。',
    'heat.statusOn': '🔥 热度：已开启 — 阈值 {threshold}，动作 {action}。',
    'heat.statusOff': 'ℹ️ 热度：已关闭。',
    'heat.alert': '🔥 **热度：**{user} 超过阈值（{score}/{threshold}）→ {action}。',
  },
  ko: {
    'heat.on': '🔥 히트 시스템 켜짐 — 임계값 {threshold}, 조치: {action}.',
    'heat.off': '✅ 히트 시스템 꺼짐.',
    'heat.statusOn': '🔥 히트: 켜짐 — 임계값 {threshold}, 조치 {action}.',
    'heat.statusOff': 'ℹ️ 히트: 꺼짐.',
    'heat.alert': '🔥 **히트:** {user}님이 임계값을 초과했습니다 ({score}/{threshold}) → {action}.',
  },
  ru: {
    'heat.on': '🔥 Heat-система ВКЛЮЧЕНА — порог {threshold}, действие: {action}.',
    'heat.off': '✅ Heat-система выключена.',
    'heat.statusOn': '🔥 Heat: включена — порог {threshold}, действие {action}.',
    'heat.statusOff': 'ℹ️ Heat: выключена.',
    'heat.alert': '🔥 **Heat:** {user} превысил порог ({score}/{threshold}) → {action}.',
  },
  uk: {
    'heat.on': '🔥 Heat-систему УВІМКНЕНО — поріг {threshold}, дія: {action}.',
    'heat.off': '✅ Heat-систему вимкнено.',
    'heat.statusOn': '🔥 Heat: увімкнено — поріг {threshold}, дія {action}.',
    'heat.statusOff': 'ℹ️ Heat: вимкнено.',
    'heat.alert': '🔥 **Heat:** {user} перевищив поріг ({score}/{threshold}) → {action}.',
  },
  ja: {
    'heat.on': '🔥 ヒートシステム ON — しきい値 {threshold}、アクション：{action}。',
    'heat.off': '✅ ヒートシステムを無効にしました。',
    'heat.statusOn': '🔥 ヒート：有効 — しきい値 {threshold}、アクション {action}。',
    'heat.statusOff': 'ℹ️ ヒート：無効。',
    'heat.alert': '🔥 **ヒート：**{user} がしきい値を超えました（{score}/{threshold}）→ {action}。',
  },
  ar: {
    'heat.on': '🔥 نظام الحرارة مُفعّل — العتبة {threshold}، الإجراء: {action}.',
    'heat.off': '✅ تم إيقاف نظام الحرارة.',
    'heat.statusOn': '🔥 الحرارة: مُفعّل — العتبة {threshold}، الإجراء {action}.',
    'heat.statusOff': 'ℹ️ الحرارة: متوقف.',
    'heat.alert': '🔥 **الحرارة:** تجاوز {user} العتبة ({score}/{threshold}) → {action}.',
  },
  id: {
    'heat.on': '🔥 Sistem Heat AKTIF — ambang {threshold}, aksi: {action}.',
    'heat.off': '✅ Sistem Heat dimatikan.',
    'heat.statusOn': '🔥 Heat: aktif — ambang {threshold}, aksi {action}.',
    'heat.statusOff': 'ℹ️ Heat: mati.',
    'heat.alert': '🔥 **Heat:** {user} melewati ambang ({score}/{threshold}) → {action}.',
  },
};
