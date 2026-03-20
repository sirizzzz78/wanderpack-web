import type { Trip } from '../db/models';
import { getTripDays } from '../db/hooks';

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;
  const result = await Notification.requestPermission();
  return result === 'granted';
}

export function checkAndNotify(trips: Trip[]) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const notifiedKey = 'readiLi.lastNotified';
  const lastNotified = localStorage.getItem(notifiedKey);
  const todayStr = today.toISOString().split('T')[0];

  // Only notify once per day per session
  if (lastNotified === todayStr) return;

  for (const trip of trips) {
    const start = new Date(trip.startDate);
    start.setHours(0, 0, 0, 0);
    const daysUntil = Math.round((start.getTime() - today.getTime()) / 86400000);
    const totalItems = getTripDays(trip.startDate, trip.endDate); // Just for count reference

    if (daysUntil === 3) {
      new Notification(`Trip to ${trip.destination} in 3 days`, {
        body: 'Time to start packing!',
        icon: '/readili-web/icons/icon-192.png',
      });
      localStorage.setItem(notifiedKey, todayStr);
    }

    if (daysUntil === 1) {
      new Notification(`Trip to ${trip.destination} is tomorrow!`, {
        body: "Don't forget to finish packing before you leave.",
        icon: '/readili-web/icons/icon-192.png',
      });
      localStorage.setItem(notifiedKey, todayStr);
    }
  }
}
