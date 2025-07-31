export type DiscussionPost = {
  id: string;
  department: string;
  authorName: string;
  timestamp: Date;
  content: string;
  likes: number;
  comments: Comment[];
};

export type Comment = {
  id: string;
  postId: string;
  authorName: string;
  timestamp: Date;
  content: string;
};
