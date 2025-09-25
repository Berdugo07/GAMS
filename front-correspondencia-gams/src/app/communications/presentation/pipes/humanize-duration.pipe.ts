import { Pipe, type PipeTransform } from '@angular/core';
import { humanize } from '../../../helpers';

@Pipe({ name: 'humanizeDuration' })
export class HumanizeDurationPipe implements PipeTransform {
  transform(miliseconds: number): string {
    const days = Math.floor(miliseconds / (1000 * 60 * 60 * 24));
    return days > 0 ? humanize(miliseconds) : 'Expira hoy';
  }
}
  