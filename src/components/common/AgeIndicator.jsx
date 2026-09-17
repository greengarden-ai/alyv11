export default function AgeIndicator({ daysOpen }) {
  const [color, severity] =
    daysOpen > 30 ? ['var(--age-critical)', ' — critical'] :
    daysOpen > 15 ? ['var(--age-warn)', ' — warning'] :
    ['var(--age-ok)', '']

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color,
    }}>
      <span aria-hidden="true">⏱</span>
      {daysOpen}d open{severity}
    </span>
  )
}
