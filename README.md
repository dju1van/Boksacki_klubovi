# Mali skup podataka hrvatskih boksačkih klubova
Ovaj repozitorij sadrži 5 datoteka uključujući i ovu (README.md). Datoteka `BoksackiKlubovi.sql ` sadrži "dump" baze podataka koju sam koristio za izradu ove laboratorijske vježbe. Datoteke `boksKlubovi.csv` i `boksKlubovi.json` su zadatak ove laboratorijske vježbe i sadrže skup otvorenih podataka o nekim boksačkim klubovima iz Hrvatske. Te na kraju `sql_upiti_za_export.sql` sadrži upite kojima se iz baze podataka `BoksackiKlubovi` generiraju datoteke `boksKlubovi.csv` i `boksKlubovi.json`.

## Metapodaci
**Jezik**: Hrvatski (hr)  
**Ime autora**: Ivan Đurić  
**Verzija skupa podataka**: 1.0  
**Kodna stranica**: UTF-8  
**Datum kreiranja**: 22-10-2024 (dd-mm-yyyy)  
**Zadnje ažurirano**: 26-10-2024 (dd-mm-yyyy)  
**Svrha skupa podataka**: lakši kontakt, centralizacija podataka  
**Dostupnost**: ove podatke mogu koristiti svi zainteresirani kao izvor informacija ili pomoć  
**Točnost podataka**: 95%  
**Otvorena licenca**: [Creative Commons Zero v1.0 Universal (CC0 1.0)](https://creativecommons.org/publicdomain/zero/1.0/)

## Opis atributa

- **nazklub** - naziv boksačkog kluba
- **oib** - OIB (osobni identifikacijski broj) boksačkog kluba
- **email** - adresa elektroničke pošte za kontakt osoblja iz boksačkog kluba
- **adresa** - adresa boksačkog kluba
- **mobitel** - broj za kontakt osoblja boksačkog kluba
- **aktivan** - ako je klub još uvijek aktivan, ovaj atribut će imati vrijednost `true` u `.json` formatu odnosno `t` u `.csv` formatu
- **mjesto** - kompleksan atribut koji se sastoji od:
  - **naziv mjesta** - naziv mjesta u kojem se nalazi klub
  - **poštanski broj** - poštanski broj mjesta
  - **broj stanovnika** - broj stanovnika u mjestu
- **zupanija** - kompleksan atribut koji se sastoji od:
  - **naziv županije** - naziv županije u kojoj se nalazi mjesto
  - **glavni grad** - glavni grad županije
  - **broj stanovnika** - broj stanovnika županije

## Hijerarhija u .csv datoteci

Struktura u .csv datoteci postignuta je pomoću znaka `:` . Na primjer, za atribut **mjesto** koji sadrži podatribute naziv, poštanski broj i broj stanovnika, hijerarhija je prikazana na sljedeći način:

`naziv_mjesta:postanski_broj_mjesta:broj_stanovnika_mjesta`

Ova uređena trojka predstavlja jednu instancu atributa **mjesto**.
