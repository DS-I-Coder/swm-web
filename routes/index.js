const express = require('express');
const connection = require('./../config');
const router = express.Router();
const {
    v4: uuidV4
} = require('uuid');

router.get('/', function (req, res) {
    if (req.session.user) res.redirect('/main');
    else res.render('index.html');
});

router.get('/login', function (req, res) {
    res.render('authpage/login.html');
});

router.get('/register', function (req, res) {
    res.render('authpage/register.html');
});
router.get('/main', function (req, res) {
    if (!req.session.user) res.redirect('/login');
    else {
        console.log(req.session);
        console.log('userid:', req.session.user.id);
        res.render('main.html', {
            userid: req.session.user.id,
            userName: req.session.user.name
        });
    }
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
    res.render('roominfo/roominfo.html');
});

router.post('/room/create', (req, res) => {
    // res.redirect(`/room/${uuidV4()}/host`);
    const room = [
        req.body.roomTitle,
        req.body.roomCategory,
        req.body.roomNotice,
        uuidV4(),
        req.session.user.uid
    ];
    console.log("test; ",req.session.user.uid)
    //숫자 있는 부분 차례로,
    //max참여인원, 현재 참여인원, 공개방여부, 베팅방여부
    let sql = 'INSERT INTO room(roomTitle, maxParticipant, curParticipant,roomCategory,isPublic,isBetting,roomNotice,uuid, host) VALUES(?,4,0,?,1,0,?,?,?);';

    connection.query(
        sql, room,
        function (err, rows, fields) {
            if (err) {
                console.log(err);
                //res.send("<script type='text/javascript'>alert('알 수 없는 오류가 발생하였습니다. 다시 시도해주세요.'); document.location.href='/main';</script>");

            }
            req.session.roomInfo = {
                notice: req.body.roomNotice
            }
            res.redirect(`/room/${room[3]}`);
            
        });
});

// router.get('/room', (req, res) => {
//     res.redirect(`/room/${uuidV4()}`);
// });


router.get('/room/:room', (req, res) => {
    const user = req.session.user;

    console.log(req.session.roomInfo); //
    if (!user) {
        res.redirect('/login');
    } else {
        res.render('room/professor', {
            roomID: req.params.room,
            userName: user.name,
            //아래로 추가
            roomNotice: req.session.roomInfo.notice
        });
        console.log(req.params.room)
        console.log(user.name) 
    } 
});

module.exports = router;