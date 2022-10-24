const express = require('express') ;
const { createServer } = require('http') ;
const { Server } = require('socket.io') ;

const app = express() ;
const httpServer = createServer(app) ;
const io = new Server(httpServer) ;
var count = 0 ;

// JSON を受け取れる仕掛け構築
app.use(express.urlencoded({extended: true})) ;
app.use(express.json()) ;

const PLAYERS_DATA = require('./players.json') ;
console.log(PLAYERS_DATA) ;
for( key in PLAYERS_DATA ) {
	console.log(`key : ${key}`) ;
	console.log(PLAYERS_DATA[key]) ;
}

const MEMBER = {} ;
// 以下を想定
// {
//	"socket.id" : {name:"user1", count:"1"},
//	"socket.id" : {name:"user2", count:"2"}
// }

// do_push（Internal RestAPI）
app.post('/do_push', (req, res) =>
{
	console.log('do_push called') ;
	if (Number(req.body.count) === 0) {
		// 全メンバーへPUSH
		io.emit('push', req.body.message) ;
	} else {
		var socketid = getIdFromCount(req.body.count) ;
		if (socketid === null) {
			console.log('not found : ' + req.body.count) ;
			console.log(MEMBER) ;
		} else {
			// 見つけたメンバーへPUSH通知
			io.to(socketid).emit('push', req.body.message) ;
		}
	}
	res.sendStatus(200) ;
}) ;
// メンバー一覧取得
app.get('/get_member', (req, res) =>
{
	// MEMBERをJSONで応答
	res.status(200).json(MEMBER) ;
}) ;

// socket.io 接続イベント
io.on('connection', socket =>
{
	console.log('io.on : connection') ;
	console.log('socket.id : ' + socket.id ) ;
	// TODO: 既にこのソケットで接続しているかのチェックが必要
	// socket.id でメンバー登録
	MEMBER[socket.id] = {
		name:null, count:0
	} ;
	// クライアントからの切断イベント
	socket.on('disconnect', reason => {
		console.log('socket : disconnect.') ;
		console.log('reason : ' + reason ) ;
		// 当該メンバーの削除
		delete MEMBER[socket.id] ;
	}) ;
	// クライアントからの受付イベント
	socket.on('reception', data => {
		console.log('recept : count ' + count) ;
		// TODO: 既に接続済みであれば切断する
		// TODO: 同時アクセス時の count の排他制御の検討が必要
		// 登録名を更新
		count = count + 1 ;
		MEMBER[socket.id].name = data.name ;
		MEMBER[socket.id].count = count ;
		// 受付結果をPUSH通知
		io.to(socket.id).emit('recept_result', { result : true }) ;
	}) ;
}) ;

function getIdFromCount(count) {
	console.log('count : ', count) ;
	for( let key in MEMBER ) {
		if (Number(MEMBER[key].count) === Number(count)) {
			return key ;
		}
	}
	return null ;
}

// listen
httpServer.listen(55555, () => {
	console.log('Start. port on 55555.') ;
}) ;
