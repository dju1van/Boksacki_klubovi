CREATE DATABASE BoksackiKlubovi;

CREATE TABLE zupanija (
    id_zupanija SERIAL PRIMARY KEY,
    nazzupanija VARCHAR(100),
    glavni_grad VARCHAR(100),
    broj_stanovnika INTEGER
);

CREATE TABLE mjesto (
    id_mjesto SERIAL PRIMARY KEY,
    nazmjesto VARCHAR(100),
    postanski_broj INTEGER,
    broj_stanovnika INTEGER,
    id_zupanija INTEGER REFERENCES zupanija(id_zupanija)
);

CREATE TABLE klub (
    id_klub SERIAL PRIMARY KEY,
    nazklub VARCHAR(100),
    oib VARCHAR(11),
    email VARCHAR(100),
    adresa VARCHAR(200),
    mobitel VARCHAR(15),
    aktivan BOOLEAN DEFAULT TRUE,
    id_mjesto INTEGER REFERENCES mjesto(id_mjesto)
);

INSERT INTO zupanija (nazzupanija, glavni_grad, broj_stanovnika) VALUES 
('Grad Zagreb', 'Zagreb', 767131),
('Splitsko-dalmatinska', 'Split', 423407),
('Primorsko-goranska', 'Rijeka', 265419);

INSERT INTO mjesto (nazmjesto, postanski_broj, broj_stanovnika, id_zupanija) VALUES 
('Zagreb', 10000, 767131, 1),
('Split', 21000, 160557, 2),
('Rijeka', 51000, 107964, 3);

INSERT INTO klub (nazklub, oib, email, adresa, mobitel, aktivan, id_mjesto) VALUES
('Boksački klub Arena', '02193896747', 'salebox.box@gmail.com', 'Remetinečka cesta 97', NULL, TRUE, 1),
('Boksački klub Pauk', '95540637708', 'bosnjakvedran@gmail.com', 'Arapova 22a', NULL, TRUE, 2),
('Boksački klub Split', '64196535562', 'dajana91@yahoo.com', 'A.G. Matoša 1', NULL, TRUE, 2),
('Boksački klub Leona', '75806994434', 'bkvekicleona@gmail.com', 'Mahatme Gandhia 2', NULL, TRUE, 1),
('Boksački klub Coloseum', '58080251746', 'boxingcoloseum@gmail.com', 'Kombolova 4', NULL, TRUE, 1),
('Zagrebački boksački klub', '07485104597', 'zagrebboxingclub@gmail.com', 'Debanićeva 1', NULL, TRUE, 1),
('Boksački klub Agram', '69437571059', 'merdja@hotmail.com', 'I.Petruševec 21', '0915490221', TRUE, 1),
('Boksački klub Rijeka', '44219876291', 'boksacki.klub.rijeka@gmail.com', 'Milutina Baraća 16b', NULL, TRUE, 3),
('Boksački klub Gladijator', '77487375749', 'info.gladijator@gmail.com', 'Ilica 298', NULL, TRUE, 1),
('Boksački klub Marjan', '70528763797', 'bkmarjan97@gmail.com', 'B. Papandopula 11', NULL, TRUE, 2);
