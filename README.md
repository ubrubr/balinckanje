# Balinčkanje — GitHub Pages + Supabase

Pokončni spletni turnir (9:16) za Play Digital Signage CMS. Vsi podatki se sinhronizirajo prek Supabase.

## Funkcije

- 16 igralcev, 8 ekip z dvema članoma; številke ekip 1–8, vsaka se pojavi natanko dvakrat.
- Upravljanje žreba s telefona; 5 s uvoda, 16 x 8,5 s animacije, nato 30 s končnega pregleda.
- Osrednji javni prikaz, ki samodejno preide na sestavo ekip po zaključku animacije.
- Enostaven izločilni sistem: četrtfinale 1–8, 2–7, 3–6, 4–5; dva polfinala in finale (7 glavnih tekem). Tekma za 3. mesto je dodatna, za bronasto stopničko.
- Vnos rezultatov na telefonu; zmagovalci samodejno napredujejo, rezultati se osvežujejo v približno 1,5 s (Realtime + polling).
- Javno upravljanje brez gesla, kot zahtevano. Vsakdo s povezavo lahko spremeni podatke.

## Povezave po objavi

Repozitorij `ubrubr/balinckanje` že vsebuje izvorno kodo. Za javno objavo omogočite GitHub Pages v `Settings > Pages > Build and deployment > Deploy from a branch > main > /(root)`; tega koraka GitHub povezava ne omogoča nastaviti samodejno.

- `https://ubrubr.github.io/balinckanje/` — samodejno preklapljajoči javni prikaz (dodajte kot Play Webpage)
- `https://ubrubr.github.io/balinckanje/admin.html` — telefon, brez prijave
- `https://ubrubr.github.io/balinckanje/zreb.html` — samo animacija žrebanja
- `https://ubrubr.github.io/balinckanje/ekipe.html` — prikaz izžrebanih ekip
- `https://ubrubr.github.io/balinckanje/tekme.html` — celotno izločilno drevo
- `https://ubrubr.github.io/balinckanje/tekme.html?pogled=cetrtfinale` — četrtfinale
- `https://ubrubr.github.io/balinckanje/tekme.html?pogled=polfinale`
- `https://ubrubr.github.io/balinckanje/tekme.html?pogled=finale`
- `https://ubrubr.github.io/balinckanje/tekme.html?pogled=stopnicke`

GitHub Pages je statični HTTPS strežnik. Podatki so v Supabase projektu `g-hub`, v ločeni tabeli `public.balinckanje_state`.

## Kako uporabljati

1. Odprite `/admin.html` na telefonu.
2. Po potrebi popravite imena igralcev.
3. Kliknite `USTVARI NOV ŽREB` in potrdite. Animacija se samodejno zažene.
4. Na Play Signage naj ostane odprta stran `/` — prikaz se sam preklopi po žrebu na seznam ekip.
5. Vnesite rezultate četrtfinala, polfinala in finala v razdelku Tekme; zmagovalci se samodejno prenesejo v naslednji krog. Za tretje mesto lahko odigrate dodatno tekmo.
6. Za ponovni prikaz istega žreba uporabite `PONOVI ISTI ŽREB`. Za nov naključni žreb izberite `USTVARI NOV ŽREB`; animacija se zažene samodejno.

## Varnost in opombe

- Publikacijski ključ v `config.js` je namenjen brskalniku; ni skrivnost. Nikoli ne dodajte `service_role`/secret ključa v javno kodo.
- RLS dovoljuje javno branje in posodabljanje samo ene vrstice namenske turnirske tabele. Ostale tabele projekta so ločene.
- Upravljanje namenoma ni zaščiteno z geslom. URL strani `/admin.html` ni varnostna meja; tudi API je javno zapisljiv. Za omejitev upravljanja bi bila potrebna avtentikacija ali zasebni strežniški endpoint.
- Javna spletna stran je za brezhibno delovanje odvisna od dostopa do Supabase in Supabase JS CDN. Ob začasni izgubi povezave se zadnje znano stanje iz predpomnilnika lahko še prikazuje.
- Tekma ne sme biti neodločena; zmagovalca določi višji rezultat. Ob spremembi rezultata predhodne tekme se odvisni rezultati samodejno počistijo.
- Stari rezultati skupinskega dela so arhivirani pod `archivedGames`; aktivni žreb in imena igralcev ostanejo nespremenjeni.
- `supabase/001_balinckanje.sql` vsebuje začetno SQL shemo in seed; v povezani bazi je bila že ustvarjena in preverjena.

## Datoteke

`index.html`, `zreb.html`, `ekipe.html`, `tekme.html`, `admin.html`, `config.js`, `shared.js`, `display-style.css`, `supabase/001_balinckanje.sql`.