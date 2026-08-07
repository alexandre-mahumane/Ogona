import { propertyRepository } from '../repositories/property.repository';
import { reservationRepository } from '../repositories/reservation.repository';
import { toPublicReservation } from '../repositories/reservation.mappers';
import { activityService } from './activity.service';
import { addDays, startOfMonth, todayUtc } from '../utils/dates';

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

    const [
      monthlyRevenue,
      previousRevenue,
      reservationsCount,
      pendingCount,
      roomsCount,
      availableRooms,
      activeProperties,
      activities,
      pendingRows,
      confirmedAroundToday,
    ] = await Promise.all([
      reservationRepository.paidRevenueBetween(hostId, monthStart, nextMonthStart),
      reservationRepository.paidRevenueBetween(hostId, prevMonthStart, monthStart),
      reservationRepository.countByHost(hostId),
      reservationRepository.countPendingByHost(hostId),
      propertyRepository.countRoomsByHost(hostId),
      propertyRepository.countAvailableRooms(hostId),
      propertyRepository.countByHost(hostId, 'published'),
      activityService.listForHost(hostId, 10),
      reservationRepository.listPendingForHost(hostId, 5),
      reservationRepository.listConfirmedInRange(
        hostId,
        addDays(now, -1),
        addDays(now, 1),
      ),
    ]);

    const revenueTrend =
      previousRevenue === 0
        ? monthlyRevenue > 0
          ? 100
          : 0
        : Number((((monthlyRevenue - previousRevenue) / previousRevenue) * 100).toFixed(1));

    const occupancyRate =
      roomsCount === 0 ? 0 : Number(((1 - availableRooms / roomsCount) * 100).toFixed(0));

    const checkInsToday = confirmedAroundToday.filter((r) => {
      const d =
        r.checkInDate instanceof Date ? r.checkInDate : new Date(r.checkInDate);
      return d.getTime() === now.getTime() && r.status === 'confirmed';
    }).length;

    const checkOutsToday = confirmedAroundToday.filter((r) => {
      const d =
        r.checkOutDate instanceof Date ? r.checkOutDate : new Date(r.checkOutDate);
      return d.getTime() === now.getTime() && ['confirmed', 'completed'].includes(r.status);
    }).length;

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
        monthlyRevenue,
        revenueTrendPercent: revenueTrend,
        reservations: reservationsCount,
        pendingReservations: pendingCount,
        rooms: roomsCount,
        availableRooms,
        occupancyRate,
        occupancyTrendPercent: 0,
      },
      quickStats: {
        activeProperties,
        checkInsToday,
        checkOutsToday,
      },
      pendingRequests,
      recentActivity: activities,
    };
  }
}

export const dashboardService = new DashboardService();
