const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 5500;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'BoksackiKlubovi',
    password: 'postgres',
    port: 5432,
});

app.get('/', async(req, res) => {
    res.render('index');
});

app.get('/datatable', async (req, res) => {
    const filterText = req.query.filterText || '';
    const filterAttribute = req.query.filterAttribute;

    let query = `SELECT k.nazklub AS nazivKluba, k.oib, k.email, k.adresa, k.mobitel, k.aktivan, m.nazmjesto AS nazivMjesta, m.postanski_broj AS postanskiBroj, 
                        m.broj_stanovnika AS brojMjestana, z.nazzupanija AS nazivZupanije, z.glavni_grad AS glavniGrad, z.broj_stanovnika AS brojStanovnika
                        FROM klub k JOIN mjesto m ON k.id_mjesto = m.id_mjesto JOIN zupanija z ON m.id_zupanija = z.id_zupanija`;

    const params = [];

    if (filterText) {
        if(filterAttribute == 'sviAtributi') {
            query += `  WHERE 
                        k.nazklub ILIKE '%' || $1 || '%' OR 
                        CAST(k.oib AS TEXT) LIKE '%' || $1 || '%' OR 
                        k.email ILIKE '%' || $1 || '%' OR 
                        k.adresa ILIKE '%' || $1 || '%' OR 
                        k.mobitel ILIKE '%' || $1 || '%' OR 
                        m.nazmjesto ILIKE '%' || $1 || '%' OR 
                        CAST(m.postanski_broj AS TEXT) LIKE '%' || $1 || '%' OR 
                        CAST(m.broj_stanovnika AS TEXT) LIKE '%' || $1 || '%' OR 
                        z.nazzupanija ILIKE '%' || $1 || '%' OR 
                        z.glavni_grad ILIKE '%' || $1 || '%' OR 
                        CAST(z.broj_stanovnika AS TEXT) LIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
        else if(filterAttribute == 'nazivKluba') {
            query += ` WHERE k.nazklub ILIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
        else if(filterAttribute == 'oib') {
            query += ` WHERE CAST(k.oib AS TEXT) LIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
        else if(filterAttribute == 'email') {
            query += ` WHERE k.email ILIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
        else if(filterAttribute == 'adresa') {
            query += ` WHERE k.adresa ILIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
        else if(filterAttribute == 'mobitel') {
            query += ` WHERE k.mobitel ILIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
        else if(filterAttribute == 'aktivan') {
            query += ` WHERE k.aktivan = true;`;
        }
        else if(filterAttribute == 'nazivMjesta') {
            query += ` WHERE m.nazivmjesta ILIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
        else if(filterAttribute == 'postanskiBroj') {
            query += ` WHERE CAST(m.postanski_broj AS TEXT) LIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
        else if(filterAttribute == 'brojMjestana') {
            query += ` WHERE CAST(m.broj_stanovnika AS TEXT) LIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
        else if(filterAttribute == 'nazivZupanije') {
            query += ` WHERE z.nazzupanija ILIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
        else if(filterAttribute == 'glavniGrad') {
            query += ` WHERE z.glavni_grad ILIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
        else if(filterAttribute == 'brojStanovnika') {
            query += ` WHERE CAST(z.broj_stanovnika AS TEXT) LIKE '%' || $1 || '%';`;
            params.push(filterText);
        }
    }

    try {
        const result = await pool.query(query, params);
        const rows = result.rows;

        res.json({ data: rows });
    } catch (error) {
        console.error('Greška pri dohvaćanju podataka iz baze:', error);
        res.status(500).json({ error: 'Greška pri dohvaćanju podataka iz baze!' });
    }
});

app.get('/counties', async(req, res) => {

    const query = `SELECT nazzupanija AS nazivZupanije, glavni_grad AS glavniGrad, broj_stanovnika AS brojStanovnika
                        FROM zupanija;`;

    try {
        const result = await pool.query(query);
        const rows = result.rows;

        res.json({ status: 'OK', message: 'Podaci dohvaćeni', response: rows });
    } catch (error) {
        console.error('Greška pri dohvaćanju podataka iz baze:', error);
        res.status(500).json({ status: 'Not Fetched', message: 'Podaci nisu dohvaćeni', error: 'Greška pri dohvaćanju podataka iz baze!' , response: null });
    }
});

app.get('/places', async(req, res) => {

    const query = `SELECT m.nazmjesto AS nazivMjesta, m.postanski_broj AS postanskiBroj, m.broj_stanovnika AS brojMjestana, z.nazzupanija AS nazivZupanije, z.glavni_grad AS glavniGrad, z.broj_stanovnika AS brojStanovnika
                        FROM mjesto m JOIN zupanija z ON m.id_zupanija = z.id_zupanija;`;

    try {
        const result = await pool.query(query);
        const rows = result.rows;

        res.json({ status: 'OK', message: 'Podaci dohvaćeni', response: rows });
    } catch (error) {
        console.error('Greška pri dohvaćanju podataka iz baze:', error);
        res.status(500).json({ status: 'Not Fetched', message: 'Podaci nisu dohvaćeni', error: 'Greška pri dohvaćanju podataka iz baze!' , response: null });
    }
});

app.get('/clubs', async(req, res) => {

    const query = `SELECT k.nazklub AS nazivKluba, k.oib, k.email, k.adresa, k.mobitel, k.aktivan, m.nazmjesto AS nazivMjesta, m.postanski_broj AS postanskiBroj, 
                        m.broj_stanovnika AS brojMjestana, z.nazzupanija AS nazivZupanije, z.glavni_grad AS glavniGrad, z.broj_stanovnika AS brojStanovnika
                        FROM klub k JOIN mjesto m ON k.id_mjesto = m.id_mjesto JOIN zupanija z ON m.id_zupanija = z.id_zupanija`;

    try {
        const result = await pool.query(query);
        const rows = result.rows;

        res.json({ status: 'OK', message: 'Podaci dohvaćeni', response: rows });
    } catch (error) {
        console.error('Greška pri dohvaćanju podataka iz baze:', error);
        res.status(500).json({ status: 'Not Fetched', message: 'Podaci nisu dohvaćeni', error: 'Greška pri dohvaćanju podataka iz baze!' , response: null });
    }
});

app.get('/clubs/:id', async(req, res) => {
    const id = req.params.id;
    let query = `SELECT k.id_klub AS ID, k.nazklub AS nazivKluba, k.oib, k.email, k.adresa, k.mobitel, k.aktivan, m.nazmjesto AS nazivMjesta, m.postanski_broj AS postanskiBroj, 
                        m.broj_stanovnika AS brojMjestana, z.nazzupanija AS nazivZupanije, z.glavni_grad AS glavniGrad, z.broj_stanovnika AS brojStanovnika
                        FROM klub k JOIN mjesto m ON k.id_mjesto = m.id_mjesto JOIN zupanija z ON m.id_zupanija = z.id_zupanija WHERE k.id_klub = ${id}`;

    try {
        const result = await pool.query(query);
        const resp = result.rows;

        if(resp == null || resp == ''){
            console.error('Greška pri dohvaćanju podataka iz baze:', error);
            res.status(404).json({ status: 'Not Found', message: 'Klub s danim ID-jem ne postoji', error: 'Greška pri dohvaćanju podataka iz baze!' , response: null });
        }

        res.status(200).json({ status: 'OK', message: 'Podaci o klubu dohvaćeni', response: resp });
    } catch (error) {
        console.error('Greška pri dohvaćanju podataka iz baze:', error);
        res.status(500).json({ status: 'Not Fetched', message: 'Podaci nisu dohvaćeni', error: 'Greška pri dohvaćanju podataka iz baze!' , response: null });
    }
});

app.post('/add', async(req, res) => {
    let data = req.body;
    data.aktivan == 'on' ? data.aktivan = true : data.aktivan = false;
    try {
        const { nazKlub, oib, email, adresa, mob, aktivan, idMjesta } = data;

        const query = `INSERT INTO klub (nazklub, oib, email, adresa, mobitel, aktivan, id_mjesto) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;

        const result = await pool.query(query, [
            nazKlub,
            oib,
            email,
            adresa,
            mob || null,
            aktivan,
            idMjesta,
        ]);

        if(result == null || result == ''){
            console.error('Greška pri dodavanju podataka u bazu:', error);
            res.status(500).json({ status: 'Not Done', message: 'Klub nije dodan', error: 'Greška pri dodavanju podataka u bazu!' , response: null });
        }

        res.status(200).json({ status: 'OK', message: 'Podaci o klubu dodani', response: result.rows });
    } catch (error) {
        console.error('Greška pri dodavanju podataka u bazu:', error);
        res.status(500).json({ status: 'Not Done', message: 'Klub nije dodan', error: 'Greška pri dodavanju podataka u bazu!' , response: null });
    }
});

app.post('/update', async(req, res) => {
    let data = req.body;
    data.aktivan == 'on' ? data.aktivan = true : data.aktivan = false;
    try {
        const { nazKlub, oib, email, adresa, mob, aktivan, idMjesta, oibKluba } = data;

    const query = `UPDATE klub SET nazklub = $1, oib = $2, email = $3, adresa = $4, mobitel = $5, aktivan = $6, id_mjesto = $7 WHERE oib = $8;`;

    const result = await pool.query(query, [
        nazKlub,
        oib,
        email,
        adresa,
        mob || null,
        aktivan,
        idMjesta,
        oibKluba,
    ]);

        if(result == null || result == ''){
            console.error('Greška pri izmjeni podataka:', error);
            res.status(500).json({ status: 'Not Done', message: 'Klub nije izmjenjen', error: 'Greška pri izmjeni podataka!' , response: null });
        }

        res.status(200).json({ status: 'OK', message: 'Podaci o klubu osviježeni', response: result.rows });
    } catch (error) {
        console.error('Greška pri izmjeni podataka:', error);
        res.status(500).json({ status: 'Not Done', message: 'Klub nije izmjenjen', error: 'Greška pri izmjeni podataka!' , response: null });
    }
});

app.post('/delete', async(req, res) => {
    let data = req.body;
    try {
        const { oibKluba } = data;

    const query = `DELETE FROM klub WHERE oib = $1;`;

    const result = await pool.query(query, [oibKluba,]);

        if(result == null || result == ''){
            console.error('Greška pri brisanju podataka:', error);
            res.status(500).json({ status: 'Not Done', message: 'Klub nije izbrisan', error: 'Greška pri brisanju podataka!' , response: null });
        }

        res.status(200).json({ status: 'OK', message: 'Podaci o klubu obrisani', response: result.rows });
    } catch (error) {
        console.error('Greška pri brisanju podataka:', error);
        res.status(500).json({ status: 'Not Done', message: 'Klub nije izbrisan', error: 'Greška pri brisanju podataka!' , response: null });
    }
});

app.listen(port, () => {
    console.log(`Poslužitelj pokrenut! port:` + port);
});
