import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination.dto';

/**
 * Query DTO for the Restaurant resource.
 * Extends the generic pagination with restaurant-specific filters.
 */
export class RestaurantQueryDto extends PaginationQueryDto {
    @ApiProperty({ example: 'Chez Marcel', description: 'Filter by owner ID', required: false })
    @IsOptional()
    @IsString()
    ownerId?: string;
}
