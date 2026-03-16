import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO de pagination générique — réutilisable par toutes les ressources.
 * Étendre cette classe pour ajouter des filtres spécifiques à une ressource.
 */
export class PaginationQueryDto {
    @ApiProperty({ example: 1, description: 'Page number (1-based)', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ example: 20, description: 'Items per page', required: false })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiProperty({ example: 'burger', description: 'Full-text search on the resource', required: false })
    @IsOptional()
    @IsString()
    search?: string;
}

/**
 * Enveloppe de réponse paginée générique.
 */
export class PaginatedResultDto<T> {
    @ApiProperty({ isArray: true })
    data: T[];

    @ApiProperty({ example: 100 })
    total: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 20 })
    limit: number;

    @ApiProperty({ example: 5 })
    totalPages: number;

    constructor(data: T[], total: number, page: number, limit: number) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.limit = limit;
        this.totalPages = Math.ceil(total / limit) || 1;
    }
}
