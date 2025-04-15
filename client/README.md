![Vite.js ><](./vite.js.png)
![Vue.js ><](./vue.js.png)
![Bootstrap ><](./bootstrap.png)

# Lab 4.1

[Lab 4.1](https://canvas.kth.se/courses/50419/assignments/315406) ska lämnas in före presentationen. Båda studenterna ska kunna redogöra för programmets alla delar. Följ instruktionerna nedan och se till att ha en övergripande förståelse för hur alla filer hänger ihop innan programmet vidareutvecklas. _Lycka till!_

## Introduktion

**Viktiga länkar:**

- [Vue.js](https://vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Vuex](https://vuex.vuejs.org/)

**Ytterligare länkar som kan vara av intresse:**

- [Vue Devtools](https://devtools.vuejs.org/)
- [Vite.js](https://vitejs.dev/)
- [Bootstrap](https://getbootstrap.com/)
- [m.m.](https://www.npmjs.com/)

1. Klona ned och navigera till repot i terminalen.
2. Kör `npm install` för att installera alla nödvändiga paket.
3. Kör `npm run dev` eller `npm run-script dev` för att starta utvecklingsservern.<sup>[1](#1)</sup>
4. Öppna webbläsaren och navigera till [localhost:8989](http://localhost:8989/).

<span id="footnote1"><sup>[1](#1)</sup> Vid detta tillfälle är Vue-applikationen klar att serveras.</span>

## Statisk kodanalys _(lint)_

Statisk kodanalys utförs för att hitta potentiella fel, misstänkta konstruktioner eller andra problem relaterade till bristande kodkvalitet. Följande steg är nödvändiga för att utföra statisk kodanalys och därmed bli godkänd på uppgiften. Observera att **alla rapporterade problem ska åtgärdas** före presentationen. Vidare måste den senaste versionen av [Node.js LTS](https://nodejs.org/) installeras innan instruktionerna nedan kan utföras.

1. Klona ned och navigera till repot i terminalen.
2. Kör `npm install` för att installera alla nödvändiga paket.
3. Kör `npm run lint` för att analysera koden och se resultatet.

Observera att de allra flesta problem kan elimineras _automatiskt_ genom att köra `npm run lint:fix`. Se därför till att _kontinuerligt_ köra kommandot ovan och åtgärda nya problem på löpande basis.
