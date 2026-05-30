import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const analyticsService = {
  async trackEvent(event: {
    event_type: string;
    user_id?: string;
    track_id?: string;
    artist_id?: string;
    metadata?: Record<string, unknown>;
  }) {
    try {
      await addDoc(collection(db, 'analytics_events'), {
        ...event,
        metadata: event.metadata || {},
        created_at: Timestamp.now(),
      });
    } catch (err) {
      console.error('Failed to track event:', err);
    }
  },

  async getEventCount(eventType: string, since?: Date): Promise<number> {
    const ref = collection(db, 'analytics_events');
    const constraints = [where('event_type', '==', eventType)];
    if (since) {
      constraints.push(where('created_at', '>=', Timestamp.fromDate(since)));
    }
    const snap = await getDocs(query(ref, ...constraints));
    return snap.size;
  },
};
