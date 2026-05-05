# Codex Web UI

Eine kleine statische Web-Oberflaeche im Stil einer CLI-Konsole. Sie zeigt Projekte, Chats, Statusdaten, Schnellbefehle und projektbezogene Notizen.

## Start

Oeffne `index.html` direkt im Browser. Es gibt keine Build-Schritte und keine externen Abhaengigkeiten.

## Funktionen

- Projekt- und Chatliste
- Terminal-artige Eingabe
- lokale Befehle wie `/help`, `/project NAME`, `/chat NAME` und `/clear`
- Chat-Export als Text
- lokale Speicherung per `localStorage`
- responsive Layouts fuer Desktop und Mobile

## Sicherheit

Dieses Repo enthaelt keine Secrets, Tokens oder API-Keys. Die aktuelle Version ist ein reines Frontend. Eine echte Codex-Anbindung sollte spaeter ueber einen lokalen Backend- oder Bridge-Service laufen, der Secrets ausserhalb des Public-Repos verwaltet.
