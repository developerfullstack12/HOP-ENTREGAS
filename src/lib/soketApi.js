const io = require('socket.io')()

const socketApi = {
    io: io
}

const users = [];

io.on('connection', (socket) => {
    socket.on("user_connected" , (username)=>{
        console.log('username')
        console.log(username)
        users[username] = socket.id
        io.emit("user_connected", username)
     })
    // console.log('A new user connected')
    socket.on("message",(data)=>{
        console.log('data')
        var socketId = users[data.receiver]
        console.log(socketId)
        console.log('socketId')
        console.log(data)
        io.to(socketId).emit('new_message' , data)
        socket.broadcast.emit('left' , data)
    })
         socket.on("disconnect", () => {
         console.log('disconnected!')
     })
})

module.exports = socketApi;