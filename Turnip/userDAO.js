module.exports = {
    createUser :  (user, connection, errFun) => {
        let statement = `INSERT INTO user(pseudo, code_ami, password, status) values (?,?,?,?)`;
        let attribute = [user.pseudo, user.code_ami, user.password, user.status];
        connection.query(statement, attribute, (err, results, fields) => {
            errFun(err);
        });
    },
    findUserByPseudo : (pseudo, connection,  retFun) => {
        let statement = `SELECT * from user where pseudo = (?)`;
        let attribute = [pseudo];
        connection.query(statement, attribute, (err, results, fields) => {
            let user = results[0];
            retFun(err, user)
        });
    },
    findUserByCode : (code_ami, connection, retFun) => {
        let statement = `SELECT * from user where code_ami = ?`;
        let attribute = [code_ami];
        connection.query(statement, attribute, (err, results, fields) => {
            let user = results[0];
            retFun(err, user);
        });
    }
}