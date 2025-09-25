-- Query di INSERT per la tabella Valutazione
-- Utenti esistenti: 1, 2, 3, 4, 8, 9
-- Passaggi esistenti: 1, 2, 3, 4, 5, 6, 7, 8
-- Voto: scala da 1 a 5 stelle

INSERT INTO valutazione (voto, id_utente, id_passaggio) VALUES
(5, 1, 1),
(4, 2, 1),
(5, 3, 1),
(3, 4, 2),
(4, 8, 2),
(5, 9, 2),
(4, 1, 3),
(5, 2, 3),
(3, 3, 3),
(4, 4, 4),
(2, 8, 4),
(4, 9, 4),
(5, 1, 5),
(5, 2, 5),
(4, 3, 5),
(3, 4, 6),
(2, 8, 6),
(4, 9, 6),
(5, 1, 7),
(4, 2, 7),
(5, 3, 7),
(4, 4, 8),
(5, 8, 8),
(3, 9, 8);