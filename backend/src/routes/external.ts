import express from 'express';
import { authRequired, AuthRequest } from '../middleware/auth';
import {
  getCountryData,
  searchCityImages,
  getWeatherByCoordinates,
  getPlacesNearby,
  getPlaceDetails,
  getExchangeRates,
  geocodeCity,
  getCached,
  setCached,
} from '../services/externalApis';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/external/country/:countryName
router.get('/country/:countryName', async (req, res, next) => {
  try {
    const cacheKey = `country:${req.params.countryName}`;
    let countryData = getCached(cacheKey);

    if (!countryData) {
      countryData = await getCountryData(req.params.countryName);
      if (countryData) {
        setCached(cacheKey, countryData, 1000 * 60 * 60 * 24); // Cache for 24 hours
      }
    }

    if (!countryData) {
      return res.status(404).json({ error: 'Country not found' });
    }

    res.json({ country: countryData });
  } catch (error) {
    next(error);
  }
});

// GET /api/external/city/:cityId/images
router.get('/city/:cityId/images', async (req, res, next) => {
  try {
    const city = await prisma.city.findUnique({
      where: { id: req.params.cityId },
    });

    if (!city) {
      return res.status(404).json({ error: 'City not found' });
    }

    const cacheKey = `images:${city.name}:${city.country}`;
    let images = getCached(cacheKey);

    if (!images) {
      images = await searchCityImages(city.name, city.country);
      if (images) {
        setCached(cacheKey, images, 1000 * 60 * 60 * 24); // Cache for 24 hours
      }
    }

    res.json({ images: images || [] });
  } catch (error) {
    next(error);
  }
});

// GET /api/external/city/:cityId/weather
router.get('/city/:cityId/weather', async (req, res, next) => {
  try {
    const city = await prisma.city.findUnique({
      where: { id: req.params.cityId },
    });

    if (!city || !city.latitude || !city.longitude) {
      return res.status(404).json({ error: 'City not found or missing coordinates' });
    }

    const cacheKey = `weather:${city.id}`;
    let weather = getCached(cacheKey);

    if (!weather) {
      weather = await getWeatherByCoordinates(city.latitude, city.longitude);
      if (weather) {
        setCached(cacheKey, weather, 1000 * 60 * 30); // Cache for 30 minutes
      }
    }

    if (!weather) {
      return res.status(503).json({ error: 'Weather data unavailable' });
    }

    res.json({ weather });
  } catch (error) {
    next(error);
  }
});

// GET /api/external/city/:cityId/places
router.get('/city/:cityId/places', async (req, res, next) => {
  try {
    const city = await prisma.city.findUnique({
      where: { id: req.params.cityId },
    });

    if (!city || !city.latitude || !city.longitude) {
      return res.status(404).json({ error: 'City not found or missing coordinates' });
    }

    const kinds = req.query.kinds as string | undefined;
    const radius = parseInt(req.query.radius as string) || 5000;

    const cacheKey = `places:${city.id}:${kinds || 'all'}:${radius}`;
    let places = getCached(cacheKey);

    if (!places) {
      places = await getPlacesNearby(city.latitude, city.longitude, radius, kinds);
      if (places) {
        setCached(cacheKey, places, 1000 * 60 * 60 * 24); // Cache for 24 hours
      }
    }

    res.json({ places: places || [] });
  } catch (error) {
    next(error);
  }
});

// GET /api/external/place/:xid
router.get('/place/:xid', async (req, res, next) => {
  try {
    const cacheKey = `place:${req.params.xid}`;
    let placeDetails = getCached(cacheKey);

    if (!placeDetails) {
      placeDetails = await getPlaceDetails(req.params.xid);
      if (placeDetails) {
        setCached(cacheKey, placeDetails, 1000 * 60 * 60 * 24); // Cache for 24 hours
      }
    }

    if (!placeDetails) {
      return res.status(404).json({ error: 'Place not found' });
    }

    res.json({ place: placeDetails });
  } catch (error) {
    next(error);
  }
});

// GET /api/external/exchange-rates
router.get('/exchange-rates', async (req, res, next) => {
  try {
    const baseCurrency = (req.query.base as string) || 'USD';

    const cacheKey = `exchange:${baseCurrency}`;
    let rates = getCached(cacheKey);

    if (!rates) {
      rates = await getExchangeRates(baseCurrency);
      if (rates) {
        setCached(cacheKey, rates, 1000 * 60 * 60); // Cache for 1 hour
      }
    }

    if (!rates) {
      return res.status(503).json({ error: 'Exchange rates unavailable' });
    }

    res.json({ rates });
  } catch (error) {
    next(error);
  }
});

// POST /api/external/geocode
router.post('/geocode', async (req, res, next) => {
  try {
    const { cityName, country } = req.body;

    if (!cityName) {
      return res.status(400).json({ error: 'cityName is required' });
    }

    const cacheKey = `geocode:${cityName}:${country || ''}`;
    let result = getCached(cacheKey);

    if (!result) {
      result = await geocodeCity(cityName, country);
      if (result) {
        setCached(cacheKey, result, 1000 * 60 * 60 * 24 * 7); // Cache for 7 days
      }
    }

    if (!result) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ geocode: result });
  } catch (error) {
    next(error);
  }
});

export default router;

