// Tor 3 — /fun: zabawy (prawda/wyzwanie, wolałbyś, 8ball, kostka). Dane inline (PL), bez bazy.
import { type ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const ACCENT = 0xe50914;

export const TRUTHS = [
  'Jaki jest Twój największy wstyd z dzieciństwa?',
  'Co ostatnio skłamałeś/aś, żeby uniknąć kłopotów?',
  'Jaką masz najdziwniejszą obsesję?',
  'Kogo z serwera zaprosił(a)byś na kawę?',
  'Jaki jest Twój największy "guilty pleasure"?',
  'Co robisz, gdy nikt nie patrzy?',
  'Jakie masz najbardziej zawstydzające hobby?',
  'Kiedy ostatnio płakałeś/aś i dlaczego?',
  'Jaki jest Twój najgorszy nawyk?',
  'O czym marzysz, ale boisz się powiedzieć na głos?',
];
export const DARES = [
  'Napisz wiadomość samymi emoji przez następne 10 minut.',
  'Zmień swój nick na "🤡 Klaun Serwera" na 1 godzinę.',
  'Wyślij ostatnie zdjęcie z galerii (bez podglądu!).',
  'Napisz coś miłego trzem losowym osobom na serwerze.',
  'Nagraj voice z Twoim najlepszym śmiechem złoczyńcy.',
  'Opowiedz najgorszy żart, jaki znasz.',
  'Mów o sobie w trzeciej osobie przez 5 wiadomości.',
  'Ustaw status "Przegrałem zakład" na 30 minut.',
  'Wyślij GIF, który opisuje Twój dzień.',
  'Pochwal się najstarszym memem na dysku.',
];
export const WYR = [
  'Wolałbyś umieć latać czy być niewidzialnym?',
  'Wolałbyś nie móc kłamać czy zawsze mówić prawdę?',
  'Wolałbyś mieć nieskończony czas czy nieskończone pieniądze?',
  'Wolałbyś grać tylko w jedną grę do końca życia czy nigdy więcej nie zagrać?',
  'Wolałbyś czytać myśli czy przewidywać przyszłość?',
  'Wolałbyś jeść tylko słodkie czy tylko słone?',
  'Wolałbyś stracić internet na rok czy telefon na rok?',
  'Wolałbyś być sławny czy bardzo bogaty, ale anonimowy?',
  'Wolałbyś cofać się w czasie czy przenosić w przyszłość?',
  'Wolałbyś mieć pauzę na życie czy przewijanie?',
];
export const EIGHTBALL = [
  'Zdecydowanie tak. ✅',
  'Bez wątpienia.',
  'Raczej tak.',
  'Wszystko na to wskazuje.',
  'Hmm… może.',
  'Zapytaj później. 🔮',
  'Nie liczyłbym na to.',
  'Raczej nie.',
  'Zdecydowanie nie. ❌',
  'Moje źródła mówią: nie.',
];

export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Rzut kością k-ściankową: wynik w [1, sides].
export function rollDie(sides: number): number {
  return 1 + Math.floor(Math.random() * sides);
}

export const data = new SlashCommandBuilder()
  .setName('fun')
  .setDescription('Zabawy: prawda/wyzwanie, wolałbyś, 8ball, kostka.')
  .addSubcommand((s) => s.setName('prawda').setDescription('Pytanie typu „prawda"'))
  .addSubcommand((s) => s.setName('wyzwanie').setDescription('Losowe wyzwanie'))
  .addSubcommand((s) => s.setName('wolalbys').setDescription('Pytanie „wolałbyś…?"'))
  .addSubcommand((s) =>
    s
      .setName('8ball')
      .setDescription('Zapytaj magiczną kulę')
      .addStringOption((o) =>
        o.setName('pytanie').setDescription('Twoje pytanie').setRequired(true).setMaxLength(300),
      ),
  )
  .addSubcommand((s) =>
    s
      .setName('kostka')
      .setDescription('Rzut kostką')
      .addIntegerOption((o) =>
        o
          .setName('scianki')
          .setDescription('Liczba ścianek (domyślnie 6)')
          .setMinValue(2)
          .setMaxValue(1000),
      ),
  );

export async function execute(interaction: ChatInputCommandInteraction): Promise<void> {
  const sub = interaction.options.getSubcommand();
  const e = new EmbedBuilder().setColor(ACCENT);

  if (sub === 'prawda') {
    e.setTitle('🧐 Prawda').setDescription(pick(TRUTHS));
  } else if (sub === 'wyzwanie') {
    e.setTitle('🔥 Wyzwanie').setDescription(pick(DARES));
  } else if (sub === 'wolalbys') {
    e.setTitle('🤔 Wolałbyś…?').setDescription(pick(WYR));
  } else if (sub === '8ball') {
    const q = interaction.options.getString('pytanie', true);
    e.setTitle('🎱 Magiczna kula').addFields(
      { name: 'Pytanie', value: q },
      { name: 'Odpowiedź', value: pick(EIGHTBALL) },
    );
  } else if (sub === 'kostka') {
    const sides = interaction.options.getInteger('scianki') ?? 6;
    const roll = rollDie(sides);
    e.setTitle('🎲 Kostka').setDescription(`Rzut k${sides}: **${roll}**`);
  }

  await interaction.reply({ embeds: [e] });
}
