import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, adminRequired, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/admin/stats
router.get('/stats', authRequired, adminRequired, async (req: AuthRequest, res, next) => {
  try {
    const [userCount, tripCount, cities, activities] = await Promise.all([
      prisma.user.count(),
      prisma.trip.count(),
      prisma.city.findMany({
        orderBy: { popularityScore: 'desc' },
        take: 10,
        select: {
          id: true,
          name: true,
          country: true,
          popularityScore: true,
        },
      }),
      prisma.activity.groupBy({
        by: ['type'],
        _count: {
          id: true,
        },
      }),
    ]);

    // Get top activities by usage (activities in sections)
    const topActivities = await prisma.sectionActivity.groupBy({
      by: ['activityId'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    const topActivityDetails = await Promise.all(
      topActivities.map(async (item) => {
        const activity = await prisma.activity.findUnique({
          where: { id: item.activityId },
          include: { city: true },
        });
        return {
          activity,
          usageCount: item._count.id,
        };
      })
    );

    // Get trip status distribution
    const tripStatusDistribution = await prisma.trip.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    // Get user registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        createdAt: true,
      },
    });

    // Group by day
    const userTrend = recentUsers.reduce((acc: any, user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    res.json({
      stats: {
        userCount,
        tripCount,
        topCities: cities,
        topActivities: topActivityDetails.filter(item => item.activity !== null),
        activityTypeDistribution: activities,
        tripStatusDistribution,
        userTrend: Object.entries(userTrend).map(([date, count]) => ({
          date,
          count,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

