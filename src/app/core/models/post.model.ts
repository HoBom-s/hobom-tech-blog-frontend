export interface Article {
  id: string;
  title: string;
  slug: string;
  date: string;
  tags: string[];
  emoji: string;
}

export interface ArticleType {
  articles: Article[];
  nextCursor?: string | null;
  hasMore: boolean;
}

export interface ArticleDetail {
  title: string;
  tags: string[];
  contents: string;
}
