-- Popolamento utenti
INSERT INTO utente (id, username, nome, cognome, password) VALUES (1, 'djalpha', 'Alessandro', 'Rossi', 'pwd1');
INSERT INTO utente (id, username, nome, cognome, password) VALUES (2, 'djbeta', 'Beatrice', 'Bianchi', 'pwd2');
INSERT INTO utente (id, username, nome, cognome, password) VALUES (3, 'djgamma', 'Giorgio', 'Verdi', 'pwd3');
INSERT INTO utente (id, username, nome, cognome, password) VALUES (4, 'djdelta', 'Diana', 'Neri', 'pwd4');

-- Popolamento brani (solo alcuni di esempio, incluso quello richiesto)
INSERT INTO brano (id, titolo, durata, id_album) VALUES (3405992021, 'Brano Speciale', '00:03:30', 1);
INSERT INTO brano (id, titolo, durata, id_album) VALUES (1002, 'Brano 2', '00:04:00', 1);
INSERT INTO brano (id, titolo, durata, id_album) VALUES (1003, 'Brano 3', '00:02:45', 1);
INSERT INTO brano (id, titolo, durata, id_album) VALUES (1004, 'Brano 4', '00:03:10', 2);
INSERT INTO brano (id, titolo, durata, id_album) VALUES (1005, 'Brano 5', '00:03:50', 2);

-- Popolamento passaggi: il brano 3405992021 è sempre il primo o il secondo brano
INSERT INTO passaggio (id, testo, inizio_secondo_brano, cue_secondo_brano, data_pubblicazione, id_utente, id_brano_1, id_brano_2) VALUES (1, 'Mix 1', '00:01:00', '00:00:30', '2025-09-17 10:00:00', 1, 3405992021, 1002);
INSERT INTO passaggio (id, testo, inizio_secondo_brano, cue_secondo_brano, data_pubblicazione, id_utente, id_brano_1, id_brano_2) VALUES (2, 'Mix 2', '00:02:00', '00:01:30', '2025-09-17 10:10:00', 2, 1003, 3405992021);
INSERT INTO passaggio (id, testo, inizio_secondo_brano, cue_secondo_brano, data_pubblicazione, id_utente, id_brano_1, id_brano_2) VALUES (3, 'Mix 3', '00:01:30', '00:00:45', '2025-09-17 10:20:00', 3, 3405992021, 1004);
INSERT INTO passaggio (id, testo, inizio_secondo_brano, cue_secondo_brano, data_pubblicazione, id_utente, id_brano_1, id_brano_2) VALUES (4, 'Mix 4', '00:02:10', '00:01:10', '2025-09-17 10:30:00', 4, 1005, 3405992021);
INSERT INTO passaggio (id, testo, inizio_secondo_brano, cue_secondo_brano, data_pubblicazione, id_utente, id_brano_1, id_brano_2) VALUES (5, 'Mix 5', '00:01:50', '00:00:50', '2025-09-17 10:40:00', 1, 3405992021, 1003);
INSERT INTO passaggio (id, testo, inizio_secondo_brano, cue_secondo_brano, data_pubblicazione, id_utente, id_brano_1, id_brano_2) VALUES (6, 'Mix 6', '00:02:20', '00:01:20', '2025-09-17 10:50:00', 2, 1002, 3405992021);
INSERT INTO passaggio (id, testo, inizio_secondo_brano, cue_secondo_brano, data_pubblicazione, id_utente, id_brano_1, id_brano_2) VALUES (7, 'Mix 7', '00:01:10', '00:00:40', '2025-09-17 11:00:00', 3, 3405992021, 1005);
INSERT INTO passaggio (id, testo, inizio_secondo_brano, cue_secondo_brano, data_pubblicazione, id_utente, id_brano_1, id_brano_2) VALUES (8, 'Mix 8', '00:02:30', '00:01:15', '2025-09-17 11:10:00', 4, 1004, 3405992021);
-- Altri passaggi possono essere aggiunti ripetendo combinazioni
