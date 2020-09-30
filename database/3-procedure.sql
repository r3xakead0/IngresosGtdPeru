USE personalGtdPeru;

DROP PROCEDURE IF EXISTS ListarAutorizaciones;

DELIMITER //

CREATE  PROCEDURE ListarAutorizaciones(
	IN limitNumber INT,
    IN pageNumber INT
)
BEGIN
	DECLARE offsetNumber INT;
    SET offsetNumber = (pageNumber - 1) * limitNumber;
    
	select t0.idAutorizacion, t0.nombres, t0.apellidos, t0.nroDocumento, 
    t0.idCliente, t1.nombre cliente, t0.idContrata, t2.nombre contrata,
	DATE_FORMAT(t0.firmaFechaInicio, "%d/%m/%Y") firmaFechaInicio, DATE_FORMAT(t0.firmaFechaFin, "%d/%m/%Y") firmaFechaFin, 
    DATE_FORMAT(t0.aptoFechaInicio, "%d/%m/%Y") aptoFechaInicio, DATE_FORMAT(t0.aptoFechaFin, "%d/%m/%Y") aptoFechaFin, 
    CASE WHEN t0.firmaFechaInicio <= CURDATE() AND t0.firmaFechaFin >= CURDATE() THEN 'Vigente' ELSE 'Vencido' END estado,
	IFNULL(GROUP_CONCAT(DISTINCT t3.nombre SEPARATOR ','),'') documentos
	from autorizacion t0
	inner join cliente t1 on t1.idCliente = t0.idCliente
	inner join contrata t2 on t2.idContrata = t0.idContrata
	left join documento t3 on t3.idAutorizacion = t0.idAutorizacion
	group by t0.idAutorizacion, t0.nombres, t0.apellidos, t0.nroDocumento, 
    t0.idCliente, t1.nombre, t0.idContrata, t2.nombre,
    t0.firmaFechaInicio, t0.firmaFechaFin, t0.aptoFechaInicio, t0.aptoFechaFin
	order by t0.fechaHoraCreacion desc
	LIMIT limitNumber OFFSET offsetNumber;
END //

DELIMITER ;

DROP PROCEDURE IF EXISTS ListarIngresos;

DELIMITER //

CREATE  PROCEDURE ListarIngresos(
	IN limitNumber INT,
    IN pageNumber INT
)
BEGIN
	DECLARE offsetNumber INT;
    SET offsetNumber = (pageNumber - 1) * limitNumber;
    
	select t0.idIngreso, t0.actividad, t0.observacion,  
    t1.idCliente, t2.nombre cliente, t1.idContrata, t3.nombre contrata, t1.nroDocumento,
	DATE_FORMAT(t0.fechaHoraIngreso, "%Y/%m/%d %T") fechaHoraIngreso, DATE_FORMAT(t0.fechaHoraSalida, "%Y/%m/%d %T") fechaHoraSalida, 
	IFNULL(GROUP_CONCAT(DISTINCT t4.nombre SEPARATOR ','),'') documentos
	from ingreso t0
	inner join autorizacion t1 on t1.idAutorizacion = t0.idAutorizacion
	inner join cliente t2 on t2.idCliente = t1.idCliente
	inner join contrata t3 on t3.idContrata = t1.idContrata
	left join documento t4 on t4.idAutorizacion = t1.idAutorizacion
	group by t0.idIngreso, t0.actividad, t0.observacion,  
    t1.idCliente, t2.nombre, t1.idContrata, t3.nombre, t1.nroDocumento,
    t0.fechaHoraIngreso, t0.fechaHoraSalida
	order by t0.fechaHoraCreacion desc
	LIMIT limitNumber OFFSET offsetNumber;
END //

DELIMITER ;
