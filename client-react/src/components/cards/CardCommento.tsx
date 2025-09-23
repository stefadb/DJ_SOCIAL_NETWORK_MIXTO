function CardCommento(props: { commento: CommentoDb, utente: UtenteDb }) {
    const { commento, utente } = props;
    return (
        <div key={commento.id} style={{ marginLeft: livello * 24, marginTop: 8, borderLeft: livello ? "1px solid #eee" : undefined, paddingLeft: livello ? 12 : 0 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <img src={PLACEHOLDER_USER} alt="avatar" style={{ width: 32, height: 32, borderRadius: "50%", marginRight: 8 }} />
                <b>{commento.autore.nome}</b>
                {commento.isAutorePassaggio && <span style={{ marginLeft: 6, color: "#d32f2f", fontSize: 12, border: "1px solid #d32f2f", borderRadius: 8, padding: "0 4px", marginRight: 4 }}>autore</span>}
                <span style={{ marginLeft: 8, color: "#888", fontSize: 12 }}>{new Date(commento.data).toLocaleString()}</span>
            </div>
            <div style={{ marginTop: 2 }}>{commento.testo}</div>
            <div style={{ display: "flex", alignItems: "center", marginTop: 2 }}>
                {renderStars(commento.rating)}
                <span style={{ marginLeft: 8, color: "#888", fontSize: 12 }}>Ha dato {commento.rating} stelle</span>
                <button style={{ marginLeft: 16, fontSize: 12 }}>Rispondi</button>
            </div>
            {commento.risposte && commento.risposte.length > 0 && (
                <div style={{ marginTop: 4 }}>
                    <button style={{ fontSize: 12 }}>Nascondi {commento.risposte.length} risposte</button>
                    {commento.risposte.map(r => renderCommento(r, livello + 1))}
                </div>
            )}
        </div>
    );
}

export default CardCommento;