const ordinalTextMapping = [
  [
    '',
    'primero',
    'segundo',
    'tercero',
    'cuarto',
    'quinto',
    'sexto',
    'séptimo',
    'octavo',
    'noveno',
  ],
  [
    '',
    'décimo',
    'vigésimo',
    'trigésimo',
    'cuadragésimo',
    'quincuagésimo',
    'sexagésimo',
    'septuagésimo',
    'octagésimo',
    'nonagésimo',
  ],
  [
    '',
    'centésimo',
    'ducentésimo',
    'tricentésimo',
    'cuadrigentésimo',
    'quingentésimo',
    'sexcentésimo',
    'septingentésimo',
    'octingentésimo',
    'noningentésimo',
  ],
  [
    '',
    'milésimo',
    'dosmilésimo',
    'tresmilésimo ',
    'cuatromilésimo',
    'cincomilésimo',
    'seismilésimo',
    'sietemilésimo',
    'ochomilésimo',
    'nuevemilésimo',
  ],
];
export function toOrdinal(value: number): string {
  const digits = [...value.toString()];
  const ordinal = digits.map(
    (digit, index) => ordinalTextMapping[digits.length - index - 1][+digit]
  );
  return ordinal.join(' ').trim().toUpperCase();
}
