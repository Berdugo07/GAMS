export function numberToText(num: number): string {
  const unidades = [
    '',
    'uno',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
  ];
  const decenas = [
    '',
    'diez',
    'veinte',
    'treinta',
    'cuarenta',
    'cincuenta',
    'sesenta',
    'setenta',
    'ochenta',
    'noventa',
  ];
  const especiales = [
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciséis',
    'diecisiete',
    'dieciocho',
    'diecinueve',
  ];
  const centenas = [
    '',
    'cien',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos',
  ];

  function convertirGrupo(n: number): string {
    let texto = '';

    if (n === 100) return 'cien';
    if (n > 100) texto += centenas[Math.floor(n / 100)] + ' ';
    n = n % 100;

    if (n >= 10 && n <= 19) {
      texto += especiales[n - 10];
    } else {
      texto += decenas[Math.floor(n / 10)];
      if (n % 10 > 0) texto += ' y ' + unidades[n % 10];
    }

    return texto.trim();
  }

  function convertirMiles(n: number): string {
    if (n === 0) return 'cero';
    if (n < 1000) return convertirGrupo(n);
    if (n < 2000) return 'mil ' + convertirGrupo(n % 1000);
    return (
      convertirGrupo(Math.floor(n / 1000)) + ' mil ' + convertirGrupo(n % 1000)
    );
  }

  function convertirMillones(n: number): string {
    if (n < 1000000) return convertirMiles(n);
    if (n < 2000000) return 'un millón ' + convertirMiles(n % 1000000);
    return (
      convertirMiles(Math.floor(n / 1000000)) +
      ' millones ' +
      convertirMiles(n % 1000000)
    );
  }

  return convertirMillones(num).trim();
}
