import { useSyncExternalStore } from 'react';
import { TraitSelection } from './traits';

/** Locally saved AI Influencer jobs (character sheets + motion briefs). */

export interface MotionSpec {
  mode: 'Motion transfer' | 'Objects swap';
  style: string;
  model: string;
  quality: string;
  videoSeconds?: number;
  imageCount: number;
  text: string;
}

export interface InfluencerJob {
  id: string;
  kind: 'character' | 'motion';
  createdAt: string; // ISO
  prompt: string;
  traits?: TraitSelection;
  hasPhoto?: boolean;
  presetId?: string; // preset character used as identity base
  motion?: MotionSpec;
  image?: string; // set once a generated image exists
  parentId?: string; // character the motion was built from
}

const KEY = 'influencer_history_v1';

function load(): InfluencerJob[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

let jobs = load();
const listeners = new Set<() => void>();
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(jobs.slice(0, 200)));
  } catch {
    // storage full or unavailable
  }
  listeners.forEach((l) => l());
};

export function addJob(job: Omit<InfluencerJob, 'id' | 'createdAt'>): InfluencerJob {
  const full: InfluencerJob = {
    ...job,
    id: `job_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  jobs = [full, ...jobs];
  save();
  return full;
}

export function deleteJob(id: string) {
  jobs = jobs.filter((j) => j.id !== id);
  save();
}

export function useJobs(): InfluencerJob[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => jobs
  );
}
