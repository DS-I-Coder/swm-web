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
const {
    Socket
} = require('dgram');
const {
    fstat
} = require('fs');
const {
    connect
} = require('./../config');

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
    connection.query(
        'SELECT u.uID, u.userName, u.category, LPAD(a.dayAccTime DIV (60*60),2,0) as h, LPAD(a.dayAccTime DIV 60,2,0) as m, LPAD(a.dayAccTime%60,2,0)as s FROM AccTime as a JOIN Users as u ON a.uID = u.uID ORDER BY a.dayAccTime DESC LIMIT 8;',
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
                    var rank_user = rows

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
    if (sKeyword === "") {
        //TODO
        res.send("<script type='text/javascript'>alert('검색어를 입력해주세요'); document.location.href=\'" + req.headers.referer + "\';</script>");
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
router.get('/timeupdate/:time', (req, res) => {
    console.log('inini', req.params.time)
    const user = req.session.user.uid;

    let sql = 'UPDATE acctime SET weekAccTime= weekAccTime+?, monthAccTime=monthAccTime+?, dayAccTime=dayAccTime+? WHERE uID=?;';
    connection.query(
        sql, [req.params.time, user, req.params.time, user, req.params.time, user],
        function (err, rows, fields) {
            if (err) {
                console.log(err);
            } else {
                // console.log(timerecord);
                res.redirect('/main');
            }
        });
});




router.get('/mypage', function (req, res) {
    if (!req.session.user) res.redirect('/login');

    else {
        connection.query('SELECT * FROM users u LEFT JOIN acctime a ON u.uid = a.uid LEFT JOIN room r ON u.uid = r.host WHERE u.uid =?;', req.session.user.uid,
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

router.get('/stat', function (req, res) {
    if (!req.session.user) res.redirect('/login');
    else {
        var acc_bycat = [1, 1, 1, 1, 1, 1]
        var acc_byage = [1, 1, 1, 1, 1, 1]
        var cat_byage = {}
        const uid = req.session.user.uid;
        var userCategory = ''

        // 카테고리별 누적시간 (acc_bycat)
        connection.query(
            'SELECT u.category, a.weekacctime FROM users u JOIN acctime a ON u.uID = a.uID WHERE u.category = (SELECT category FROM users WHERE uID = ? );', uid,
            function (err, rows, fields) {
                for (i = 0; i < rows.length; i++) {
                    const acc = rows[i].weekacctime
                    var idx = parseInt(acc / 36000)
                    if (idx > 5) {
                        acc_bycat[5] += 1
                    } else {
                        acc_bycat[idx] += 1
                    }
                }
                userCategory = rows[0].category
            }
        )
        connection.query(
            'SELECT category, count(category) AS cnt FROM users WHERE truncate(userage/10,0) = (SELECT truncate(userage/10,0) FROM users WHERE uID = ? ) GROUP BY category LIMIT 5;',
            uid,
            function (err, rows, fields) {
                if (err) {
                    console.log(err)
                } else {
                    cat_byage = rows
                }
            }
        )
        // 나이대별 누적시간, 카테고리
        connection.query(
            'SELECT u.category, concat(truncate(u.userage/10,0),0) AS userage, a.weekacctime FROM users u JOIN acctime a ON u.uID = a.uID WHERE truncate(u.userage/10,0) = (SELECT truncate(userage/10,0) FROM users WHERE uID = ? );',
            uid,
            function (err, rows, fields) {
                if (err) {
                    console.log(err);
                } else {
                    for (i = 0; i < rows.length; i++) {
                        const acc = rows[i].weekacctime
                        var idx = parseInt(acc / 36000)
                        if (idx > 5) {
                            acc_byage[5] += 1
                        } else {
                            acc_byage[idx] += 1
                        }
                        var userAge = rows[0].userage
                    }
                    res.render('otherpage/stat.html', {
                        // 이름, 나이, 카테고리, 각 결과 배열
                        results: rows,
                        userName: req.session.user.name,
                        acc_bycat: acc_bycat,
                        acc_byage: acc_byage,
                        cat_byage: cat_byage,
                        userCategory: userCategory,
                        userAge: userAge
                    });
                }
            }
        )
    }
})


/****** */
router.post('/emoji', upload.single('img'), (req, res) => {
    console.log(req.file);
    connection.query(
        'UPDATE users SET `userPicture` = ? WHERE (`uID` = ?)', ['/images/' + req.file.filename, req.session.user.uid],
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