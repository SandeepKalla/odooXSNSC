import express from 'express';
import { PrismaClient, TripStatus } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const createTripSchema = z.object({
  name: z.string().min(1),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  budget: z.number().min(0).default(0),
});

const updateTripSchema = z.object({
  name: z.string().min(1).optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  budget: z.number().min(0).optional(),
  status: z.enum(['ONGOING', 'UPCOMING', 'COMPLETED']).optional(),
});

// Helper to determine trip status
const getTripStatus = (startDate: Date, endDate: Date): TripStatus => {
  const now = new Date();
  if (now < startDate) return TripStatus.UPCOMING;
  if (now > endDate) return TripStatus.COMPLETED;
  return TripStatus.ONGOING;
};

// POST /api/trips
router.post('/', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const data = createTripSchema.parse(req.body);
    
    if (data.endDate < data.startDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const status = getTripStatus(data.startDate, data.endDate);

    const trip = await prisma.trip.create({
      data: {
        ...data,
        userId: req.userId!,
        status,
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.status(201).json({ trip });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// GET /api/trips
router.get('/', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const { status } = req.query;

    const where: any = { userId: req.userId };
    if (status && ['ONGOING', 'UPCOMING', 'COMPLETED'].includes(status as string)) {
      where.status = status;
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            activities: {
              include: {
                activity: {
                  include: {
                    city: true,
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ trips });
  } catch (error) {
    next(error);
  }
});

// GET /api/trips/:id
router.get('/:id', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      include: {
        sections: {
          orderBy: { order: 'asc' },
          include: {
            activities: {
              include: {
                activity: {
                  include: {
                    city: true,
                  },
                },
              },
              orderBy: { order: 'asc' },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ trip });
  } catch (error) {
    next(error);
  }
});

// PUT /api/trips/:id
router.put('/:id', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const data = updateTripSchema.parse(req.body);
    
    const updateData: any = { ...data };
    if (data.startDate || data.endDate) {
      const startDate = data.startDate || trip.startDate;
      const endDate = data.endDate || trip.endDate;
      if (endDate < startDate) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }
      updateData.status = getTripStatus(startDate, endDate);
    }

    const updated = await prisma.trip.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        sections: {
          orderBy: { order: 'asc' },
        },
      },
    });

    res.json({ trip: updated });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// DELETE /api/trips/:id
router.delete('/:id', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    await prisma.trip.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

