import { supabase } from '../supabase';

export const analyticsService = {
  async trackEvent(event: {
    event_type: string;
    user_id?: string;
    track_id?: string;
    artist_id?: string;
    metadata?: Record<string, unknown>;
  }) {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: event.event_type,
        user_id: event.user_id,
        track_id: event.track_id,
        artist_id: event.artist_id,
        metadata: event.metadata || {},
      });
    if (error) console.error('Failed to track event:', error);
  },

  async getEventCount(eventType: string, since?: Date): Promise<number> {
    let query = supabase
      .from('analytics_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', eventType);

    if (since) {
      query = query.gte('created_at', since.toISOString());
    }

    const { count, error } = await query;
    if (error) throw error;
    return count || 0;
  },
};
