# DialyCare / Dad Dialysis Tracker  
## Professional Product Workflow, MVP Screens, Feature Roadmap & Market Reference Notes

**Prepared for:** Nitesh Sukalikar  
**Product type:** Mobile-first local/offline dialysis record tracker  
**Current goal:** Personal use for tracking father’s dialysis records  
**Future goal:** Expand into a simple dialysis-care tool for local patients or clinics  
**Version:** 1.0

---

## 1. Executive Summary

DialyCare is a mobile-first dialysis tracking application designed to solve a very specific real-world problem:

> Paper dialysis booklets are hard to manage, hard to search, hard to summarize, and easy to lose.

The app should initially focus on helping one caregiver track one dialysis patient clearly and consistently. It should not start as a hospital platform, clinic SaaS, or full health management product.

The first version should be:

- No login
- No backend
- No complex architecture
- Mobile/tablet-first
- Local device storage
- Fast entry after each dialysis session
- Simple backup/export/import
- Document upload for booklet photos, prescriptions, and reports

The core product value is:

> “Track every dialysis session, weight change, BP reading, UF removed, dialyzer usage, medicines, and reports in one clean digital place.”

---

## 2. Internet / Market Review

Yes, similar applications and concepts already exist, but most of them are either too broad, too generic, cloud-based, or not designed around the exact dialysis booklet workflow you showed.

### 2.1 Existing Similar Products / References

| Product / Reference | What It Does | Useful Reference Feature | Gap You Can Improve |
|---|---|---|---|
| CareClinic | General health tracker for symptoms, vitals, medications, documents, reminders, trends, caregiver/dependent support | Medication tracker, vitals, documents, charts, reminders, caregiver support | Too broad; not dialysis-booklet-first |
| Water Wizz | Fluid, BP, and dialysis log for kidney-care patients | Fluid intake, urine output, dialysis session tracker, BP diary, dashboards, cloud storage | Has dialysis tracking, but your version can be simpler, offline, and booklet-based |
| Dialyze – Kidney Health Tracker | Hemodialysis/CKD app concept with logging, labs, meds, AI assistant, reports | Dialysis logging, UF goal, injections, complications, labs, AI assistant | More advanced and broad; your MVP should be simpler and family-caregiver focused |
| Dialysis Calc / Pebble concept | Watch app for fluid removal metrics | Pre-weight, dry weight, UF goal, actual removal, variance, treatment history | Very focused utility; good inspiration for fast calculation UX |
| Apple Health / Google Fit style apps | Track vitals and health metrics | Clean dashboards, trends, health measurements | Not specialized for dialysis care |
| Paper dialysis booklet | Existing manual tracking method | Date, pre/post BP, pre/post weight, UF removed, remarks | Hard to search, summarize, backup, share, or analyze |

### 2.2 Market Observation

Most health apps are designed around general health tracking. Your opportunity is narrower and more practical:

> A digital replacement for the dialysis booklet, built for caregivers.

This gives you a stronger niche than “health app.”

---

## 3. Why This App Is Needed

Dialysis patients and caregivers need to repeatedly track:

- Pre-HD weight
- Post-HD weight
- Weight gain/loss
- Pre-HD BP
- Post-HD BP
- UF removed
- Dry weight
- Dialyzer type
- Dialyzer usage count
- Dialyzer change date
- Medicines
- Remarks
- Reports
- Prescriptions
- Doctor notes
- Dialysis frequency

A physical booklet works for recording, but fails for:

- Searching history
- Viewing monthly trends
- Finding abnormal patterns
- Sharing with doctors
- Tracking dialyzer reuse count
- Backing up records
- Generating summaries
- Comparing weight/BP across sessions

---

## 4. Product Positioning

### Product Name Options

1. **DialyCare**  
   Tagline: *Every dialysis session. One place.*

2. **KidneyBook**  
   Tagline: *Your dialysis booklet, now digital.*

3. **RenalTrack**  
   Tagline: *Track dialysis. Understand trends.*

4. **Dad Dialysis Tracker**  
   Tagline: *Built for one father. Useful for many families.*

### Recommended Name

**DialyCare**

Reason:

- Professional
- Simple
- Expandable
- Works for personal and clinic use later
- Does not sound childish or too medical-heavy

---

## 5. Core User Persona

### Primary User

**Caregiver / Family Member**

Example:

- Son/daughter managing father’s dialysis
- Wants quick record entry
- Wants to avoid losing paper data
- Wants to show history to doctor
- Wants no complicated login or setup

### Secondary User

**Dialysis Patient**

Example:

- 50+ age group
- May not be highly tech-savvy
- Needs large text and simple UI

### Future User

**Local Clinic / Dialysis Center**

Example:

- Staff managing multiple patients
- Needs patient-wise session logs
- Needs reporting and export

---

## 6. MVP Product Strategy

### MVP Rule

Do not build a complete health platform.

Build only this:

> “A beautiful digital dialysis booklet.”

### MVP Should Include

1. Patient profile
2. Dialysis session tracker
3. Dialyzer usage tracker
4. Medicine tracker
5. Document upload
6. Session history
7. Basic charts
8. Export/import backup

### MVP Should Not Include Initially

- Login
- Payment
- Doctor portal
- Clinic dashboard
- AI diagnosis
- Cloud sync
- WhatsApp integration
- Multi-tenant architecture
- Hospital admin module
- Insurance module
- Complex analytics
- Native mobile app

---

## 7. Recommended MVP Architecture

### Approach

Mobile-first Progressive Web App.

```text
Mobile / Tablet Browser
        ↓
PWA Web Application
        ↓
IndexedDB / Dexie.js
        ↓
Local Device Storage
```

### Recommended Stack

| Layer | Tool |
|---|---|
| UI | React / Next.js |
| Styling | Tailwind CSS |
| Components | ShadCN UI |
| Local Database | IndexedDB |
| IndexedDB Wrapper | Dexie.js |
| Charts | Recharts |
| PWA Support | next-pwa or Vite PWA |
| PDF Export | jsPDF / pdfmake |
| File Handling | Browser File API |

### Why This Architecture

- No backend cost
- No auth complexity
- Works on phone/tablet
- Can be installed like app
- Fast for personal use
- Easy to backup/export

---

## 8. Important Brutal Fact About Local Storage

If there is no backend and no login:

### Benefits

- Very low cost
- Private
- Fast
- Simple
- No server required
- Can work offline

### Risks

- Data stays only on that device
- If browser data is cleared, records may be lost
- Data will not automatically sync across devices
- If phone is lost, data is lost unless exported
- Documents/photos may take device storage

### Mandatory MVP Safety Feature

Add from day one:

- Export backup as JSON
- Import backup from JSON
- Export monthly PDF summary
- Optional manual backup reminder

---

## 9. MVP Screens

---

# Screen 1: Welcome / Patient Setup

## Purpose

Set up the patient once.

## Fields

```text
Patient Name
UHID
Age
Gender
Hospital
Consultant
Dialyzer Type
Dry Weight
Dialysis Frequency
Emergency Contact
```

## UI Direction

- Large form fields
- Step-by-step
- “Save Patient” button
- No login screen

## Success Criteria

User can complete setup in under 2 minutes.

---

# Screen 2: Home Dashboard

## Purpose

Show the most important current health and dialysis summary.

## Sections

### Patient Header

```text
Good Morning, Nitesh 👋
Nitinkumar Sukalikar
Last dialysis: 22 Jun 2026
```

### Key Cards

```text
Current Weight
58.5 kg

Dry Weight
57.0 kg

Difference
+1.5 kg
```

```text
Current Dialyzer
F8HPS

Usage
7 / 12
```

```text
Next Dialysis
Tomorrow
9:00 AM
```

### Quick Actions

```text
+ Add Session
+ Add Report
+ Add Medicine
+ Export Backup
```

## UI Direction

- Card-based
- White background
- Blue/green highlights
- Large numbers
- Clear visual hierarchy

---

# Screen 3: Add Dialysis Session

## Purpose

Fast entry after every dialysis session.

## Required Fields

```text
Date
Session Time
Pre-HD Weight
Post-HD Weight
Pre-HD BP
Post-HD BP
UF Removed
Dialyzer Used
Dialyzer Usage Number
Remarks
```

## Optional Fields

```text
Hospital
Doctor
Complications
Injections Given
Medicine Changes
Machine Notes
```

## Smart Calculations

```text
Weight Loss = Pre-HD Weight - Post-HD Weight
Weight Gain vs Dry Weight = Pre-HD Weight - Dry Weight
Dialyzer Usage Count = Previous Count + 1
```

## UI Direction

- Use large numeric inputs
- Auto-calculate weight loss
- Auto-increment dialyzer usage
- Save button fixed at bottom
- Must be usable with one hand on mobile

## Success Criteria

Session entry should take less than 30 seconds.

---

# Screen 4: Session History

## Purpose

View all past dialysis entries.

## Filters

```text
This Week
This Month
Last 3 Months
Custom Date
```

## Session Card Example

```text
22 Jun 2026

Weight
62.4 → 58.5 kg

UF Removed
3.9 L

BP
160/90 → 130/80

Dialyzer
F8HPS - Use #7

Remark
Stable
```

## UI Direction

- Timeline-style cards
- Color-coded status
- Tap card to open full details
- Monthly grouping

---

# Screen 5: Dialyzer Tracker

## Purpose

Never forget when the dialyzer was changed and how many times it was used.

## Fields

```text
Dialyzer Name
Started On
Current Usage Count
Maximum Allowed Usage
Last Used Date
Status
```

## Example

```text
Current Dialyzer: F8HPS
Started: 01 Jun 2026
Usage: 7 / 12
Status: Active
```

## Alerts

```text
10 / 12 uses: Warning
12 / 12 uses: Change recommended
```

## Future Addition

Photo of dialyzer label.

---

# Screen 6: Medicines

## Purpose

Track dialysis-related medicines.

## Fields

```text
Medicine Name
Dosage
Frequency
Timing
Start Date
End Date
Instructions
Doctor Notes
```

## Example

```text
Calcium Tablet
500 mg
Morning + Night
After food
```

## MVP Feature

Simple list only.

## Future Feature

Reminders and adherence tracking.

---

# Screen 7: Reports & Documents

## Purpose

Store booklet images, prescriptions, and reports.

## Categories

```text
Dialysis Booklet
Prescription
Blood Report
KFT
CBC
Hospital Report
Bills
Other
```

## Upload Types

```text
Photo
PDF
Image
```

## Metadata

```text
Report Name
Date
Category
Notes
```

## Future Feature

OCR extraction from reports and booklet pages.

---

# Screen 8: Analytics / Trends

## Purpose

Help caregiver and doctor understand health patterns quickly.

## MVP Charts

1. Pre-HD weight trend
2. Post-HD weight trend
3. UF removed trend
4. Pre-HD BP trend
5. Post-HD BP trend

## Useful Summary Cards

```text
Average UF Removed
Average Pre-HD BP
Average Post-HD BP
Average Weight Gain
Highest UF Removed
Lowest Post-HD BP
```

## UI Direction

Charts should be simple, not overloaded.

---

# Screen 9: Backup & Export

## Purpose

Protect data and make it shareable.

## Features

```text
Export Full Backup JSON
Import Backup JSON
Export Monthly PDF
Export Doctor Summary PDF
```

## PDF Should Include

```text
Patient Info
Dialysis Summary
Session Table
BP Trend
Weight Trend
Dialyzer Usage
Medicine List
Report Index
```

---

## 10. Workflow Explanation

### Workflow 1: First-Time Setup

```text
Open App
↓
Add Patient Basic Details
↓
Add Dry Weight & Dialysis Frequency
↓
Add Current Dialyzer Details
↓
Upload Existing Booklet Photos
↓
Start Tracking
```

### Workflow 2: Add New Dialysis Session

```text
Tap Add Session
↓
Enter Pre/Post Weight
↓
Enter Pre/Post BP
↓
Enter UF Removed
↓
Confirm Dialyzer Usage
↓
Add Remarks
↓
Save Session
↓
Dashboard Updates Automatically
```

### Workflow 3: Track Dialyzer

```text
Add Current Dialyzer
↓
Set Max Usage Count
↓
Every Dialysis Session Adds +1 Usage
↓
Show Warning Near Limit
↓
Change Dialyzer
↓
Archive Old Dialyzer History
```

### Workflow 4: Upload Existing Records

```text
Open Reports
↓
Choose Category: Dialysis Booklet
↓
Upload Photo/PDF
↓
Add Date / Notes
↓
Save Locally
```

### Workflow 5: Share With Doctor

```text
Open Export
↓
Select Date Range
↓
Generate PDF Summary
↓
Share PDF via WhatsApp / Email / Print
```

---

## 11. Data Model for MVP

### Patient

```json
{
  "id": "patient_001",
  "name": "Nitinkumar Sukalikar",
  "uhid": "ANM10000554002",
  "age": 62,
  "gender": "Male",
  "hospital": "Apollo Hospitals",
  "consultant": "Dr. Ravindra Nikalje",
  "dryWeight": 57.0,
  "dialysisFrequency": "3 times per week"
}
```

### Dialysis Session

```json
{
  "id": "session_001",
  "date": "2026-06-22",
  "preWeight": 62.4,
  "postWeight": 58.5,
  "preBpSystolic": 160,
  "preBpDiastolic": 90,
  "postBpSystolic": 130,
  "postBpDiastolic": 80,
  "ufRemoved": 3.9,
  "dialyzerId": "dialyzer_001",
  "dialyzerUseNumber": 7,
  "remarks": "Stable"
}
```

### Dialyzer

```json
{
  "id": "dialyzer_001",
  "name": "F8HPS",
  "startedOn": "2026-06-01",
  "maxUsage": 12,
  "currentUsage": 7,
  "status": "Active"
}
```

### Medicine

```json
{
  "id": "medicine_001",
  "name": "Calcium Tablet",
  "dose": "500mg",
  "frequency": "Morning + Night",
  "instructions": "After food",
  "startDate": "2026-06-01"
}
```

### Document

```json
{
  "id": "doc_001",
  "title": "June Dialysis Booklet",
  "category": "Dialysis Booklet",
  "fileType": "image",
  "date": "2026-06-22",
  "notes": "Booklet page uploaded"
}
```

---

## 12. Branding Scheme

### Visual Direction

The app should feel:

- Calm
- Clean
- Medical but not hospital-like
- Elderly-friendly
- Premium but simple
- Personal and trustworthy

### Avoid

- Too many gradients
- Neon colors
- Heavy animations
- Dark UI as default
- Tiny text
- Too many icons
- Complex dashboards

---

## 13. Theme Options

### Theme 1: Blue & White

Best for:

- Trust
- Medical professionalism
- Doctor-friendly export

Palette:

```css
Primary Blue: #2563EB
Light Blue: #DBEAFE
Background: #F8FAFC
Card: #FFFFFF
Text: #0F172A
Border: #E2E8F0
```

### Theme 2: Green & White

Best for:

- Healing
- Calmness
- Patient comfort

Palette:

```css
Primary Green: #10B981
Dark Green: #047857
Light Green: #D1FAE5
Background: #F8FAFC
Card: #FFFFFF
Text: #0F172A
Border: #E5E7EB
```

### Theme 3: Multi-Color Modern

Best for:

- Younger caregivers
- Modern product feel
- Better data visualization

Palette:

```css
Blue: #2563EB
Green: #10B981
Orange: #F59E0B
Purple: #6366F1
Pink: #EC4899
Background: #F8FAFC
Text: #0F172A
```

### Recommended Theme for MVP

Start with **Blue & White + small Green status indicators**.

Reason:

- Most professional
- Cleanest for medical use
- Least risky visually
- Best for client/demo presentation

---

## 14. Features to Add Later

### Phase 2: Better Usability

- Multiple patients
- Calendar view
- Search records
- Smart filters
- Favorite reports
- Voice note remarks
- Photo compression
- Dark mode

### Phase 3: Smart Health Tracking

- Fluid intake tracker
- Daily urine output tracker
- Dry weight history
- Symptoms after dialysis
- Cramps / dizziness / nausea log
- Injection tracker
- Lab value tracker: Creatinine, Potassium, Hemoglobin, Urea, Phosphorus
- Normal range indicator for labs

### Phase 4: Doctor Sharing

- Doctor summary PDF
- QR code patient profile
- Share read-only report
- Print-ready booklet
- Visit preparation checklist

### Phase 5: AI Features

- OCR from booklet photos
- Auto-read BP and weight from uploaded booklet
- AI monthly summary
- AI “questions to ask doctor”
- AI abnormal trend explanation
- AI medicine list extraction from prescription

### Phase 6: Clinic Version

- Login/authentication
- Multiple patients
- Staff roles
- Clinic dashboard
- Appointment scheduling
- Billing optional
- Cloud sync
- Audit trail
- Doctor/nurse notes
- Patient export

---

## 15. Features Inspired by Existing Apps

### From CareClinic

Reference ideas:

- Medication reminders
- Documents and exports
- Measurement tracking
- Caregiver/dependent support
- Charts and timelines

How to adapt:

- Keep only dialysis-relevant measurements in MVP.

### From Water Wizz

Reference ideas:

- Fluid intake
- BP diary
- Dialysis log
- Historical charts
- PDF/CSV export

How to adapt:

- Add fluid intake later, not MVP.

### From Dialyze

Reference ideas:

- Lab tracker
- Injection reminders
- AI assistant
- Health score
- Diet guidance

How to adapt:

- Add labs and AI only after manual tracking becomes stable.

### From Dialysis Calc

Reference ideas:

- UF goal
- Dry weight calculation
- Actual removal vs expected removal
- Simple session history

How to adapt:

- Add UF variance calculation in Phase 2.

---

## 16. Differentiation Strategy

Your app should not compete as a “complete health tracker.”

It should win by being:

1. Dialysis-booklet-first
2. Caregiver-first
3. Offline-first
4. Mobile-first
5. Fast-entry-first
6. Export-friendly
7. Simple enough for elderly patients
8. Useful without login or subscription

Strong positioning:

> “A digital dialysis booklet for families who want clear records without complicated hospital software.”

---

## 17. MVP Development Priority

### Priority 1: Must Build

- Patient setup
- Add dialysis session
- Session history
- Dialyzer tracker
- Documents upload
- Export/import backup

### Priority 2: Should Build

- Dashboard summary
- Basic charts
- Medicine list
- Monthly PDF export

### Priority 3: Can Build Later

- OCR
- AI summaries
- Reminders
- Fluid intake
- Multi-patient
- Cloud sync
- Doctor sharing

---

## 18. Brutal Product Advice

### Do Not Overbuild

Your biggest risk is trying to build a full health ecosystem too early.

### Do Not Add AI First

AI will look attractive, but it will not solve the immediate pain.

### Do Not Start With Login

Authentication will slow you down and add unnecessary complexity.

### Do Not Build Native App First

A PWA is enough for version 1.

### Do Not Ignore Backup

If backup is missing, the app is risky.

### Do Not Make UI Too Fancy

This is a healthcare record app. It must feel clean, calm, and trustworthy.

---

## 19. What Makes This Product Strong

This idea is strong because:

- You have a real user: your father
- You have real data: dialysis booklet
- You have a repeated workflow: every dialysis session
- You have a measurable pain point: record management
- You can test every feature immediately
- You can build a useful MVP without spending on backend
- You can later sell to local dialysis patients/clinics

---

## 20. Final MVP Definition

### Product

**DialyCare**

### MVP Description

A mobile-first offline dialysis tracker that replaces the paper dialysis booklet and helps caregivers track sessions, BP, weight, UF removed, dialyzer usage, medicines, and reports.

### MVP User

Caregiver managing one dialysis patient.

### MVP Success Metric

The caregiver can enter and review dialysis session data faster and more clearly than using a paper booklet.

### MVP North Star

```text
New dialysis session added in under 30 seconds.
```

---

## 21. Source References

These sources were used for competitive and product-feature research:

1. CareClinic App Store listing — https://apps.apple.com/in/app/tracker-reminder-careclinic/id1455648231  
2. CareClinic Google Play listing — https://play.google.com/store/apps/details?id=com.careclinicsoftware.careclinic  
3. CareClinic website — https://careclinic.io/  
4. CareClinic Blood Pressure Tracker — https://careclinic.io/blood-pressure-tracker/  
5. CareClinic Medication Tracker — https://careclinic.io/medicine-tracker/  
6. National Kidney Foundation: Hemodialysis and Your Diet — https://www.kidney.org/kidney-topics/hemodialysis-and-your-diet  
7. National Kidney Foundation: What Is Dry Weight? — https://www.kidney.org/kidney-topics/what-dry-weight  
8. National Kidney Foundation: Hemodialysis — https://www.kidney.org/kidney-topics/hemodialysis  
9. Kidney Care UK: Haemodialysis Health and Wellbeing — https://kidneycareuk.org/kidney-disease-information/treatments/haemodialysis/patient-info-your-health-and-wellbeing-on-haemodialysis/  
10. Kidney Care UK: Fluid Balance on Dialysis — https://www.kidney.org.uk/fluid-balance-on-dialysis  
11. Water Wizz discussion — Reddit r/dialysis, “Introducing Water Wizz – a fluid, BP & dialysis log for kidney-care patients”  
12. Dialyze discussion — Reddit r/iosapps / r/TestMyApp, “Beta Testers Wanted: Dialyze – Kidney Health Tracker”  
13. Dialysis Calc concept — Reddit r/pebble, “I made a Pebble app for tracking fluid removal during dialysis”  

---

## 22. Medical Safety Note

This application should be positioned as a personal record-keeping and tracking tool only.

It should not:

- Diagnose disease
- Recommend dialysis settings
- Replace nephrologist advice
- Suggest medication changes
- Claim clinical accuracy

Suggested disclaimer:

> DialyCare is a personal record-tracking tool. It does not provide medical advice, diagnosis, or treatment. Always consult your nephrologist or dialysis care team for medical decisions.

