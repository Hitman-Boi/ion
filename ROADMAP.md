# Roadmap

## Core Features

### Features

#### [ ] 1. Hidden Activities
Stealth activities capability - some resources and activities are hidden from the main course page but accessible through direct links and conditional navigation

#### [ ] 2. 

## Gamification 2.0

### Needs
Three core psychological needs:
- Autonomy (control over one's path)
- Competence (feeling of mastery)
- Relatedness (social connection)

Examples such as "Squad Battles" satisfy Relatedness; "Skill Trees" satisfy Autonomy; "Knowledge Duels" satisfy Competence.

### Features

#### [ ] 1. Learning Streaks
Why (The Hook): Leverages "Loss Aversion." Users are more likely to return daily to keep a counter alive than they are to gain a new reward.

How to Implement:

Database: Add current_streak (integer) and last_learning_date (timestamp) to the User table.

Logic: Run a check on login. If today - last_learning_date = 1 day, increment streak. If > 1 day, reset to 0.

UI: Display a "Fire" icon with the count next to the user's profile picture in the navbar.

#### [ ] 2. Department Leaderboards
Why (Social Pressure): Shifts competition from "Me vs. You" (which scares low performers) to "Sales vs. Engineering" (which builds team spirit).

How to Implement:

Data Aggregation: Calculate the Average points per active user per department (to be fair to smaller teams).

Query: SELECT department_id, AVG(user_points) FROM users GROUP BY department_id.

UI: A simple bar chart widget on the homepage showing the top 3 departments.

#### [ ] 3. LinkedIn-Ready "Verified" Certificates
Why (Career Growth): Users are motivated by public recognition. This also serves as free marketing for your company when employees share their achievements.

How to Implement:

Certificate Engine: When a course is 100% complete, generate a unique permalink (e.g., antigravity.com/cert/verify/12345).

Open Graph Tags: Configure the public page with Open Graph metadata so it generates a rich preview image when the link is pasted into LinkedIn.

Action: Add a "Add to Profile" button that uses LinkedIn’s standard URL sharing parameters.

#### [ ] 4. Subject Matter Expert (SME) Tags
Why (Internal Status): Identifies hidden talent within the company and encourages mastery, not just completion.

How to Implement:

Threshold Logic: Define a "Mastery Score" (e.g., >95% on the final exam).

Profile Decoration: If the user hits the score, append a specific badge icon/text (e.g., "Python SME") to their user profile card in the directory.

Search Indexing: Update the search engine so typing "Python Expert" returns these specific users.

#### [ ] 5. "Expiring" Certifications (Skill Decay)
Why (Maintenance): Prevents the "Learn and Forget" problem. It frames learning as "maintenance" rather than "homework."

How to Implement:

Metadata: Add a validity_period (in days) to specific Compliance or Technical courses.

Cron Job: Run a nightly script: IF (completion_date + validity_period) < (today + 7 days) THEN send_email_alert("Your badge is expiring").

Visuals: Change the badge color from Green to Yellow (Warning) to Red (Expired) on the dashboard.

#### [ ] 6. The "FIFA" Influence: Leaderboard Seasons, Leagues, and Relegation

A critical flaw in static leaderboards is the "winner takes all" phenomenon, where early adopters accrue insurmountable leads. Advanced gamification borrows the "Season" mechanic from sports video games like EA Sports FC (formerly FIFA).   

- Cyclical Reset: Instead of a permanent score, the competition runs in cycles (e.g., monthly or quarterly seasons). At the end of a season, points reset, and trophies are awarded. This ensures that a new hire joining in Q3 has a fair shot at winning the Q3 title, maintaining motivation for latecomers.

- Tiered Leagues: Squads operate in tiered leagues (e.g., Bronze, Silver, Gold, Premier). The top two teams in the Silver League are promoted to Gold at the end of the season, while the bottom two in Gold are relegated. This ensures that teams are always competing against peers of similar skill levels, maintaining the "Flow State"—the zone where challenge matches skill.

#### [ ] 7. Asynchronous Player-vs-Player (PvP)

Real-time quizzes (like Kahoot!) are logistically difficult in global, distributed corporations. The solution is the asynchronous duel, similar to mechanics found in popular mobile trivia games.

- The Challenge: Learner A challenges Learner B to a "Product Knowledge Duel." Learner A answers a set of 5 rapid-fire questions. Their score is recorded but hidden.

- The Response: Learner B receives a push notification: "You have been challenged by [Name]!" They play the same 5 questions at their convenience.

- The Reveal: Once both sides have played, the winner is revealed. The system calculates the point differential and awards victory badges or currency.

- Algorithmic Matchmaking: The LMS can automatically trigger duels to reinforce learning. If the system detects that two learners have similar knowledge gaps in "Cybersecurity," it can auto-generate a duel between them, forcing a review of the material under the guise of competition.

#### [ ] 8. The "Stash" and Scavenger Hunt Mechanic
One of the most distinct features found in the open-source Moodle ecosystem is the "Stash" plugin. In a traditional LMS, a course is a linear list of links. With Stash, the course becomes a treasure map.

- Hidden Objects: Instructors can hide virtual items (e.g., "The Key of Knowledge," "The Safety Goggles," "The CEO's Coin") inside activities, blocks, or even specific text passages within a lesson.

- Collection: When a learner reads a policy document carefully, they might find a small, unobtrusive icon. Clicking it adds the item to their "Inventory" or "Backpack".   

- Gating: Advanced courses or rewards can be locked not by "prerequisites" but by items. "You cannot enter the 'Advanced Leadership' module until you have collected the 'Sword of Truth' from the Ethics course and the 'Shield of Empathy' from the HR course."

- Encouraging Exploration: This mechanic creates a compelling reason for learners to explore the LMS interface thoroughly, combating "banner blindness" and superficial skimming. They read the text because they are looking for the hidden item.   

#### [ ] 9. Digital Escape Rooms and Non-Linear Logic
Storytelling is a powerful mnemonic device. LMS platforms are increasingly integrating "Digital Escape Room" concepts.

Instead of a linear "Next" button, the learner is presented with a scenario: "You are locked in the server room and a cyber-attack is imminent."

- Puzzles as Assessments: To "escape" (i.e., complete the module), the learner must input a 4-digit code. The code is derived from answering questions correctly about cybersecurity protocols found in various resources.

- Non-Linear Navigation: The learner must jump between different resources—reading a PDF to get the first digit, watching a video for the second, and checking the glossary for the third. This replicates real-world problem solving (searching for information) rather than rote memorization.

- Implementation: In platforms like Canvas or Moodle, this is achieved by setting strict "completion dependencies" and password-protecting quizzes where the password is the answer to the previous puzzle.   

#### [ ] 10. Identity, Avatars, and The "Virtual Pet"
Personalization is key to engagement. Standard LMS profiles are static photos. Advanced gamification introduces Dynamic Identities that evolve with the learner.

5.1 Evolving Avatars and Visual Status
Borrowed from RPGs (Role Playing Games), the Evolving Avatar reflects the learner's competency level visually.   

The Novice: A new hire starts with a basic, unequipped avatar (e.g., a "Rookie" character in a plain uniform).

Gear Acquisition: As they complete specific modules, they unlock thematic gear.

Completing "Safety Training": Unlocks a Helmet.

Completing "Communication Skills": Unlocks a Radio.

Completing "Leadership 101": Unlocks a Captain's Badge.

Social Signaling: A fully trained employee has an avatar that looks visually distinct (e.g., a "Commander" with full gear). When they post in the LMS discussion forum, this avatar appears next to their name, instantly signaling their expertise level to peers. This replaces the static "Job Title" with a dynamic "Knowledge Title".   

Technological Evolution: Platforms like Guildhawk are pushing this further with AI-driven digital humans that act as multilingual avatars, serving as both the learner's representation and their guide.   

5.2 The "Virtual Pet" (Tamagotchi Effect)
A fascinating niche in gamification is the Care-Taking Mechanic, which taps into the psychological need to nurture.

The Concept: The LMS assigns a "Virtual Pet," "Digital Tree," or "Growing City" to the learner (or team).   

The Loop: The pet needs "food" to survive. The only way to get food is to log in and complete a daily micro-learning activity.

Consequence: If the learner ignores the LMS for a week, the pet becomes "sick," the tree withers, or the city buildings degrade. If they maintain a streak, the pet evolves or the tree bears fruit.

Application: This is incredibly effective for Compliance Training or Daily Reinforcement (e.g., safety refreshers). It shifts the motivation from "I have to do this for HR" to "I need to keep my pet alive." This mechanic has been successfully popularized by consumer apps like Habitica and Forest and is now entering the corporate space via custom LMS plugins.   

#### [ ] 11. The Streak Mechanic
Popularized by language learning apps like Duolingo, the "Streak" is now a viable and powerful LMS feature.   

- Daily Active Usage: The system tracks consecutive days of login or learning activity.

- The Badge of Honor: A "100-Day Streak" becomes a status symbol, displayed prominently on the user's profile.

- Streak Freeze: To prevent demotivation from a legitimate break (e.g., a weekend or sick day), the system offers "Streak Freezes" as a purchasable item in the Reward Shop. This creates a closed economic loop: Learn -> Earn Coins -> Buy Freeze -> Protect Streak -> Keep Learning. This turns the virtual economy into a mechanism for retention.   

#### [ ] 12. Algorithmic Nudges
Using AI and predictive analytics, the LMS can deliver "Nudges" that feel like game notifications rather than administrative spam.   

Contextual Triggers: Instead of a generic "Please complete training," the system sends specific, data-driven prompts:

- "User B just passed you on the leaderboard! Complete this 5-minute module to reclaim your spot."

- "Your Streak is at risk! Log in within 2 hours to save it."

- "Your Squad needs 500 points to capture the 'Sales Zone'. Your contribution will tip the scale."

Success Factors: Research suggests that highlighting streaks and social comparisons in these nudges can significantly boost engagement, as they trigger the "Fear of Missing Out" (FOMO) and competitive instincts.   

#### [ ] 13. The Skill Tree (RPG Progression)
Linear lists of courses are visually uninspiring. The Skill Tree visualizes learning as a non-linear path of progression, similar to the talent trees found in games like World of Warcraft or Final Fantasy.   

- Visualization: A branching map where "nodes" represent skills or competencies.

- Prerequisites: You cannot unlock the "Advanced Negotiation" node until you have mastered the "Active Listening" node.

- Choice (Autonomy): The learner can choose their path. "Do I want to specialize in 'Technical Sales' (Left Branch) or 'Relationship Management' (Right Branch)?"

- Mastery Levels: Nodes can have levels (Bronze, Silver, Gold). A learner can choose to move forward to new nodes or "grind" previous nodes (by doing advanced simulations) to upgrade them to Gold mastery. This appeals to the "Achiever" player type who wants to 100% complete the game.   

