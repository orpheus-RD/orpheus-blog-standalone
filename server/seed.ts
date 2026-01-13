/**
 * Database Seed Script
 * 
 * This script initializes the database with default content
 * Run with: npx tsx server/seed.ts
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { photos, essays, papers } from "../drizzle/schema";
import { sql } from "drizzle-orm";

const seedPhotos = [
  {
    title: "Winter Solitude",
    description: "Snow-covered peaks under a pale winter sky, where silence speaks louder than words.",
    location: "Isle of Skye, Scotland",
    imageUrl: "/images/DSCF3114.JPG",
    category: "Landscape",
    tags: "winter,mountains,scotland,snow",
    featured: true,
    sortOrder: 1,
    publishedAt: new Date("2024-01-15"),
  },
  {
    title: "Edge of the World",
    description: "Where chalk cliffs meet the sea, two figures walk toward the infinite horizon.",
    location: "Seven Sisters, England",
    imageUrl: "/images/image7.jpg",
    category: "Landscape",
    tags: "cliffs,sea,england,coast",
    featured: true,
    sortOrder: 2,
    publishedAt: new Date("2024-02-20"),
  },
  {
    title: "Turquoise Waters",
    description: "A lone kayaker navigates the crystal waters beneath ancient limestone cliffs.",
    location: "Étretat, France",
    imageUrl: "/images/image1.jpg",
    category: "Landscape",
    tags: "france,coast,kayak,water",
    featured: false,
    sortOrder: 3,
    publishedAt: new Date("2024-03-10"),
  },
  {
    title: "Threshold",
    description: "An elderly man pauses at the doorway, caught between shadow and light.",
    location: "York, England",
    imageUrl: "/images/image5.jpg",
    category: "Street",
    tags: "street,portrait,england,light",
    featured: false,
    sortOrder: 4,
    publishedAt: new Date("2024-04-05"),
  },
  {
    title: "Florentine Light",
    description: "The Duomo's intricate facade glows in the golden hour, as crowds gather below.",
    location: "Florence, Italy",
    imageUrl: "/images/image2.jpg",
    category: "Architecture",
    tags: "italy,florence,architecture,cathedral",
    featured: false,
    sortOrder: 5,
    publishedAt: new Date("2024-05-15"),
  },
  {
    title: "Roman Passage",
    description: "The Pantheon stands eternal, as modern life flows past its ancient columns.",
    location: "Rome, Italy",
    imageUrl: "/images/image3.jpg",
    category: "Architecture",
    tags: "italy,rome,architecture,pantheon",
    featured: false,
    sortOrder: 6,
    publishedAt: new Date("2024-06-20"),
  },
];

const seedEssays = [
  {
    title: "The Art of Seeing",
    subtitle: "On Photography and Presence",
    excerpt: "In an age of infinite images, what does it mean to truly see? The camera becomes not just a tool for capture, but a lens through which we learn to inhabit the present moment more fully.",
    content: `In an age of infinite images, what does it mean to truly see? The camera becomes not just a tool for capture, but a lens through which we learn to inhabit the present moment more fully.

Photography, at its essence, is an act of attention. When we raise the camera to our eye, we are making a declaration: this moment matters. This light, this gesture, this fleeting arrangement of the world deserves to be preserved.

But the paradox of photography is that in seeking to capture the moment, we often miss it. We become so focused on the frame, the exposure, the composition, that we forget to simply be present with what we're witnessing.

The masters of photography understood this tension. Henri Cartier-Bresson spoke of the "decisive moment" – that instant when all elements align in perfect harmony. But to recognize such moments, one must first learn to see without the camera, to develop what he called "the eye."

This is the art of seeing: not merely looking, but truly perceiving. It requires us to slow down, to quiet the constant chatter of our minds, and to open ourselves to the visual poetry that surrounds us at every moment.`,
    coverImageUrl: "/images/image7.jpg",
    category: "Photography",
    tags: "photography,art,seeing,presence",
    readTime: 12,
    featured: true,
    published: true,
    publishedAt: new Date("2024-12-01"),
  },
  {
    title: "Wandering Through Time",
    subtitle: "Reflections on European Architecture",
    excerpt: "Standing before the Pantheon, one feels the weight of two millennia pressing down through those ancient columns. Architecture, at its finest, is frozen music—a symphony in stone that plays across centuries.",
    content: `Standing before the Pantheon, one feels the weight of two millennia pressing down through those ancient columns. Architecture, at its finest, is frozen music—a symphony in stone that plays across centuries.

The great buildings of Europe are not merely structures; they are conversations across time. When we enter a Gothic cathedral, we are participating in a dialogue that began eight hundred years ago. The masons who carved those stones, the architects who designed those soaring vaults, the countless generations who have walked those aisles before us – all are present in that space.

This is what distinguishes truly great architecture from mere building. A building shelters us from the elements; architecture shelters our souls. It creates spaces that elevate our spirits, that remind us of our capacity for beauty and transcendence.

Walking through the streets of Rome, Florence, or Paris, one is constantly reminded of this truth. Every corner reveals another masterpiece, another testament to human creativity and aspiration. These cities are living museums, where the past and present coexist in an endless dance.`,
    coverImageUrl: "/images/image3.jpg",
    category: "Travel",
    tags: "architecture,europe,travel,history",
    readTime: 15,
    featured: false,
    published: true,
    publishedAt: new Date("2024-11-15"),
  },
  {
    title: "The Silence of Snow",
    subtitle: "A Winter Journey to the Scottish Highlands",
    excerpt: "There is a particular quality to highland silence in winter—not an absence of sound, but a presence of stillness so profound it becomes almost audible. The mountains hold their breath.",
    content: `There is a particular quality to highland silence in winter—not an absence of sound, but a presence of stillness so profound it becomes almost audible. The mountains hold their breath.

I arrived in the Scottish Highlands in late January, when the land lay buried under a thick blanket of snow. The journey from Edinburgh had taken me through increasingly wild terrain, the gentle lowlands giving way to stark, dramatic peaks.

The silence was the first thing I noticed. In our modern world, true silence has become almost impossible to find. There is always the hum of traffic, the buzz of electronics, the constant background noise of civilization. But here, in this remote corner of Scotland, I found something approaching absolute quiet.

It was not an empty silence, but a full one. The snow absorbed all sound, creating a muffled, dreamlike quality to the landscape. When I walked, my footsteps made soft crunching sounds that seemed almost too loud in that pristine stillness.

The mountains themselves seemed to be sleeping, their ancient forms softened by snow, their harsh edges rounded into gentle curves. I felt like an intruder in a sacred space, a witness to something not meant for human eyes.`,
    coverImageUrl: "/images/DSCF3114.JPG",
    category: "Travel",
    tags: "scotland,winter,travel,nature",
    readTime: 10,
    featured: false,
    published: true,
    publishedAt: new Date("2024-10-20"),
  },
  {
    title: "Portraits of Strangers",
    subtitle: "The Ethics and Aesthetics of Street Photography",
    excerpt: "Every photograph of a stranger is an act of both intimacy and intrusion. We capture moments that belong to others, freezing their private gestures into our public narratives.",
    content: `Every photograph of a stranger is an act of both intimacy and intrusion. We capture moments that belong to others, freezing their private gestures into our public narratives.

Street photography occupies a unique ethical space in the photographic arts. Unlike portraiture, where the subject consents to being photographed, street photography often captures people unaware. We take something from them – their image, their moment – without asking permission.

This raises profound questions about the nature of public space, privacy, and the photographer's responsibility. When we photograph a stranger on the street, are we documenting reality or exploiting it? Are we creating art or invading privacy?

The great street photographers have grappled with these questions throughout the medium's history. Some, like Henri Cartier-Bresson, believed in remaining invisible, capturing moments without disturbing them. Others, like William Klein, embraced confrontation, engaging directly with their subjects.

There is no easy answer to these ethical dilemmas. But I believe that the best street photography comes from a place of empathy and respect. We must see our subjects as fellow human beings, not merely as compositional elements.`,
    coverImageUrl: "/images/image5.jpg",
    category: "Photography",
    tags: "street,photography,ethics,portraits",
    readTime: 18,
    featured: false,
    published: true,
    publishedAt: new Date("2024-09-10"),
  },
];

const seedPapers = [
  {
    title: "Visual Rhetoric in Contemporary Documentary Photography: A Semiotic Analysis",
    authors: "Orpheus D.",
    abstract: "This paper examines the evolving visual rhetoric employed in contemporary documentary photography, analyzing how photographers construct meaning through compositional choices, color grading, and subject positioning. Drawing on semiotic theory and visual culture studies, we propose a framework for understanding how documentary images function as both evidence and argument in the digital age.",
    journal: "Journal of Visual Culture",
    year: 2024,
    volume: "23",
    pages: "145-172",
    doi: "10.1177/1470412924000001",
    category: "Visual Culture",
    tags: "Documentary Photography,Visual Rhetoric,Semiotics,Digital Culture",
    citations: 12,
    featured: true,
    published: true,
    publishedAt: new Date("2024-03-15"),
  },
  {
    title: "The Phenomenology of Place: Architectural Experience and Embodied Perception",
    authors: "Orpheus D., Smith, J.",
    abstract: "This study investigates the phenomenological dimensions of architectural experience, focusing on how built environments shape embodied perception and spatial consciousness. Through a combination of theoretical analysis and empirical observation, we argue that architecture functions as a medium for the cultivation of particular modes of being-in-the-world.",
    journal: "Architectural Theory Review",
    year: 2024,
    volume: "29",
    pages: "78-103",
    doi: "10.1080/13264826.2024.000002",
    category: "Architecture",
    tags: "Phenomenology,Architecture,Embodiment,Spatial Perception",
    citations: 8,
    featured: false,
    published: true,
    publishedAt: new Date("2024-06-20"),
  },
  {
    title: "Between Stillness and Motion: Temporality in Landscape Photography",
    authors: "Orpheus D.",
    abstract: "This article explores the paradoxical relationship between stillness and motion in landscape photography, examining how photographers negotiate the tension between the frozen moment of capture and the continuous flow of natural time. We analyze works by contemporary landscape photographers to demonstrate how temporal complexity is encoded within seemingly static images.",
    journal: "Photography & Culture",
    year: 2023,
    volume: "16",
    pages: "234-258",
    doi: "10.1080/17514517.2023.000003",
    category: "Photography",
    tags: "Landscape Photography,Temporality,Nature,Visual Arts",
    citations: 5,
    featured: false,
    published: true,
    publishedAt: new Date("2023-11-10"),
  },
];

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  const db = drizzle(connection);

  console.log("🌱 Starting database seed...");

  try {
    // Check if photos table is empty
    const existingPhotos = await db.select({ count: sql<number>`count(*)` }).from(photos);
    if (existingPhotos[0].count === 0) {
      console.log("📷 Seeding photos...");
      for (const photo of seedPhotos) {
        await db.insert(photos).values(photo);
      }
      console.log(`   ✓ Added ${seedPhotos.length} photos`);
    } else {
      console.log(`📷 Photos table already has ${existingPhotos[0].count} entries, skipping...`);
    }

    // Check if essays table is empty
    const existingEssays = await db.select({ count: sql<number>`count(*)` }).from(essays);
    if (existingEssays[0].count === 0) {
      console.log("📝 Seeding essays...");
      for (const essay of seedEssays) {
        await db.insert(essays).values(essay);
      }
      console.log(`   ✓ Added ${seedEssays.length} essays`);
    } else {
      console.log(`📝 Essays table already has ${existingEssays[0].count} entries, skipping...`);
    }

    // Check if papers table is empty
    const existingPapers = await db.select({ count: sql<number>`count(*)` }).from(papers);
    if (existingPapers[0].count === 0) {
      console.log("🎓 Seeding papers...");
      for (const paper of seedPapers) {
        await db.insert(papers).values(paper);
      }
      console.log(`   ✓ Added ${seedPapers.length} papers`);
    } else {
      console.log(`🎓 Papers table already has ${existingPapers[0].count} entries, skipping...`);
    }

    console.log("✅ Database seed completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await connection.end();
    process.exit(1);
  }

  await connection.end();
  process.exit(0);
}

seed();
