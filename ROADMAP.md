# Product Roadmap (Updated 2025)

## Feature Summary

| Feature Name | Category | Priority |
| :--- | :--- | :--- |
| **CDN Asset Offloading** | Infrastructure | High |
| **Async Job Queue (BullMQ)** | Infrastructure | High |
| **Onboarding & Integrated Help Guide** | Core LMS | High |
| **Career Paths (Role Guides)** | Core LMS | High |
| **Microlearning & "Chapterization"** | Core LMS | High |
| **LTI 1.3 Integration (LinkedIn Learning & Eloomi)** | Core LMS | High |
| **Redis Caching Layer** | Infrastructure | High |
| **Documents-to-Course "Architect"** | AI Intelligence | High |
| **Course Context AI Assistant** | AI Intelligence | High |
| **On-Demand Content Gen (PPT/Podcast)** | AI Intelligence | High |
| **Skill Gap Detective** | AI Intelligence | High |
| **The Streak Mechanic & Loss Aversion** | Gamification 2.0 | High |
| **The Skill Tree (RPG Progression)** | Gamification 2.0 | High |
| **Leaderboard Seasons & Leagues** | Gamification 2.0 | High |
| **Mobile Offline Mode** | Core LMS | Medium |
| **Save for Later (Bookmarks)** | Core LMS | Medium |
| **Contextual Q&A** | Core LMS | Medium |
| **The "Socratic" Tutor** | AI Intelligence | Medium |
| **Adaptive Assessment Engine** | AI Intelligence | Medium |
| **AI Role-Play Simulations** | AI Intelligence | Medium |
| **Asynchronous PvP Duels** | Gamification 2.0 | Medium |
| **XP Store & Rewards "Season Pass"** | Gamification 2.0 | Medium |
| **Collaborative Quests / Squad Goals** | Gamification 2.0 | Medium |
| **Database Connection Pooling** | Infrastructure | Medium |
| **Node.js Clustering (PM2)** | Infrastructure | Medium |
| **Discussion Boards (Course-Level)** | Core LMS | Low |
| **Hidden / Stealth Activities** | Core LMS | Low |
| **Flashcard Generator** | AI Intelligence | Low |
| **Dynamic Avatars & Digital Identity** | Gamification 2.0 | Low |
| **SME Tags (Subject Matter Expert)** | Gamification 2.0 | Low |
| **Scavenger Hunt / "The Stash"** | Gamification 2.0 | Low |
| **Expiring Certifications** | Gamification 2.0 | Low |

## Implemented Features (Current State)

| Feature Name | Category | Status |
| :--- | :--- | :--- |
| **Authentication & Roles** | Core LMS | ✅ Live (NextAuth, RBAC) |
| **Course Authoring Studio** | Core LMS | ✅ Live (Modules, Topics) |
| **Resource Types** | Core LMS | ✅ Live (Video, PDF, Quiz) |
| **User Progress Tracking** | Core LMS | ✅ Live (Granular status) |
| **Quizzes & Submissions** | Core LMS | ✅ Live (JSON-based) |
| **Skills & Job Roles** | Core LMS | ✅ Live (Skill-to-Role mapping) |
| **Learning Paths** | Core LMS | ✅ Live (Path Levels & Items) |
| **Course Reviews & Ratings** | Core LMS | ✅ Live (5-star system) |
| **Content Quality Flags** | Core LMS | ✅ Live (Bug reporting) |



---

## Feature Details

### 1. Core LMS (The Foundation)
*Focus: Frictionless experience, accessibility, and career-aligned learning.*

#### High Priority

**1. Onboarding & Integrated Help Guide**
*   **Why:** Reducing friction for first-time users is critical. If a user feels lost in the first 5 minutes, they won't return.
*   **How to Implement:**
    *   **Interactive Walkthrough:** Use a library like `intro.js` to guide users through the UI.
    *   **First-Run Trigger:** On the *first* login only, highlight key areas: "Here is your profile," "Here is your dashboard," "Click here to resume."
    *   **Persistent "Help" Widget:** A floating "?" button makes the FAQ always accessible without leaving the page.

**2. Career Paths (Role Guides)**
*   **Why:** Employees don't just want "random courses"; they want a promotion. This aligns training with actual business goals and career progression.
*   **How to Implement:**
    *   **Graph Logic:** Create a "Path" object that links to multiple "Course" objects sequentially.
    *   **Visual Progress Map:** Display a map (e.g., "Junior Dev" -> "Mid-Level Dev"). As courses are finished, the path fills with color.
    *   **Prerequisites:** Admin can define dependencies, e.g., "To unlock Senior Manager path, you must complete Project Management I."

**3. Microlearning & "Chapterization"**
*   **Why:** Attention spans are short. "Microlearning" makes content searchable, digestible, and respectful of the user's time.
*   **How to Implement:**
    *   **Data Structure:** Instead of one long `video_url`, store a list of `chapters` (Start Time, Title).
    *   **UI:** Display "jump points" on the video timeline (like YouTube chapters).
    *   **Deep Search:** Allow users to search for specific terms (e.g., "Excel Pivot Tables") and jump straight to minute 14:05 of a 1-hour course.

**4. LTI 1.3 Integration (LinkedIn Learning & Eloomi)**
*   **Why:** Companies don't want to migrate content manually. Integrating with established libraries like LinkedIn Learning expands the catalog instantly.
*   **How to Implement:**
    *   **LtiResourceLink:** Implement the standard LTI 1.3 flow to launch external tools.
    *   **Content Selection (Deep Linking):** Allow admins to browse LinkedIn/Eloomi catalogs from within the LMS and pick specific courses to import as "Proxy Courses."
    *   **Grade Passback:** Support LTI Assignment and Grade Services (AGS) to sync completion status back to the LMS.

#### Medium Priority

**4. Mobile Offline Mode**
*   **Why:** Essential for frontline workers, commuters, or regions with spotty internet connectivity. Ensures learning can happen anywhere.
*   **How to Implement:**
    *   **Local Persistence:** Use encrypted local storage or IndexDB to save video chunks and PDFs securely on the device.
    *   **Background Sync:** Service workers automatically sync progress and quiz results back to the server once connectivity is restored.
    *   **Download Manager:** A dedicated UI to manage downloaded content and delete old files to save space.

**5. Save for Later (Bookmarks)**
*   **Why:** Users often browse on mobile during breaks but want to study deeply on desktop later.
*   **How to Implement:**
    *   **Database:** A simple `user_bookmarks` table linking `user_id` and `course_id`.
    *   **UI:** A "Ribbon" icon on course cards and a prominent "My List" row on the dashboard (copying Netflix/YouTube UX).

**6. Contextual Q&A**
*   **Why:** General discussion boards become "ghost towns." Tying Q&A to specific content keeps it relevant and timely.
*   **How to Implement:**
    *   **The "Context" Tag:** When a user posts a question, tag it with `Course_ID` AND `Video_Timestamp`.
    *   **Visibility:** Show questions *below* the video player, allowing other learners to see questions asked at that exact moment.

#### Low Priority

**7. Discussion Boards (Course-Level)**
*   **Why:** Peer-to-peer learning reduces the burden on instructors.
*   **How to Implement:**
    *   **Threaded Comments:** Allow nesting to keep conversations organized.
    *   **Endorsements:** Allow Admins/Instructors to "Pin" or "Verify" a correct answer so future learners see it first.

**8. Hidden / Stealth Activities**
*   **Why:** Allows for adaptive learning paths, "Easter eggs," or manager-only resources.
*   **How to Implement:**
    *   **Visibility Flag:** Boolean flag in the database `is_hidden`.
    *   **Access Logic:** Resources do not appear in lists but are accessible via direct URL or conditional logic triggers.

---

### 2. AI Intelligence (The Force Multiplier)
*Focus: Personalization, admin efficiency, and 24/7 learner support.*

#### High Priority

**1. Documents-to-Course "Architect"**
*   **Why:** Reduces course creation time from weeks to minutes. Eliminates the "cold start" problem for content creators.
*   **How to Implement:**
    *   **Ingestion:** Admin uploads a PDF policy document or text file.
    *   **Chunking strategy:** Split text into logical sections.
    *   **LLM Processing:** Pass chunks to the LLM with the prompt: "Summarize this into a script and generate 2 quiz questions based on the facts."

**2. Course Context AI Assistant**
*   **Why:** Learners often need answers that connect dots across the entire course or learning path, not just the current video.
*   **How to Implement:**
    *   **Scope:** Index all assets (Videos, PDFs, Quizzes) within a Learning Path.
    *   **RAG Pipeline:** When a user asks a question, query the full vector store for that course. "How does this relate to the concept in Module 1?"
    *   **UI:** A persistent "Course Buddy" chat sidebar that remembers conversation history across different topics.

**3. On-Demand Content Gen (PPT/Podcast)**
*   **Why:** Different learning modalities and use cases. Some want to listen while commuting (Podcast), others need to present to their team (PPT).
*   **How to Implement:**
    *   **Multi-Modal Transformation:** Pipeline to convert course text/transcripts into specific formats.
    *   **Podcast:** Use high-quality TTS (Text-to-Speech) to generate a "host and guest" conversation summarizing the module.
    *   **One-Pager:** Condense key takeaways into a PDF cheat sheet.
    *   **PPT Deck:** Generate a slide deck so the learner can "teach back" the concept to their team.

**4. Skill Gap Detective**
*   **Why:** Ensures training is relevant. "We have 100 people taking 'Advanced Excel', but our job descriptions ask for 'Python'. We are training for the wrong past."
*   **How to Implement:**
    *   **Semantic Matching:** Use Vector Embeddings to compare course transcripts against industry job descriptions or internal hiring requirements.
    *   **Reporting:** Dashboard showing alignment scores and flagging outdated content.

#### Medium Priority

**4. The "Socratic" Tutor**
*   **Why:** Giving direct answers stops learning. Guiding the user promotes mastery (like Khan Academy's Khanmigo).
*   **How to Implement:**
    *   **System Prompt:** Configure the LLM: "If the user asks for the answer, refuse politely. Instead, explain the underlying concept found in Video 3 at 04:20."
    *   **Hint System:** Provide progressive hints before revealing the full explanation.

**5. Adaptive Assessment Engine**
*   **Why:** Static quizzes are often too hard (demotivating) or too easy (boring). Adaptive difficulty finds the "Zone of Proximal Development."
*   **How to Implement:**
    *   **Dynamic Weighting:** Assign difficulty scores to question banks.
    *   **Real-time Adjustment:** If a user answers 3 hard questions correctly, skip the easy ones. If they struggle, offer remedial questions.
    *   **Item Response Theory (IRT):** Use statistical models to estimate learner ability.

**6. AI Role-Play Simulations**
*   **Why:** Multiple choice cannot test soft skills like empathy, sales negotiation, or leadership.
*   **How to Implement:**
    *   **Voice Interface:** Users speak into the microphone to respond to an AI "Customer" or "Employee."
    *   **Sentiment Analysis:** AI analyzes tone, speed, and keywords.
    *   **Feedback Loop:** "You achieved the goal, but your tone was too aggressive. Try using more empathetic phrasing."

#### Low Priority

**7. Flashcard Generator**
*   **Why:** Quick reinforcement before exams ("I have a test in 10 minutes").
*   **How to Implement:**
    *   **Scan & Generate:** Scan the course transcript and generate 5 rapid-fire flashcards.
    *   **Spaced Repetition:** Schedule reviews based on user performance (SuperMemo algorithm).

---

### 3. Gamification 2.0 (Engagement Engine)
*Focus: Intrinsic motivation using autonomy, mastery, and purpose.*

#### High Priority

**1. The Streak Mechanic & Loss Aversion**
*   **Why:** Leverages "Loss Aversion." Users are more likely to return daily to keep a counter alive than to gain a new reward.
*   **How to Implement:**
    *   **Database:** Track `current_streak` and `last_learning_date`.
    *   **Logic:** On login, check date diff. If 1 day, increment. If >1 day, reset.
    *   **Visuals:** "Fire" icon in the navbar.

**2. The Skill Tree (RPG Progression)**
*   **Why:** Linear lists are boring. Skill trees visualize learning as a non-linear path of progression and mastery.
*   **How to Implement:**
    *   **Branching Visualization:** Nodes represent skills. Users choose "Left Branch" (Technical) or "Right Branch" (Management).
    *   **Unlock Logic:** Dependencies enforce mastery before progression.
    *   **Gold Status:** Allow users to "grind" previous nodes to upgrade them to Gold mastery.

**3. Leaderboard Seasons & Leagues**
*   **Why:** Prevents "Winner takes all" where early adopters dominate forever.
*   **How to Implement:**
    *   **Cyclical Reset:** Scores reset monthly or quarterly.
    *   **Promotion/Relegation:** Top 10% of "Silver League" move to "Gold." Bottom 10% drop. This ensures everyone competes against peers of similar activity levels.

#### Medium Priority

**4. Asynchronous PvP Duels**
*   **Why:** Real-time quizzes are hard to schedule. Async duels allow social competition on users' own time.
*   **How to Implement:**
    *   **Challenge System:** User A challenges User B. User A plays now.
    *   **Notification:** User B gets a push: "You have been challenged!"
    *   **The Reveal:** Winner is shown only when both sides have played.

**5. XP Store & Rewards "Season Pass"**
*   **Why:** Gives tangible value to points, creating a localized economy and retention loop.
*   **How to Implement:**
    *   **Currency:** Earn "Coins" or "XP" for learning.
    *   **Storefront:** Spend coins on "Streak Freezes," "Profile Borders," or real-world "Company Swag."
    *   **Battle Pass UI:** A free track vs. a premium track of rewards to visualize upcoming incentives.

**6. Collaborative Quests / Squad Goals**
*   **Why:** Shifts focus from individual competition to team collaboration ("Relatedness").
*   **How to Implement:**
    *   **Goal Setting:** "If the Sales Team completes 50 modules this week, everyone gets a reward."
    *   **Visual Tracker:** Shared progress bar on the department home page.
    *   **Social Nudge:** "Your team needs 10 more points! Log in to help."

#### Low Priority

**7. Dynamic Avatars & Digital Identity**
*   **Why:** Visual status signaling. Borrowed from RPGs to reflect competency level.
*   **How to Implement:**
    *   **Evolving Assets:** New hires start with "Rookie" avatars. Completing "Safety Training" unlocks a helmet.
    *   **Forum Display:** Avatars appear next to forum posts, signaling expertise.

**8. SME Tags (Subject Matter Expert)**
*   **Why:** Identifies hidden talent and encourages mastery, not just completion.
*   **How to Implement:**
    *   **Threshold:** >95% score on final exams grants a badge.
    *   **Search Index:** Typing "Python Expert" returns users with this tag.

**9. Scavenger Hunt / "The Stash"**
*   **Why:** Combats "banner blindness" and encourages thorough exploration of the platform.
*   **How to Implement:**
    *   **Hidden Objects:** Instructors hide "coins" or "keys" inside text blocks.
    *   **Collection:** Clicking the icon adds it to the user's inventory.

**10. Expiring Certifications**
*   **Why:** Prevents "Learn and Forget." Frames learning as maintenance.
*   **How to Implement:**
    *   **Validity Period:** Metadata on course completion.
    *   **Automated Nudges:** Email alerts: "Your badge is expiring in 7 days."
    *   **Visual Decay:** Badge turns yellow, then red.

---

### 4. Technical & Infrastructure (Scalability)
*Focus: Handling 1000+ concurrent learners on a single EC2 instance.*

#### High Priority

**1. Redis Caching Layer**
*   **Why:** Database CPUS are the bottleneck. caching frequent reads (e.g., "Get Course Details", "User Session") reduces DB load by 90%.
*   **How to Implement:**
    *   **Cache-Aside Pattern:** Check Redis first; if miss, query DB and set Redis.
    *   **Invalidation:** Use "Time-to-Live" (TTL) of 60s for high-traffic pages and event-based invalidation for course updates.

**2. Asynchronous Job Queue (BullMQ)**
*   **Why:** Heavy tasks (generating certificates, sending 1000 emails, transcoding video) block the main Node.js thread, causing UI lag.
*   **How to Implement:**
    *   **Worker Nodes:** specific processes for background tasks.
    *   **Redis-backed:** BullMQ uses Redis to persist jobs. If the app crashes, jobs retry automatically.

**3. CDN Asset Offloading (S3 + CloudFront)**
*   **Why:** Serving static assets (Videos, PDFs, Images) from the EC2 filesystem consumes IOPS and bandwidth, crashing the app under load.
*   **How to Implement:**
    *   **Storage:** Upload all uploads to S3 (or MinIO for self-hosted).
    *   **Delivery:** Serve via CloudFront (CDN) so the EC2 only handles JSON API requests, not heavy file transfers.

#### Medium Priority

**4. Database Connection Pooling (PgBouncer)**
*   **Why:** 1000 concurrent users opening 1000 DB connections will exhaust the Postgres max_connections limit immediately.
*   **How to Implement:**
    *   **Middleware:** Install PgBouncer in front of Postgres.
    *   **Pooling:** It keeps a pool of ~50 warm connections and reuses them for thousands of incoming requests.

**5. Node.js Clustering (PM2)**
*   **Why:** Node.js is single-threaded. By default, it uses only 1 vCPU. On a 4-core EC2, 75% of power is wasted.
*   **How to Implement:**
    *   **Process Manager:** Use PM2 with `pm2 start app.js -i max`.
    *   **Load Balancing:** PM2 automatically distributes incoming HTTP requests across all available CPU cores.
