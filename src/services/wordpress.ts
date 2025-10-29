import axios, { AxiosInstance } from "axios";
import { Post, Category, PostListParams } from "@/types/wordpress";
import i18nService from "./i18n";

const DEFAULT_EN_URL =
  process.env.EXPO_PUBLIC_WORDPRESS_EN_API_URL ||
  "https://blog.doavers.com/wp-json/wp/v2/";
const DEFAULT_ID_URL =
  process.env.EXPO_PUBLIC_WORDPRESS_ID_API_URL ||
  "https://doavers.my.id/wp-json/wp/v2/";
const DEFAULT_EN_FEATURED_CATEGORY_ID =
  process.env.EXPO_PUBLIC_WORDPRESS_EN_FEATURED_CATEGORY_ID || "6";
const DEFAULT_ID_FEATURED_CATEGORY_ID =
  process.env.EXPO_PUBLIC_WORDPRESS_ID_FEATURED_CATEGORY_ID || "6";

class WordPressApiService {
  private api: AxiosInstance;
  private currentBaseUrl: string;

  constructor() {
    this.currentBaseUrl = this.getBaseUrlByLanguage();
    this.api = axios.create({
      baseURL: this.currentBaseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private getBaseUrlByLanguage(): string {
    const currentLanguage = i18nService.getCurrentLanguage();
    // console.log("WordPressApiService: Current language:", currentLanguage);

    if (currentLanguage === "id") {
      // console.log("WordPressApiService: Using Indonesian URL:", DEFAULT_ID_URL);
      return DEFAULT_ID_URL;
    } else {
      // console.log("WordPressApiService: Using English URL:", DEFAULT_EN_URL);
      return DEFAULT_EN_URL;
    }
  }

  private getFeaturedCategoryIdByLanguage(): string {
    const currentLanguage = i18nService.getCurrentLanguage();
    // console.log(
    //   "WordPressApiService: Getting featured category ID for language:",
    //   currentLanguage
    // );

    if (currentLanguage === "id") {
      const categoryId = DEFAULT_ID_FEATURED_CATEGORY_ID;
      // console.log(
      //   "WordPressApiService: Using Indonesian featured category ID:",
      //   categoryId
      // );
      return categoryId;
    } else {
      const categoryId = DEFAULT_EN_FEATURED_CATEGORY_ID;
      // console.log(
      //   "WordPressApiService: Using English featured category ID:",
      //   categoryId
      // );
      return categoryId;
    }
  }

  updateBaseUrl() {
    const newBaseUrl = this.getBaseUrlByLanguage();
    if (newBaseUrl !== this.currentBaseUrl) {
      // console.log(
      //   "WordPressApiService: Updating base URL from",
      //   this.currentBaseUrl,
      //   "to",
      //   newBaseUrl
      // );
      this.currentBaseUrl = newBaseUrl;
      this.api.defaults.baseURL = newBaseUrl;
    }
  }

  async getPosts(params?: PostListParams): Promise<Post[]> {
    try {
      this.updateBaseUrl();
      const response = await this.api.get("/posts", {
        params: {
          _embed: true,
          ...params,
        },
      });

      // Transform the data to include easier-to-use properties
      return response.data.map((post: any) => this.transformPost(post));
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    try {
      this.updateBaseUrl();
      const response = await this.api.get("/categories", {
        params: {
          _embed: true,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async getPostById(id: number): Promise<Post> {
    try {
      this.updateBaseUrl();
      const response = await this.api.get(`/posts/${id}`, {
        params: {
          _embed: true,
        },
      });
      return this.transformPost(response.data);
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  }

  async getFeaturedPosts(limit: number = 5): Promise<Post[]> {
    try {
      this.updateBaseUrl();

      // Use language-specific category ID if no categoryId is provided
      const featuredCategoryId = parseInt(
        this.getFeaturedCategoryIdByLanguage()
      );

      // console.log("WordPressApiService.getFeaturedPosts called", {
      //   categoryId: featuredCategoryId,
      //   limit,
      //   language: i18nService.getCurrentLanguage(),
      // });

      const response = await this.api
        .get("/posts", {
          params: {
            _embed: true,
            categories: featuredCategoryId,
            per_page: limit,
          },
        })
        .then((res) => {
          return res;
        })
        .catch((err) => {
          throw err;
        });

      return response.data.map((post: any) => {
        const tfPost = this.transformPost(post);
        // console.log("Transformed featured post:", tfPost);
        return tfPost;
      });
    } catch (error) {
      console.error("Error fetching featured posts:", error);
      throw error;
    }
  }

  async getLatestPosts(
    perPage: number = 10,
    page: number = 1
  ): Promise<Post[]> {
    try {
      this.updateBaseUrl();
      const response = await this.api.get("/posts", {
        params: {
          _embed: true,
          per_page: perPage,
          page: page,
          order: "desc",
          orderby: "date",
        },
      });

      return response.data.map((post: any) => this.transformPost(post));
    } catch (error) {
      console.error("Error fetching latest posts:", error);
      throw error;
    }
  }

  async getPostsByCategory(
    categoryId: number,
    perPage: number = 10,
    page: number = 1
  ): Promise<Post[]> {
    try {
      this.updateBaseUrl();
      const response = await this.api.get("/posts", {
        params: {
          _embed: true,
          categories: categoryId,
          per_page: perPage,
          page: page,
          order: "desc",
          orderby: "date",
        },
      });

      return response.data.map((post: any) => this.transformPost(post));
    } catch (error) {
      console.error("Error fetching posts by category:", error);
      throw error;
    }
  }

  async searchPosts(
    query: string,
    perPage: number = 10,
    page: number = 1
  ): Promise<Post[]> {
    try {
      this.updateBaseUrl();
      const response = await this.api.get("/posts", {
        params: {
          _embed: true,
          subtype: "post",
          search: decodeURIComponent(query),
          per_page: perPage,
          page: page,
          order: "desc",
          orderby: "relevance",
        },
      });

      return response.data.map((post: any) => this.transformPost(post));
    } catch (error) {
      console.error("Error searching posts:", error);
      throw error;
    }
  }

  // Helper method to transform post data for easier use
  private transformPost(post: any): Post {
    const featuredImage = this.getFeaturedImageUrl(post);
    const authorName = this.getAuthorName(post);
    const categoryNames = this.getCategoryNames(post);

    return {
      ...post,
      featured_image: featuredImage,
      author_name: authorName,
      category_names: categoryNames,
    };
  }

  private getFeaturedImageUrl(post: any): string | undefined {
    if (post._embedded?.["wp:featuredmedia"]?.[0]) {
      const media = post._embedded["wp:featuredmedia"][0];
      return (
        media.source_url ||
        media.media_details?.sizes?.medium?.source_url ||
        media.media_details?.sizes?.thumbnail?.source_url
      );
    }
    return undefined;
  }

  private getAuthorName(post: any): string | undefined {
    if (post._embedded?.author?.[0]) {
      return post._embedded.author[0].name;
    }
    return undefined;
  }

  private getCategoryNames(post: any): string[] {
    if (post._embedded?.["wp:term"]?.[0]) {
      return post._embedded["wp:term"][0].map((term: any) => term.name);
    }
    return [];
  }
}

const wordpressApiService = new WordPressApiService();
export default wordpressApiService;
