/**
 * @deprecated Import directly from './pagination.dto' instead.
 * This file is kept for backwards compatibility only.
 *
 * Offer-specific query DTO lives here; the generic building blocks
 * (`PaginationQueryDto`, `PaginatedResultDto`) live in `./pagination.dto`.
 */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto, PaginatedResultDto } from './pagination.dto';

// Re-export generics so existing imports keep working without changes.
export { PaginationQueryDto, PaginatedResultDto };

/**
 * Query DTO for the Offer resource.
 * Extends the generic pagination with offer-specific filters.
 */
export class OfferQueryDto extends PaginationQueryDto {
    @ApiProperty({ example: 'restaurant123', description: 'Filter by restaurant ID', required: false })
    @IsOptional()
    @IsString()
    restaurantId?: string;

    /**
     * true  → only isActive=true & not expired
     * false → only inactive or expired
     * absent → all
     */
    @ApiProperty({ example: true, description: 'Filter by active status (true=active only, false=inactive/expired)', required: false })
    @IsOptional()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return undefined;
    })
    @IsBoolean()
    activeOnly?: boolean;
}
