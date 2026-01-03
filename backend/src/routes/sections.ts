import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authRequired, AuthRequest } from '../middleware/auth';
import { inferSectionType, detectOverlaps, validateSectionDates } from '../services/sectionService';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const createSectionSchema = z.object({
  title: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  budget: z.number().min(0).default(0),
  order: z.number().default(0),
});

const updateSectionSchema = z.object({
  title: z.string().optional(),
  notes: z.string().optional(),
  startDate: z.string().transform((str) => new Date(str)).optional(),
  endDate: z.string().transform((str) => new Date(str)).optional(),
  budget: z.number().min(0).optional(),
  order: z.number().optional(),
});

// POST /api/trips/:tripId/sections
router.post('/:tripId/sections', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: req.params.tripId,
        userId: req.userId,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const data = createSectionSchema.parse(req.body);

    // Validate section dates within trip dates
    const validation = validateSectionDates(data.startDate, data.endDate, trip.startDate, trip.endDate);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Get existing sections to check for overlaps
    const existingSections = await prisma.tripSection.findMany({
      where: { tripId: trip.id },
    });

    const allSections = [
      ...existingSections.map(s => ({ id: s.id, startDate: s.startDate, endDate: s.endDate })),
      { startDate: data.startDate, endDate: data.endDate },
    ];

    const overlapMap = detectOverlaps(allSections);
    const hasOverlapWarning = overlapMap.size > 0;

    // Infer section type (will be BUFFER initially, updated when activities are added)
    const section = await prisma.tripSection.create({
      data: {
        ...data,
        tripId: trip.id,
        hasOverlapWarning,
      },
      include: {
        activities: {
          include: {
            activity: true,
          },
        },
      },
    });

    res.status(201).json({ section });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// PUT /api/trips/:tripId/sections/:sectionId
router.put('/:tripId/sections/:sectionId', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: req.params.tripId,
        userId: req.userId,
      },
      include: {
        sections: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const section = trip.sections.find(s => s.id === req.params.sectionId);
    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    const data = updateSectionSchema.parse(req.body);

    const startDate = data.startDate || section.startDate;
    const endDate = data.endDate || section.endDate;

    // Validate section dates
    const validation = validateSectionDates(startDate, endDate, trip.startDate, trip.endDate);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Check for overlaps with other sections
    const otherSections = trip.sections
      .filter(s => s.id !== section.id)
      .map(s => ({ id: s.id, startDate: s.startDate, endDate: s.endDate }));

    const allSections = [
      ...otherSections,
      { id: section.id, startDate, endDate },
    ];

    const overlapMap = detectOverlaps(allSections);
    const hasOverlapWarning = overlapMap.has(section.id);

    // Get activities to infer type
    const activities = await prisma.sectionActivity.findMany({
      where: { sectionId: section.id },
      include: { activity: true },
    });

    const sectionType = inferSectionType(activities.map(a => ({ type: a.activity.type })));

    const updated = await prisma.tripSection.update({
      where: { id: section.id },
      data: {
        ...data,
        startDate,
        endDate,
        hasOverlapWarning,
        sectionType,
      },
      include: {
        activities: {
          include: {
            activity: true,
          },
        },
      },
    });

    res.json({ section: updated });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors });
    }
    next(error);
  }
});

// DELETE /api/trips/:tripId/sections/:sectionId
router.delete('/:tripId/sections/:sectionId', authRequired, async (req: AuthRequest, res, next) => {
  try {
    const trip = await prisma.trip.findFirst({
      where: {
        id: req.params.tripId,
        userId: req.userId,
      },
    });

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const section = await prisma.tripSection.findFirst({
      where: {
        id: req.params.sectionId,
        tripId: trip.id,
      },
    });

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    await prisma.tripSection.delete({
      where: { id: section.id },
    });

    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;

