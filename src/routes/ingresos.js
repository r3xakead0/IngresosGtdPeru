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
        res.render('ingresos/add', { clientes, contratas });
    });
});

router.post('/add', isLoggedIn, async (req, res) => {
    const form = req.body;

    var fechaHoraInicio = moment(form.fechaHoraInicio).format('YYYY-MM-DD HH:mm');
    var fechaHoraFin = moment(form.fechaHoraFin).format('YYYY-MM-DD HH:mm');

    const newingreso = {
        nroingreso: form.nroingreso,
        idSala: form.sala,
        idActividad: form.actividad,
        idEquipo: form.equipo,
        fechaHoraInicio: fechaHoraInicio,
        fechaHoraFin: fechaHoraFin,
        idSupervisor: form.supervisor,
        idCliente: form.cliente,
        idProveedor: form.proveedor,
        descripcionTrabajo: form.descripcionTrabajo,
        personalCliente: form.personalCliente,
        personalProveedor: form.personalProveedor,
        personalGtd: form.personalGtd,
        idUsuario: req.user.idUsuario
    };
    await pool.query('INSERT INTO ingreso set ?', [newingreso]);

    if (req.file) {

        const fileUrl = form.nroingreso.toString() + '-1';

        const fileTempPath = req.file.path;
        const ext = path.extname(req.file.originalname).toLowerCase();
        const targetPath = path.resolve(`src/public/document/${fileUrl}${ext}`);

        if (ext === '.pdf') {
            await fs.rename(fileTempPath, targetPath);
            const newDocument = {
                nombre: path.basename(targetPath),
                nroingreso: form.nroingreso
            };

            await pool.query('INSERT INTO documento set ?', [newDocument]);
        } else {
            await fs.unlink(fileTempPath);
            res.status(500).json({ error: 'Solo archivos PDF' });
        }

    }

    req.flash('success', 'ingreso guardado satisfactoriamente');
    res.redirect('/ingresos');
});

router.get('/:page?', isLoggedIn, async (req, res) => {

    const result = await pool.query('SELECT COUNT(1) count FROM ingreso');

    var pageSize = 10;
    var page = req.query.page || 1;
    var totalRows = result[0].count;
    var pageCount = Math.ceil(totalRows / pageSize);
    var limit = pageCount > pageSize ? pageCount : pageSize;

    const consulta = await pool.query('CALL ListarIngresos(' + pageSize + ',' + page + ')');
    let ingresos = consulta[0];
    ingresos.forEach(ingreso => {
        let documentos = [];
        const arrDocumentos = ingreso.documentos.split(',');
        arrDocumentos.forEach(element => {
            documentos.push({ nombre: element });
        });
        ingreso.documentos = documentos;
    });

    res.render('ingresos/list', {
        ingresos: ingresos,
        pagination: {
            page: page,
            limit: pageSize,
            totalRows: totalRows,
            pageCount: pageCount
        }
    });
});

router.get('/delete/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    const documentos = await pool.query('SELECT * FROM documento WHERE nroingreso = ?', [id]);

    for (let i = 0; i < documentos.length; i++) {
        let document = documentos[i];
        let filePath = path.resolve(`src/public/document/${document.nombre}`);
        await fs.unlink(filePath);
    }

    await pool.query('DELETE FROM documento WHERE nroingreso = ?', [id]);

    await pool.query('DELETE FROM ingreso WHERE nroingreso = ?', [id]);

    req.flash('success', 'ingreso eliminado satisfactoriamente');
    res.redirect('/ingresos');
});

router.get('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    var ingresos = await pool.query('SELECT t0.*, t1.idEspecialidad FROM ingreso t0 INNER JOIN actividad t1 ON t1.idActividad = t0.idActividad WHERE t0.nroingreso = ?', [id])
    const ingreso = ingresos[0];

    if (ingreso) {
        Promise.all([
            await pool.query('SELECT * FROM equipo WHERE activo = ?', true),
            await pool.query('SELECT * FROM sala WHERE activo = ?', true),
            await pool.query('SELECT * FROM supervisor WHERE activo = ?', true),
            await pool.query('SELECT * FROM cliente WHERE activo = ?', true),
            await pool.query('SELECT * FROM proveedor WHERE activo = ?', true),
            await pool.query('SELECT * FROM especialidad WHERE activo = ?', true),
            await pool.query('SELECT * FROM actividad WHERE idEspecialidad = ' + ingreso.idEspecialidad + ' and activo = ?', true),
        ]).then(values => {
            const equipos = values[0];
            const salas = values[1];
            const supervisores = values[2];
            const clientes = values[3];
            const proveedores = values[4];
            const especialidades = values[5];
            const actividades = values[6];

            var fechaHoraInicio = moment(ingreso.fechaHoraInicio).format('YYYY-MM-DDTHH:mm');
            var fechaHoraFin = moment(ingreso.fechaHoraFin).format('YYYY-MM-DDTHH:mm');
            ingreso.fechaHoraInicio = fechaHoraInicio;
            ingreso.fechaHoraFin = fechaHoraFin;

            res.render('ingresos/edit', { ingreso, equipos, salas, supervisores, clientes, proveedores, especialidades, actividades });
        });
    } else {
        res.redirect('/ingresos');
    }
});

router.post('/edit/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;

    const form = req.body;
    var fechaHoraInicio = moment(form.fechaHoraInicio).format('YYYY-MM-DD HH:mm');
    var fechaHoraFin = moment(form.fechaHoraFin).format('YYYY-MM-DD HH:mm');

    const newingreso = {
        idSala: form.sala,
        idActividad: form.actividad,
        idEquipo: form.equipo,
        fechaHoraInicio: fechaHoraInicio,
        fechaHoraFin: fechaHoraFin,
        idSupervisor: form.supervisor,
        idCliente: form.cliente,
        idProveedor: form.proveedor,
        descripcionTrabajo: form.descripcionTrabajo,
        personalCliente: form.personalCliente,
        personalProveedor: form.personalProveedor,
        personalGtd: form.personalGtd,
        idUsuario: req.user.idUsuario
    };

    await pool.query('UPDATE ingreso set ? WHERE nroingreso = ?', [newingreso, id]);
    req.flash('success', 'ingreso actualizado satisfactoriamente');
    res.redirect('/ingresos');
});

router.get('/document/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
    res.render('ingresos/document', { nroingreso: id });
});

router.post('/document', isLoggedIn, async (req, res) => {
    const { nroingreso, documento } = req.body;

    const consulta = await pool.query('SELECT * FROM documento WHERE nroingreso = ?', nroingreso);
    const fileUrl = nroingreso.toString() + '-' + (consulta.length + 1).toString();

    const fileTempPath = req.file.path;
    const ext = path.extname(req.file.originalname).toLowerCase();
    const targetPath = path.resolve(`src/public/document/${fileUrl}${ext}`);

    if (ext === '.pdf') {
        await fs.rename(fileTempPath, targetPath);
        const newDocument = {
            nombre: path.basename(targetPath),
            nroingreso: nroingreso
        };

        await pool.query('INSERT INTO documento set ?', [newDocument]);
        res.redirect('/ingresos');
    } else {
        await fs.unlink(fileTempPath);
        res.status(500).json({ error: 'Solo archivos PDF' });
    }

});

module.exports = router;