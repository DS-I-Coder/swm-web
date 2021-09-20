const express = require('express');
const connection = require('./../config');
const router = express.Router();
const {
    v4: uuidV4
} = require('uuid');
const {
    query
} = require('express');

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
                        rankuser: rows,
                        //userid: req.session.user.id,
                        //userName: req.session.user.name
                    });

                } else {
                    console.log(req.session);
                    console.log('userid:', req.session.user.id);
                    res.render('main.html', {
                        rankuser: rows,
                        //userid: req.session.user.id,
                        //userName: req.session.user.name
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
        req.session.user.uid
        //,`/js/util/emoji/${req.body.roomImage}`
    ];
    //숫자 있는 부분 차례로,
    //max참여인원, 현재 참여인원, 공개방여부, 베팅방여부
    //let sql = 'INSERT INTO room(roomTitle, maxParticipant, curParticipant,roomCategory,isPublic,isBetting,roomNotice,uuid, host, roomImage) VALUES(?,4,0,?,1,0,?,?,?,?);';
    let sql = 'INSERT INTO room(roomTitle, maxParticipant, curParticipant,roomCategory,isPublic,isBetting,roomNotice,uuid, host) VALUES(?,4,0,?,1,0,?,?,?);';
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



router.get('/mypage', function (req, res) {
    if (!req.session.user) res.redirect('/login');

    else {
        connection.query('SELECT * FROM users WHERE uid=?;', req.session.user.uid,
            function (err, result, fields) {
                if (err) {
                    console.log(err);
                } else {
                    page = res.render('mypage', {
                        userid: req.session.user.id,
                        username: req.session.user.name,
                        list: result,
                    });
                    console.log(result)

                }
            });

        console.log(req.session);
        console.log('userid:', req.session.user.id);

    }
});

module.exports = router;