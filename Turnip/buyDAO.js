module.exports = {
    ajouterAchat : (achat, connection, errFun) => {
        let statement = `INSERT INTO BUY(code_ami, picture, value) VALUES (?,?,?)`;
        let attributes = [achat.code_ami, achat.picture, achat.value];
        connection.query(statement, attributes, (err, results, fields) => {
            errFun(err, results);
        });
    },
    listeAchats : (connection, retFun) => {
        let statement = `SELECT * FROM BUY ORDER BY date`;
        connection.query(statement, (err, results, fields) => {
            retFun(err, results);
        });
    },

}