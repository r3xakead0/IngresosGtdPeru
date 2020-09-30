USE personalGtdPeru;

INSERT INTO usuario (nombreusuario, clave, nombreCompleto, email, administrador)
VALUES ('admin', '$2a$10$RtmjRYFJkMkY3HpfK9UkNuu/6S9aKkP0t4vYDVP/0ZSekDgjhg61C', 'Administrador de Sistema', 'admin@mail.com', true);

INSERT INTO cliente (nombre) VALUES ('BISA');
INSERT INTO cliente (nombre) VALUES ('GTD-DC');
INSERT INTO cliente (nombre) VALUES ('GTD-IMP');
INSERT INTO cliente (nombre) VALUES ('GTD-PEXT');
INSERT INTO cliente (nombre) VALUES ('GTD-TI');
INSERT INTO cliente (nombre) VALUES ('INTERNEXA');

INSERT INTO contrata (nombre) VALUES ('APICSA');
INSERT INTO contrata (nombre) VALUES ('BISA');
INSERT INTO contrata (nombre) VALUES ('COINSA');
INSERT INTO contrata (nombre) VALUES ('CUMMINS');
INSERT INTO contrata (nombre) VALUES ('GTD-PAC');
INSERT INTO contrata (nombre) VALUES ('GTD-RED');
INSERT INTO contrata (nombre) VALUES ('GTD-TI');
INSERT INTO contrata (nombre) VALUES ('MATYSGER');
INSERT INTO contrata (nombre) VALUES ('NETPRO');
INSERT INTO contrata (nombre) VALUES ('SERGEL');
INSERT INTO contrata (nombre) VALUES ('SNAKECOM');
INSERT INTO contrata (nombre) VALUES ('VERTIV');
