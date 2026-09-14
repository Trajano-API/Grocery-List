# Groceries List App

Eigenständiges React-JavaScript-Projekt aus dem Export „Groceries List App.make“.
Verwendet Vite und Tailwind CSS. Design und App-Funktionen stammen aus dem Export.

## Starten

Voraussetzung: Node.js 20.19+ oder 22.12+ (empfohlen: Node.js 24).

```powershell
cd C:\_dev\groceries-list-app
npm install
npm run dev
```

Die im Terminal angezeigte lokale Adresse im Browser öffnen.

## Produktionsbuild

```powershell
npm run build
npm run preview
```

Der Build liegt in dist/.

## Funktionen und Struktur

- Einkaufslisten und farbige Gruppen verwalten
- Artikel hinzufügen, bearbeiten, abhaken und filtern
- Mengen, Einheiten und Preise erfassen
- Speicherung im localStorage des jeweiligen Browsers; kein Backend erforderlich
- src/App.jsx: App und Komponenten
- src/index.css: Design und Tailwind
- src/main.jsx: React-Einstieg

Google Fonts werden über das Internet geladen. Die App verwendet bei fehlender Verbindung Ersatzschriften.
Figma-Konfiguration, Export-Chatverlauf und eingebettete Agentenanweisungen sind nicht Teil des Projekts.
