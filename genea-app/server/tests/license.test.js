const request = require('supertest');
const express = require('express');
const licenseController = require('../src/controllers/license.controller');

const app = express();
app.use(express.json());

// Mock routes
app.get('/license/info', licenseController.getLicenseInfo);
app.post('/license/request', licenseController.requestLicense);
app.post('/license/activate', licenseController.activateLicense);

describe('License Controller', () => {
  test('GET /license/info should return license information', async () => {
    const response = await request(app)
      .get('/license/info')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('contact');
    expect(response.body.data).toHaveProperty('freeFamilies');
    expect(response.body.data).toHaveProperty('pricing');
    expect(response.body.data.pricing).toHaveProperty('trial');
    expect(response.body.data.pricing).toHaveProperty('annual');
    expect(response.body.data.pricing.annual.price).toBe('$30 USD');
  });

  test('License info should include free families', async () => {
    const response = await request(app)
      .get('/license/info')
      .expect(200);

    const freeFamilies = response.body.data.freeFamilies;
    expect(freeFamilies).toContain('Díaz');
    expect(freeFamilies).toContain('Saavedra');
    expect(freeFamilies).toContain('Barbará');
    expect(freeFamilies).toContain('Díaz Saavedra');
  });

  test('License info should include payment information', async () => {
    const response = await request(app)
      .get('/license/info')
      .expect(200);

    expect(response.body.data).toHaveProperty('paymentInfo');
    expect(response.body.data.paymentInfo).toHaveProperty('mercadoPago');
    expect(response.body.data.paymentInfo.mercadoPago.account).toBe('gadiazsaavedra@gmail.com');
  });
});

describe('License Middleware Functions', () => {
  const { checkLicense, isFreeFamilyName } = require('../src/middleware/license.middleware');

  test('isFreeFamilyName should identify free families correctly', () => {
    expect(isFreeFamilyName('Díaz')).toBe(true);
    expect(isFreeFamilyName('Saavedra')).toBe(true);
    expect(isFreeFamilyName('Díaz Saavedra')).toBe(true);
    expect(isFreeFamilyName('García')).toBe(false);
    expect(isFreeFamilyName('López')).toBe(false);
  });

  test('isFreeFamilyName should be case insensitive', () => {
    expect(isFreeFamilyName('díaz')).toBe(true);
    expect(isFreeFamilyName('SAAVEDRA')).toBe(true);
    expect(isFreeFamilyName('Díaz saavedra')).toBe(true);
  });
});