# Product Roadmap (Updated 2025)

## Feature Summary

| Feature Name | Streams | Priority |
| :--- | :--- | :--- |
| **Redis Caching Layer** | 1 - Infra and Setup | High |
| **Async Job Queue (BullMQ)** | 1 - Infra and Setup | High |
| **CDN Asset Offloading** | 1 - Infra and Setup | High |
| **LMS Backup & Disaster Recovery** | 1 - Infra and Setup | High |
| **Enterprise Licensing Management** | 1 - Infra and Setup | High |
| **Microlearning & "Chapterization"** | 2 - Course Content | High |
| **Mobile Responsiveness (PWA)** | 2 - Course Content | High |
| **Onboarding & Integrated Help Guide** | 3 - Demo | High |
| **Career Paths (Role Guides)** | 4 - User Engagement | High |
| **ILT & VILT Training Management** | 4 - User Engagement | High |
| **Advanced Analytics (Power BI / DataLake)** | 5 - User Analytics | High |
| **Skill Gap Detective** | 5 - User Analytics | High |
| **Competency-Based Certification** | 6 - Gamification | High |
| **The Streak Mechanic & Loss Aversion** | 6 - Gamification | High |
| **The Skill Tree (RPG Progression)** | 6 - Gamification | High |
| **Leaderboard Seasons & Leagues** | 6 - Gamification | High |
| **Documents-to-Course "Architect"** | 7 - Content Automation | High |
| **On-Demand Content Gen (PPT/Podcast)** | 7 - Content Automation | High |
| **AI-Based Course Recommendations** | 8 - AI Intelligence | High |
| **Course Context AI Assistant** | 8 - AI Intelligence | High |
| **LTI 1.3 Integration (LinkedIn/Eloomi)** | 1 - Infra and Setup | Medium |
| **Database Connection Pooling** | 1 - Infra and Setup | Medium |
| **Node.js Clustering (PM2)** | 1 - Infra and Setup | Medium |
| **Offline Mode** | 2 - Course Content | Medium |
| **Manager-Assigned Learning** | 4 - User Engagement | Medium |
| **Social Learning Hub** | 4 - User Engagement | Medium |
| **Save for Later (Bookmarks)** | 4 - User Engagement | Medium |
| **Contextual Q&A** | 4 - User Engagement | Medium |
| **Asynchronous PvP Duels** | 6 - Gamification | Medium |
| **XP Store & Rewards "Season Pass"** | 6 - Gamification | Medium |
| **Squad Goals** | 6 - Gamification | Medium |
| **The "Socratic" Tutor** | 8 - AI Intelligence | Medium |
| **Adaptive Assessment Engine** | 8 - AI Intelligence | Medium |
| **AI Role-Play Simulations** | 8 - AI Intelligence | Medium |
| **LMS Theme & Cleanup** | 1 - Infra and Setup | Low |
| **Hidden / Stealth Activities** | 2 - Course Content | Low |
| **Discussion Boards (Course-Level)** | 4 - User Engagement | Low |
| **Pre/Post Course Surveys** | 4 - User Engagement | Low |
| **SME Tags (Subject Matter Expert)** | 4 - User Engagement | Low |
| **Expiring Certifications** | 4 - User Engagement | Low |
| **Dynamic Avatars & Digital Identity** | 6 - Gamification | Low |
| **Scavenger Hunt / "The Stash"** | 6 - Gamification | Low |
| **Flashcard Generator** | 7 - Content Automation | Low |

## Implemented Features (Current State)

| Feature Name | Streams | Status |
| :--- | :--- | :--- |
| **Authentication & Roles** | 1 - Infra and Setup | ✅ Live (NextAuth, RBAC) |
| **Course Authoring Studio** | 2 - Course Content | ✅ Live (Modules, Topics) |
| **Resource Types** | 2 - Course Content | ✅ Live (Video, PDF, Quiz) |
| **Learning Paths** | 2 - Course Content | ✅ Live (Path Levels & Items) |
| **Course Reviews & Ratings** | 4 - User Engagement | ✅ Live (5-star system) |
| **Content Quality Flags** | 4 - User Engagement | ✅ Live (Bug reporting) |
| **User Progress Tracking** | 5 - User Analytics | ✅ Live (Granular status) |
| **Quizzes & Submissions** | 5 - User Analytics | ✅ Live (JSON-based) |
| **Skills & Job Roles** | 6 - Gamification | ✅ Live (Skill-to-Role mapping) |


---

## Feature Details

### 1 - Infra and Setup
*Focus: Scalability, Reliability, and Integrations.*

**1. Redis Caching Layer (High)**
*   **Why:** Database CPUs are the bottleneck. Caching frequent reads (e.g., "Get Course Details") reduces DB load by 90%.
*   **How to Implement:**
    *   **Cache-Aside Pattern:** Check Redis first; if miss, query DB and set Redis.
    *   **Invalidation:** Use "Time-to-Live" (TTL) of 60s for high-traffic pages and event-based invalidation for course updates.

**2. Async Job Queue (BullMQ) (High)**
*   **Why:** Heavy tasks (generating certificates, emails, video transcoding) block the Node.js thread.
*   **How to Implement:**
    *   **Worker Nodes:** Spin up specific processes for background tasks.
    *   **Redis-backed:** BullMQ uses Redis to persist jobs. If the app crashes, jobs retry automatically.

**3. CDN Asset Offloading (High)**
*   **Why:** Serving static assets from EC2 consumes IOPS.
*   **How to Implement:**
    *   **Storage:** Upload all user uploads to S3 (or MinIO for self-hosted).
    *   **Delivery:** Serve via CloudFront (CDN) so the EC2 only handles JSON API requests, not heavy file transfers.

**4. LMS Backup & Disaster Recovery (High)**
*   **Why:** Data loss prevention is a non-negotiable compliance requirement.
*   **How to Implement:**
    *   **Automated Snapshots:** Cron job to dump Postgres DB to S3 nightly.
    *   **Point-in-Time Recovery:** Enable WAL archiving for granular recovery.

**5. Enterprise Licensing Management (High)**
*   **Why:** Control seat usage and expiration for B2B clients.
*   **How to Implement:**
    *   **License Keys:** Generating encrypted keys tied to domain/seat count.
    *   **Middleware Check:** Validate license validity on login/request.

**6. LTI 1.3 Integration (LinkedIn/Eloomi) (Medium)**
*   **Why:** Instantly expand the catalog with external providers.
*   **How to Implement:**
    *   **LtiResourceLink:** Implement the standard LTI 1.3 flow to launch external tools.
    *   **Content Selection (Deep Linking):** Allow admins to browse LinkedIn/Eloomi catalogs from within the LMS and pick specific courses to import as "Proxy Courses."
    *   **Grade Passback:** Support LTI Assignment and Grade Services (AGS) to sync completion status back to the LMS.

**7. Database Connection Pooling (Medium)**
*   **Why:** Managing DB connections at scale.
*   **How to Implement:**
    *   **Middleware:** Install PgBouncer in front of Postgres.
    *   **Pooling:** It keeps a pool of ~50 warm connections and reuses them for thousands of incoming requests.

**8. Node.js Clustering (PM2) (Medium)**
*   **Why:** Utilize all CPU cores on the single EC2 instance.
*   **How to Implement:**
    *   **Process Manager:** Use PM2 with `pm2 start app.js -i max`.
    *   **Load Balancing:** PM2 automatically distributes incoming HTTP requests across all available CPU cores.

**9. LMS Theme & Cleanup (Low)**
*   **Why:** Brand alignment for different tenants (Whitelabeling).
*   **How to Implement:**
    *   **CSS Variables:** Define global colors/fonts in root CSS that can be injected dynamically.
    *   **Tenant Config:** Store branding assets (Logo, Hex Codes) in the Tenant table.

---

### 2 - Course Content
*Focus: Content formats, delivery, and structure.*

**1. Microlearning & "Chapterization" (High)**
*   **Why:** Attention spans are short. Makes content searchable.
*   **How to Implement:**
    *   **Data Structure:** Instead of one long `video_url`, store a list of `chapters` (Start Time, Title).
    *   **UI:** Display "jump points" on the video timeline (like YouTube chapters).
    *   **Deep Search:** Allow users to search for specific terms (e.g., "Excel Pivot Tables") and jump straight to minute 14:05 of a 1-hour course.

**2. Mobile Responsiveness (PWA) (High)**
*   **Why:** "Easy access on any device." Users expect a native-app-like experience.
*   **How to Implement:**
    *   **Responsive Grid:** Ensure "Bento Grid" collapses to single column on mobile.
    *   **Touch Targets:** Increase button sizes (min 44px).
    *   **PWA Manifest:** Add `manifest.json` for "Add to Home Screen" capability.

**3. Offline Mode (Medium)**
*   **Why:** Learning for frontline workers or commuters.
*   **How to Implement:**
    *   **Local Persistence:** Use encrypted local storage or IndexDB to save video chunks and PDFs securely on the device.
    *   **Background Sync:** Service workers automatically sync progress and quiz results back to the server once connectivity is restored.
    *   **Download Manager:** A dedicated UI to manage downloaded content and delete old files to save space.

**4. Hidden / Stealth Activities (Low)**
*   **Why:** Adaptive paths or Easter eggs.
*   **How to Implement:**
    *   **Visibility Flag:** Boolean flag in the database `is_hidden`.
    *   **Access Logic:** Resources do not appear in lists but are accessible via direct URL or conditional logic triggers.

---

### 3 - Demo
*Focus: Showcasing the platform.*

**1. Onboarding & Integrated Help Guide (High)**
*   **Why:** Reducing friction for first-time users is critical.
*   **How to Implement:**
    *   **Interactive Walkthrough:** Use a library like `intro.js` to guide users through the UI.
    *   **First-Run Trigger:** On the *first* login only, highlight key areas: "Here is your profile," "Here is your dashboard," "Click here to resume."
    *   **Persistent "Help" Widget:** A floating "?" button makes the FAQ always accessible without leaving the page.

---

### 4 - User Engagement
*Focus: Retention and Social Learning.*

**1. Career Paths (Role Guides) (High)**
*   **Why:** Employees want a promotion, not just courses.
*   **How to Implement:**
    *   **Graph Logic:** Create a "Path" object that links to multiple "Course" objects sequentially.
    *   **Visual Progress Map:** Display a map (e.g., "Junior Dev" -> "Mid-Level Dev"). As courses are finished, the path fills with color.
    *   **Prerequisites:** Admin can define dependencies, e.g., "To unlock Senior Manager path, you must complete Project Management I."

**2. ILT & VILT Training Management (High)**
*   **Why:** Blended learning requires managing Zoom links, classroom seats, and attendance alongside digital courses.
*   **How to Implement:**
    *   **Event Entity:** New resource type "Event" with StartTime, Duration, Link/Location.
    *   **Calendar Integration:** Generate `.ics` files for invite.
    *   **Attendance Tracking:** QR code scan or manual instructor check-in.

**3. Manager-Assigned Learning (Medium)**
*   **Why:** Managers need to direct their team's growth directly.
*   **How to Implement:**
    *   **Hierarchy:** `User` has `ManagerID`.
    *   **My Team Dashboard:** View designed for Managers to see direct report progress.
    *   **Assignment Action:** "Assign to Team" button on course card.

**4. Social Learning Hub (Medium)**
*   **Why:** Community discussion drives engagement more than static boards. "Integration with KH Chat."
*   **How to Implement:**
    *   **Global Feed:** A "LinkedIn-style" feed of course completions and insights.
    *   **Course Groups:** dedicated channels for specific cohorts.
    *   **Peer Recommendations:** "Share to Feed" button.

**5. Save for Later (Bookmarks) (Medium)**
*   **Why:** Browse on mobile, study on desktop.
*   **How to Implement:**
    *   **Database:** A simple `user_bookmarks` table linking `user_id` and `course_id`.
    *   **UI:** A "Ribbon" icon on course cards and a prominent "My List" row on the dashboard.

**6. Contextual Q&A (Medium)**
*   **Why:** Discussion boards often fail. Tie Q&A to specific video timestamps.
*   **How to Implement:**
    *   **The "Context" Tag:** When a user posts a question, tag it with `Course_ID` AND `Video_Timestamp`.
    *   **Visibility:** Show questions *below* the video player, allowing other learners to see questions asked at that exact moment.

**7. Pre/Post Course Surveys (Low)**
*   **Why:** Measure training effectiveness (Kirkpatrick Level 1).
*   **How to Implement:**
    *   **Survey Builder:** Form builder for Likert scale feedback.
    *   **Triggers:** "Pre" survey must be completed to unlock Module 1. "Post" survey to unlock Certificate.

**8. SME Tags (Subject Matter Expert) (Low)**
*   **Why:** Identify hidden talent.
*   **How to Implement:**
    *   **Threshold:** >95% score on final exams grants a badge.
    *   **Search Index:** Update search engine so typing "Python Expert" returns users with this tag.

**9. Expiring Certifications (Low)**
*   **Why:** Maintenance learning.
*   **How to Implement:**
    *   **Validity Period:** Metadata on course completion.
    *   **Automated Nudges:** Email alerts: "Your badge is expiring in 7 days."
    *   **Visual Decay:** Badge turns yellow, then red.

---

### 5 - User Analytics
*Focus: Data-driven insights.*

**1. Advanced Analytics (Power BI / DataLake) (High)**
*   **Why:** Enterprise clients need raw data for their own BI tools (ION DataLake).
*   **How to Implement:**
    *   **ETL Pipeline:** Nightly export of anonymized activity logs to partitioned S3 bucket / DataLake.
    *   **Embedded Dashboards:** Embed Power BI / Tableau frames for admin view.

**2. Skill Gap Detective (High)**
*   **Why:** Ensure training matches job requirements.
*   **How to Implement:**
    *   **Semantic Matching:** Use Vector Embeddings to compare course transcripts against industry job descriptions.
    *   **Reporting:** Dashboard showing alignment scores and flagging outdated content.

---

### 6 - Gamification
*Focus: Intrinsic motivation.*

**1. Competency-Based Certification (High)**
*   **Why:** Badges should represent *skill mastery*, not just course completion.
*   **How to Implement:**
    *   **Skill Mapping:** Link multiple courses/quizzes to a single "Competency" (e.g., "Full Stack Developer").
    *   **Rule Engine:** Issue certificate only when *all* related sub-skills are >80%.
    *   **Verifiable Credential:** Generate unique UUID link for the certificate.

**2. The Streak Mechanic (High)**
*   **Why:** Loss aversion drives daily login.
*   **How to Implement:**
    *   **Database:** Track `current_streak` and `last_learning_date`.
    *   **Logic:** On login, check date diff. If 1 day, increment. If >1 day, reset.
    *   **Visuals:** "Fire" icon in the navbar.

**3. The Skill Tree (High)**
*   **Why:** Visual non-linear progression.
*   **How to Implement:**
    *   **Branching Visualization:** Nodes represent skills. Users choose "Left Branch" (Technical) or "Right Branch" (Management).
    *   **Unlock Logic:** Dependencies enforce mastery before progression.
    *   **Gold Status:** Allow users to "grind" previous nodes to upgrade them to Gold mastery.

**4. Leaderboard Seasons (High)**
*   **Why:** Prevents "Winner takes all."
*   **How to Implement:**
    *   **Cyclical Reset:** Scores reset monthly or quarterly.
    *   **Promotion/Relegation:** Top 10% of "Silver League" move to "Gold." Bottom 10% drop.

**5. Asynchronous PvP Duels (Medium)**
*   **Why:** Social competition on own time.
*   **How to Implement:**
    *   **Challenge System:** User A challenges User B. User A plays now.
    *   **Notification:** User B gets a push: "You have been challenged!"
    *   **The Reveal:** Winner is shown only when both sides have played.

**6. XP Store & Rewards (Medium)**
*   **Why:** Tangible value for points.
*   **How to Implement:**
    *   **Currency:** Earn "Coins" or "XP" for learning.
    *   **Storefront:** Spend coins on "Streak Freezes," "Profile Borders," or real-world "Company Swag."

**7. Squad Goals (Medium)**
*   **Why:** Team collaboration.
*   **How to Implement:**
    *   **Goal Setting:** "If the Sales Team completes 50 modules this week, everyone gets a reward."
    *   **Visual Tracker:** Shared progress bar on the department home page.

**8. Dynamic Avatars (Low)**
*   **Why:** Visual status signaling.
*   **How to Implement:**
    *   **Evolving Assets:** New hires start with "Rookie" avatars. Completing "Safety Training" unlocks a helmet.

**9. Scavenger Hunt (Low)**
*   **Why:** Encourages exploration.
*   **How to Implement:**
    *   **Hidden Objects:** Instructors hide "coins" or "keys" inside text blocks.
    *   **Collection:** Clicking the icon adds it to the user's inventory.

---

### 7 - Content Automation
*Focus: Speed of creation.*

**1. Documents-to-Course "Architect" (High)**
*   **Why:** Eliminates "cold start" problem.
*   **How to Implement:**
    *   **Ingestion:** Admin uploads a PDF policy document or text file.
    *   **Chunking strategy:** Split text into logical sections.
    *   **LLM Processing:** Pass chunks to the LLM with the prompt: "Summarize this into a script and generate 2 quiz questions based on the facts."

**2. On-Demand Content Gen (High)**
*   **Why:** Multi-modal learning (Commute vs. Presentation).
*   **How to Implement:**
    *   **Multi-Modal Transformation:** Pipeline to convert course text/transcripts into specific formats.
    *   **Podcast:** Use high-quality TTS (Text-to-Speech) to generate a "host and guest" conversation.
    *   **One-Pager:** Condense key takeaways into a PDF cheat sheet.
    *   **PPT Deck:** Generate a slide deck so the learner can "teach back" the concept to their team.
    *   **Video Gen:** Use AI avatars (e.g., HeyGen API) to speak the scripts.

**3. Flashcard Generator (Low)**
*   **Why:** Quick reinforcement.
*   **How to Implement:**
    *   **Scan & Generate:** Scan the course transcript and generate 5 rapid-fire flashcards.
    *   **Spaced Repetition:** Schedule reviews based on user performance (SuperMemo algorithm).

---

### 8 - AI Intelligence
*Focus: 24/7 Support and Personalization.*

**1. AI-Based Course Recommendations (High)**
*   **Why:** "Learner Course Demand Management." Users don't know what they don't know.
*   **How to Implement:**
    *   **Collaborative Filtering:** "Users who took Excel also took Data Science."
    *   **Content Filtering:** Recommend courses matching the user's "Skill Tags."

**2. Course Context AI Assistant (High)**
*   **Why:** Connect dots across the entire path.
*   **How to Implement:**
    *   **Scope:** Index all assets (Videos, PDFs, Quizzes) within a Learning Path.
    *   **RAG Pipeline:** When a user asks a question, query the full vector store for that course. "How does this relate to the concept in Module 1?"
    *   **UI:** A persistent "Course Buddy" chat sidebar that remembers conversation history across different topics.

**3. The "Socratic" Tutor (Medium)**
*   **Why:** Promotes mastery, not just answers.
*   **How to Implement:**
    *   **System Prompt:** Configure the LLM: "If the user asks for the answer, refuse politely. Instead, explain the underlying concept found in Video 3 at 04:20."
    *   **Hint System:** Provide progressive hints before revealing the full explanation.

**4. Adaptive Assessment Engine (Medium)**
*   **Why:** Finds "Zone of Proximal Development."
*   **How to Implement:**
    *   **Dynamic Weighting:** Assign difficulty scores to question banks.
    *   **Real-time Adjustment:** If a user answers 3 hard questions correctly, skip the easy ones. If they struggle, offer remedial questions.
    *   **Item Response Theory (IRT):** Use statistical models to estimate learner ability.

**5. AI Role-Play Simulations (Medium)**
*   **Why:** Test soft skills (empathy, sales).
*   **How to Implement:**
    *   **Voice Interface:** Users speak into the microphone to respond to an AI "Customer" or "Employee."
    *   **Sentiment Analysis:** AI analyzes tone, speed, and keywords.
    *   **Feedback Loop:** "You achieved the goal, but your tone was too aggressive. Try using more empathetic phrasing."
