import { Point } from "../utils";
import { dayjs } from "element-plus";

export interface TimeTrackSourceItem {
  name: string;
  track: {
    time: string;
    point: Point;
  }[];
}

interface TrackSourceItem {
  name: string;
  startTime: number;
  endTime: number;
  track: {
    time: string;
    timeStamp: number;
    point: Point;
  }[];
}

const getTimeRange = (list: { startTime: number; endTime: number }[]) => {
  let startTime = Infinity;
  let endTime = -Infinity;

  (list || []).forEach((i) => {
    startTime = Math.min(startTime, i.startTime);
    endTime = Math.max(endTime, i.endTime);
  });

  return { startTime, endTime };
};

const formatTimeTrack = (item: TimeTrackSourceItem): TrackSourceItem => {
  let startTime = Infinity;
  let endTime = -Infinity;
  const { name, track } = item;
  const newTrack: TrackSourceItem["track"] = [];

  for (let i = 0; i < track.length; i++) {
    const item = track[i];
    const timeStamp = dayjs(item.time).valueOf();
    newTrack.push({
      ...item,
      timeStamp,
    });
  }

  if (track.length) {
    startTime = newTrack[0].timeStamp;
    endTime = newTrack[newTrack.length - 1].timeStamp;
  }

  return {
    name,
    startTime,
    endTime,
    track: newTrack,
  };
};

interface RenderEvent {
  frameState?: {
    time: number;
  };
}

export class MulitTimeTrack {
  private source: TrackSourceItem[];

  private runtime: {
    speed: number;
    during: number;
    timeRange: { startTime: number; endTime: number };
  };

  constructor(source: TimeTrackSourceItem[] = [], during = 10) {
    this.source = source.map(formatTimeTrack).filter((i) => i.track.length);
    const timeRange = getTimeRange(this.source);

    const { startTime, endTime } = timeRange;
    const speed = (endTime - startTime) / during;
    this.runtime = {
      speed,
      during,
      timeRange,
    };
  }

  private lastTime?: number;
  private usedTime = 0;

  start(initTime: number) {
    this.lastTime = initTime;
  }

  clear() {
    this.usedTime = 0;
  }

  onFrame(
    evt: RenderEvent,
    opt: {
      fullPath: boolean;
    }
  ) {
    const time = evt.frameState?.time;
    const lastTime = this.lastTime;
    if (!time) {
      return null;
    }

    if (!lastTime) {
      this.lastTime = time;
      return null;
    }

    const { during, speed, timeRange } = this.runtime;
    const isFullPath = opt.fullPath;

    const elapsedTime = time - lastTime;
    this.usedTime = this.usedTime + elapsedTime;
    if (this.usedTime > during) {
      return "end";
    }
    this.lastTime = time;

    const currentTime = this.usedTime * speed + timeRange.startTime;

    const features = new Map<string, Point>();
    const lines = new Map<string, Point[]>();

    for (let i = 0; i < this.source.length; i++) {
      const item = this.source[i];
      if (!item.track.length) {
        continue;
      }

      if (isFullPath) {
        lines.set(
          item.name,
          item.track.map((i) => i.point)
        );
      }

      if (item.startTime > currentTime) {
        continue;
      }

      if (item.endTime < currentTime) {
        features.set(item.name, item.track[item.track.length - 1].point);
        continue;
      }

      const subPath: Point[] = [];
      for (let j = 0; j < item.track.length; j++) {
        const track = item.track[j];

        if (track.timeStamp >= currentTime) {
          const lastTrack = item.track[j - 1];

          if (!lastTrack) {
            break;
          }

          const timeoffset =
            (currentTime - lastTrack.timeStamp) /
            (track.timeStamp - lastTrack.timeStamp);

          const position: Point = [
            lastTrack.point[0] +
              (track.point[0] - lastTrack.point[0]) * timeoffset,
            lastTrack.point[1] +
              (track.point[1] - lastTrack.point[1]) * timeoffset,
          ];

          if (!isFullPath) {
            subPath.push(position);
            lines.set(item.name, subPath);
          }

          features.set(item.name, position);

          break;
        }

        if (!isFullPath) {
          subPath.push(track.point);
        }
      }
    }

    return {
      features,
      lines,
      currentTime,
    };
  }

  updateSource(source: TimeTrackSourceItem[] = [], during = 10) {
    this.source = source.map(formatTimeTrack).filter((i) => i.track.length);
    const timeRange = getTimeRange(this.source);

    const { startTime, endTime } = timeRange;
    const speed = (endTime - startTime) / during;
    this.runtime = {
      speed,
      during,
      timeRange,
    };
    this.usedTime = 0;
  }
}
