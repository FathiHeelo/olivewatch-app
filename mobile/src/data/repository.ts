import { climateStressIndex } from './climate';

// Every record carries where it came from, so the UI can show the honest label.
export type Source = 'حقيقية' | 'تجريبية' | 'محاكاة';

export type PlotStatus = 'healthy' | 'needs_check';

export type Plot = {
  id: string;
  name: string;
  trees: number;
  status: PlotStatus;
  lastCheck: string; // ready-to-show Arabic text
  lastCheckDays: number;
  source: Source;
};

export type Farm = {
  id: string;
  name: string;
  areaDunum: number;
  trees: number;
  varieties: string;
};

export type Climate = {
  dT: number; // °C anomaly vs 2005–2024
  dP: number; // mm rainfall anomaly
  dryDays: number;
  csi: number;
  baseline: string;
  source: Source;
  provider: string;
};

export type HomeData = { farm: Farm; plots: Plot[]; climate: Climate };

// The data layer is behind one interface. Today it is the mock below; when the Firebase
// config arrives, add a Firestore implementation and switch getRepository().
export interface Repository {
  getHome(): Promise<HomeData>;
  getClimate(): Promise<Climate>;
}

const climate: Climate = {
  dT: 2,
  dP: -20,
  dryDays: 10,
  csi: climateStressIndex(2, -20, 10), // 46.7
  baseline: '2005–2024',
  source: 'محاكاة',
  provider: 'NASA POWER',
};

const mock: HomeData = {
  farm: {
    id: 'farm-east',
    name: 'الحقل الشرقي — نابلس',
    areaDunum: 24,
    trees: 420,
    varieties: 'رومي وزيتي',
  },
  plots: [
    { id: 'p1', name: 'قطعة الجبل الشمالي', trees: 140, status: 'healthy', lastCheck: 'منذ يومين', lastCheckDays: 2, source: 'تجريبية' },
    { id: 'p2', name: 'قطعة الوادي', trees: 160, status: 'needs_check', lastCheck: 'منذ 14 يوماً', lastCheckDays: 14, source: 'تجريبية' },
    { id: 'p3', name: 'قطعة السدرة', trees: 120, status: 'healthy', lastCheck: 'أمس', lastCheckDays: 1, source: 'تجريبية' },
  ],
  climate,
};

class MockRepository implements Repository {
  async getHome() {
    return mock;
  }
  async getClimate() {
    return climate;
  }
}

export function getRepository(): Repository {
  return new MockRepository();
}
