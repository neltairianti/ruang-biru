const openingDateFormatter = new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'long',
  timeZone: 'Asia/Jakarta',
});

export function formatGemaOpeningDate(date: string) {
  return openingDateFormatter.format(new Date(`${date}T00:00:00+07:00`));
}
