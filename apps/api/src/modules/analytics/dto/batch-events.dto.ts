import { IsArray, IsString, IsOptional, IsInt, MaxLength, ValidateNested, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

const ALLOWED_EVENT_TYPES = [
  'page_view',
  'product_view',
  'product_scroll',
  'product_section_view',
  'affiliate_click',
  'quiz_step_start',
  'quiz_step_complete',
  'quiz_abandon',
  'quiz_complete',
  'search_query',
  'filter_change',
  'favorite_add',
  'favorite_remove',
  'recommendation_click',
  'price_chart_interact',
];

export class EventDto {
  @IsString()
  @MaxLength(36)
  visitor_id: string;

  @IsOptional()
  @IsString()
  @MaxLength(12)
  session_id?: string;

  @IsString()
  @MaxLength(40)
  event_type: string;

  @IsOptional()
  @IsInt()
  product_id?: number;

  @IsOptional()
  @IsInt()
  brand_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  page_path?: string;

  @IsOptional()
  properties?: Record<string, any>;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  device_type?: string;
}

export class BatchEventsDto {
  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => EventDto)
  events: EventDto[];
}

export { ALLOWED_EVENT_TYPES };
