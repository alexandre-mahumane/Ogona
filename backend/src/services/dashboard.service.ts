import { dashboardRepository } from '../repositories/dashboard.repository';
import { reservationRepository } from '../repositories/reservation.repository';
import { toPublicReservation } from '../repositories/reservation.mappers';
import { activityService } from './activity.service';
import { startOfMonth, todayUtc } from '../utils/dates';

export class DashboardService {
  async getHostDashboard(hostId: string) {
    const now = todayUtc();
    const monthStart = startOfMonth(now.getUTCFullYear(), now.getUTCMonth() + 1);
    const nextMonthStart = startOfMonth(
      now.getUTCMonth() === 11 ? now.getUTCFullYear() + 1 : now.getUTCFullYear(),
      now.getUTCMonth() === 11 ? 1 : now.getUTCMonth() + 2,
    );
    const prevMonthStart = startOfMonth(
      now.getUTCMonth() === 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear(),
      now.getUTCMonth() === 0 ? 12 : now.getUTCMonth(),
    );

    const [snapshot, activities, pendingRows] = await Promise.all([
      dashboardRepository.getHostSnapshot(hostId, {
        today: now,
        monthStart,
        nextMonthStart,
        prevMonthStart,
      }),
      activityService.listForHost(hostId, 10),
      reservationRepository.listPendingForHost(hostId, 5),
    ]);

    const revenueTrend =
      snapshot.previousRevenue === 0
        ? snapshot.monthlyRevenue > 0
          ? 100
          : 0
        : Number(
            (
              ((snapshot.monthlyRevenue - snapshot.previousRevenue) /
                snapshot.previousRevenue) *
              100
            ).toFixed(1),
          );

    const occupancyRate =
      snapshot.roomsCount === 0
        ? 0
        : Number(
            ((1 - snapshot.availableRooms / snapshot.roomsCount) * 100).toFixed(0),
          );

    const pendingRequests = pendingRows.map((row) =>
      toPublicReservation({
        reservation: row.reservation,
        guestName: row.guestName,
        propertyName: row.propertyName,
        roomName: row.roomName,
        thumbnailUrl: row.coverImageUrl,
      }),
    );

    return {
      metrics: {
        monthlyRevenue: snapshot.monthlyRevenue,
        revenueTrendPercent: revenueTrend,
        reservations: snapshot.reservationsCount,
        pendingReservations: snapshot.pendingCount,
        rooms: snapshot.roomsCount,
        availableRooms: snapshot.availableRooms,
        occupancyRate,
        occupancyTrendPercent: 0,
      },
      quickStats: {
        activeProperties: snapshot.activeProperties,
        checkInsToday: snapshot.checkInsToday,
        checkOutsToday: snapshot.checkOutsToday,
      },
      pendingRequests,
      recentActivity: activities,
    };
  }
}

export const dashboardService = new DashboardService();
