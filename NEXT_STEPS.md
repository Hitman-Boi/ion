Terminology for roles on the platform:
* **Learner:** Employees seeking career advancement and skill acquisition.
* **Enterprise Admin (HR/L&D):** Managers responsible for workforce planning, license optimization, and assigning training.

Terminology for roles in a course:
* **Learner:** Employees seeking career advancement and skill acquisition.
* **Admin:** Managers responsible for workforce planning, license optimization, and assigning training.
* **Instructor:** Internal experts creating proprietary content.


Summary of Next Steps:
1. Video player (currently using Mux player)
2. SCORM Player
3. PDF Viewer
4. File Uploads
5. Student Dashboard (Learner View)
6. Admin Dashboard
7. General File Uploads (for PDFs/Docs)
8. Implement LTI 1.3 integration endpoints.
9. Studio Features: Add Drag-and-Drop (DnD Kit) to the Sidebar and integrate the TipTap editor.




2. SCORM Support: The legacy app had a SCORMPlayer.tsx component. This is currently missing in the new BlockRenderer.
3. PDF Viewer: The legacy app had a PDFViewer.tsx. The new app currently only supports Video, HTML, and basic Assessments.
4. File Uploads: The legacy app had a UnitUploader.tsx and api/upload endpoints for general file management. The new app relies on Mux for video but lacks a general file uploader for other assets.

### Module A: Career Mobility & Role Guides
* **Feature:** **Role Path Visualization**
    * **Description:** A visual, interactive node map showing the progression from one job role to another.
    * **Requirement:** Users can select a "Target Role" (e.g., Product Manager). The system generates a linear path of required courses and milestones needed to qualify for that role.

### Module B: Workforce Intelligence (Skill Gaps)
* **Feature:** **Skill Heatmap Dashboard**
    * **Description:** A data visualization tool for HR to compare "Skill Supply" vs. "Skill Demand."
    * **Requirement:**
        * **Input:** Admin defines targets (e.g., "Need 50 Data Scientists").
        * **Tracking:** System counts active learners in Python/Data Science tracks.
        * **Visual Output:** A Color-coded Grid (Red/Amber/Green). Red indicates a severe deficit (e.g., "Need 50, Have 10").

### Module C: Content Blending & Management
* **Feature:** **Hybrid Playlists (Custom Learning Paths)**
    * **Description:** The ability to sequence heterogeneous content types into a single course stream.
    * **Requirement:** Admins must be able to create a "Course" that sequences items in this order:
        1.  Platform Video (Generic content).
        2.  Custom Upload (Proprietary PDF/Video).
        3.  Platform Quiz.
* **Feature:** **Proprietary Content Upload**
    * **Description:** Upload mechanism for internal company assets.
    * **Supported Formats:** PDF, MP4.
    * **Constraint:** **View-Only Mode.** Users may view/stream these assets but **cannot download** the original files to their local machine.

### Module D: Admin & Analytics Suite
* **Feature:** **Industry Benchmarking**
    * **Description:** Comparative analytics against anonymized industry data.
    * **Requirement:** Display a graph comparing "Average Learning Hours per Employee" of the current organization vs. the Industry Average. Trigger alerts if the organization falls below the 25th percentile.

### Module E: AI & Active Practice
* **Feature:** **AI Contextual Coach**
    * **Description:** A chatbot sidebar embedded in the video player interface.
    * **Capabilities:**
        * "Summarize this video."
        * "How does this concept apply to [User's Job Title]?"
    * **Technical Note:** Must run inference on the video transcript text.
* **Feature:** **In-Browser Coding Sandboxes**
    * **Description:** Integrated IDE for technical practice.
    * **Requirement:** Launch ephemeral Docker containers that allow users to compile and run code (Python/Java/JS) directly in the browser without local installation.

