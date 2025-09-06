const express = require('express');
const { urls, stats } = require('../data');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// ✅ Create Short URL
router.post('/shorturls', (req, res) => {
  const { url, validity, shortcode } = req.body;

  // Validate URL
  if (!url || !/^https?:\/\/.+/.test(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }

  let code = shortcode || uuidv4().slice(0, 6);
  if (urls[code]) {
    return res.status(409).json({ error: "Shortcode already exists" });
  }

  const validMinutes = validity && Number.isInteger(validity) ? validity : 30;
  const createdAt = new Date();
  const expiry = new Date(createdAt.getTime() + validMinutes * 60000);

  urls[code] = { originalUrl: url, createdAt, expiry };
  stats[code] = { totalClicks: 0, clicks: [] };

  return res.status(201).json({
    shortLink: `http://localhost:3000/${code}`,
    expiry: expiry.toISOString()
  });
});

// ✅ Redirect to original URL
router.get('/:code', (req, res) => {
  const { code } = req.params;
  const entry = urls[code];

  if (!entry) {
    return res.status(404).json({ error: "Shortcode not found" });
  }

  if (new Date() > entry.expiry) {
    return res.status(410).json({ error: "Short URL expired" });
  }

  // Track click
  const click = {
    timestamp: new Date().toISOString(),
    referrer: req.get('Referer') || "Direct",
    location: "India" // fake for now
  };
  stats[code].totalClicks++;
  stats[code].clicks.push(click);

  return res.redirect(entry.originalUrl);
});

// ✅ Get Stats
router.get('/shorturls/:code', (req, res) => {
  const { code } = req.params;
  const entry = urls[code];

  if (!entry) {
    return res.status(404).json({ error: "Shortcode not found" });
  }

  return res.json({
    url: entry.originalUrl,
    createdAt: entry.createdAt,
    expiry: entry.expiry,
    totalClicks: stats[code].totalClicks,
    clicks: stats[code].clicks
  });
});

module.exports = router;
