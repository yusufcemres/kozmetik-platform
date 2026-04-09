export type AnalyticsEventType =
  | 'page_view'
  | 'product_view'
  | 'product_scroll'
  | 'product_section_view'
  | 'affiliate_click'
  | 'quiz_step_start'
  | 'quiz_step_complete'
  | 'quiz_abandon'
  | 'quiz_complete'
  | 'search_query'
  | 'filter_change'
  | 'favorite_add'
  | 'favorite_remove'
  | 'recommendation_click'
  | 'price_chart_interact';

export interface AnalyticsEventPayload {
  visitor_id: string;
  session_id: string;
  event_type: AnalyticsEventType;
  product_id?: number;
  brand_id?: number;
  page_path: string;
  properties?: Record<string, any>;
  device_type: string;
}
