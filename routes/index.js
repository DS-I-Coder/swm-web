const express = require('express');
const connection = require('./../config');
const router = express.Router();
const fs = require('fs');
const multer = require('multer')
const path = require('path');
const upload = multer({
    storage: multer.diskStorage({ // diskStorage가 로컬 저장.
        destination(req, file, cb) {
            cb(null, "/images");
        },
        filename(req, file, cb) {
            //const ext = path.extname(file.originalname);
            //cb(null, path.basename(file.originalname, ext))
            cb(null, file.originalname);
        }
    }),
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});


const {
    v4: uuidV4
} = require('uuid');
const {
    query
} = require('express');
const { Socket } = require('dgram');
const { fstat } = require('fs');
const { connect } = require('./../config');

// const timeanddate=require('../public/js/time-and-date-handling.js');



router.get('/', function (req, res) {
    if (req.session.user) res.redirect('/main');
    else res.redirect('/main');
});


router.get('/login', function (req, res) {
    req.session.url = req.headers.referer;

    res.render('authpage/login.html');
});

router.get('/register', function (req, res) {
    res.render('authpage/register.html');
});

router.get('/main', function (req, res) {
    /* TODO ***************************/
    var rank_user = []
    connection.query(
        'SELECT u.uID, u.userName, u.category, a.weekAcctime FROM AccTime as a JOIN Users as u ON a.uID = u.uID ORDER BY a.weekAccTime DESC LIMIT 8;',
        function (err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                if (!req.session.user) {
                    //res.redirect('/login');
                    res.render('main.html', {
                        flag: false,
                        rankuser: rows
                        //userName: req.session.user.name
                    });

                } else {
                    console.log(req.session);
                    res.render('main.html', {
                        flag: true,
                        rankuser: rows,
                        userid: req.session.user.id,
                        userName: req.session.user.name
                    });
                }
            }
        });
});


router.get("/logout", function (req, res) {
    if (req.session.user) {
        req.session.destroy(
            function (err) {
                if (err) {
                    console.log("log out session error");
                    return;
                }
                console.log("log out");
                res.redirect("/");
            }
        );

    } else {
        console.log("no session");
        res.redirect('authpage/login');
    }
});

//roominfo화면으로 넘기기
router.get('/room/roominfo', function (req, res) {

    if (!req.session.user) {
        res.redirect('/login')
    }

    res.render('roominfo/roominfo.html');
});

//search화면으로 넘기기
router.get('/search', function (req, res) {
    const sKeyword = req.query.searchinput;
    if (sKeyword === ""){
        //TODO
        res.send("<script type='text/javascript'>alert('검색어를 입력해주세요'); document.location.href=\'"+req.headers.referer+"\';</script>");
    }
    connection.query(
        'SELECT * FROM room WHERE roomTitle LIKE \'%' + sKeyword + '%\';',

        function (err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                res.render('otherpage/search.html', {
                    results: rows
                });
            }
        }
    );

});

router.post('/room/create', (req, res) => {
    // res.redirect(`/room/${uuidV4()}/host`);

    const room = [
        req.body.roomTitle,
        req.body.roomCategory,
        req.body.roomNotice,
        uuidV4(),
        req.session.user.uid,
        req.body.roomPW
    ];
    console.log('143', req.body.roomPW);

    //숫자 있는 부분 차례로,
    //max참여인원, 현재 참여인원, 공개방여부, 베팅방여부
    //let sql = 'INSERT INTO room(roomTitle, maxParticipant, curParticipant,roomCategory,isPublic,isBetting,roomNotice,uuid, host, roomImage) VALUES(?,4,0,?,1,0,?,?,?,?);';
    let sql = 'INSERT INTO room(roomTitle, maxParticipant, curParticipant,roomCategory,isPublic,isBetting,roomNotice,uuid, host, roomPW) VALUES(?,4,0,?,1,?,?,?,?);';
    connection.query(
        sql, room,
        function (err, rows, fields) {
            if (err) {
                console.log(err);
                //res.send("<script type='text/javascript'>alert('알 수 없는 오류가 발생하였습니다. 다시 시도해주세요.'); document.location.href='/main';</script>");

            }
            res.redirect(`/room/${room[3]}`);
        });
});

// router.get('/room', (req, res) => {
//     res.redirect(`/room/${uuidV4()}`);
// });


router.get('/room/:room', (req, res) => {
    const user = req.session.user;

    if (!user) {
        res.redirect('/login');
    } else {

        connection.query(
            'SELECT * FROM room WHERE uuid = ?', req.params.room,
            function (err, rows, fields) {
                if (err) {

                } else {
                    console.log(rows)
                    res.render('room/professor', {
                        roomID: req.params.room,
                        userName: user.name,
                        roomTitle: rows[0].roomTitle,
                        roomNotice: rows[0].roomNotice
                    });
                }
            }
        )
    }

});

/*sql에 추가
ALTER TABLE acctime ADD dayAccTime int default 0 not null;*/
router.get('/timeupdate', (req, res) => {

    const user=req.session.user.uid;

    let sql = 'UPDATE acctime SET weekAccTime=?, monthAccTime=?, dayAccTime=? WHERE uID=?;';
    connection.query(
        sql, [10,20,30,user],
        function (err, rows, fields) {
            if (err) {
                console.log(err);
            }

            else{
            // console.log(timerecord);
            res.redirect('/main');
            }
    });
});




router.get('/mypage', function (req, res) {
    if (!req.session.user) res.redirect('/login');

    else {
        connection.query('SELECT * FROM room r RIGHT JOIN users u ON r.host = u.uid where uid = ?;', req.session.user.uid,
            function (err, result, fields) {
                if (err) {
                    console.log(err);
                } else {
                            page = res.render('mypage', {
                                userid: req.session.user.id,
                                username: req.session.user.name,
                                list: result
                            });
                }
            }
        );
        //console.log(req.session);
        console.log('userid:', req.session.user.id);

    }
});

router.get('/delete/:rID', function (req, res) {
    console.log(req.params.rID);
    
    if (!req.session.user) res.redirect('/login');
    else {
        connection.query(
            'DELETE FROM room WHERE rID = ?;', req.params.rID,
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                } else {
                    res.redirect('/mypage');
                }
            }
        );
    }
})

router.get('/stat', function(req, res){
    //if (!req.session.user) res.redirect('/login');
    //else{
        connection.query(// TODO: 나이 조건 걸기
            // 나이대 별 카테고리 비율 중 상위 5개만
            'SELECT category, COUNT(category) AS cnt FROM users GROUP BY category LIMIT 5;',
            function(err, rows, fields){
                if(err){
                    console.log(err);
                }else{
                    console.log(rows);

                    res.render('otherpage/stat.html',{
                        results: rows,
                        userName: req.session.user.name
                    });
                }
            }
        )
    //}
})


/****** */
router.post('/emoji', upload.single('img'), (req, res) => {
    console.log(req.file);
    connection.query(
        'UPDATE users SET `userPicture` = ? WHERE (`uID` = ?)', [ '/images/' + req.file.filename,req.session.user.uid],
        function (err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                console.log(rows);
                res.redirect('/mypage');
            }
        }
    )
})
module.exports = router;


