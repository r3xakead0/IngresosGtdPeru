'use strict';
const router = require('express').Router();
const moment = require('moment');
const path = require('path');
const fs = require('fs-extra');

const pool = require('../database');
const { isLoggedIn } = require('../lib/auth');

router.get('/add', isLoggedIn, async (req, res) => {
    Promise.all([
        await pool.query('SELECT * FROM cliente WHERE activo = ?', true),
        await pool.query('SELECT * FROM contrata WHERE activo = ?', true),
    ]).then(values => {
        const clientes = values[0];
        const contratas = values[1];
        res.render('autorizaciones/add', { clientes, contratas });
    });
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    var autorizaciones = await pool.query('SELECT t0.* FROM autorizacion t0 WHERE t0.idAutorizacion = ? LIMIT 1', [id])
    const autorizacion = autorizaciones[0];

    if (autorizacion) {
        Promise.all([
            await pool.query('SELECT * FROM cliente WHERE activo = ?', true),
            await pool.query('SELECT * FROM contrata WHERE activo = ?', true),
        ]).then(values => {
            const clientes = values[0];
            const contratas = values[1];

            autorizacion.firmaFechaInicio = moment(autorizacion.firmaFechaInicio).format('YYYY-MM-DD');
            autorizacion.firmaFechaFin = moment(autorizacion.firmaFechaFin).format('YYYY-MM-DD');
            autorizacion.aptoFechaInicio = moment(autorizacion.aptoFechaInicio).format('YYYY-MM-DD');
            autorizacion.aptoFechaFin = moment(autorizacion.aptoFechaFin).format('YYYY-MM-DD');

            res.render('autorizaciones/edit', { autorizacion, clientes, contratas });
        });
    } else {
        res.redirect('/autorizaciones');
    }
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    const documentos = await pool.query('SELECT * FROM documento WHERE idAutorizacion = ?', [id]);

    for (let i = 0; i < documentos.length; i++) {
        let document = documentos[i];
        let filePath = path.resolve(`src/public/document/${document.nombre}`);
        await fs.unlink(filePath);
    }

    await pool.query('DELETE FROM documento WHERE idAutorizacion = ?', [id]);

    await pool.query('DELETE FROM autorizacion WHERE idAutorizacion = ?', [id]);

    req.flash('success', 'Autorizacion eliminada satisfactoriamente');
    res.redirect('/autorizaciones');
});

router.get('/document/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    res.render('autorizaciones/document', { idAutorizacion: id });
});

router.get('/:page?', isLoggedIn, async (req, res) => {

    const result = await pool.query('SELECT COUNT(1) count FROM autorizacion');

    var pageSize = 10;
    var page = req.query.page || 1;
    var totalRows = result[0].count;
    var pageCount = Math.ceil(totalRows / pageSize);

    const consulta = await pool.query('CALL ListarAutorizaciones(' + pageSize + ',' + page + ')');

    let autorizaciones = consulta[0];
    autorizaciones.forEach(autorizacion => {
        let documentos = [];
        const arrDocumentos = autorizacion.documentos.split(',');
        arrDocumentos.forEach(element => {
            documentos.push({ nombre: element });
        });
        autorizacion.documentos = documentos;
    });

    res.render('autorizaciones/list', {
        autorizaciones: autorizaciones,
        pagination: {
            page: page,
            limit: pageSize,
            totalRows: totalRows,
            pageCount: pageCount
        }
    });
});

router.post('/add', isLoggedIn, async (req, res) => {
    const form = req.body;

    var firmaFechaInicio = moment(form.firmaFechaInicio).format('YYYY-MM-DD');
    var firmaFechaFin = moment(form.firmaFechaFin).format('YYYY-MM-DD');
    var aptoFechaInicio = moment(form.aptoFechaInicio).format('YYYY-MM-DD');
    var aptoFechaFin = moment(form.aptoFechaFin).format('YYYY-MM-DD');

    const newAutorizacion = {
        nombres: form.nombres,
        apellidos: form.apellidos,
        nroDocumento: form.nroDocumento,
        idCliente: form.cliente,
        idContrata: form.contrata,
        firmaFechaInicio: firmaFechaInicio,
        firmaFechaFin: firmaFechaFin,
        aptoFechaInicio: aptoFechaInicio,
        aptoFechaFin: aptoFechaFin,
        idUsuarioCreacion: req.user.idUsuario,
        fechaHoraCreacion: moment().format('YYYY-MM-DDTHH:mm')
    };

    await pool.query('INSERT INTO autorizacion set ?', [newAutorizacion]);

    if (req.file) {

        var autorizacion = await pool.query('SELECT MAX(idAutorizacion) idAutorizacion FROM autorizacion')
        const idAutorizacion = autorizacion[0].idAutorizacion;
        console.log(idAutorizacion);
        const fileUrl = idAutorizacion.toString() + '-1';

        const fileTempPath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        const targetPath = path.resolve(`src/public/document/${fileUrl}${ext}`);

        if (ext === '.pdf') {
            await fs.rename(fileTempPath, targetPath);
            const newDocument = {
                nombre: path.basename(targetPath),
                idAutorizacion: idAutorizacion
            };

            await pool.query('INSERT INTO documento set ?', [newDocument]);
        } else {
            await fs.unlink(fileTempPath);
            res.status(500).json({ error: 'Solo archivos PDF' });
        }

    }

    req.flash('success', 'Autorizacion guardada satisfactoriamente');
    res.redirect('/autorizaciones');
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    const form = req.body;
    var firmaFechaInicio = moment(form.firmaFechaInicio).format('YYYY-MM-DD');
    var firmaFechaFin = moment(form.firmaFechaFin).format('YYYY-MM-DD');
    var aptoFechaInicio = moment(form.aptoFechaInicio).format('YYYY-MM-DD');
    var aptoFechaFin = moment(form.aptoFechaFin).format('YYYY-MM-DD');

    const editAutorizacion = {
        nombres: form.nombres,
        apellidos: form.apellidos,
        nroDocumento: form.nroDocumento,
        idCliente: form.cliente,
        idContrata: form.contrata,
        firmaFechaInicio: firmaFechaInicio,
        firmaFechaFin: firmaFechaFin,
        aptoFechaInicio: aptoFechaInicio,
        aptoFechaFin: aptoFechaFin,
        idUsuarioModificacion: req.user.idUsuario,
        fechaHoraModificacion: moment().format('YYYY-MM-DDTHH:mm')
    };

    await pool.query('UPDATE autorizacion set ? WHERE idAutorizacion = ?', [editAutorizacion, id]);

    req.flash('success', 'Autorizacion actualizada satisfactoriamente');
    res.redirect('/autorizaciones');
});

router.post('/document', isLoggedIn, async (req, res) => {
    const { idAutorizacion, documento } = req.body;

    const consulta = await pool.query('SELECT * FROM documento WHERE idAutorizacion = ?', idAutorizacion);
    const fileUrl = idAutorizacion.toString() + '-' + (consulta.length + 1).toString();

    const fileTempPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const targetPath = path.resolve(`src/public/document/${fileUrl}${ext}`);

    if (ext === '.pdf') {
        await fs.rename(fileTempPath, targetPath);
        const newDocument = {
            nombre: path.basename(targetPath),
            idAutorizacion: idAutorizacion
        };

        await pool.query('INSERT INTO documento set ?', [newDocument]);
        res.redirect('/autorizaciones');
    } else {
        await fs.unlink(fileTempPath);
        res.status(500).json({ error: 'Solo archivos PDF' });
    }

});

module.exports = router;