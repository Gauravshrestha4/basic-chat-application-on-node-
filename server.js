var mongo =require('./node_modules/mongodb').MongoClient,
	client=require('./node_modules/socket.io').listen(8012).sockets;
mongo.connect('mongodb://127.0.0.1/chat',function(err,db){
	if(err) throw err;

	client.on('connection',function(socket){
		var col=db.collection('messages');

		sendStatus=function(s){
			socket.emit('status',s);
		};

		//emit all message
		col.find().limit(100).sort({id:1}).toArray(function(err,res){
			if(err) throw err;
			socket.emit('output',res);
		})
		//wait for input
		socket.on('input',function(data){
			var name=data.name,
				message=data.message,
				whitespacePattern=/^\s*$/;
				if(whitespacePattern.test(name)||whitespacePattern.test(message)){
					sendStatus("name and message is required");
				}
				else{
					col.insert({name:name,message:message},function(){
						//emit latest message to all clients
						client.emit('output',[data]);
						sendStatus({
							message:"message sent",
							clear:true
						});
					});
				}
		});
	});
});