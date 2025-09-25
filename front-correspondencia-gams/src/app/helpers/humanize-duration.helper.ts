import humanizeDuration from 'humanize-duration';

export function humanize(miliseconds: number): string {
  return humanizeDuration(miliseconds, {
    language: 'es',
    round: true,
    units: ['d', 'h'],
  });
}
