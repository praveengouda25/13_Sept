import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { useEffect, useRef } from "react";
import { impactStats } from "@/data/site";
import { ImpactCounter } from "@/components/ImpactCounter";

export function VideoSection() {
  const videoFileName =
    "FDownloader.Net_AQPCCWsRaIhEJfCkUEgRuv3L7ZJ_xKgnXI1KBg7-6O4HVWipotljJd1wS_Jx0cfG8XHpXCQs7QQJR1fltLNeVXRUMRNZKqSeXss_720p_(HD).mp4";
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const userPaused = useRef(false);
  const autoPausing = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          if (!userPaused.current) void video.play().catch(() => undefined);
        } else if (!video.paused) {
          autoPausing.current = true;
          video.pause();
          autoPausing.current = false;
        }
      },
      { threshold: [0, 0.35, 0.75] },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Our Impact"
          title="Together, We Create Meaningful Change"
          description="Through education, dhyana, yoga, sports and values, SVRST works with children to build lasting foundations for life. See how your support transforms lives."
        />

        <Reveal delay={200} className="mt-14">
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
            {/* Video Container */}
            <div className="aspect-video w-full">
              <video
                ref={videoRef}
                src={`/${videoFileName}`}
                controls
                controlsList="nodownload"
                poster="/gallery/485680654_2314820495585530_4844798421333418608_n.jpg"
                className="size-full object-cover"
                preload="metadata"
                muted
                playsInline
                loop
                onPause={() => {
                  if (!autoPausing.current) userPaused.current = true;
                }}
              >
                <p>Your browser does not support the video tag.</p>
              </video>
            </div>
          </div>
        </Reveal>
        <div className="mt-14 grid gap-8 border-y border-primary/20 py-8 sm:grid-cols-3 sm:gap-0">
          {impactStats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 90}
              className="sm:border-l sm:border-primary/20 first:sm:border-l-0"
            >
              <ImpactCounter
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                className="sm:pl-8 first:sm:pl-0"
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
