import { TerminalSquare } from 'lucide-react';

export const dynamic = 'force-dynamic';

const COMMANDS = [
  { name: '/ping', desc: 'Latencja bota (API + WebSocket).', status: 'aktywna' },
  { name: '/library [szukaj]', desc: 'Twoja biblioteka gier z bazy (Steam + PSN).', status: 'aktywna' },
  { name: '/antinuke', desc: 'Ochrona serwera: status / włącz / progi / whitelist.', status: 'aktywna' },
  { name: '/link <kod>', desc: 'Łączy konto Discord z profilem GH0ST EMPIRE.', status: 'aktywna' },
  { name: '/portal', desc: 'Link do portalu GH0ST + jak zarabiać Ghost Tokens.', status: 'aktywna' },
];

export default function CommandsPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">Slash-komendy zarejestrowane przez bota (discord.js v14).</p>

      <section className="panel-glow overflow-hidden rounded-2xl border border-line bg-card">
        <h2 className="flex items-center gap-2 border-b border-line px-5 py-4 text-base font-semibold uppercase tracking-wide">
          <TerminalSquare size={16} className="text-accent" /> Komendy
        </h2>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-sm">
          <thead className="text-left text-[11px] uppercase tracking-wide text-muted">
            <tr>
              <th className="px-5 py-3 font-medium">Komenda</th>
              <th className="px-5 py-3 font-medium">Opis</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {COMMANDS.map((c) => (
              <tr key={c.name} className="border-t border-line">
                <td className="px-5 py-3 font-mono text-accent">{c.name}</td>
                <td className="px-5 py-3 text-white/80">{c.desc}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs text-green-400">{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>

      <p className="text-xs text-muted">
        Część komend (ekonomia GH0ST: GT za czat/voice, `/portal`, `/link`) jest rozwijana w module bota.
      </p>
    </div>
  );
}
