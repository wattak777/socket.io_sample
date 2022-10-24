var client = require('socket.io-client') ;
//const URL = 'http://localhost:55555/connect' ;
const URL = 'http://localhost:55555' ;
const username = process.argv[2] ;

console.log('try to connect as ' + username + '.') ;

// 接続
var socket = client.connect(URL) ;
socket.on('connect', () => {
	console.log('Connection') ;
	// 接続時に受付へ
	socket.emit('reception', {name : username}) ;
}) ;
// 受付結果受信イベント
socket.on('recept_result', (data) => {
	console.log('Reception result : ' + data.result) ;
}) ;
// PUSH通知
socket.on('push', (msg) => {
	console.log('Receive : ' + msg) ;
}) ;
// サーバから切断で終了
socket.on('disconnect', (reason) => {
	console.log('disconnect.') ;
	console.log('reason : ' + reason) ;
	process.exit(0) ;
}) ;

