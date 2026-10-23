/**
 * Scale glyph per audience, drawn from brand L-modules: one module for a startup, a small assembly for
 * an SME, a full lattice for an enterprise, and a bespoke rotated arrangement for custom work. Decorative.
 */
const L = "M0 0h62v-14H31l-11-11V-70H0z";

export function AudienceGlyph({ kind, dark = false }: { kind: string; dark?: boolean }) {
  const a = dark ? "#FFFFFF" : "#0B1B3A";
  const b = "#1769E0";
  const c = dark ? "rgba(255,255,255,0.35)" : "rgba(11,27,58,0.25)";
  let pieces: [number, number, number, string][] = [];
  if (kind === "startups") pieces = [[170, 210, 0, a]];
  else if (kind === "smes")
    pieces = [
      [120, 220, 0, a],
      [190, 220, 0, c],
      [190, 150, 0, a],
    ];
  else if (kind === "enterprise")
    pieces = Array.from({ length: 12 }, (_, i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      return [60 + col * 78, 110 + row * 72, ((col + 2 * row) % 4) * 90, (col + row) % 3 === 0 ? b : a] as [number, number, number, string];
    });
  else
    pieces = [
      [80, 200, -30, a],
      [170, 120, 60, b],
      [250, 230, 160, a],
      [300, 120, 20, c],
    ];
  return (
    <svg viewBox="0 0 400 280" aria-hidden="true" className="h-auto w-full">
      {pieces.map(([x, y, r, f], i) => (
        <path key={i} d={L} fill={f} transform={`translate(${x} ${y}) rotate(${r} 31 -35)`} />
      ))}
      <path d="M352 30l12 12-12 12-12-12z" fill={b} />
    </svg>
  );
}
