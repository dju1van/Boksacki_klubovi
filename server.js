const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const multer = require('multer');
const { auth } = require('express-openid-connect');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './conf.env' });
const expressZip = require('express-zip');
const app = express();
const upload = multer();
const port = 5500;
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_CLIENT_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};


// Middleware 
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(auth(config));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'BoksackiKlubovi',
    password: 'postgres',
    port: 5432,
});

function convertToCSV(data) {
    const fields = Object.keys(data[0]);
    const csv = data.map(row => fields.map(field => row[field]).join(',')).join('\n');
    return fields.join(',') + '\n' + csv;
}

app.get('/', async(req, res) => {
    res.send('index.html');
});

app.get('/profile', async (req, res) => {
    if (req.oidc.isAuthenticated()) {
        res.json(req.oidc.user);
    } else {
        res.status(401).json({ Error: 'Not logged in' });
    }
});

app.get('/login', (req, res) => {
    res.oidc.login({returnTo: '/profile'});
});

app.get('/logout', (req, res) => {
    res.oidc.logout({returnTo: '/'});
});

app.get('/download', async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ Error: 'Not logged in' });
    } else {
        try {
            const query = 'SELECT * FROM klub';
            const result = await pool.query(query);
            const data = result.rows;
    
            const jsonData = JSON.stringify(data, null, 4);
            const csvData = convertToCSV(data);
            
            const jsonFilePath = path.join(__dirname, 'boksackiKlubovi.json');
            const csvFilePath = path.join(__dirname, 'boksackiKlubovi.csv');
    
            fs.writeFileSync(jsonFilePath, jsonData);
            fs.writeFileSync(csvFilePath, csvData);
    
            res.zip([
                { path: jsonFilePath, name: 'boksackiKlubovi.json' },
                { path: csvFilePath, name: 'boksackiKlubovi.csv' }
            ], 'boksackiKlubovi.zip', (err) => {
                if (err) {
                    console.error('Error zipping files:', err);
                    res.status(500).json({ error: 'Failed to zip files' });
                }
    
                fs.unlinkSync(jsonFilePath);
                fs.unlinkSync(csvFilePath);
            });
    
        } catch (error) {
            console.error('Error fetching data from the database:', error);
            res.status(500).json({ error: 'Error fetching data from the database' });
        }
    }
});

app.get('/datatable', async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ Error: 'Not logged in' });
    }

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
    if (req.oidc.isAuthenticated()) {
        const query = `SELECT nazzupanija AS nazivZupanije, glavni_grad AS glavniGrad, broj_stanovnika AS brojStanovnika
                        FROM zupanija;`;

        try {
            const result = await pool.query(query);
            let modifiedResult = result.rows.map(row => {
                return {
                    "@context": {
                        "@vocab": "http://schema.org/",
                        "nazivzupanije": "addressRegion",

                    },
                    "@type": "DefinedRegion",
                    "nazivzupanije": row.nazivzupanije,
                    "glavnigrad": row.glavnigrad,
                    "brojstanovnika": row.brojstanovnika
                };
            });

            res.json({ status: 'OK', message: 'Podaci dohvaćeni', response: modifiedResult });
        } catch (error) {
            console.error('Greška pri dohvaćanju podataka iz baze:', error);
            res.status(500).json({ status: 'Not Fetched', message: 'Podaci nisu dohvaćeni', error: 'Greška pri dohvaćanju podataka iz baze!' , response: null });
        }
    } else {
        res.status(401).json({ Error: 'Not logged in' });
    }
});

app.get('/places', async(req, res) => {
    if (req.oidc.isAuthenticated()) {
        const query = `SELECT m.nazmjesto AS nazivMjesta, m.postanski_broj AS postanskiBroj, m.broj_stanovnika AS brojMjestana, z.nazzupanija AS nazivZupanije, z.glavni_grad AS glavniGrad, z.broj_stanovnika AS brojStanovnika
                        FROM mjesto m JOIN zupanija z ON m.id_zupanija = z.id_zupanija;`;

        try {
            const result = await pool.query(query);
            let modifiedResult = result.rows.map(row => {
                return {
                    "@context": {
                        "@vocab": "http://schema.org/",
                        "nazivzupanije": "addressRegion",
                        "nazivmjesta": "name"

                    },
                    "@type": "Place",
                    "nazivmjesta": row.nazivmjesta,
                    "postanskibroj": row.postanskibroj,
                    "brojmjestana": row.brojmjestana,
                    "nazivzupanije": row.nazivzupanije,
                    "glavnigrad": row.glavnigrad,
                    "brojstanovnika": row.brojstanovnika
                };
            });

            res.json({ status: 'OK', message: 'Podaci dohvaćeni', response: modifiedResult });
        } catch (error) {
            console.error('Greška pri dohvaćanju podataka iz baze:', error);
            res.status(500).json({ status: 'Not Fetched', message: 'Podaci nisu dohvaćeni', error: 'Greška pri dohvaćanju podataka iz baze!' , response: null });
        }
    } else {
        res.status(401).json({ Error: 'Not logged in' });
    }
});

app.get('/clubs', async(req, res) => {
    if (req.oidc.isAuthenticated()) {
        const query = `SELECT k.nazklub AS nazivKluba, k.oib, k.email, k.adresa, k.mobitel, k.aktivan, m.nazmjesto AS nazivMjesta, m.postanski_broj AS postanskiBroj, 
                        m.broj_stanovnika AS brojMjestana, z.nazzupanija AS nazivZupanije, z.glavni_grad AS glavniGrad, z.broj_stanovnika AS brojStanovnika
                        FROM klub k JOIN mjesto m ON k.id_mjesto = m.id_mjesto JOIN zupanija z ON m.id_zupanija = z.id_zupanija`;

        try {
            const result = await pool.query(query);
            let modifiedResult = result.rows.map(row => {
                return {
                    "@context": {
                        "@vocab": "http://schema.org/",
                        "nazivKluba": "legalName",
                        "adresa": "address",
                        "oib": "leiCode",
                        "mobitel": "telephone"
                    },
                    "@type": "SportsClub",
                    "nazivkluba": row.nazivkluba,
                    "oib": row.oib,
                    "email": row.email,
                    "adresa": {
                        "@type": "PostalAddress",
                        "streetAddress": row.adresa
                    },
                    "mobitel": row.mobitel,
                    "aktivan": row.aktivan,
                    "nazivmjesta": row.nazivmjesta,
                    "postanskibroj": row.postanskibroj,
                    "brojmjestana": row.brojmjestana,
                    "nazivzupanije": row.nazivzupanije,
                    "glavnigrad": row.glavnigrad,
                    "brojstanovnika": row.brojstanovnika
                };
            });

            res.json({ status: 'OK', message: 'Podaci dohvaćeni', response: modifiedResult });
        } catch (error) {
            console.error('Greška pri dohvaćanju podataka iz baze:', error);
            res.status(500).json({ status: 'Not Fetched', message: 'Podaci nisu dohvaćeni', error: 'Greška pri dohvaćanju podataka iz baze!' , response: null });
        }
    } else {
        res.status(401).json({ Error: 'Not logged in' });
    }
});

app.get('/clubs/:id', async(req, res) => {
    if (req.oidc.isAuthenticated()) {
        const id = req.params.id;
        let query = `SELECT k.id_klub AS ID, k.nazklub AS nazivKluba, k.oib, k.email, k.adresa, k.mobitel, k.aktivan, m.nazmjesto AS nazivMjesta, m.postanski_broj AS postanskiBroj, 
                            m.broj_stanovnika AS brojMjestana, z.nazzupanija AS nazivZupanije, z.glavni_grad AS glavniGrad, z.broj_stanovnika AS brojStanovnika
                            FROM klub k JOIN mjesto m ON k.id_mjesto = m.id_mjesto JOIN zupanija z ON m.id_zupanija = z.id_zupanija WHERE k.id_klub = ${id}`;

        try {
            const result = await pool.query(query);
            let modifiedResult = result.rows.map(row => {
                return {
                    "@context": {
                        "@vocab": "http://schema.org/",
                        "nazivKluba": "legalName",
                        "adresa": "address",
                        "oib": "leiCode",
                        "mobitel": "telephone"
                    },
                    "@type": "SportsClub",
                    "nazivKluba": row.nazivkluba,
                    "oib": row.oib,
                    "email": row.email,
                    "adresa": {
                        "@type": "PostalAddress",
                        "streetAddress": row.adresa
                    },
                    "mobitel": row.mobitel,
                    "aktivan": row.aktivan,
                    "nazivMjesta": row.nazivmjesta,
                    "postanskibroj": row.postanskibroj,
                    "brojmjestana": row.brojmjestana,
                    "nazivzupanije": row.nazivzupanije,
                    "glavnigrad": row.glavnigrad,
                    "brojstanovnika": row.brojstanovnika
                };
            });

            if(result.rowCount == 0){
                console.error('Greška pri dohvaćanju podataka iz baze:', error);
                res.status(404).json({ status: 'Not Found', message: 'Klub s danim ID-jem ne postoji', error: 'Greška pri dohvaćanju podataka iz baze!' , response: null });
            }

            res.status(200).json({ status: 'OK', message: 'Podaci o klubu dohvaćeni', response: modifiedResult });
        } catch (error) {
            console.error('Greška pri dohvaćanju podataka iz baze:', error);
            res.status(500).json({ status: 'Not Fetched', message: 'Podaci nisu dohvaćeni', error: 'Greška pri dohvaćanju podataka iz baze!' , response: null });
        }
    } else {
        res.status(401).json({ Error: 'Not logged in' });
    }
});

app.post('/add', upload.none(), async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ Error: 'Not logged in' });
    }

    let data = req.body;
    data.aktivan == 'on' ? (data.aktivan = true) : (data.aktivan = false);

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

        let modifiedResult = result.rows.map(row => {
            return {
                "@context": {
                    "@vocab": "http://schema.org/",
                    "nazKlub": "legalName",
                    "adresa": "address",
                    "oib": "leiCode",
                    "mobitel": "telephone"
                },
                "@type": "SportsClub",
                "id_klub": row.id_klub,
                "nazKlub": row.nazklub,
                "oib": row.oib,
                "email": row.email,
                "adresa": {
                    "@type": "PostalAddress",
                    "streetAddress": row.adresa
                },
                "mobitel": row.mobitel,
                "aktivan": row.aktivan,
                "id_mjesto": row.id_mjesto
            };
        });

        if (result.rowCount == 0) {
            console.error('Greška pri dodavanju podataka u bazu:', error);
            return res.status(500).json({status: 'Not Done', message: 'Klub nije dodan', error: 'Greška pri dodavanju podataka u bazu!', response: null});
        }

        res.status(200).json({status: 'OK', message: 'Podaci o klubu dodani', response: modifiedResult});
    } catch (error) {
        console.error('Greška pri dodavanju podataka u bazu:', error);
        res.status(500).json({status: 'Not Done', message: 'Klub nije dodan', error: 'Greška pri dodavanju podataka u bazu!', response: null});
    }
});

app.post('/update', upload.none(), async(req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ Error: 'Not logged in' });
    }

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

        if(result.rowCount == 0){
            console.error('Greška pri izmjeni podataka:', error);
            res.status(500).json({ status: 'Not Done', message: 'Klub nije izmjenjen', error: 'Greška pri izmjeni podataka!' , response: null });
        }

        res.status(200).json({ status: 'OK', message: 'Podaci o klubu osviježeni', response: result.rows });
    } catch (error) {
        console.error('Greška pri izmjeni podataka:', error);
        res.status(500).json({ status: 'Not Done', message: 'Klub nije izmjenjen', error: 'Greška pri izmjeni podataka!' , response: null });
    }
});

app.post('/delete', upload.none(), async(req, res) => {
    if (!req.oidc.isAuthenticated()) {
        return res.status(401).json({ Error: 'Not logged in' });
    }

    let data = req.body;
    try {
        const { oibKluba } = data;

        const query = `DELETE FROM klub WHERE oib = $1;`;
        const result = await pool.query(query, [oibKluba,]);

        if(result.rowCount == 0){
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
