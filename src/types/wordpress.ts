// WordPress API Types
export interface WordPressMedia {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: string;
  mime_type: string;
  source_url: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: {
      [key: string]: {
        file: string;
        width: number;
        height: number;
        mime_type?: string;
        source_url?: string;
      };
    };
  };
}

export interface WordPressCategory {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  meta: any[];
  _links: any;
}

export interface WordPressAuthor {
  id: number;
  name: string;
  url: string;
  description: string;
  link: string;
  slug: string;
  avatar_urls: {
    [key: string]: string;
  };
}

export interface WordPressPost {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: string;
  ping_status: string;
  sticky: boolean;
  template: string;
  format: string;
  meta: any[];
  categories: number[];
  tags: number[];
  _links: any;
  _embedded?: {
    author?: WordPressAuthor[];
    'wp:featuredmedia'?: WordPressMedia[];
    'wp:term'?: Array<Array<{ id: number; name: string; slug: string }>>;
  };
}

// Extended types for easier use in the app
export interface Post extends WordPressPost {
  featured_image?: string;
  author_name?: string;
  category_names?: string[];
}

export interface Category extends WordPressCategory {}

// Bookmark interface with full URL support for handling source changes
export interface Bookmark {
  id: number;
  title: string;
  excerpt: string;
  featured_image?: string;
  author_name?: string;
  category_names?: string[];
  date: string;
  link: string; // Full URL to the post
  bookmarked_date: string; // When the bookmark was created
}

export interface PostListParams {
  page?: number;
  per_page?: number;
  search?: string;
  categories?: number[];
  exclude?: number[];
  include?: number[];
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'relevance' | 'slug' | 'include' | 'title' | 'modified';
}