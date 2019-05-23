const express = require('express')
const path = require('path')

const app = express()

const server = require('http').createServer(app)
const io = require('socket.io')(server)

app.use(express.static(path.join(__dirname, 'public')))
app.set('views', path.join(__dirname, 'public'))
app.engine('html', require('ejs').renderFile)
app.set('view engine', 'html')

app.use('/', (req, res) => {
  res.render('index.html')
})

let users = []
let messages = {}
let userConnected = 0
let sala
let mapa = {}

io.on('connection', socket => {
  userConnected++
  io.emit('connected', userConnected)
  socket.on('room', room => {
    socket.join(room)
    sala = room
    if (!messages.hasOwnProperty(room)) {
      messages[room] = []
    }
  })

  socket.on('user', user => {
    io.to(sala).emit('userEntered', user)
    mapa[socket.id] = user
    users.push(user)
    socket.emit('previousMessages', messages[sala])
  })

  socket.on('sendMessage', data => {
    messages[sala].push(data)
    io.to(sala).emit('receivedMessage', data)
  })

  socket.on('disconnect', () => {
    userConnected--
    io.to(sala).emit('userLeft', mapa[socket.id])
  })
})


server.listen(3000)