var mysql = require('mysql');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

var con = mysql.createConnection({
  host: "localhost",
  user: "backenduser",
  password: "3cela14jeCool!",
  database: 'db_tymoverole'
});

app.use(bodyParser.urlencoded({ extended: true }));

//obecné funkce
function createRoleStatuses(mojerole) {
  kopie = [0, 0, 0, 0, 0, 0, 0, 0]
  for (let i = 0; i < mojerole.length; i++) {
    kopie[i] = mojerole[i];
  }
  statusy = [0, 0, 0, 0, 0, 0, 0, 0];
  pocet = [0, 0, 0];

  for (j = 0; j < 3; j++) {
    max = Math.max(...kopie);
    if (max == -1) { break }
    for (var i = 0; i < kopie.length; i++) {
      var el = kopie[i];
      if (el == max) {
        pocet[j]++;
        statusy[i] = j + 1;
        kopie[i] = -1;
      }
    }
  }
  if ((pocet[0] + pocet[1] + pocet[2]) > 3) {
    for (i = 0; i < statusy.length; i++) {
      if (statusy[i] == 3) statusy[i] = 0
    }
    if ((pocet[0] + pocet[1]) > 3) {
      for (i = 0; i < statusy.length; i++) {
        if (statusy[i] == 2) statusy[i] = 0
      }
    }
  }
  return statusy;
}

function warning() {
  var sql = "SHOW WARNINGS";
  con.query(sql, function (error, results) {
    if (error) {
      throw error;
    }
    console.log(results[0][0]);
  });
}

//HTTP requesty
app.post('/general', function (req, res) {
  chyba = true;
  if (req.body.statusy) {
    if (Array.isArray(req.body.statusy)) {
      if (req.body.statusy.length == 8) {
        jeint = true;
        statusy = [0, 0, 0, 0, 0, 0, 0, 0];
        statusyPrimarni = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < req.body.statusy.length; i++) {
          try {
            statusy[i] = parseInt(req.body.statusy[i]);
          } catch (error) {
            jeint = false;
          }
        }
        if (jeint) {
          chyba = false
          //ziskani prumernych dat
          var sql = "SELECT COUNT(*) as 'celkem', AVG(ROLE1) as 'av1', AVG(ROLE2) as 'av2', AVG(ROLE3) as 'av3', AVG(ROLE4) as 'av4', AVG(ROLE5) as 'av5', AVG(ROLE6) as 'av6', AVG(ROLE7) as 'av7', AVG(ROLE8) as 'av8' FROM vysledky";
          con.query(sql, function (error, results) {
            if (error) {
              res.status(500)
              res.setHeader('Content-type', 'text/html');
              res.send("Jejda :(");
            } else {
              //zjisteni posledniho primarniho
              var maxPrimarniStatus = -1;
              for (let j = 0; j < statusy.length; j++) {
                if (statusy[j] == 1) maxPrimarniStatus = j;
              }
              //ziskani "unikatnosti"
              for (let j = 0; j < statusy.length; j++) {
                if (statusy[j] == 1) {
                  var sql2 = "SELECT COUNT(*) as 'pocet' FROM `vysledky` WHERE `ROLE" + (j + 1) + "-STATUS` = 1";
                  con.query(sql2, function (error, results2) {
                    if (error) {
                      res.status(500)
                      res.setHeader('Content-type', 'text/html');
                      res.send("Jejda :(");
                    } else {
                      statusyPrimarni[j] = results2[0].pocet;
                      if (j == maxPrimarniStatus) {
                        //vypocty
                        var odpoved = {
                          hodnoty: [results[0].av1, results[0].av2, results[0].av3, results[0].av4, results[0].av5, results[0].av6, results[0].av7, results[0].av8],
                          primarni: []
                        }
                        for (let k = 0; k < statusy.length; k++) {
                          if (statusy[k] == 1) odpoved.primarni.push(
                            { ID: k, PRO: Math.round((statusyPrimarni[k] / results[0].celkem) * 1000) / 10 }
                          );
                        }
                        res.status(200)
                        res.setHeader('Content-type', 'application/json');
                        res.send(JSON.stringify(odpoved));
                      }
                    }
                  });
                }
              }
            }
          });
        }
      }
    }
  }
  if (chyba) {
    res.status(400)
    res.setHeader('Content-type', 'text/html');
    res.send("Jejda :(");
  }
});

app.post('/vysledek', function (req, res) {
  chyba = true;
  if (req.body.score) {
    if (Array.isArray(req.body.score)) {
      if (req.body.score.length == 8) {
        jeint = true;
        role = [0, 0, 0, 0, 0, 0, 0, 0];
        for (let i = 0; i < req.body.score.length; i++) {
          try {
            role[i] = parseInt(req.body.score[i]);
          } catch (error) {
            jeint = false;
          }
        }
        if (jeint) {
          chyba = false;
          var statusy = createRoleStatuses(role);
          var sql = "INSERT INTO `db_tymoverole`.`vysledky` (`ROLE1`, `ROLE2`, `ROLE3`, `ROLE4`, `ROLE5`, `ROLE6`, `ROLE7`, `ROLE8`, `ROLE1-STATUS`, `ROLE2-STATUS`, `ROLE3-STATUS`, `ROLE4-STATUS`, `ROLE5-STATUS`, `ROLE6-STATUS`, `ROLE7-STATUS`, `ROLE8-STATUS`, `DATUM`) VALUES (?);";
          var datetime = new Date();
          var values = role.concat(statusy, datetime);
          con.query(sql, [values], function (error, results, fields) {
            if (error) {
              throw error;
            }
            res.status(200)
            res.setHeader('Content-type', 'text/html');
            res.send("OK");
          });
        }
      }
    }
  }
  if (chyba) {
    res.status(400)
    res.setHeader('Content-type', 'text/html');
    res.send("Jejda :(");
  }
});

app.post('/test', function (req, res) {
  console.log(req.body.score);
});

//připojování
app.listen(3300, function (err) {
  if (err) throw err;
  console.log("Backend:      http://localhost:3300");
});

con.connect(function (err) {
  if (err) throw err;
  console.log("DB-connect:   http://localhost:3306");
});

