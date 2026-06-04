import { PrismaClient, StarReason, NotificationType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL as string });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌙 Seeding DreamNet database...");

  // Clear in reverse FK dependency order
  await prisma.notification.deleteMany();
  await prisma.starTransaction.deleteMany();
  await prisma.featuredDream.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.dreamTag.deleteMany();
  await prisma.dream.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  console.log("✓ Cleared existing data");

  // ─── USERS ───────────────────────────────────────────────────────────────
  const pw = await bcrypt.hash("password123", 10);

  const [u0, u1, u2, u3, u4, u5] = await Promise.all([
    prisma.user.create({ data: { username: "PixelTraveler", email: "pixel@dreamnet.com",   passwordHash: pw, avatarId: 1 } }),
    prisma.user.create({ data: { username: "NightOwl",     email: "night@dreamnet.com",    passwordHash: pw, avatarId: 2 } }),
    prisma.user.create({ data: { username: "SleepDiver",   email: "sleep@dreamnet.com",    passwordHash: pw, avatarId: 3 } }),
    prisma.user.create({ data: { username: "LucidLoaf",    email: "lucid@dreamnet.com",    passwordHash: pw, avatarId: 4 } }),
    prisma.user.create({ data: { username: "StarGazer",    email: "star@dreamnet.com",     passwordHash: pw, avatarId: 5 } }),
    prisma.user.create({ data: { username: "DreamerKid",   email: "dreamer@dreamnet.com",  passwordHash: pw, avatarId: 1 } }),
  ]);
  console.log("✓ Created 6 users  (all passwords: password123)");

  // ─── TAGS ────────────────────────────────────────────────────────────────
  const tagNames = ["adventure","fantasy","night","lucid","weird","ocean","city","flying","mystery","forest","space"];
  const tagRows  = await Promise.all(tagNames.map(name => prisma.tag.create({ data: { name } })));
  const t: Record<string, string> = Object.fromEntries(tagRows.map(r => [r.name, r.id]));
  console.log("✓ Created tags");

  // ─── DREAMS ──────────────────────────────────────────────────────────────
  async function mkDream(title: string, content: string, userId: string, tags: string[]) {
    return prisma.dream.create({
      data: { title, content, userId, tags: { create: tags.map(n => ({ tagId: t[n] })) } },
    });
  }

  const [d0, d1, d2, d3, d4, d5, d6, d7, d8, d9] = await Promise.all([
    mkDream("Sky Island", `I found myself standing on a floating island high above the clouds. There was a single ancient tree at the center, its massive roots somehow anchoring it to nothing, its leaves glowing faintly like scattered embers. The island drifted slowly through a purple twilight sky.

When I walked to the edge, I could see other islands in the distance, each with their own strange ecosystems — one covered in blue crystalline formations that chimed in the wind, another with a lighthouse rotating without any visible mechanism.

I tried to jump to the nearest island. Instead of falling, I found I could glide, my arms spreading like wings. The air smelled of cedar and distant rain. I woke up just as I was about to land, and for a moment I was furious about it.`, u0.id, ["fantasy","flying","lucid"]),

    mkDream("Abandoned City", `I walked through a city that had been empty for decades. The buildings were intact — no crumbling, no graffiti — but vines had quietly claimed every surface, growing in perfect geometric patterns as though the city had been designed for them.

The streets were completely silent except for the wind moving through empty windows. I found a newspaper on a bench, perfectly preserved. The date was today's date. The headlines were about mundane city events — a park renovation, a restaurant closing. When I turned to the back page, there was a photograph of an empty street, and I realized with a jolt that I was standing on that exact street.

I ran, but every street I turned onto was another photograph from that same newspaper.`, u1.id, ["city","weird","night"]),

    mkDream("Deep Sea Kingdom", `I was underwater, but breathing felt completely natural. I swam down through layers of the ocean — past coral reefs in impossible colors, past ancient shipwrecks where fish made their homes in the captain's quarters.

Eventually I reached a city built from sea glass, polished wood, and what looked like whale bones. The streets were lit by bioluminescent plants growing from every surface. The inhabitants were humanoid but had markings across their skin that shifted and glowed like deep-sea creatures.

They spoke in a language of clicks, low tones, and whale song. Somehow I understood it perfectly. They were arguing about whether to move the city deeper because something massive was approaching from above. I realized "above" meant the surface. I realized they meant us.`, u2.id, ["ocean","adventure","fantasy"]),

    mkDream("The White Door", `A white door appeared in the middle of my bedroom. It wasn't connected to any wall — just standing there, freestanding, between my desk and the window. I walked around it and saw nothing on the other side. Just my normal bedroom, my laundry on the floor, my poster on the wall.

When I opened it from the front, there was a corridor. Not a small door-sized opening but a full corridor stretching into infinity, white walls, white floor, white ceiling, lit by a sourceless glow. Doors lined both sides — red doors, blue doors, wooden doors, doors made of what looked like water somehow holding its shape.

I chose a green one. Behind it was an exact replica of my bedroom. On the desk was a journal I didn't recognize. The first page said: "You've been here before. The door finds you."`, u3.id, ["lucid","mystery","weird"]),

    mkDream("The Midnight Train", `I boarded a train at a station that wasn't on any map. The sign said the station's name but the letters kept rearranging before I could read them. The conductor was tall, wore a crisp uniform, and had no face — just smooth skin where features should be. He punched my ticket without looking at it.

The other passengers were reading newspapers. When I tried to read over someone's shoulder, the text was made of symbols I'd never seen, but I understood them as "weather" and "ceremony" and "the thing beneath the mountain."

Outside the windows, landscapes replaced each other every few seconds — arctic tundra, dense jungle, city lights from above, the ocean at night. I fell asleep on the train and dreamed I was back at the station, holding a ticket for a city I'd never heard of but knew I'd been to.`, u4.id, ["night","adventure","weird"]),

    mkDream("Crystal Forest", `The forest was made of crystal, or the trees had slowly turned to crystal over centuries — I couldn't tell which. The light came through them in sharp fractured beams that cast rainbow patterns across the crystal floor.

I walked for what felt like hours. No animals. No wind. Just the faint sound of crystals vibrating against each other when I touched them, like distant bells.

At the center was a clearing with a single tree that was half-crystal, half-living wood. Its leaves were translucent, patterned like wings. I sat under it and could see my own reflection fractured hundreds of times in the trunk. In each reflection I was doing something different — reading, running, sleeping, laughing at something I couldn't hear.`, u5.id, ["fantasy","adventure","forest"]),

    mkDream("Falling Stars", `I was standing on top of a mountain so high that I was above the clouds. The sky above me was not blue but a deep, saturated violet, and stars were falling — not like shooting stars, not streaks of light, but actual stars, enormous and slow, drifting down from the sky like dandelion seeds.

Each star that landed near me hit the ground gently and sank into it like it was water, leaving a glowing circle that slowly faded. The mountain was covered in hundreds of these glowing rings.

I held my hands out and a star drifted toward me. It was warm. It fit perfectly in my cupped hands, about the size of a grapefruit. It hummed. When it sank into my palms, I woke up. My hands were warm for a long time afterward. I genuinely believe something was given to me.`, u0.id, ["space","night","flying"]),

    mkDream("Shadow Theater", `I was in a theater where everything was made of shadows. The seats, the stage, the curtains, the audience around me — all shadows, perfectly three-dimensional, but clearly shadows. Only I was solid, real, out of place.

The performance was a shadow play of my own life, but accelerated and compressed. I watched things that hadn't happened yet. I watched myself talking to someone I didn't recognize. I watched myself standing in a doorway I'd never seen, deciding something.

The shadow audience watched me watching the performance. At intermission, a shadow that looked like my mother sat down next to me and said something in a language I don't speak, but I knew from her expression it was reassuring. I woke up crying, but not from sadness.`, u1.id, ["weird","night","mystery"]),

    mkDream("The Glass Ocean", `The ocean was made of glass — solid, transparent, and you could see everything that had ever been in it, preserved in the layers like a geological record. Ships from every era of history, suspended at their depths. Creatures that no longer exist, perfectly still, their patterns still vivid.

I walked on the surface in bare feet and it was perfectly flat, slightly warm from the sun. Other people were walking too, stopping to crouch and look at things below them. No one spoke. There was a shared understanding that it was a museum.

Near the edge of the horizon, I could see the glass beginning to crack — hairline fractures spreading very slowly. A woman walking near me pointed at them. She said, "The ocean remembers what it used to be and it's trying to come back." I looked at my feet. Water was beginning to come up through the cracks.`, u2.id, ["ocean","fantasy","lucid"]),

    mkDream("Flying Over Mountains", `This was a flying dream, but different from the usual ones. I wasn't struggling to stay up or panicking about falling. I was just flying, competently, like someone who has done it for years. I banked around mountain peaks the way a bird does, reading the thermals, adjusting naturally.

The mountains were somewhere that doesn't exist in any geography I recognize. Too tall, too close together. Covered in a species of tree with silver leaves that flashed in the light. There were structures built into the cliff faces — actual buildings with windows, accessible only by air.

I landed on a ledge outside one of them. Inside was a library. The books were about dreams. My name was in the index of one of them. I opened it to my page. The text was a description of this dream, the one I was currently inside, perfectly accurate, including the detail that I would reach this sentence and wake up. I reached this sentence and woke up.`, u3.id, ["flying","adventure","lucid"]),
  ]);
  console.log("✓ Created 10 dreams");

  // ─── RATINGS ─────────────────────────────────────────────────────────────
  // Format: [dream, rater, value] — no user rates their own dream
  const ratingData: [typeof d0, typeof u0, number][] = [
    // d0 SkyIsland (u0): rated by u1,u2,u3,u4,u5 → avg 4.8
    [d0,u1,5],[d0,u2,5],[d0,u3,4],[d0,u4,5],[d0,u5,5],
    // d1 AbandonedCity (u1): → avg 4.6
    [d1,u0,5],[d1,u2,4],[d1,u3,5],[d1,u4,4],[d1,u5,5],
    // d2 DeepSeaKingdom (u2): → avg 4.6
    [d2,u0,4],[d2,u1,5],[d2,u3,5],[d2,u4,4],[d2,u5,5],
    // d3 WhiteDoor (u3): → avg 4.4
    [d3,u0,4],[d3,u1,5],[d3,u2,4],[d3,u4,5],[d3,u5,4],
    // d4 MidnightTrain (u4): → avg 4.0
    [d4,u0,3],[d4,u1,4],[d4,u2,5],[d4,u3,4],[d4,u5,4],
    // d5 CrystalForest (u5): → avg 3.4
    [d5,u0,3],[d5,u1,4],[d5,u2,3],[d5,u3,4],[d5,u4,3],
    // d6 FallingStars (u0): → avg 5.0
    [d6,u1,5],[d6,u2,5],[d6,u3,5],[d6,u4,5],[d6,u5,5],
    // d7 ShadowTheater (u1): → avg 4.4
    [d7,u0,4],[d7,u2,5],[d7,u3,4],[d7,u4,5],[d7,u5,4],
    // d8 GlassOcean (u2): → avg 4.6
    [d8,u0,5],[d8,u1,4],[d8,u3,5],[d8,u4,4],[d8,u5,5],
    // d9 FlyingMountains (u3): → avg 4.4
    [d9,u0,4],[d9,u1,5],[d9,u2,4],[d9,u4,5],[d9,u5,4],
  ];

  await prisma.rating.createMany({
    data: ratingData.map(([dream, user, value]) => ({
      dreamId: dream.id, userId: user.id, value,
    })),
  });

  // Update averageRating and ratingCount on each dream
  const dreamIds = [d0,d1,d2,d3,d4,d5,d6,d7,d8,d9];
  for (const dream of dreamIds) {
    const agg = await prisma.rating.aggregate({
      where: { dreamId: dream.id },
      _avg: { value: true },
      _count: { value: true },
    });
    await prisma.dream.update({
      where: { id: dream.id },
      data: { averageRating: agg._avg.value ?? 0, ratingCount: agg._count.value },
    });
  }
  console.log("✓ Created ratings and updated dream averages");

  // ─── COMMENTS ────────────────────────────────────────────────────────────
  // [dream, author, content]
  const commentDefs: [typeof d0, typeof u0, string][] = [
    [d0,u1,"This is almost exactly the flying dream I had last summer. The gliding without effort part really resonated."],
    [d0,u3,"The part about the crystalline island chiming in the wind gave me chills. Beautiful imagery."],
    [d0,u5,"I've had this floating island dream three times but it always ends before I can explore. Jealous you got to glide."],

    [d1,u0,"The newspaper with today's date is horrifying in the best way. You wrote this so precisely."],
    [d1,u2,"I had a very similar dream about a city that knew it was being dreamed. The feeling of being observed by the place is unmistakable."],
    [d1,u4,"Every turn becoming a photograph is such a precise sensation — caught inside something you're also creating."],

    [d2,u0,"The detail about them being worried about what was approaching from above — us — is terrifying and perfect."],
    [d2,u1,"Bioluminescent markings that shift and glow. I genuinely need to draw this."],
    [d2,u5,"Clicking whale song language you just instinctively understand — peak dream logic."],

    [d3,u1,"The journal saying you've been here before is the most unsettling thing I've read this week."],
    [d3,u2,"Doors made of water holding their shape — that's such a perfect dream image. Tangible impossibility."],
    [d3,u4,"I've had the freestanding door dream too but it led to nothing, just void. Yours was so much richer."],

    [d4,u0,"The conductor with no face is iconic. Train dreams operate on their own rules entirely."],
    [d4,u3,"The headlines about mundane things while you're clearly inside something vast is so perfectly dreamlike."],
    [d4,u5,"Dreaming that you're back at the station holding a ticket for somewhere you know but can't name — I feel that deeply."],

    [d5,u2,"The reflections in the trunk each doing something different — that's you seeing parallel lives."],
    [d5,u3,"No wind, no animals, just the crystalline vibration. I could feel the silence reading this."],
    [d5,u4,"Half-crystal, half-living wood. That's a symbol if I've ever seen one."],

    [d6,u2,"Your hands being warm when you woke up — that's a real phenomenon. Something genuinely happened here."],
    [d6,u4,"The slowness of the stars falling like dandelion seeds is exactly how it should feel."],

    [d7,u0,"Crying from something other than sadness — that's the most honest description I've heard for that particular feeling."],
    [d7,u3,"A performance of your own life that you can't fully understand but recognize anyway. This is profound."],

    [d8,u1,"The water coming through the cracks at the end is such a perfect ending. The ocean remembers itself."],
    [d8,u5,"Walking on a museum of the ocean's history in bare feet. I would give anything to have this dream."],

    [d9,u0,"Flying with competence, reading the thermals — that is such a different quality of dream than the anxious struggling ones."],
    [d9,u4,"The library in the cliff face with your name in the index of a dream book. This is perfect recursive horror-wonder."],
  ];

  const createdComments = await Promise.all(
    commentDefs.map(([dream, user, content]) =>
      prisma.comment.create({
        data: { dreamId: dream.id, userId: user.id, content },
      })
    )
  );

  // Map for looking up comments: "dreamId:userId" → comment
  const commentMap: Record<string, typeof createdComments[0]> = {};
  for (let i = 0; i < commentDefs.length; i++) {
    const [dream, user] = commentDefs[i];
    commentMap[`${dream.id}:${user.id}`] = createdComments[i];
  }
  console.log("✓ Created top-level comments");

  // ─── REPLIES ─────────────────────────────────────────────────────────────
  // Dream author replies to the first commenter on their dream
  // [parentComment key, replier, content]
  type ReplyDef = [string, typeof u0, string]; // key = "dreamId:commenterId"
  const replyDefs: ReplyDef[] = [
    [`${d0.id}:${u1.id}`, u0, "Do you think it's the same island? I wonder if dreamers sometimes share places."],
    [`${d1.id}:${u0.id}`, u1, "Thank you. It stuck with me for a week. I still think about that bench sometimes."],
    [`${d2.id}:${u0.id}`, u2, "I thought about that detail for days. What do they think of us, looking down from above?"],
    [`${d3.id}:${u1.id}`, u3, "Right? I still can't decide if it was a warning or a welcome."],
    [`${d4.id}:${u0.id}`, u4, "I've had the faceless conductor twice. I think it might be an archetype."],
    [`${d5.id}:${u2.id}`, u5, "Parallel lives in the crystal tree is the most beautiful interpretation of this I've seen."],
    [`${d6.id}:${u2.id}`, u0, "I know. I lay there for twenty minutes just trying to hold onto the warmth before getting up."],
    [`${d7.id}:${u0.id}`, u1, "The shadow mother scene broke me a little. There's something healing about it even without understanding."],
    [`${d8.id}:${u1.id}`, u2, "That line — 'the ocean remembers what it used to be' — I wrote it in my journal immediately on waking."],
    [`${d9.id}:${u0.id}`, u3, "I've never had a flying dream where I knew what I was doing. Must be incredible."],
  ];

  const createdReplies = await Promise.all(
    replyDefs.map(([parentKey, replier, content]) => {
      const parent = commentMap[parentKey];
      return prisma.comment.create({
        data: { dreamId: parent.dreamId, userId: replier.id, content, parentId: parent.id },
      });
    })
  );
  console.log("✓ Created comment replies");

  // ─── STAR TRANSACTIONS ───────────────────────────────────────────────────
  // POST_DREAM: +2 per dream posted
  const postDreamTxns = [
    // PixelTraveler: d0, d6
    { userId: u0.id, amount: 2, reason: "POST_DREAM" as StarReason },
    { userId: u0.id, amount: 2, reason: "POST_DREAM" as StarReason },
    // NightOwl: d1, d7
    { userId: u1.id, amount: 2, reason: "POST_DREAM" as StarReason },
    { userId: u1.id, amount: 2, reason: "POST_DREAM" as StarReason },
    // SleepDiver: d2, d8
    { userId: u2.id, amount: 2, reason: "POST_DREAM" as StarReason },
    { userId: u2.id, amount: 2, reason: "POST_DREAM" as StarReason },
    // LucidLoaf: d3, d9
    { userId: u3.id, amount: 2, reason: "POST_DREAM" as StarReason },
    { userId: u3.id, amount: 2, reason: "POST_DREAM" as StarReason },
    // StarGazer: d4
    { userId: u4.id, amount: 2, reason: "POST_DREAM" as StarReason },
    // DreamerKid: d5
    { userId: u5.id, amount: 2, reason: "POST_DREAM" as StarReason },
  ];

  // RECEIVE_RATING: +value for each rating received
  const receiveRatingTxns = ratingData.map(([dream, rater, value]) => {
    // Find the dream's owner
    const ownerMap: Record<string, string> = {
      [d0.id]: u0.id, [d1.id]: u1.id, [d2.id]: u2.id, [d3.id]: u3.id, [d4.id]: u4.id,
      [d5.id]: u5.id, [d6.id]: u0.id, [d7.id]: u1.id, [d8.id]: u2.id, [d9.id]: u3.id,
    };
    return { userId: ownerMap[dream.id], amount: value, reason: "RECEIVE_RATING" as StarReason };
  });

  // LEAVE_COMMENT: +1 per comment written
  const leaveCommentTxns = commentDefs.map(([_, user]) => ({
    userId: user.id, amount: 1, reason: "LEAVE_COMMENT" as StarReason,
  }));

  // RECEIVE_REPLY: +1 for each reply received on your comment
  const receiveReplyTxns = replyDefs.map(([parentKey]) => {
    const [dreamId, commenterId] = parentKey.split(":");
    return { userId: commenterId, amount: 1, reason: "RECEIVE_REPLY" as StarReason };
  });

  await prisma.starTransaction.createMany({
    data: [...postDreamTxns, ...receiveRatingTxns, ...leaveCommentTxns, ...receiveReplyTxns],
  });
  console.log("✓ Created star transactions");

  // ─── UPDATE USER TOTAL STARS ─────────────────────────────────────────────
  const allUsers = [u0, u1, u2, u3, u4, u5];
  await Promise.all(
    allUsers.map(async (user) => {
      const agg = await prisma.starTransaction.aggregate({
        where: { userId: user.id },
        _sum: { amount: true },
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { totalStars: agg._sum.amount ?? 0 },
      });
    })
  );
  console.log("✓ Updated user star totals");

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────────
  // Rating notifications: dream author notified for each rating
  const ratingNotifications = ratingData.map(([dream, rater]) => {
    const ownerMap: Record<string, string> = {
      [d0.id]: u0.id, [d1.id]: u1.id, [d2.id]: u2.id, [d3.id]: u3.id, [d4.id]: u4.id,
      [d5.id]: u5.id, [d6.id]: u0.id, [d7.id]: u1.id, [d8.id]: u2.id, [d9.id]: u3.id,
    };
    return {
      userId: ownerMap[dream.id],
      type: "RATING_RECEIVED" as NotificationType,
      relatedDreamId: dream.id,
      relatedUserId: rater.id,
      read: true, // historical — already "seen"
    };
  });

  // Comment notifications: dream author notified for each top-level comment
  const commentNotifications = commentDefs.map(([dream, commenter]) => {
    const ownerMap: Record<string, string> = {
      [d0.id]: u0.id, [d1.id]: u1.id, [d2.id]: u2.id, [d3.id]: u3.id, [d4.id]: u4.id,
      [d5.id]: u5.id, [d6.id]: u0.id, [d7.id]: u1.id, [d8.id]: u2.id, [d9.id]: u3.id,
    };
    return {
      userId: ownerMap[dream.id],
      type: "COMMENT_ON_DREAM" as NotificationType,
      relatedDreamId: dream.id,
      relatedUserId: commenter.id,
      read: true,
    };
  });

  // Reply notifications: commenter notified when their comment is replied to
  const replyNotifications = replyDefs.map(([parentKey, replier]) => {
    const [dreamId, commenterId] = parentKey.split(":");
    return {
      userId: commenterId,
      type: "REPLY_TO_COMMENT" as NotificationType,
      relatedDreamId: dreamId,
      relatedUserId: replier.id,
      read: false, // show as unread so Activity page is interesting
    };
  });

  await prisma.notification.createMany({
    data: [...ratingNotifications, ...commentNotifications, ...replyNotifications],
  });
  console.log("✓ Created notifications");

  // ─── FEATURED DREAM ──────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  await prisma.featuredDream.create({ data: { dreamId: d0.id, date: today } });
  console.log("✓ Set today's featured dream to Sky Island");

  // ─── SUMMARY ─────────────────────────────────────────────────────────────
  const userSummaries = await prisma.user.findMany({
    select: { username: true, totalStars: true },
    orderBy: { totalStars: "desc" },
  });
  console.log("\n🌙 Seed complete! Top Dreamers:");
  userSummaries.forEach((u, i) => console.log(`  ${i + 1}. ${u.username} — ★ ${u.totalStars}`));
  console.log("\n🔑 All accounts use password: password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
