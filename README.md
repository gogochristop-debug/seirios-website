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

## Deployment στο Cloudflare Pages

1. Συνδέστε το Git repository σε ένα νέο **Cloudflare Pages** project.
2. Επιλέξτε το generic/static framework preset.
3. Ορίστε build command: `npm run build`.
4. Ορίστε output directory: `dist`.
5. Δεν απαιτούνται environment variables για τη βασική έκδοση.

Εναλλακτικά, με εγκατεστημένο Wrangler:

```bash
npm run build
npx wrangler pages deploy dist
```

> Η φόρμα επικοινωνίας λειτουργεί ως UI επίδειξης. Για αποστολή email, συνδέστε την αργότερα με Cloudflare Pages Functions ή την υπηρεσία φορμών της επιλογής σας.
