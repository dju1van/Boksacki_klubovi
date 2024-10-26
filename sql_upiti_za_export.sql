-- za izvoz podataka u .json datoteku
COPY (
    SELECT array_to_json(array_agg(row_to_json(x))) FROM (
        SELECT 
        klub.nazklub, 
        klub.oib,
        klub.email,
		klub.adresa,
        klub.mobitel,
		klub.aktivan,

        COALESCE(json_agg(json_build_object('naziv_mjesta', mjesto.nazmjesto,'postanski_broj', mjesto.postanski_broj,'broj_stanovnika', mjesto.broj_stanovnika))) AS mjesto,

        COALESCE(json_agg(json_build_object('naziv_zupanije', zupanija.nazzupanija,'glavni_grad', zupanija.glavni_grad,'broj_stanovnika', zupanija.broj_stanovnika))) AS zupanija

        FROM klub
	JOIN mjesto ON klub.id_mjesto = mjesto.id_mjesto
	JOIN zupanija ON mjesto.id_zupanija = zupanija.id_zupanija
	GROUP BY klub.nazklub, klub.oib, klub.email, klub.adresa, klub.mobitel, klub.aktivan)x) 
TO 'C:/Users/Korisnik/pgAdmin/boksKlubovi.json'

--za izvoz podataka u .csv datoteku
COPY (
    SELECT 
    klub.nazklub, 
    klub.oib,
    klub.email,
	klub.adresa,
    klub.mobitel,
	klub.aktivan,

	string_agg(mjesto.nazmjesto || ':' || mjesto.postanski_broj || ':' || mjesto.broj_stanovnika, ',') AS mjesto,
	
	string_agg(zupanija.nazzupanija || ':' || zupanija.glavni_grad || ':' || zupanija.broj_stanovnika, ',') AS zupanija
        
    FROM klub
	JOIN mjesto ON klub.id_mjesto = mjesto.id_mjesto
	JOIN zupanija ON mjesto.id_zupanija = zupanija.id_zupanija
	GROUP BY klub.nazklub, klub.oib, klub.email, klub.adresa, klub.mobitel, klub.aktivan) 
TO 'C:/Users/Korisnik/pgAdmin/boksKlubovi.csv' WITH DELIMITER ',' CSV HEADER;