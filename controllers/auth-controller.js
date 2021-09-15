const Cryptr = require('cryptr');
cryptr = new Cryptr('myTotalySecretKey');
const connection = require('./../config');
module.exports.auth=function(req,res){
    const id = req.body.id;
    const pw = req.body.pw;

    connection.query('SELECT * FROM users WHERE userID = ?',[id], function (error, results, fields) {
      if (error) {
          res.json({
            status:false,
            message:'there are some error with query'
            })
      }else{

        if(results.length >0){
          decryptedString = cryptr.decrypt(results[0].userPW);
            if(pw==decryptedString){
              console.log("login");
              req.session.user={
                uid: results[0].uID,
                id: id,
                name: results[0].userName,
                authorized: true
              };
                res.redirect(req.session.url);
            }else{

              res.send('<script type="text/javascript">alert("아이디와 비밀번호를 확인해주세요"); document.location.href="/login"; </script>');

            }

        }
        else{
          res.json({
              status:false,
            message:"Id does not exits"
          });
        }
      }
    });
}
