# Γ.Ε. Σείριος — Επίσημη ιστοσελίδα

Η πρώτη ολοκληρωμένη έκδοση της ιστοσελίδας της **Γυμναστικής Ένωσης Σείριος (Γ.Ε. Σείριος)** στην Καλαμάτα. Πρόκειται για ένα γρήγορο, responsive static site στα ελληνικά, κατασκευασμένο με semantic HTML, CSS και ελάχιστη JavaScript, χωρίς runtime dependencies.

## Περιεχόμενο

- Αρχική και παρουσίαση συλλόγου
- Volleyball και Beach Volley
- Πρόγραμμα προπονήσεων
- Νέα και τουρνουά
- Πρόγραμμα φίλων και υποστηρικτών
- Θέσεις χορηγών
- Gallery και φόρμα επικοινωνίας

Οι εικόνες/θέσεις περιεχομένου είναι προσωρινές και μπορούν να αντικατασταθούν όταν είναι διαθέσιμο το επίσημο φωτογραφικό υλικό και τα λογότυπα χορηγών.

## Ανάπτυξη

```bash
npm run dev
```

Το production build δημιουργείται στον φάκελο `dist`:

```bash
npm run build
npm run preview
```

## Deployment στο Cloudflare Workers

Το `wrangler.jsonc` δηλώνει ρητά το `./dist` ως τον μοναδικό φάκελο static assets. Το production build διαγράφει και δημιουργεί ξανά αυτόν τον φάκελο, αντιγράφοντας μόνο τα αρχεία που χρειάζεται η ιστοσελίδα. Τα `node_modules`, scripts, source configuration και άλλα αρχεία ανάπτυξης δεν μεταφορτώνονται στο Cloudflare.

Για Git-based deployment στο **Cloudflare Workers Builds**:

1. Συνδέστε το Git repository σε ένα νέο Workers project.
2. Ορίστε build command: `npm run build`.
3. Ορίστε deploy command: `npx wrangler deploy`.
4. Δεν απαιτούνται environment variables για τη βασική έκδοση.

Εναλλακτικά, με εγκατεστημένο Wrangler:

```bash
npm run deploy
```

Το Wrangler διαβάζει το `wrangler.jsonc` και δημοσιεύει αποκλειστικά το `dist/` μέσω Cloudflare Workers Static Assets. Μην ορίζετε το repository root (`.`) ως assets directory στο Cloudflare dashboard.

> Η φόρμα επικοινωνίας λειτουργεί ως UI επίδειξης. Για αποστολή email, συνδέστε την αργότερα με Cloudflare Pages Functions ή την υπηρεσία φορμών της επιλογής σας.
