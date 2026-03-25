import { Controller, Get, Query, Param } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { SearchService } from "./search.service";

@ApiTags("搜索")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: "全局搜索" })
  @ApiQuery({ name: "q", required: true, description: "搜索关键词" })
  @ApiQuery({ name: "page", required: false, description: "页码" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量" })
  async search(
    @Query("q") query: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.searchService.search(query, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get("games")
  @ApiOperation({ summary: "搜索游戏" })
  @ApiQuery({ name: "q", required: true, description: "搜索关键词" })
  @ApiQuery({ name: "page", required: false, description: "页码" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量" })
  async searchGames(
    @Query("q") query: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.searchService.searchGames(query, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }

  @Get("suggestions")
  @ApiOperation({ summary: "获取搜索建议" })
  @ApiQuery({ name: "q", required: true, description: "搜索关键词" })
  @ApiQuery({ name: "limit", required: false, description: "建议数量" })
  async getSuggestions(
    @Query("q") query: string,
    @Query("limit") limit?: string,
  ) {
    return this.searchService.getSuggestions(
      query,
      limit ? parseInt(limit) : 5,
    );
  }

  @Get("popular")
  @ApiOperation({ summary: "获取热门搜索" })
  @ApiQuery({ name: "limit", required: false, description: "数量" })
  async getPopularSearches(@Query("limit") limit?: string) {
    return this.searchService.getPopularSearches(limit ? parseInt(limit) : 10);
  }

  @Get("advanced")
  @ApiOperation({ summary: "高级搜索" })
  @ApiQuery({ name: "q", required: false, description: "搜索关键词" })
  @ApiQuery({ name: "genre", required: false, description: "游戏类型" })
  @ApiQuery({ name: "platform", required: false, description: "平台" })
  @ApiQuery({ name: "priceMin", required: false, description: "最低价格" })
  @ApiQuery({ name: "priceMax", required: false, description: "最高价格" })
  @ApiQuery({ name: "sortBy", required: false, description: "排序字段" })
  @ApiQuery({ name: "sortOrder", required: false, description: "排序方向" })
  @ApiQuery({ name: "page", required: false, description: "页码" })
  @ApiQuery({ name: "limit", required: false, description: "每页数量" })
  async advancedSearch(
    @Query("q") query?: string,
    @Query("genre") genre?: string,
    @Query("platform") platform?: string,
    @Query("priceMin") priceMin?: string,
    @Query("priceMax") priceMax?: string,
    @Query("sortBy") sortBy?: "price" | "rating" | "releaseDate" | "popularity",
    @Query("sortOrder") sortOrder?: "asc" | "desc",
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.searchService.advancedSearch({
      query,
      genre,
      platform,
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      sortBy,
      sortOrder,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });
  }
}
