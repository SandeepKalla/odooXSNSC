import express from 'express';
import { PrismaClient, ActivityType } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/search/cities
router.get('/cities', async (req, res, next) => {
  try {
    const { query, country } = req.query;

    const where: any = {};

    if (query) {
      where.OR = [
        { name: { contains: query as string, mode: 'insensitive' } },
        { country: { contains: query as string, mode: 'insensitive' } },
      ];
    }

    if (country) {
      where.country = { contains: country as string, mode: 'insensitive' };
    }

    const cities = await prisma.city.findMany({
      where,
      orderBy: [
        { popularityScore: 'desc' },
        { name: 'asc' },
      ],
      take: 50,
    });

    res.json({ cities });
  } catch (error) {
    next(error);
  }
});

// GET /api/search/activities
router.get('/activities', async (req, res, next) => {
  try {
    const { query, type, cityId, maxCost } = req.query;

    const where: any = {};

    if (query) {
      where.OR = [
        { name: { contains: query as string, mode: 'insensitive' } },
        { description: { contains: query as string, mode: 'insensitive' } },
      ];
    }

    if (type && Object.values(ActivityType).includes(type as ActivityType)) {
      where.type = type as ActivityType;
    }

    if (cityId) {
      where.cityId = cityId as string;
    }

    if (maxCost) {
      where.cost = { lte: parseFloat(maxCost as string) };
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        city: true,
      },
      orderBy: [
        { cost: 'asc' },
        { name: 'asc' },
      ],
      take: 100,
    });

    res.json({ activities });
  } catch (error) {
    next(error);
  }
});

export default router;

