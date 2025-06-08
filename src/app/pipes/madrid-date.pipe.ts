import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'madridDate'
})
export class MadridDatePipe implements PipeTransform {

  private datePipe = new DatePipe('es-ES'); // idioma español

  transform(value: string | Date | null | undefined, format: string = 'dd/MM/yyyy HH:mm'): string | null {
    if (!value) return null;

    // Convertir fecha al formato y zona Madrid
    try {
      // Convertir a Date
      const date = new Date(value);
      if (isNaN(date.getTime())) return null;

      // Usar Intl.DateTimeFormat para zona horaria Madrid
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Madrid',
      };
      // Formatear manualmente para control (dd/MM/yyyy HH:mm)
      const formatter = new Intl.DateTimeFormat('es-ES', options);
      const parts = formatter.formatToParts(date);

      const map: any = {};
      parts.forEach(({ type, value }) => { map[type] = value; });
      return `${map.day}/${map.month}/${map.year} ${map.hour}:${map.minute}`;
    } catch {
      return this.datePipe.transform(value, format, 'Europe/Madrid');
    }
  }
}
