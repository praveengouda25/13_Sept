import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  HeartPulse,
  Trophy,
  Sparkles,
  Shield,
  Calendar,
  Clock,
  MapPin,
  Users,
  Linkedin,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { causeImage, images } from "@/lib/images";
import type { Cause, Event, Story } from "@/data/site";
import { cn } from "@/lib/utils";

const causeIcons: Record<Cause["icon"], LucideIcon> = {
  book: BookOpen,
  heart: HeartPulse,
  trophy: Trophy,
  shield: Shield,
  sparkles: Sparkles,
};

export function CauseCard({ cause, delay = 0, showDonate = false }: { cause: Cause; delay?: number; showDonate?: boolean }) {
  const Icon = causeIcons[cause.icon];
  return (
    <Reveal delay={delay} className="h-full">
      <article className="group h-full overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={causeImage[cause.slug]}
            alt={`${cause.label} programme at SVRST Trust`}
            width={1600}
            height={1000}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-95" />
          <span className="absolute left-4 top-4 grid size-11 place-items-center rounded-2xl bg-background/85 text-accent backdrop-blur">
            <Icon className="size-5" />
          </span>
          <h3 className="absolute bottom-4 left-4 right-4 font-display text-xl font-semibold text-primary-foreground">
            {cause.label}
          </h3>
        </div>
        <div className="flex h-[calc(100%-0px)] flex-col p-6">
          <p className="font-medium text-foreground">{cause.short}</p>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{cause.blurb}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link to={`/work/${cause.slug}` as string}>
                Learn More
                <ArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            {showDonate && (
              <Button asChild variant="donate">
                <Link to="/donate" search={{ cause: cause.slug }}>
                  Donate to This Cause
                </Link>
              </Button>
            )}
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export function EventCard({ event, delay = 0 }: { event: Event; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={images[event.image]}
            alt={event.title}
            width={1600}
            height={1000}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-accent backdrop-blur">
            {event.status === "upcoming" ? "Upcoming" : "Past Event"}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl font-semibold">{event.title}</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Calendar className="size-4 text-accent" /> {event.date}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 text-accent" /> {event.time}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-accent" /> {event.location}
            </li>
            {event.seats && (
              <li className="flex items-center gap-2">
                <Users className="size-4 text-accent" /> {event.seats} places available
              </li>
            )}
          </ul>
          <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">{event.description}</p>
          {event.impact && (
            <p className="mt-4 rounded-2xl bg-secondary p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Impact: </span>
              {event.impact}
            </p>
          )}
          {event.status === "upcoming" && (
            <Button asChild variant="leaf" className="mt-6 self-start">
              <Link to="/events/register" search={{ event: event.slug }}>
                Register
                <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      </article>
    </Reveal>
  );
}

export function StoryCard({ story, delay = 0 }: { story: Story; delay?: number }) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="grid h-full overflow-hidden rounded-3xl border border-border bg-card shadow-soft sm:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden sm:aspect-auto">
          <img
            src={images[story.image]}
            alt={story.name}
            width={1600}
            height={1000}
            loading="lazy"
            className="size-full object-cover"
          />
        </div>
        <div className="p-6 sm:p-8">
          <p className="eyebrow text-accent">Success Story</p>
          <h3 className="mt-3 font-display text-xl font-semibold">{story.name}</h3>
          <p className="text-sm text-muted-foreground">{story.place}</p>
          <dl className="mt-5 space-y-3 text-sm">
            <div>
              <dt className="font-semibold text-foreground">Challenge</dt>
              <dd className="text-muted-foreground">{story.challenge}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Support received</dt>
              <dd className="text-muted-foreground">{story.support}</dd>
            </div>
            <div>
              <dt className="font-semibold text-foreground">Result</dt>
              <dd className="text-muted-foreground">{story.result}</dd>
            </div>
          </dl>
        </div>
      </article>
    </Reveal>
  );
}

export function TeamCard({
  member,
  delay = 0,
}: {
  member: { name: string; role: string; bio: string; linkedin: string };
  delay?: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="group h-full overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lift">
        <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
          <img
            src={images.community}
            alt={`Portrait placeholder for ${member.role}`}
            width={1400}
            height={1200}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-navy/80 to-transparent p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <a
              href={member.linkedin}
              aria-label={`LinkedIn profile of ${member.role}`}
              className="grid size-11 place-items-center rounded-full bg-background/90 text-accent"
            >
              <Linkedin className="size-4" />
            </a>
          </div>
        </div>
        <div className="p-6">
          <h3 className="font-display text-lg font-semibold">{member.name}</h3>
          <p className="text-sm font-medium text-accent">{member.role}</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{member.bio}</p>
        </div>
      </article>
    </Reveal>
  );
}

export function FeatureCard({
  title,
  body,
  Icon,
  delay = 0,
  className,
}: {
  title: string;
  body: string;
  Icon: LucideIcon;
  delay?: number;
  className?: string;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div
        className={cn(
          "group h-full rounded-3xl border border-border bg-card p-6 shadow-soft transition-all duration-500 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-lift",
          className,
        )}
      >
        <span className="grid size-12 place-items-center rounded-2xl bg-accent/10 text-accent transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-foreground">
          <Icon className="size-5" />
        </span>
        <h3 className="mt-5 font-display text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </Reveal>
  );
}
