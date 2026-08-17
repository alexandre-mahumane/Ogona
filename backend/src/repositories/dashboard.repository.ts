import { sql } from 'drizzle-orm';
import { db } from '../config/database';

export type HostDashboardSnapshot = {
  monthlyRevenue: number;
  previousRevenue: number;
  reservationsCount: number;
  pendingCount: number;
  roomsCount: number;
  availableRooms: number;
  activeProperties: number;
  checkInsToday: number;
  checkOutsToday: number;
};

function firstRow(result: unknown): Record<string, unknown> {
  if (Array.isArray(result) && result[0] && typeof result[0] === 'object') {
    return result[0] as Record<string, unknown>;
  }
  const rows = (result as { rows?: unknown[] } | null)?.rows;
  if (Array.isArray(rows) && rows[0] && typeof rows[0] === 'object') {
    return rows[0] as Record<string, unknown>;
  }
  return {};
}

function num(row: Record<string, unknown>, key: string): number {
  return Number(row[key] ?? 0);
}

export class DashboardRepository {
  async getHostSnapshot(
    hostId: string,
    range: { today: Date; monthStart: Date; nextMonthStart: Date; prevMonthStart: Date },
  ): Promise<HostDashboardSnapshot> {
    const result = await db.execute(sql`
      SELECT
        coalesce((
          SELECT sum(p.amount)
          FROM payments p
          INNER JOIN reservations r ON r.id = p.reservation_id
          WHERE r.host_id = ${hostId}
            AND p.status = 'paid'
            AND p.paid_at >= ${range.monthStart}
            AND p.paid_at < ${range.nextMonthStart}
        ), 0) AS monthly_revenue,
        coalesce((
          SELECT sum(p.amount)
          FROM payments p
          INNER JOIN reservations r ON r.id = p.reservation_id
          WHERE r.host_id = ${hostId}
            AND p.status = 'paid'
            AND p.paid_at >= ${range.prevMonthStart}
            AND p.paid_at < ${range.monthStart}
        ), 0) AS previous_revenue,
        (SELECT count(*)::int FROM reservations WHERE host_id = ${hostId}) AS reservations_count,
        (
          SELECT count(*)::int
          FROM reservations
          WHERE host_id = ${hostId} AND status = 'pending'
        ) AS pending_count,
        (
          SELECT count(*)::int
          FROM rooms rm
          INNER JOIN properties pr ON pr.id = rm.property_id
          WHERE pr.host_id = ${hostId}
        ) AS rooms_count,
        (
          SELECT count(*)::int
          FROM rooms rm
          INNER JOIN properties pr ON pr.id = rm.property_id
          WHERE pr.host_id = ${hostId} AND rm.status = 'disponivel'
        ) AS available_rooms,
        (
          SELECT count(*)::int
          FROM properties
          WHERE host_id = ${hostId} AND status = 'published'
        ) AS active_properties,
        (
          SELECT count(*)::int
          FROM reservations
          WHERE host_id = ${hostId}
            AND status = 'confirmed'
            AND check_in_date = ${range.today}
        ) AS check_ins_today,
        (
          SELECT count(*)::int
          FROM reservations
          WHERE host_id = ${hostId}
            AND status IN ('confirmed', 'completed')
            AND check_out_date = ${range.today}
        ) AS check_outs_today
    `);

    const row = firstRow(result);
    return {
      monthlyRevenue: num(row, 'monthly_revenue'),
      previousRevenue: num(row, 'previous_revenue'),
      reservationsCount: num(row, 'reservations_count'),
      pendingCount: num(row, 'pending_count'),
      roomsCount: num(row, 'rooms_count'),
      availableRooms: num(row, 'available_rooms'),
      activeProperties: num(row, 'active_properties'),
      checkInsToday: num(row, 'check_ins_today'),
      checkOutsToday: num(row, 'check_outs_today'),
    };
  }
}

export const dashboardRepository = new DashboardRepository();
