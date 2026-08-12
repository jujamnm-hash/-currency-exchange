import type { ColorProfile } from "./vision";

export type SpatialNoteDTO = {
  id: string;
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  heading: number | null;
  imageHash: string;
  colorProfile: string;
  thumbnail: string | null;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
};

export type MatchedNote = SpatialNoteDTO & {
  score: number;
  distanceM: number;
  hashDist: number;
  colorDist: number;
  parsedColor?: ColorProfile;
};

export type CreateNoteInput = {
  title: string;
  content: string;
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  heading?: number | null;
  imageHash: string;
  colorProfile: ColorProfile;
  thumbnail?: string | null;
  deviceId: string;
};

export type MatchQuery = {
  latitude: number;
  longitude: number;
  heading?: number | null;
  imageHash: string;
  colorProfile: ColorProfile;
  deviceId?: string;
  radiusM?: number;
};
