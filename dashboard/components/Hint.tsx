// Tooltip ⓘ przy etykietach pól (Etap I — przyjazność). Natywny title — zero JS, działa wszędzie.
export default function Hint({ text }: { text: string }) {
  return (
    <span
      title={text}
      className="ml-1 inline-block cursor-help select-none align-middle text-xs text-muted/80"
    >
      ⓘ
    </span>
  );
}
