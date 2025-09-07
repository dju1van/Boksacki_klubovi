const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 5500;

app.use(express.static('public'));

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

app.listen(port, () => {
    console.log(`Poslužitelj pokrenut! port:` + port);
});
