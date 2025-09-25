-- Query di INSERT per la tabella Commento
-- Utenti esistenti: 1, 2, 3, 4, 8, 9
-- Passaggi esistenti: 1, 2, 3, 4, 5, 6, 7, 8

INSERT INTO commento (testo, data_pubblicazione, id_utente, id_passaggio, id_commento_padre) VALUES
('Ottimo passaggio! La transizione è molto fluida.', '2024-09-20 14:30:00', 1, 1, NULL),
('Sono d\'accordo, il mix è perfetto!', '2024-09-20 15:15:00', 2, 1, 1),
('Bello questo brano, non lo conoscevo.', '2024-09-21 10:20:00', 3, 2, NULL),
('Il drop è fantastico!', '2024-09-21 16:45:00', 4, 2, NULL),
('Mi piace molto come hai mixato questi due brani', '2024-09-22 09:10:00', 8, 3, NULL),
('Grazie per il consiglio!', '2024-09-22 11:30:00', 1, 3, 5),
('Questo passaggio è troppo tecnico per me 😅', '2024-09-22 18:20:00', 9, 4, NULL),
('Con un po\' di pratica ci riuscirai anche tu!', '2024-09-22 19:05:00', 2, 4, 7),
('I BPM sono perfettamente allineati', '2024-09-23 08:45:00', 3, 5, NULL),
('Complimenti per la creatività!', '2024-09-23 12:15:00', 4, 5, NULL),
('Non mi convince molto questo accostamento', '2024-09-23 15:30:00', 8, 6, NULL),
('Interessante punto di vista', '2024-09-23 16:10:00', 9, 6, 11),
('La parte finale è spettacolare!', '2024-09-24 10:00:00', 1, 7, NULL),
('Dove posso trovare il primo brano?', '2024-09-24 14:20:00', 2, 7, NULL),
('Lo trovi su Spotify', '2024-09-24 14:35:00', 3, 7, 14),
('Passaggio molto energico, perfetto per la pista!', '2024-09-24 20:15:00', 4, 8, NULL),
('Sì, l\'ho suonato ieri sera e ha fatto impazzire tutti!', '2024-09-24 21:00:00', 8, 8, 16),
('Voglio imparare anch\'io a fare passaggi così!', '2024-09-25 09:30:00', 9, 8, NULL);