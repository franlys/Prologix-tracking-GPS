import { SubscriptionPlan } from '../entities/subscription.entity';

export interface PlanFeatures {
  maxDevices: number;
  maxGeofences: number;
  maxSharedUsers: number;
  historyRetentionDays: number;

  // Notificaciones
  emailNotifications: boolean;
  pushNotifications: boolean;
  whatsappNotifications: boolean;
  smsNotifications: boolean;

  // Alertas
  basicAlerts: boolean;
  advancedAlerts: boolean;
  sosButton: boolean;
  nightMode: boolean;

  // Reportes
  basicReports: boolean;
  advancedReports: boolean;
  whiteLabelReports: boolean;
  scheduledReports: boolean;

  // Funciones premium
  driverManagement: boolean;
  tripManagement: boolean;
  fuelManagement: boolean;
  predictiveMaintenance: boolean;
  remoteControl: boolean;

  // IA y Analytics
  aiPredictions: boolean;
  routeOptimization: boolean;
  anomalyDetection: boolean;
  driverGamification: boolean;
  savingsCalculator: boolean;

  // Integraciones
  apiAccess: boolean;
  apiRequestsPerMonth: number;
  webhooks: boolean;
  thirdPartyIntegrations: boolean;

  // Soporte
  supportLevel: 'email' | 'priority' | 'dedicated';
  supportResponseTime: string;

  // Adicionales
  whiteLabel: boolean;
  multiTenant: boolean;
  dashcamCloud: boolean;
  dashcamStorageGB: number;
}

export interface PlanPricing {
  monthlyPricePerDevice: number; // Precio por dispositivo al mes
  yearlyPricePerDevice: number; // Precio por dispositivo al año (con descuento)
  currency: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;

  // Descuentos por volumen (dispositivos)
  volumeDiscounts: {
    minDevices: number;
    discountPercent: number;
  }[];
}

export interface Plan {
  id: SubscriptionPlan;
  name: string;
  description: string;
  tagline: string;
  features: PlanFeatures;
  pricing: PlanPricing;
  recommended: boolean;
  trialDays: number;
}

export const PLANS: Record<SubscriptionPlan, Plan> = {
  [SubscriptionPlan.FREE]: {
    id: SubscriptionPlan.FREE,
    name: 'Gratuito',
    description: 'Para usuarios individuales que quieren probar el servicio',
    tagline: 'Rastrea 3 vehículos GRATIS para siempre',
    recommended: false,
    trialDays: 0,
    features: {
      maxDevices: 3,
      maxGeofences: 5,
      maxSharedUsers: 1,
      historyRetentionDays: 7,

      emailNotifications: true,
      pushNotifications: true,
      whatsappNotifications: false,
      smsNotifications: false,

      basicAlerts: true,
      advancedAlerts: false,
      sosButton: false,
      nightMode: false,

      basicReports: true,
      advancedReports: false,
      whiteLabelReports: false,
      scheduledReports: false,

      driverManagement: false,
      tripManagement: false,
      fuelManagement: false,
      predictiveMaintenance: false,
      remoteControl: false,

      aiPredictions: false,
      routeOptimization: false,
      anomalyDetection: false,
      driverGamification: false,
      savingsCalculator: true, // Básico

      apiAccess: false,
      apiRequestsPerMonth: 0,
      webhooks: false,
      thirdPartyIntegrations: false,

      supportLevel: 'email',
      supportResponseTime: '48-72 horas',

      whiteLabel: false,
      multiTenant: false,
      dashcamCloud: false,
      dashcamStorageGB: 0,
    },
    pricing: {
      monthlyPricePerDevice: 0,
      yearlyPricePerDevice: 0,
      currency: 'MXN',
      volumeDiscounts: [],
    },
  },

  [SubscriptionPlan.BASICO]: {
    id: SubscriptionPlan.BASICO,
    name: 'Básico',
    description: 'Ideal para familias y pequeños negocios',
    tagline: 'Por el precio de un café, rastrea 10 vehículos con WhatsApp incluido',
    recommended: true,
    trialDays: 30,
    features: {
      maxDevices: 10,
      maxGeofences: 20,
      maxSharedUsers: 5,
      historyRetentionDays: 30,

      emailNotifications: true,
      pushNotifications: true,
      whatsappNotifications: true,
      smsNotifications: false,

      basicAlerts: true,
      advancedAlerts: true,
      sosButton: true,
      nightMode: true,

      basicReports: true,
      advancedReports: false,
      whiteLabelReports: false,
      scheduledReports: true, // Email diario/semanal

      driverManagement: false,
      tripManagement: false,
      fuelManagement: false,
      predictiveMaintenance: false,
      remoteControl: false,

      aiPredictions: false,
      routeOptimization: false,
      anomalyDetection: false,
      driverGamification: false,
      savingsCalculator: true, // Completo

      apiAccess: false,
      apiRequestsPerMonth: 0,
      webhooks: false,
      thirdPartyIntegrations: false,

      supportLevel: 'priority',
      supportResponseTime: '< 24 horas',

      whiteLabel: false,
      multiTenant: false,
      dashcamCloud: false,
      dashcamStorageGB: 0,
    },
    pricing: {
      monthlyPricePerDevice: 2.99,
      yearlyPricePerDevice: 29.90, // ~2 meses gratis
      currency: 'MXN',
      stripePriceIdMonthly: 'price_basic_monthly', // Configurar en Stripe
      stripePriceIdYearly: 'price_basic_yearly',
      volumeDiscounts: [],
    },
  },

  [SubscriptionPlan.PROFESIONAL]: {
    id: SubscriptionPlan.PROFESIONAL,
    name: 'Profesional',
    description: 'Para empresas con flotas medianas',
    tagline: 'Todo lo que necesitas para gestionar tu flota: viajes, conductores, mantenimiento y control remoto',
    recommended: false,
    trialDays: 30,
    features: {
      maxDevices: 50,
      maxGeofences: 999999, // Ilimitado
      maxSharedUsers: 20,
      historyRetentionDays: 90,

      emailNotifications: true,
      pushNotifications: true,
      whatsappNotifications: true,
      smsNotifications: true,

      basicAlerts: true,
      advancedAlerts: true,
      sosButton: true,
      nightMode: true,

      basicReports: true,
      advancedReports: true,
      whiteLabelReports: false,
      scheduledReports: true,

      driverManagement: true,
      tripManagement: true,
      fuelManagement: true,
      predictiveMaintenance: true,
      remoteControl: true,

      aiPredictions: true, // Básico
      routeOptimization: true,
      anomalyDetection: false,
      driverGamification: true,
      savingsCalculator: true,

      apiAccess: true,
      apiRequestsPerMonth: 10000,
      webhooks: true,
      thirdPartyIntegrations: true, // Google, Zapier

      supportLevel: 'priority',
      supportResponseTime: '< 12 horas',

      whiteLabel: false,
      multiTenant: false,
      dashcamCloud: false,
      dashcamStorageGB: 0,
    },
    pricing: {
      monthlyPricePerDevice: 4.99,
      yearlyPricePerDevice: 49.90, // ~2 meses gratis
      currency: 'MXN',
      stripePriceIdMonthly: 'price_pro_monthly',
      stripePriceIdYearly: 'price_pro_yearly',
      volumeDiscounts: [
        { minDevices: 25, discountPercent: 10 }, // $4.49/dispositivo
        { minDevices: 50, discountPercent: 15 }, // $4.24/dispositivo
        { minDevices: 100, discountPercent: 20 }, // $3.99/dispositivo
        { minDevices: 200, discountPercent: 25 }, // $3.74/dispositivo
      ],
    },
  },

  [SubscriptionPlan.EMPRESARIAL]: {
    id: SubscriptionPlan.EMPRESARIAL,
    name: 'Empresarial',
    description: 'Para grandes flotas y corporativos',
    tagline: 'Plataforma white-label con IA, API ilimitada y soporte dedicado',
    recommended: false,
    trialDays: 30,
    features: {
      maxDevices: 999999, // Ilimitado
      maxGeofences: 999999, // Ilimitado
      maxSharedUsers: 999999, // Ilimitado
      historyRetentionDays: 999999, // Ilimitado

      emailNotifications: true,
      pushNotifications: true,
      whatsappNotifications: true,
      smsNotifications: true,

      basicAlerts: true,
      advancedAlerts: true,
      sosButton: true,
      nightMode: true,

      basicReports: true,
      advancedReports: true,
      whiteLabelReports: true,
      scheduledReports: true,

      driverManagement: true,
      tripManagement: true,
      fuelManagement: true,
      predictiveMaintenance: true,
      remoteControl: true,

      aiPredictions: true, // Avanzado
      routeOptimization: true,
      anomalyDetection: true,
      driverGamification: true,
      savingsCalculator: true,

      apiAccess: true,
      apiRequestsPerMonth: 999999, // Ilimitado
      webhooks: true,
      thirdPartyIntegrations: true, // Todas las integraciones

      supportLevel: 'dedicated',
      supportResponseTime: '< 4 horas',

      whiteLabel: true,
      multiTenant: true,
      dashcamCloud: true,
      dashcamStorageGB: 100,
    },
    pricing: {
      monthlyPricePerDevice: 7.99,
      yearlyPricePerDevice: 79.90, // ~2 meses gratis
      currency: 'MXN',
      stripePriceIdMonthly: 'price_enterprise_monthly',
      stripePriceIdYearly: 'price_enterprise_yearly',
      volumeDiscounts: [
        { minDevices: 25, discountPercent: 10 },
        { minDevices: 50, discountPercent: 15 },
        { minDevices: 100, discountPercent: 20 },
        { minDevices: 200, discountPercent: 25 },
        { minDevices: 500, discountPercent: 30 }, // Custom pricing
      ],
    },
  },
};

// Helper function para obtener configuración de un plan
export function getPlanConfig(plan: SubscriptionPlan): Plan {
  return PLANS[plan];
}

// Helper function para calcular precio con descuentos por volumen
export function calculatePriceWithVolume(
  plan: SubscriptionPlan,
  deviceCount: number,
  billingPeriod: 'monthly' | 'yearly'
): number {
  const planConfig = PLANS[plan];
  const basePrice = billingPeriod === 'monthly'
    ? planConfig.pricing.monthlyPricePerDevice
    : planConfig.pricing.yearlyPricePerDevice;

  // Encontrar el descuento aplicable
  const applicableDiscount = planConfig.pricing.volumeDiscounts
    .filter(d => deviceCount >= d.minDevices)
    .sort((a, b) => b.discountPercent - a.discountPercent)[0];

  if (applicableDiscount) {
    const discountedPrice = basePrice * (1 - applicableDiscount.discountPercent / 100);
    return discountedPrice * deviceCount;
  }

  return basePrice * deviceCount;
}

// Helper function para verificar si una característica está disponible
export function isFeatureAvailable(plan: SubscriptionPlan, feature: keyof PlanFeatures): boolean {
  return PLANS[plan].features[feature] as boolean;
}
