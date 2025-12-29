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
    tagline: 'Rastrea 1 vehículo GRATIS para siempre',
    recommended: false,
    trialDays: 0,
    features: {
      maxDevices: 1,
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

      basicReports: false,
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
      savingsCalculator: false,

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
      currency: 'DOP', // Dominican Pesos
      volumeDiscounts: [],
    },
  },

  [SubscriptionPlan.BASICO]: {
    id: SubscriptionPlan.BASICO,
    name: 'Básico',
    description: 'Ideal para individuos, motos, un solo carro',
    tagline: 'Ubicación en tiempo real con historial de 7 días',
    recommended: false,
    trialDays: 30,
    features: {
      maxDevices: 1,
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

      basicReports: false,
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
      savingsCalculator: false,

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
      monthlyPricePerDevice: 499,
      yearlyPricePerDevice: 4790, // 20% descuento (499 x 12 x 0.8)
      currency: 'DOP',
      stripePriceIdMonthly: 'price_basic_monthly_dop',
      stripePriceIdYearly: 'price_basic_yearly_dop',
      volumeDiscounts: [],
    },
  },

  [SubscriptionPlan.PROFESIONAL]: {
    id: SubscriptionPlan.PROFESIONAL,
    name: 'Profesional',
    description: 'Para negocios pequeños y flotas medianas',
    tagline: 'Geocercas ilimitadas, reportes, alertas avanzadas y WhatsApp',
    recommended: true,
    trialDays: 30,
    features: {
      maxDevices: 10,
      maxGeofences: 999999, // Ilimitado
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
      scheduledReports: true,

      driverManagement: false,
      tripManagement: true,
      fuelManagement: false,
      predictiveMaintenance: false,
      remoteControl: false,

      aiPredictions: false,
      routeOptimization: false,
      anomalyDetection: false,
      driverGamification: false,
      savingsCalculator: true,

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
      monthlyPricePerDevice: 899,
      yearlyPricePerDevice: 8630, // 20% descuento (899 x 12 x 0.8)
      currency: 'DOP',
      stripePriceIdMonthly: 'price_pro_monthly_dop',
      stripePriceIdYearly: 'price_pro_yearly_dop',
      volumeDiscounts: [
        { minDevices: 5, discountPercent: 11 }, // RD$799/dispositivo
        { minDevices: 10, discountPercent: 22 }, // RD$699/dispositivo
      ],
    },
  },

  [SubscriptionPlan.EMPRESARIAL]: {
    id: SubscriptionPlan.EMPRESARIAL,
    name: 'Empresa',
    description: 'Para flotas grandes y corporativos',
    tagline: 'Gestión completa de flota con reportes avanzados, API y control remoto',
    recommended: false,
    trialDays: 30,
    features: {
      maxDevices: 999999, // Ilimitado
      maxGeofences: 999999, // Ilimitado
      maxSharedUsers: 999999, // Ilimitado
      historyRetentionDays: 180,

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

      aiPredictions: true,
      routeOptimization: true,
      anomalyDetection: false,
      driverGamification: true,
      savingsCalculator: true,

      apiAccess: true,
      apiRequestsPerMonth: 10000,
      webhooks: true,
      thirdPartyIntegrations: true,

      supportLevel: 'priority',
      supportResponseTime: '< 12 horas',

      whiteLabel: false,
      multiTenant: false,
      dashcamCloud: false,
      dashcamStorageGB: 0,
    },
    pricing: {
      monthlyPricePerDevice: 1499,
      yearlyPricePerDevice: 14390, // 20% descuento (1499 x 12 x 0.8)
      currency: 'DOP',
      stripePriceIdMonthly: 'price_enterprise_monthly_dop',
      stripePriceIdYearly: 'price_enterprise_yearly_dop',
      volumeDiscounts: [
        { minDevices: 25, discountPercent: 10 }, // RD$1,349/dispositivo
        { minDevices: 50, discountPercent: 20 }, // RD$1,199/dispositivo
        { minDevices: 100, discountPercent: 33 }, // RD$999/dispositivo
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
