# Balinčkanje — GitHub Pages + Supabase

Pokončni spletni turnir (9:16) za Play Digital Signage CMS. Vsi podatki se sinhronizirajo prek Supabase.

## Funkcije

- 16 igralcev, 8 ekip z dvema članoma; številke ekip 1–8, vsaka se pojavi natanko dvakrat.
- Jan R. (p5) in Marko D. (p14) vedno dobita isto številko ekipe, ostali pari so naključni.
- Upravljanje žreba s telefona; 5 s uvoda, 16 x 8,5 s animacije, nato 30 s končnega pregleda.
- Osrednji javni prikaz, ki samodejno preide na sestavo ekip po zaključku animacije.
- 2 skupini po 4 ekipe, 3 krogi (4 tekme/krog), polfinale, tekma za tretje mesto, finale in stopničke.
- Vnos rezultatov in prikaz lestvic s telefona; osvežitev v približno 1,5 s (Realtime + polling).
- Javno upravljanje brez gesla, kot zahtevano. Vsakdo s povezavo lahko spremeni podatke.

## Povezave po objavi

Če ustvarite javni GitHub repo `ubrubr/balinckanje`, omogočite GitHub Pages v `Settings > Pages > Deploy from a branch > main > /(root)`.

- `https://ubrubr.github.io/balinckanje/` — samodejno preklapljajoči javni prikaz (dodajte kot Play Webpage)
- `https://ubrubr.github.io/balinckanje/admin.html` — telefon, brez prijave
- `https://ubrubr.github.io/balinckanje/zreb.html` — samo animacija žrebanja
- `https://ubrubr.github.io/balinckanje/ekipe.html` — prikaz izžrebanih ekip
- `https://ubrubr.github.io/balinckanje/tekme.html?pogled=1` — prvi krog (2, 3)
- `https://ubrubr.github.io/balinckanje/tekme.html?pogled=polfinale`
- `https://ubrubr.github.io/balinckanje/tekme.html?pogled=finale`
- `https://ubrubr.github.io/balinckanje/tekme.html?pogled=stopnicke`
- `https://ubrubr.github.io/balinckanje/tekme.html?pogled=lestvica`

GitHub Pages je statični HTTPS strežnik. Podatki so v Supabase projektu `g-hub`, v ločeni tabeli `public.balinckanje_state`.

## Kako uporabljati

1. Odprite `/admin.html` na telefonu.
2. Po potrebi popravite imena igralcev.
3. Kliknite `USTVARI NOV ŽREB`, nato `ZAČNI ANIMACIJO`.
4. Na Play Signage naj ostane odprta stran `/` — prikaz se sam preklopi po žrebu na seznam ekip.
5. Vnesite rezultate tekem v razdelku Tekme; javni zaslon uporabite za prikaz kroga, lestvice, finala ali stopničk.
6. Za ponovni prikaz istega žreba uporabite `PONOVI ANIMACIJO`. Za nova naključna paražiranja uporabite `USTVARI NOV ŽREB`.

## Varnost in opombe

- Publikacijski ključ v `config.js` je namenjen brskalniku; ni skrivnost. Nikoli ne dodajte `service_role`/secret ključa v javno kodo.
- RLS dovoljuje javno branje in posodabljanje samo ene vrstice namenske turnirske tabele. Ostale tabele projekta so ločene.
- Upravljanje namenoma ni zaščiteno z geslom. URL strani `/admin.html` ni varnostna meja; tudi API je javno zapisljiv. Za omejitev upravljanja bi bila potrebna avtentikacija ali zasebni strežniški endpoint.
- Javna spletna stran je za brezhibno delovanje odvisna od dostopa do Supabase in Supabase JS CDN. Ob začasni izgubi povezave se zadnje znano stanje iz predpomnilnika lahko še prikazuje.
- Ob popolnem izenačenju vseh kriterijev mora skrbnik potrditi ročno prednost ekipe, preden zaupa napredovanju. Samodejni rezervni vrstni red je po številki ekipe.
- `supabase/001_balinckanje.sql` vsebuje začetno SQL shemo in seed; v povezani bazi je bila že ustvarjena in preverjena.

## Datoteke

`index.html`, `zreb.html`, `ekipe.html`, `tekme.html`, `admin.html`, `config.js`, `shared.js`, `display-style.css`, `supabase/001_balinckanje.sql`.