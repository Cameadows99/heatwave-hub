export type Suggestion = {
  id: string;
  authorName?: string;
  timestamp: Date;
  title: string;
  body: string;
  seconds: number; // Likes
};
