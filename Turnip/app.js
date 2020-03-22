
/**
 * 
 * Modules NODEJS
 */
const express = require('express')
const mysql = require('mysql')
var bodyParser = require('body-parser');
const app = express()
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const log = require('simple-node-logger').createSimpleLogger('project.log');

/**
 * 
 * IMPORT PERSONNELS
 * 
 */

const userDAO = require("./userDAO");
const sellDAO = require("./sellDAO");
const buyDAO = require("./buyDAO");
const tradeDAO = require("./tradeDAO");

const SECRET_KEY = "0Vj9oEVrz7o9o8eGnwZdPvuHwYsZcSmo";

router.use(bodyParser.urlencoded({ extended: false}));

router.use(bodyParser.json());

var con = mysql.createConnection({
  host: "localhost",
  user: "user1",
  password: "1234",
  database: "TurnipDB"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected !");
});


router.post('/register', (req, res) => {
  if(req.body.pseudo == undefined) {
    return res.status(400).send({error: 'pseudo manquant'});
  }
  if(req.body.code_ami == undefined) {
    return res.status(400).send({error: 'code_ami manquant'});
  }
  if(req.body.password == undefined) {
    return res.status(400).send({error: 'password manquant'});
  }
  const pseudo = req.body.pseudo;
  const code_ami = req.body.code_ami;
  const password = bcrypt.hashSync(req.body.password);

  const user = {
    pseudo : pseudo,
    code_ami : code_ami,
    password: password,
  }

  userDAO.createUser(user, con, (err) => {
    if(err) {
      log.error(err);
      return res.status(500).send({error:"Une erreur est survenu"});
    } else {
      const expiresIn = 24 * 60 * 60;
      const access_token = jwt.sign({id: user.code_ami}, SECRET_KEY, {expiresIn:expiresIn});
      res.status(200).send({
        "pseudo" : user.pseudo,
        "code_ami" : user.code_ami,
        "access_token" : access_token,
        "expires_in":expiresIn
      });
    }
  });
});

router.post('/login', (req, res) => {
  if(req.body.pseudo == undefined) {
    return res.status(400).send({error: 'pseudo manquant'});
  }
  if(req.body.password == undefined) {
    return res.status(400).send({error: 'password manquant'});
  }

  const pseudo = req.body.pseudo;
  const password = req.body.password;

  userDAO.findUserByPseudo(pseudo, con, (err, user) => {
    if(err) {
      log.error(err);
      return res.status(500).send({error:"Une erreur est survenu"});
    }
    if(!user) return res.status(404).send({error:"échec de l'authentification"});
    const result = bcrypt.compareSync(password, user.password);
    if(!result) return res.status(404).send({error:"échec de l'authentification"});

    const expiresIn = 24 * 60 *  60;
    const access_token = jwt.sign({id : user.code_ami}, SECRET_KEY, {
      expiresIn : expiresIn
    });
    res.status(200).send({
      "pseudo" : user.pseudo,
      "code_ami" : user.code_ami,
      "access_token" : access_token,
      "expires_in" : expiresIn
    })
  })
});

// Ajout d'une valeur de vente
router.post('/sell', (req, res) => {
  const token = req.headers['authorization'];

  const picture = req.body.picture;
  const value = req.body.value;

  if(picture == undefined) {
    return res.status(400).send({error:"picture manquant"});
  }
  if(value == undefined) {
    return res.status(400).send({error:"value manquant"});
  }

  if(typeof picture != "string") {
    return res.status(400).send({error:"picture mal typé"});
  }
  if(typeof value != "number") {
    return res.status(400).send({error:"value mal typé"});
  }

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if(err) {
      return res.status(401).send("Your token doesn't exists or is expired, please login again");
    }
    const code_ami = userData.id;
    let vente = {
      "code_ami" : code_ami,
      "picture" : picture,
      "value" : value
    }
    sellDAO.ajouterVente(vente, con, (err, result) => {
      if(err) {
        log.error(err);
        return res.status(500).send({error:"Une erreur est survenue"});
      }
      vente.id = result.insertId;
      res.status(200).send(vente);
    });
  })
});


//récupère la liste de vente
//critières : non-expiré puis expiré, trié par valeur
router.get('/sell', (req, res) => {
  const token = req.headers['authorization'];

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if(err) return res.status(401).send("Your token doesn't exists or is expired, please login again");
    const code_ami = userData.id;
    sellDAO.listeVentes(con, (err, results) => {
      if(err) {
        log.error(err);
      }
      res.status(200).send(results);
    })
  })
})

// Ajout d'une valeur d'achat
router.post('/buy', (req, res) => {
  const token = req.headers['authorization'];

  const picture = req.body.picture;
  const value = req.body.value;

  if(picture == undefined) {
    return res.status(400).send({error:"picture manquant"});
  }
  if(value == undefined) {
    return res.status(400).send({error:"value manquant"});
  }

  if(typeof picture != "string") {
    return res.status(400).send({error:"picture mal typé"});
  }
  if(typeof value != "number") {
    return res.status(400).send({error:"value mal typé"});
  }

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if(err) {
      return res.status(401).send("Your token doesn't exists or is expired, please login again");
    }
    const code_ami = userData.id;
    let achat = {
      "code_ami" : code_ami,
      "picture" : picture,
      "value" : value
    }
    buyDAO.ajouterAchat(achat, con, (err, result) => {
      if(err) {
        log.error(err);
        return res.status(500).send({error:"Une erreur est survenue"});
      }
      achat.id = result.insertId;
      res.status(200).send(achat);
    });
  })
});

// Récupération de la liste d'achat
router.get('/buy', (req, res) => {
  const token = req.headers['authorization'];

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if(err) return res.status(401).send("Your token doesn't exists or is expired, please login again");
    const code_ami = userData.id;
    buyDAO.listeAchats(con, (err, results) => {
      if(err) {
        log.error(err);
        return res.status(500).send({error:"Une erreur est survenue"});
      }
      res.status(200).send(results);
    })
  })
});

router.post('/trade/accept', (req,res) => {
  const token = req.headers['authorization'];

  const idTrade = req.body.id;

  if(idTrade == undefined) { return res.status(400).send({error:"id manquant"});}

  if(typeof idTrade != "number") {return res.status(400).send({error:"id mal typé"});} 

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    const code_ami = userData.id;
    if(err) return res.status(401).send("Your token doesn't exists or is expired, please login again");
    tradeDAO.acceptTrade(code_ami, idTrade, con, (err, results) => {
      if(err) {
        log.error(err);
        return res.status(500).send({error:"Une erreur est survenue"});
      }
      res.status(200).send(results);
    })
  });
});

router.post('/trade/refuse', (req, res) => {
  const token = req.headers['authorization'];

  const idTrade = req.body.id;

  if(idTrade == undefined) { return res.status(400).send({error:"id manquant"});}

  if(typeof idTrade != "number") {return res.status(400).send({error:"id mal typé"});} 

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    const code_ami = userData.id;
    if(err) return res.status(401).send("Your token doesn't exists or is expired, please login again");
    tradeDAO.refuseTrade(code_ami, idTrade, con, (err, results) => {
      if(err) {
        log.error(err);
        return res.status(500).send({error:"Une erreur est survenue"});
      }
      res.status(200).send(results);
    })
  });
})

router.get('/trade/sent', (req, res) => {
  const token = req.headers['authorization'];

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if(err) { return res.status(401).send({error:"Your token doesn't exists or is expired, please login again"});}
      
      const code_ami = userData.id;

      tradeDAO.listeTradeSent(code_ami, con, (err, results) => {
        if(err) {
          log.error(err);
          res.status(500).send(err);
        }
        res.status(200).send(results);
      });
  });
})


// Ajout d'une demande 
router.post('/trade', (req, res) => {
  const token = req.headers['authorization'];

  const host = req.body.host;
  const message = req.body.message;

  if (host == undefined) { return res.status(400).send({error:"host manquant"});}
  if (message == undefined) { return res.status(400).send({error:"message manquant"}); }

  if( typeof host != "string") { return res.status(400).send({error:"host mal typé"}); }
  if( typeof message != "string") { return res.status(400).send({error:"message mal typé"}); }

  jwt.verify(token, SECRET_KEY, (err, userData) => {
    if(err) return res.status(401).send("Your token doesn't exists or is expired, please login again");
    const code_ami = userData.id;
    if(host == code_ami) { return res.status(400).send({error:"Impossible de demander un voyage vers vous-même"});}
    let trade = {
      "traveler" : code_ami,
      "host" : host,
      "message" : message,
      "status" : "attente"
    }

    tradeDAO.ajouterTrade(trade, con, (err, results) => {
      if(err) {
        log.error(err);
        return res.status(500).send({error:"Une erreur est survenue"});
      }
      trade.id = results.insertId;
      res.status(200).send(trade);
    })    
  })
})




/**
 * Liste des demandes d'aller sur l'île du profil connecté
 */
router.get('/trade', (req, res) => {
  const token = req.headers['authorization'];

  jwt.verify(token, SECRET_KEY, (err, userData) => {
      if(err) { return res.status(401).send({error:"Your token doesn't exists or is expired, please login again"});}
      
      const code_ami = userData.id;

      tradeDAO.listeTradeRec(code_ami, con, (err, results) => {
        if(err) {
          log.error(err);
          res.status(500).send(err);
        }
        res.status(200).send(results);
      });
  });
})

router.get('/user', (req, res) => {
  const token = req.headers['authorization'];

  jwt.verify(token. SECRET_KEY, (err, userData) => {
    if(err) { return res.status(401).send({error:"Your token doesn't exists or is expired, please login again"});}
  });
});





app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.use(router);

const server = app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
