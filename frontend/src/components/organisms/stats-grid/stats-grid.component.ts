import { client } from '@shared/utils/graphql';
import ChatTextIcon from 'phosphor-svelte/lib/ChatTextIcon';
import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
import TrashIcon from 'phosphor-svelte/lib/TrashIcon';
import HammerIcon from 'phosphor-svelte/lib/HammerIcon';
import BellIcon from 'phosphor-svelte/lib/BellIcon';

export interface CardData {
  title: string;
  value: number;
  icon: any;
  color: string;
}

export const DEFAULT_CARDS: CardData[] = [
  { title: 'Tweets', value: 0, icon: ChatTextIcon, color: 'blue' },
  { title: 'Pohon Tumbang', value: 0, icon: LeafIcon, color: 'green' },
  { title: 'Sampah', value: 0, icon: TrashIcon, color: 'yellow' },
  { title: 'Vandalisme', value: 0, icon: HammerIcon, color: 'red' },
  { title: 'Notifikasi', value: 0, icon: BellIcon, color: 'purple' },
];

const TWEETS_QUERY = `query { twitter_TwitterService_ListTweets(input: { page: 1, perPage: 1 }) { total } }`;
const NOTIFS_QUERY = `query { notification_NotificationService_ListNotifications(input: { page: 1, perPage: 1 }) { total } }`;

export async function fetchStatsFromGateway(): Promise<Partial<Record<string, number>>> {
  try {
    const [tweetRes, notifRes] = await Promise.all([
      client.query(TWEETS_QUERY).toPromise(),
      client.query(NOTIFS_QUERY).toPromise(),
    ]);
    return {
      tweets: tweetRes.data?.twitter_TwitterService_ListTweets?.total || 0,
      unreadNotifs: notifRes.data?.notification_NotificationService_ListNotifications?.total || 0,
    };
  } catch {
    return {};
  }
}
