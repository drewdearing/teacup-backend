require('dotenv').config()
const request = require('request')
const admin = require('firebase-admin')
const express = require("express")
const cors = require('cors')
const app = express()
app.use(cors())
const server = require('http').Server(app)
const io = require('socket.io')(server)


var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
var challonge_key = process.env.CHALLONGE_KEY
var challonge_user = process.env.CHALLONGE_USER

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://teacup-challonge.firebaseio.com"
})

var db = admin.firestore()

server.listen(5000, () => {
    console.log("Server running on port 5000");
})

io.on('connection', function(socket){
    let id = socket.handshake.query.id
    console.log("connected to "+id)
    socket.join(id)
})

app.get("/init", (req, resolve) => {
    let user = req.query.user
    let key = req.query.key
    let id = req.query.id
    let data = {
        isAuthenticated: false
    }
    let path = 'tournaments/'+id+'.json'
    let url = "https://"+user+":"+key+"@api.challonge.com/v1/"+path
    request(url, {json: true}, (err, res, body) => {
        if(body.tournament != null){
            let description = body.tournament.description
            request({
                url: url,
                method: 'PUT',
                json: {tournament: {description: description}}
            }, (err, res, body) => {
                data.isOwner = res.statusCode == 200
                data.isAuthenticated = data.isOwner || res.body.errors != null
                let tournamentRef = db.collection('tournaments').doc(id)
                tournamentRef.get().then((tournamentDoc) => {
                    if(tournamentDoc.exists){
                        data.data = tournamentDoc.data()
                        data.exists = true
                        resolve.json(data)
                    }
                    else{
                        if(data.isOwner){
                            data.data = {
                                currentMatch: null,
                                nextMatch: null
                            }
                            tournamentRef.set(data.data, {merge: true}).then(() => {
                                data.exists = true
                                resolve.json(data)
                            })
                        }
                        else{
                            data.exists = false
                            resolve.json(data)
                        }
                    }
                })
            })
        }
        else{
            data.isAuthenticated = res.body.errors != null
            resolve.json(data)
        }
    })
})

app.put("/update", (req, resolve) => {
    let id = req.query.id
    let round = req.query.round
    let name1 = req.query.name1
    let name2 = req.query.name2
    var currentMatch = req.query.current_match
    var nextMatch = req.query.next_match
    currentMatch = (currentMatch != "null") ? currentMatch:null
    nextMatch = (nextMatch != "null") ? nextMatch:null
    let data = {
        currentMatch: currentMatch,
        nextMatch: nextMatch
    }
    let tournamentRef = db.collection('tournaments').doc(id)
    tournamentRef.update(data)
    io.to(id).emit('update', data)

    if(currentMatch != null){
        var current_name = name1
        tournamentRef.collection('match_labels').get().then(async (match_labels) => {
            current_labels = {}
            for(var i in match_labels.docs){
                let match_label = match_labels.docs[i]
                let type = match_label.data().type
                current_labels[match_label.id] = await getLabel(tournamentRef, match_label)
                if(type == 'player' || type == 'team'){
                    current_labels[match_label.id].name = current_name
                    current_name = name2
                }
            }
            current_labels.title = round
            tournamentRef.update({
                current_labels: current_labels
            })
        })
    }
    
    resolve.json({statusCode: 200})
})

async function getLabel(ref, label){
    let type = label.data().type
    if(type == 'player'){
        let player = {}
        let player_labels = await ref.collection('player_labels').get()
        for(var i in player_labels.docs){
            let player_label = player_labels.docs[i]
            player[player_label.id] = await getLabel(ref, player_label)
        }
        return player
    }
    else if(type == 'team'){
        let team = {}
        let team_labels = await ref.collection('team_labels').get()
        for(var i in team_labels.docs){
            let team_label = team_labels.docs[i]
            team[team_label.id] = await getLabel(ref, team_label)
        }
        return team
    }
    else if(type == 'string'){
        return label.data().default
    }
    else if(type == 'option_select'){
        return label.data().default
    }
    else if(type == 'int'){
        return label.data().default
    }
}

app.get("/tournament", (req, resolve) => {
    let user = challonge_user
    let key = challonge_key
    let id = req.query.id
    let path = 'tournaments/'+id+'.json'
    let url = "https://"+user+":"+key+"@api.challonge.com/v1/"+path
    request(url, {json: true}, (err, res, body) => {
        resolve.json(body)
    })
})

app.get("/matches", (req, resolve) => {
    let user = challonge_user
    let key = challonge_key
    let id = req.query.id
    let path = 'tournaments/'+id+'/matches.json'
    let url = "https://"+user+":"+key+"@api.challonge.com/v1/"+path
    request(url, {json: true}, (err, res, body) => {
        resolve.json(body)
    })
})

app.get("/participants", (req, resolve) => {
    let user = challonge_user
    let key = challonge_key
    let id = req.query.id
    let path = 'tournaments/'+id+'/participants.json'
    let url = "https://"+user+":"+key+"@api.challonge.com/v1/"+path
    request(url, {json: true}, (err, res, body) => {
        resolve.json(body)
    })
})
