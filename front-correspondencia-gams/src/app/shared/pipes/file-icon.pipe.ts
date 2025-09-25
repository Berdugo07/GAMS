import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileIcon',
})
export class FileIconPipe implements PipeTransform {
  private readonly PATH = 'images/icons/files';
  private readonly FILE_ICONS: Record<string, string[]> = {
    'image.png': ['jpg', 'png', 'jpeg'],
    'vide.png': ['mp4'],
    'pdf.png': ['pdf'],
  };

  transform(fileName: string): unknown {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return `${this.PATH}/${'unknown.png'}`;
    for (const [imageName, extensions] of Object.entries(this.FILE_ICONS)) {
      if (extensions.includes(extension)) {
        return `${this.PATH}/${imageName}`;
      }
    }
    return `${this.PATH}/${'unknown.png'}`;
  }
}
