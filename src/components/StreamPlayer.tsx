"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Film } from "@/content/projects";
import { streamFor } from "@/content/stream";

type Status = "unavailable" | "loading" | "ready" | "error";

const fmt = (t: number) => {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

type FsVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };

/**
 * Cloudflare Stream playback with the theatre's own typographic controls.
 * HLS plays natively on Safari/iOS and through hls.js elsewhere; the bitrate adapts to the connection.
 *
 * Keys (when the player has focus): Space or K play/pause, M sound, F fullscreen, ← → 5 seconds.
 */
export function StreamPlayer({ film, autoPlay = true }: { film: Film; autoPlay?: boolean }) {
  const source = streamFor(film.key);
  const wrap = useRef<HTMLDivElement>(null);
  const video = useRef<FsVideo>(null);
  const [status, setStatus] = useState<Status>(source ? "loading" : "unavailable");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffering, setBuffering] = useState(false);
  const [idle, setIdle] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // attach the stream
  useEffect(() => {
    const v = video.current;
    if (!v || !source) return;
    setStatus("loading");
    let destroyed = false;
    let hls: { destroy: () => void } | null = null;

    const start = () => {
      if (destroyed) return;
      setStatus("ready");
      if (autoPlay) v.play().catch(() => setPlaying(false));
    };

    if (v.canPlayType("application/vnd.apple.mpegurl")) {
      v.src = source.hls;
      v.addEventListener("loadedmetadata", start, { once: true });
    } else {
      import("hls.js").then(({ default: Hls }) => {
        if (destroyed) return;
        if (!Hls.isSupported()) {
          setStatus("error");
          return;
        }
        const h = new Hls({ capLevelToPlayerSize: true, startLevel: -1 });
        hls = h;
        h.on(Hls.Events.MANIFEST_PARSED, start);
        h.on(Hls.Events.ERROR, (_e, data) => {
          if (!data.fatal) return;
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) h.recoverMediaError();
          else setStatus("error");
        });
        h.loadSource(source.hls);
        h.attachMedia(v);
      });
    }
    const onError = () => setStatus("error");
    v.addEventListener("error", onError);
    return () => {
      destroyed = true;
      v.removeEventListener("error", onError);
      hls?.destroy();
      v.removeAttribute("src");
      v.load();
    };
    // re-run when the film changes or the viewer retries
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source?.hls, attempt]);

  const toggle = useCallback(() => {
    const v = video.current;
    if (!v || status !== "ready") return;
    if (v.paused) v.play().catch(() => undefined);
    else v.pause();
  }, [status]);

  const seek = (by: number) => {
    const v = video.current;
    if (v) v.currentTime = Math.max(0, Math.min((v.duration || 0) - 0.1, v.currentTime + by));
  };

  const fullscreen = () => {
    const w = wrap.current;
    const v = video.current;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined);
    else if (w?.requestFullscreen) w.requestFullscreen().catch(() => v?.webkitEnterFullscreen?.());
    else v?.webkitEnterFullscreen?.(); // iPhone Safari
  };

  const wake = () => {
    setIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 2600);
  };
  useEffect(() => () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") {
      e.preventDefault();
      toggle();
    } else if (k === "m") {
      setMuted((m) => !m);
    } else if (k === "f") {
      fullscreen();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      e.stopPropagation();
      seek(5);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      e.stopPropagation();
      seek(-5);
    } else return;
    wake();
  };

  useEffect(() => {
    if (video.current) video.current.muted = muted;
  }, [muted]);

  const showControls = !playing || !idle || buffering;

  return (
    <div
      ref={wrap}
      tabIndex={0}
      role="group"
      aria-label={`${film.title}, video player`}
      onKeyDown={onKey}
      onPointerMove={wake}
      onTouchStart={wake}
      className="absolute inset-0 bg-black outline-none"
      style={{ cursor: showControls ? "default" : "none" }}
      data-player-status={status}
    >
      <video
        ref={video}
        playsInline
        preload="metadata"
        poster={film.poster ?? undefined}
        className="absolute inset-0 h-full w-full object-cover"
        onPlay={() => {
          setPlaying(true);
          wake();
        }}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onCanPlay={() => setBuffering(false)}
        onEnded={() => setPlaying(false)}
        onClick={toggle}
      />

      {/* no Stream configured: play the film from its shared Drive original */}
      {status === "unavailable" && (
        <iframe
          title={`${film.title}, film`}
          src={`https://drive.google.com/file/d/${film.driveId}/preview`}
          allow="autoplay; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0 bg-black"
        />
      )}

      {/* loading and buffering */}
      {(status === "loading" || (status === "ready" && buffering)) && (
        <div role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="ui bg-black/55 px-3 py-2 text-[17px]">Loading film</span>
        </div>
      )}

      {/* failure, with a way out */}
      {status === "error" && (
        <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 p-6 text-center">
          <p className="ui text-[20px]">This film didn&rsquo;t load.</p>
          <p className="max-w-[28ch] text-[15px] opacity-80">Check your connection, then try again.</p>
          <button onClick={() => setAttempt((a) => a + 1)} className="btn">
            Try again
          </button>
        </div>
      )}

      {/* big play affordance before the first play, or if autoplay was blocked */}
      {status === "ready" && !playing && time === 0 && (
        <button
          onClick={toggle}
          className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 to-transparent p-5 pb-24 text-left md:pb-20"
          aria-label={`Play ${film.title} with sound`}
        >
          <span className="ui text-[22px]">Play with sound</span>
          <span className="ui-sm">{fmt(0)} / {fmt(duration)}</span>
        </button>
      )}

      {/* typographic controls */}
      {status === "ready" && (
        <div
          className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-14 transition-opacity duration-300"
          style={{ opacity: showControls ? 1 : 0 }}
          onFocus={wake}
        >
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={time}
            onChange={(e) => {
              if (video.current) video.current.currentTime = Number(e.target.value);
            }}
            aria-label="Seek"
            aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
            className="scrubber block w-full"
            style={{ ["--p" as string]: `${duration ? (time / duration) * 100 : 0}%` }}
          />
          <div className="mt-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <button onClick={toggle} className="ui min-h-[44px] text-[17px]" aria-label={playing ? "Pause" : "Play"}>
                {playing ? "Pause" : "Play"}
              </button>
              <span className="ui-sm tabular-nums" aria-hidden>
                {fmt(time)} / {fmt(duration)}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <button onClick={() => setMuted((m) => !m)} className="ui min-h-[44px] text-[17px]" aria-pressed={muted}>
                {muted ? "Sound off" : "Sound on"}
              </button>
              <button onClick={fullscreen} className="ui min-h-[44px] text-[17px]">
                Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
