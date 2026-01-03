import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';
import { inferSectionType } from '../services/sectionService';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const addActivitySchema = z.object({
  activityId: z.string(),
  scheduledDate: z.string().transform((str) => new Date(str)),
  scheduledTime: z.string().optional(),
  expense: z.number().min(0).default(0),
  order: z.number().default(0),
});

const updateActivitySchema = z.object({
  scheduledDate: z.string().transform((str) => new Date(str)).optional(),
  scheduledTime: z.string().optional(),
  expense: z.number().min(0).optional(),
  order: z.number().optional(),
});

// POST /api/sections/:sectionId/activities
router.post('/:sectionId/activities', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const section = await prisma.tripSection.findFirst({
      where: { id: req.params.sectionId },
      include: {
        trip: {
          select: { userId: true },
        },
      },
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    if (section.trip.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const data = addActivitySchema.parse(req.body);

    // Validate activity exists
    const activity = await prisma.activity.findUnique({
      where: { id: data.activityId },
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    // Validate scheduled date is within section date range
    if (data.scheduledDate < section.startDate || data.scheduledDate > section.endDate) {
      return res.status(400).json({ error: 'Scheduled date must be within section date range' });
    }

    // Create section activity
    const sectionActivity = await prisma.sectionActivity.create({
      data: {
        ...data,
        sectionId: section.id,
      },
      include: {
        activity: {
          include: {
            city: true,
          },
        },
      },
    });

    // Update section type based on activities
    const allActivities = await prisma.sectionActivity.findMany({
      where: { sectionId: section.id },
      include: { activity: true },
    });

    const sectionType = inferSectionType(allActivities.map(a => ({ type: a.activity.type })));

    await prisma.tripSection.update({
      where: { id: section.id },
      data: { sectionType },
    });

    res.status(201).json({ sectionActivity });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// PUT /api/sections/:sectionId/activities/:id
router.put('/:sectionId/activities/:id', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const sectionActivity = await prisma.sectionActivity.findFirst({
      where: { id: req.params.id },
      include: {
        section: {
          include: {
            trip: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!sectionActivity) {
      return res.status(404).json({ error: 'Section activity not found' });
    }

    if (sectionActivity.section.trip.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const data = updateActivitySchema.parse(req.body);

    const section = sectionActivity.section;
    const scheduledDate = data.scheduledDate || sectionActivity.scheduledDate;

    // Validate scheduled date is within section date range
    if (scheduledDate < section.startDate || scheduledDate > section.endDate) {
      return res.status(400).json({ error: 'Scheduled date must be within section date range' });
    }

    const updated = await prisma.sectionActivity.update({
      where: { id: sectionActivity.id },
      data: {
        ...data,
        scheduledDate,
      },
      include: {
        activity: {
          include: {
            city: true,
          },
        },
      },
    });

    res.json({ sectionActivity: updated });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// DELETE /api/sections/:sectionId/activities/:id
router.delete('/:sectionId/activities/:id', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const sectionActivity = await prisma.sectionActivity.findFirst({
      where: { id: req.params.id },
      include: {
        section: {
          include: {
            trip: {
              select: { userId: true },
            },
          },
        },
      },
    });

    if (!sectionActivity) {
      return res.status(404).json({ error: 'Section activity not found' });
    }

    if (sectionActivity.section.trip.userId !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await prisma.sectionActivity.delete({
      where: { id: sectionActivity.id },
    });

    // Update section type after removal
    const remainingActivities = await prisma.sectionActivity.findMany({
      where: { sectionId: sectionActivity.sectionId },
      include: { activity: true },
    });

    const sectionType = inferSectionType(remainingActivities.map(a => ({ type: a.activity.type })));

    await prisma.tripSection.update({
      where: { id: sectionActivity.sectionId },
      data: { sectionType },
    });

    res.json({ message: 'Activity removed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

