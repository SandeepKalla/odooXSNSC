import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';
import { shiftDates } from '../services/TripService';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/public/trips/:id/publish
router.post('/trips/:id/publish', authRequired, async (req: AuthRequest, res, next) => {
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

    // Generate unique slug
    const slug = `${trip.name.toLowerCase().replace(/\s+/g, '-')}-${trip.id.slice(0, 8)}`;

    const publicShare = await prisma.publicShare.upsert({
      where: { tripId: trip.id },
      update: {
        isPublic: true,
        slug,
      },
      create: {
        tripId: trip.id,
        slug,
        isPublic: true,
      },
    });

    res.json({ publicShare });
  } catch (error) {
    next(error);
  }
});

// GET /api/public/trips
router.get('/trips', async (req, res, next) => {
  try {
    const { query, limit = '20' } = req.query;

    const where: any = {
      isPublic: true,
    };

    const trips = await prisma.publicShare.findMany({
      where,
      include: {
        trip: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
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
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit as string, 10),
    });

    res.json({ trips: trips.map(t => t.trip) });
  } catch (error) {
    next(error);
  }
});

// GET /api/public/trips/:slug
router.get('/trips/:slug', async (req, res, next) => {
  try {
    const publicShare = await prisma.publicShare.findUnique({
      where: { slug: req.params.slug },
      include: {
        trip: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
              },
            },
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
        },
      },
    });

    if (!publicShare || !publicShare.isPublic) {
      return res.status(404).json({ error: 'Public trip not found' });
    }

    res.json({ trip: publicShare.trip });
  } catch (error) {
    next(error);
  }
});

// POST /api/public/trips/:slug/copy
router.post('/trips/:slug/copy', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const publicShare = await prisma.publicShare.findUnique({
      where: { slug: req.params.slug },
      include: {
        trip: {
          include: {
            sections: {
              include: {
                activities: {
                  include: {
                    activity: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!publicShare || !publicShare.isPublic) {
      return res.status(404).json({ error: 'Public trip not found' });
    }

    const originalTrip = publicShare.trip;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Shift trip dates relative to today
    const { newStart, newEnd } = shiftDates(originalTrip.startDate, originalTrip.endDate, today);

    // Create new trip
    const newTrip = await prisma.trip.create({
      data: {
        userId: req.userId!,
        name: `${originalTrip.name} (Copy)`,
        startDate: newStart,
        endDate: newEnd,
        budget: originalTrip.budget,
        status: 'UPCOMING',
      },
    });

    // Copy sections with shifted dates
    for (const section of originalTrip.sections) {
      const sectionDuration = section.endDate.getTime() - section.startDate.getTime();
      const sectionStartOffset = section.startDate.getTime() - originalTrip.startDate.getTime();
      
      const newSectionStart = new Date(newStart.getTime() + sectionStartOffset);
      const newSectionEnd = new Date(newSectionStart.getTime() + sectionDuration);

      const newSection = await prisma.tripSection.create({
        data: {
          tripId: newTrip.id,
          title: section.title,
          notes: section.notes,
          startDate: newSectionStart,
          endDate: newSectionEnd,
          budget: section.budget,
          sectionType: section.sectionType,
          order: section.order,
          hasOverlapWarning: section.hasOverlapWarning,
        },
      });

      // Copy activities with shifted dates
      for (const sectionActivity of section.activities) {
        const activityOffset = sectionActivity.scheduledDate.getTime() - originalTrip.startDate.getTime();
        const newScheduledDate = new Date(newStart.getTime() + activityOffset);

        await prisma.sectionActivity.create({
          data: {
            sectionId: newSection.id,
            activityId: sectionActivity.activityId,
            scheduledDate: newScheduledDate,
            scheduledTime: sectionActivity.scheduledTime,
            expense: sectionActivity.expense,
            order: sectionActivity.order,
          },
        });
      }
    }

    const createdTrip = await prisma.trip.findUnique({
      where: { id: newTrip.id },
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
            },
          },
        },
      },
    });

    res.status(201).json({ trip: createdTrip });
  } catch (error) {
    next(error);
  }
});

export default router;

