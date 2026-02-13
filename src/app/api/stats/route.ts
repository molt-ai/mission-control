import { NextResponse } from 'next/server';
import { getStats, getRecentTasks } from '@/lib/data';

export async function GET() {
  const stats = await getStats();
  const recentTasks = await getRecentTasks(20);

  return NextResponse.json({
    stats,
    recentTasks,
  });
}
