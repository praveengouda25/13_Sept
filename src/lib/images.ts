const gallery = (filename: string) => `/gallery/${filename}`;
const heroSection = (filename: string) => `/Hero_Section/${filename}`;

// Official SVRST photographs from the existing public/gallery collection.
const educationClassroom = gallery("485680654_2314820495585530_4844798421333418608_n.jpg");
const educationReading = gallery("485102872_2314820398918873_398084130907220773_n.jpg");
const community = gallery("486202553_2315961552138091_2057107015716883614_n.jpg");
const eventWalk = gallery("485995676_2316844402049806_2027262695686617169_n.jpg");
const eventKits = gallery("486672457_2321493698251543_1227417758185921883_n.jpg");
const teamLead = gallery("484906498_2309865726081007_3933555102617373580_n.jpg");
const achievementsImg = gallery("486531486_2316844078716505_6594244948484410213_n.jpg");
const storyStudent = gallery("486141822_2316844352049811_4766525757847180261_n.jpg");
const storyFamily = gallery("485895274_2316844125383167_1612227953887777993_n.jpg");

// Hero images from dedicated Hero_Section
const hero1 = heroSection("488874613_2328972350837011_3561273432230561794_n.jpg");
const hero2 = heroSection("520534394_2421416824925896_672210982372800926_n.jpg");
const hero3 = heroSection("752782065_2753480668386175_1281203819259567930_n.jpg");
const hero4 = heroSection("753663213_2753480985052810_2368062948337649079_n.jpg");

// Updated section images
const ourStory = "/images/our_story.jpg";

// Additional programme and donation images
const yogaMeditation = gallery("556817065_2486140661786845_3079024253033452349_n.jpg");
const sportsActivity = gallery("486674265_2321493761584870_6737025434645024787_n.jpg");
const volunteers = gallery("486954179_2320490565018523_1646936542213223806_n.jpg");
const mentoring = gallery("486672457_2321493698251543_1227417758185921883_n.jpg");
const donateBg = gallery("487086157_2321493558251557_7274259767878808068_n.jpg");
const culturalActivity = gallery("487089955_2321493391584907_3436896747489378949_n.jpg");
const eventActivity = gallery("487204572_2321493361584910_9169377512072903822_n.jpg");

/**
 * Image inventory — each image has a single purpose so no section repeats
 * another section's visual.
 *
 * hero1 / hero2 / hero3 / hero4  → homepage hero slider only
 * educationClassroom, educationReading, mentoring        → education programme
 * yogaMeditation                                         → dhyana & yoga programme
 * sportsActivity                                        → sports programme
 * culturalActivity                                      → values & culture programme
 * eventKits, eventWalk, volunteers                       → events & volunteering
 * achievementsImg                                        → achievements
 * community, ourStory                                    → about pages
 * teamLead                                               → team portraits
 * storyStudent, storyFamily                              → success stories
 * donateBg                                               → donation page
 */
export const images = {
  hero1,
  hero2,
  hero3,
  hero4,
  community,
  ourStory,
  donateBg,
  educationClassroom,
  educationReading,
  yogaMeditation,
  sportsActivity,
  culturalActivity,
  eventKits,
  eventWalk,
  volunteers,
  achievements: achievementsImg,
  mentoring,
  teamLead,
  storyStudent,
  storyFamily,
  foodDistribution: eventKits,
  womenEnterprise: culturalActivity,
  foodKitchen: eventActivity,
  // Legacy aliases kept so older imports keep resolving.
  education: educationClassroom,
  healthcare: yogaMeditation,
  food: eventActivity,
  women: culturalActivity,
} as const;

export type ImageKey = keyof typeof images;

/** Card/listing image for each programme (distinct from the hero slider images). */
export const causeImage: Record<string, string> = {
  education: educationClassroom,
  dhyana: yogaMeditation,
  yoga: yogaMeditation,
  sports: sportsActivity,
  values: culturalActivity,
};

/** Larger, different visual for each programme detail page hero. */
export const causeHeroImage: Record<string, string> = {
  education: educationReading,
  dhyana: yogaMeditation,
  yoga: yogaMeditation,
  sports: sportsActivity,
  values: culturalActivity,
};
