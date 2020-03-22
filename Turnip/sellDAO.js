module.exports = {
    ajouterVente : (vente, connection, errFun) => {
        let statement = `INSERT INTO SELL(code_ami, picture, value) VALUES (?,?,?)`;
        let attributes = [vente.code_ami, vente.picture, vente.value];
        connection.query(statement, attributes, (err, results, fields) => {
            errFun(err, results);
        });
    },
    listeVentes : (connection, retFun) => {
        let statement = `SELECT * FROM SELL ORDER BY date`;
        connection.query(statement, (err, results, fields) => {
            retFun(err, results);
        });
    },

}