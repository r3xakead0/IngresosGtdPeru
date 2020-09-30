DROP DATABASE IF EXISTS personalGtdPeru;

CREATE DATABASE personalGtdPeru;

USE personalGtdPeru;

CREATE TABLE usuario (
    idUsuario INT NOT NULL AUTO_INCREMENT,
    nombreUsuario VARCHAR(16) NOT NULL,
    clave VARCHAR(60) NOT NULL,
    nombreCompleto VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    administrador BOOL DEFAULT FALSE,
    PRIMARY KEY (idUsuario)
);

CREATE TABLE cliente (
    idCliente INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    activo BOOL DEFAULT TRUE,
    PRIMARY KEY (idCliente)
);

CREATE TABLE contrata (
    idContrata INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    activo BOOL DEFAULT TRUE,
    PRIMARY KEY (idContrata)
);

CREATE TABLE clienteContrata (
    idClienteContrata INT NOT NULL AUTO_INCREMENT,
    idCliente INT NOT NULL,
    idContrata INT NOT NULL,
    PRIMARY KEY (idclienteContrata),
    FOREIGN KEY (idCliente) REFERENCES cliente(idCliente),
    FOREIGN KEY (idContrata) REFERENCES contrata(idContrata)
);

CREATE TABLE autorizacion (
    idAutorizacion INT NOT NULL AUTO_INCREMENT,
    nnombres VARCHAR(50) NOT NULL,
    apellidos VARCHAR(50) NOT NULL,
    nroDocumento VARCHAR(20) NOT NULL,
    cliente INT NOT NULL,
    idContrata INT NOT NULL,
    firmaFechaInicio DATE NOT NULL,
    firmaFechaFin DATE NOT NULL,
    aptoFechaInicio DATE NOT NULL,
    aptoFechaFin DATE NOT NULL,
    activo BOOL DEFAULT TRUE,
    idUsuarioCreacion INT NOT NULL,
    fechaHoraCreacion DATETIME NOT NULL,
    idUsuarioModificacion INT NULL,
    fechaHoraModificacion DATETIME NULL,
    PRIMARY KEY (idAutorizacion),
    FOREIGN KEY (idCliente) REFERENCES cliente(idCliente),
    FOREIGN KEY (idContrata) REFERENCES contrata(idContrata)
);

CREATE TABLE documento (
	idDocumento INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    idAutorizacion INT NOT NULL,
    PRIMARY KEY (idDocumento),
    FOREIGN KEY (idAutorizacion) REFERENCES autorizacion(idAutorizacion)
);

CREATE TABLE ingreso (
    idIngreso INT NOT NULL AUTO_INCREMENT,
    idAutorizacion INT NOT NULL,
    actividad TEXT,
    observacion TEXT,
	activo BOOL DEFAULT TRUE,
    idUsuarioCreacion INT NOT NULL,
    fechaHoraCreacion DATETIME NOT NULL,
    idUsuarioModificacion INT NULL,
    fechaHoraModificacion DATETIME NULL,
    PRIMARY KEY (idIngreso),
    FOREIGN KEY (idAutorizacion) REFERENCES autorizacion(idAutorizacion)
);