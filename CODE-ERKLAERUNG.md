# Code-Erklärung: Gruppen auf- und zuklappen

Mit dieser Funktion kann ich eine Gruppe in der Einkaufsliste öffnen und wieder schliessen. Es ist immer höchstens eine Gruppe geöffnet.

## 1. Die Funktion

In `src/App.jsx` steht ab Zeile 159 diese Funktion:

```jsx
const toggleGroup = (groupId) => {
    setExpandedGroupId((prev) => (prev === groupId ? null : groupId));
};
```

`groupId` ist die ID der angeklickten Gruppe. `prev` enthält die ID der Gruppe, die bisher geöffnet war.

Mit `prev === groupId` prüfe ich, ob die angeklickte Gruppe bereits offen ist. Wenn ja, wird `null` gespeichert und die Gruppe geschlossen. Wenn nicht, wird die ID der angeklickten Gruppe gespeichert und diese geöffnet.

Das Fragezeichen und der Doppelpunkt sind eine kurze Schreibweise für eine Wenn-sonst-Abfrage.

## 2. Aufruf beim Klicken

Ab Zeile 350 wird die Funktion beim Klick auf den Gruppennamen aufgerufen. Hier habe ich das Styling und die zusätzlichen Anzeigen weggelassen:

```jsx
<button onClick={() => toggleGroup(group.id)}>
    {group.name}
</button>
```

Der Button zeigt den Namen der Gruppe an. Beim Klick wird `toggleGroup` mit der ID dieser Gruppe ausgeführt. Durch `() =>` wird die Funktion erst beim Klicken aufgerufen.

## 3. Inhalt anzeigen

In Zeile 345 wird geprüft, ob die aktuelle Gruppe geöffnet ist:

```jsx
const isExpanded = expandedGroupId === group.id;
```

Wenn die gespeicherte ID zur Gruppe passt, ist `isExpanded` gleich `true`.

Ab Zeile 365 wird damit entschieden, ob der Inhalt angezeigt wird. Hier ist der Inhalt gekürzt:

```jsx
{isExpanded && (
    <div>
        {/* Hier steht der Inhalt der Gruppe. */}
    </div>
)}
```

Das `&&` bedeutet hier, dass der Inhalt nur angezeigt wird, wenn `isExpanded` wahr ist.

## Ablauf

Ich klicke auf einen Gruppennamen. Dadurch wird `toggleGroup` aufgerufen und der State mit `setExpandedGroupId` geändert. React rendert die Ansicht danach neu. Die geöffnete Gruppe zeigt ihren Inhalt an. Wenn ich nochmals auf dieselbe Gruppe klicke, wird sie geschlossen.
