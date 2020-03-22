module.exports = {
    ajouterTrade : (trade, connection, retFun) => {
        let statement = `INSERT INTO TRADE(traveler, host, message, state) VALUES (?,?,?,?)`;
        let attributes = [trade.traveler, trade.host, trade.message, trade.status];

        connection.query(statement, attributes, (err, results, fields) => {
            retFun(err, results);
        });
    },
    listeTradeRec : (code_ami, connection, retFun) => {
        let statement = `SELECT * FROM TRADE WHERE HOST=?`;
        let attributes=[code_ami];
        connection.query(statement, attributes, (err, results, fields) => {
            retFun(err, results);
        });
    },
    listeTradeSent : (code_ami, connection, retFun) => {
        let statement = `SELECT * FROM TRADE WHERE TRAVELER=?`;
        let attributes=[code_ami];
        connection.query(statement, attributes, (err, results, fields) => {
            retFun(err, results);
        });
    },
    acceptTrade : (code_ami, idTrade, connection, retFun) => {
        let statement = `SELECT * FROM TRADE WHERE HOST=? AND ID=?`;
        let attributes=[code_ami, idTrade];
        connection.query(statement, attributes, (err,results, fields) => {
            if(err) {retFun(err, {})}
            if(results.length == 0) {retFun(new Error("Erreur lors de la tentative d'acception d'un échange"), {})}
            let trade = results[0];
            let statement = `UPDATE TRADE SET state="accepté" WHERE ID=?`;
            let attributes = [idTrade];
            trade.state="accepté";
            connection.query(statement, attributes, (err, results, fields) => {
                retFun(err, trade);
            });
        })
    },
    refuseTrade : (code_ami, idTrade, connection, retFun) => {
        let statement = `SELECT * FROM TRADE WHERE HOST=? AND ID=?`;
        let attributes=[code_ami, idTrade];
        connection.query(statement, attributes, (err,results, fields) => {
            if(err) {retFun(err, {})}
            if(results.length == 0) {retFun(new Error("Erreur lors de la tentative du refus d'un échange"), {})}
            let trade = results[0];
            let statement = `UPDATE TRADE SET state="refusé" WHERE ID=?`;
            let attributes = [idTrade];
            trade.state="refusé";
            connection.query(statement, attributes, (err, results, fields) => {
                retFun(err, trade);
            });
        })
    },
}