export interface CalendarEvent {
  id?: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  attendees?: string[];
}
