import Supercluster from 'supercluster';

export type PointProperties = {
  id: string;
  category?: string;
};

export type GeoPoint = {
  type: 'Feature';
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: PointProperties;
};

export type ClusterOrPoint = GeoPoint | {
  type: 'Feature';
  id: number;
  geometry: { type: 'Point'; coordinates: [number, number] };
  properties: { cluster: true; point_count: number; point_count_abbreviated: number };
};

export function createCluster(points: GeoPoint[], radius = 60, maxZoom = 16) {
  const index = new Supercluster<PointProperties>({ radius, maxZoom });
  index.load(points);
  return index;
}
