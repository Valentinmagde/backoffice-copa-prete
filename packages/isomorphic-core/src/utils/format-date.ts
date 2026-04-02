import dayjs from 'dayjs';
import 'dayjs/locale/fr';

export function formatDate(
  date?: Date,
  format: string = 'D MMMM YYYY'
): string {
  if (!date) return '';
  return dayjs(date).locale('fr').format(format);
}