export const dynamic = 'force-dynamic';

const COMMANDS = [
  { name: '/ping', desc: 'Sprawdza, czy bot żyje (latencja API + WebSocket).', status: 'aktywna' },
  { name: '/library [szukaj]', desc: 'Twoja biblioteka gier z bazy (Steam + PSN), embed w czerwieni.', status: 'aktywna' },
];

export default function CommandsPage() {
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">Slash-komendy zarejestrowane przez bota (discord.js v14).</p>
      <div className="overflow-hidden rounded-xl border border-line">
        <table className="w-full text-sm">
          <thead className="bg-card text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Komenda</th>
              <th className="px-4 py-3 font-medium">Opis</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {COMMANDS.map((c) => (
              <tr key={c.name} className="border-t border-line">
                <td className="px-4 py-3 font-mono text-accent">{c.name}</td>
                <td className="px-4 py-3 text-white/80">{c.desc}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-green-500/15 px-2.5 py-1 text-xs text-green-400">{c.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">
        Kolejne moduły (moderacja, reaction roles, AI) dołożymy jako osobne komendy. Telemetria użycia wymaga
        zapisu zdarzeń z bota do bazy — do dorobienia.
      </p>
    </div>
  );
}
