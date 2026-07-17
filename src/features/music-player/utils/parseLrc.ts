export type LyricLine = {
  time: number;
  text: string;
};

const timeTagPattern = /\[(\d+):(\d+(?:[.:]\d+)?)\]/g;

function parseTimestamp(minutes: string, seconds: string) {
  return Number(minutes) * 60 + Number(seconds.replace(":", "."));
}

export function parseLrc(source: string): LyricLine[] {
  return source
    .split(/\r?\n/)
    .flatMap((line) => {
      const timestamps = [...line.matchAll(timeTagPattern)];
      const text = line.replace(timeTagPattern, "").trim();

      return timestamps.map((match) => ({
        time: parseTimestamp(match[1]!, match[2]! ),
        text,
      }));
    })
    .filter((line) => Number.isFinite(line.time))
    .sort((left, right) => left.time - right.time);
}