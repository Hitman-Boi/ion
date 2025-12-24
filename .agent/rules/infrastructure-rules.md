---
trigger: always_on
---

## Technical Constraints & Architecture

* **Infrastructure:**
    * **No AWS dependencies.** The system must be cloud-agnostic.
    * **Storage:** All assets (videos, PDFs) must be stored using **Local Storage** managed via **Docker Volumes**.
    * **Deployment:** The entire stack must be deployable via `docker-compose`.

* **Security & Compliance:**
    * **DRM/Content Protection:** Videos and PDFs must be served via secure streams/blob URLs to prevent direct downloading by students.
    * **External Links:** All external resources must open in a `target="_blank"` (new tab) attribute to keep the user inside the LMS environment.
