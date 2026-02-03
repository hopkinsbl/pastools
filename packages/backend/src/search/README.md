# Search Module

## Overview

The Search module provides full-text search capabilities across all CDM entities within a project. It uses PostgreSQL's built-in full-text search with tsvector and tsquery for efficient text matching and ranking.

## Features

- **Cross-Entity Search**: Search across tags, equipment, documents, technical queries, and punchlist items
- **Relevance Ranking**: Results ranked by PostgreSQL's ts_rank function
- **Entity Type Filtering**: Optional filtering by specific entity type
- **Pagination**: Configurable page size with maximum 100 results per page
- **Highlighting**: Matching text highlighted in results
- **Project Scoped**: All searches are scoped to a specific project

## API Endpoints

### Search Entities

```
GET /api/projects/:projectId/search?q=<query>&entityType=<type>&page=<page>&limit=<limit>
```

**Query Parameters:**
- `q` (required): Search query string
- `entityType` (optional): Filter by entity type (tag, equipment, document, technical_query, punchlist_item)
- `page` (optional): Page number (1-based, default: 1)
- `limit` (optional): Results per page (1-100, default: 20)

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "entityType": "tag",
      "name": "TI-101",
      "description": "Temperature sensor for reactor inlet",
      "rank": 0.85,
      "highlight": "<mark>Temperature</mark> sensor for reactor inlet"
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

## Search Implementation

### Full-Text Search

The module uses PostgreSQL's full-text search capabilities:

1. **Text Vectorization**: Converts searchable text fields to tsvector
2. **Query Processing**: Converts search query to tsquery using plainto_tsquery
3. **Matching**: Uses @@ operator to match tsvector against tsquery
4. **Ranking**: Uses ts_rank to score relevance

### Searchable Fields

- **Tags**: name, description
- **Equipment**: name, description
- **Documents**: title, type
- **Technical Queries**: title, description
- **Punchlist Items**: description, closureCriteria

### Search Algorithm

1. Parse search query and pagination parameters
2. Determine which entity types to search (all or filtered)
3. Execute parallel searches across entity types
4. Combine and sort results by rank
5. Apply pagination
6. Return formatted results with highlighting

## Usage Examples

### Search All Entities

```typescript
GET /api/projects/123/search?q=temperature
```

### Search Specific Entity Type

```typescript
GET /api/projects/123/search?q=sensor&entityType=tag
```

### Paginated Search

```typescript
GET /api/projects/123/search?q=alarm&page=2&limit=50
```

## Requirements Validation

This module validates the following requirements:

- **Requirement 7.1**: Cross-entity search across tags, equipment, documents, TQs, and punchlist items
- **Requirement 7.2**: Results include entity type, name, and description
- **Requirement 7.3**: Support filtering by entity type
- **Requirement 7.4**: Highlight matching text in results
- **Requirement 7.5**: Navigate to entity detail from search results (frontend implementation)

## Performance Considerations

- **Index Requirements**: Full-text search requires tsvector indexes on searchable columns
- **Result Limits**: Each entity type search limited to 100 results to prevent performance issues
- **Parallel Execution**: Entity type searches execute in parallel for better performance
- **Ranking**: PostgreSQL's ts_rank provides efficient relevance scoring

## Future Enhancements

- Add tsvector columns to entities for better performance
- Implement search result caching
- Add fuzzy matching for typo tolerance
- Support advanced query syntax (AND, OR, NOT, phrases)
- Add search analytics and popular queries
- Implement search suggestions/autocomplete
