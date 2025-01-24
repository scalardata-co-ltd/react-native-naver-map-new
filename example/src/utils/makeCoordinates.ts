import type { StationInfo } from '../component/StationMarkers';

const bidList = [
  'EV',
  'LH',
  'PW',
  'CV',
  'PI',
  'LU',
  'NT',
  'RE',
  'KEP',
  'IN',
  'PC',
  'EC',
  'PL',
  'GS',
  'HW',
  'SF',
  'HM',
  'CU',
  'EZ',
  'HE',
  'HY',
  'JA',
  'KL',
  'ME',
  'TD',
  'ST',
  'SK',
  'JE',
  'MO',
]; // 중복되지 않은 bid 값들을 배열로 정리

function getRandomBid(): string {
  return bidList[Math.floor(Math.random() * bidList.length)] || '';
}

export function generateMockStationData(
  centerLatitude: number,
  centerLongitude: number,
  radius: number,
  count: number
): StationInfo[] {
  const mockData: StationInfo[] = [];

  for (let i = 0; i < count; i++) {
    const randomAngle = Math.random() * 2 * Math.PI;
    const randomRadius = Math.random() * radius;

    const latitudeOffset = (randomRadius * Math.cos(randomAngle)) / 111000; // 1 degree latitude ≈ 111km
    const longitudeOffset =
      (randomRadius * Math.sin(randomAngle)) /
      (111000 * Math.cos(centerLatitude * (Math.PI / 180)));

    mockData.push({
      category: Math.random() > 0.5 ? 'A' : 'B',
      bid: getRandomBid(),
      es_key: `ES-${Math.random().toString(36).substring(7).toUpperCase()}`,
      oem_code: Math.random() > 0.5 ? '4' : undefined,
      latitude: (centerLatitude + latitudeOffset).toFixed(6),
      longitude: (centerLongitude + longitudeOffset).toFixed(6),
      promotion: Math.random() > 0.5 ? 'Y' : 'N',
      use_type: Math.random() > 0.5 ? 'public' : 'private',
      charging_status: Math.random() > 0.5 ? 'Y' : 'N',
      cluster_cnt: Math.random() > 0.5 ? Math.floor(Math.random() * 10) : null,
      plug_types: Math.random() > 0.5 ? 'Type1, Type2' : null,
      charger_rapid_cnt:
        Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0,
      charger_slow_cnt: Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0,
      pnc_yn: Math.random() > 0.5 ? 'Y' : 'N',
    });
  }

  return mockData;
}
