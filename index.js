require('dotenv').config()
const request = require('request')
const admin = require('firebase-admin')
const express = require("express")
const cors = require('cors')
const path = require('path')
const app = express()
app.use(cors())
app.use(express.json())
const server = require('http').Server(app)
const io = require('socket.io')(server)

var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
var challonge_key = process.env.CHALLONGE_KEY
var challonge_user = process.env.CHALLONGE_USER
var port = process.env.PORT

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://teacup-gg.firebaseio.com"
})

var db = admin.firestore().collection('environments').doc(process.env.FIRESTORE_ENV)

server.listen(port, () => {
    console.log("Server running on port "+port);
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
                data.isAuthenticated = res && (res.statusCode == 200 || res.body.errors != null)
                if(id != null) {
                    data.isOwner = res && res.statusCode == 200
                    let tournamentRef = db.collection('tournaments').doc(id)
                    let userRef = db.collection('users').doc(user)
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
                    userRef.collection('tournaments').doc(id).set({
                        lastActive: new Date()
                    })
                }
                else{
                    resolve.json(data)
                }
            })
        }
        else{
            data.isAuthenticated = res.body.errors != null
            resolve.json(data)
        }
    })
})

app.get("/tournaments", async (req, resolve) => {
    let user = req.query.id
    if(user){
        let userRef = db.collection('users').doc(user)
        let tournamentsRef = userRef.collection('tournaments')
        let tournaments = await tournamentsRef.orderBy("lastActive", "desc").get()
        let tournamentData = []
        tournaments.forEach((tournament) => {
            if(tournament.exists){
                tournamentData.push({
                    id:tournament.id,
                    data:tournament.data()
                })
            }
        })
        resolve.json(tournamentData)
    }
    else{
        resolve.status(400).send('Bad Request')
    }
})

app.get("/labels", async (req, resolve) => {
    let id = req.query.id
    let tournamentRef = db.collection('tournaments').doc(id)
    let labelRef = tournamentRef.collection('participant_labels')
    let labels = await labelRef.get()
    var labelData = []
    var labelObj = {}
    labels.forEach((label) => {
        labelData.push(getLabelData(label))
    })
    let tournament_labels = await Promise.all(labelData)
    tournament_labels.push({
        name: "name",
        type: "string",
        default: ""
    })
    tournament_labels.push({
        name: "score",
        type: "int",
        default: 0
    })
    tournament_labels.forEach((tournament_label) => {
        labelObj[tournament_label.name] = tournament_label
    })
    resolve.json(labelObj)
})

app.put("/labels/update", async (req, resolve) => {
    let body = req.body;
    let id = body.id;
    let label = body.label;
    if(id != null && label != null){
        let tournamentRef = db.collection('tournaments').doc(id)
        let labelRef = tournamentRef.collection('participant_labels').doc(label.name)
        labelRef.set({
            type: label.type,
            default: label.default
        })
        if(label.type == 'option_select'){
            let optionsRef = labelRef.collection('options')
            let options = await optionsRef.get()
            options.forEach((option) => {
                if(!label.options.includes(option.id)){
                    option.ref.delete()
                }
            })
            label.options.forEach((option) => {
                optionsRef.doc(option).set({
                    default: option == label.default
                })
            })
            resolve.status(200).send('Updated')
        }

    }
    else{
        resolve.status(400).send('Bad Request')
    }
})

app.put("/labels/delete", async (req, resolve) => {
    let body = req.body;
    let id = body.id;
    let name = body.name;
    if(id != null && name != null){
        let tournamentRef = db.collection('tournaments').doc(id)
        let labelRef = tournamentRef.collection('participant_labels').doc(name)
        labelRef.delete()
    }
    else{
        resolve.status(400).send('Bad Request')
    }
})

app.get("/currentMatch", async (req, resolve) => {
    let id = req.query.id
    if(id != null){
        let tournamentRef = db.collection('tournaments').doc(id)
        let tournament = await tournamentRef.get()
        if(tournament.exists){
            let currentMatch = tournament.data().currentMatch
            if(currentMatch != null){
                let matchRef = tournamentRef.collection('matches').doc(currentMatch)
                let match = await matchRef.get()
                if(match.exists){
                    let round_name = match.data().round
                    let label_data = {
                        match_id: match.id,
                        participant1: match.data().participant1,
                        participant2: match.data().participant2,
                        round: round_name,
                        participants: {}
                    }
                    let participantsRef = matchRef.collection('participants')
                    let participants = await participantsRef.get()
                    participants.forEach((participant) => {
                        label_data.participants[participant.id] = participant.data()
                    })
                    resolve.json(label_data)
                }
                else{
                    resolve.status(404).send('match not found')
                }
            }
            else{
                resolve.json({ match_id: null })
            }
        }
        else{
            resolve.status(404).send('tournament not found')
        }
    }
    else{
        resolve.status(400).send('Bad Request')
    }
})

app.get("/participant/labels", async (req, resolve) => {
    let id = req.query.id
    let participant_id = req.query.participant_id
    if(id != null && participant_id != null){

        let tournamentRef = db.collection('tournaments').doc(id)
        let participantRef = tournamentRef.collection('participants').doc(participant_id)
        let labelRef = tournamentRef.collection('participant_labels')
        let participantDoc = await participantRef.get()
        let labels = await labelRef.get()
        let participantData = await getParticipant(id, participant_id)
        let participant = participantData.participant
        
        var labelData = []
        var labelObj = {}

        labels.forEach((label) => {
            labelData.push(getLabelData(label))
        })

        let tournament_labels = await Promise.all(labelData)

        tournament_labels.forEach((tournament_label) => {
            tournament_label.value = ""
            if(participantDoc.exists){
                let data = participantDoc.data()
                if(tournament_label.name in data){
                    let value = String(data[tournament_label.name])
                    tournament_label.value = value
                }
            }
            labelObj[tournament_label.name] = tournament_label
        })

        resolve.json(labelObj)
    }
    else{
        resolve.status(400).send('Bad Request')
    }
})

app.put("/participant/labels/update", async (req, resolve) => {
    let body = req.body
    let id = body.id
    let labels = body.labels
    let participant_id = body.participant_id
    if (id != null && participant_id != null && labels != null){
        let tournamentRef = db.collection('tournaments').doc(id)
        let participantRef = tournamentRef.collection('participants').doc(participant_id)
        participantRef.set(labels, {merge: true})
        resolve.status(200).send('Updated')
    }
    else{
        resolve.status(400).send('Bad Request')
    }
})

app.put("/match/update", async (req, resolve) => {
    let body = req.body
    let id = body.id
    let match_id = body.match_id
    if(id != null && match_id != null){
        let tournamentRef = db.collection('tournaments').doc(id)
        let matchRef = tournamentRef.collection('matches').doc(match_id)
        let participantsRef = matchRef.collection('participants')
        if('round' in body){
            matchRef.update({round: body.round})
        }
        if('participant1' in body && 'participant2' in body){
            matchRef.update({
                participant1: body.participant1,
                participant2: body.participant2
            })
        }
        if('participants' in body){
            for(participant_id in body.participants){
                let participant = body.participants[participant_id]
                let participantRef = participantsRef.doc(participant_id)
                participantRef.update(participant)
            }
        }
        tournamentRef.get().then((tournamentDoc) => {
            if(tournamentDoc.exists){
                let currentMatch = tournamentDoc.data().currentMatch
                if(currentMatch != null && currentMatch == match_id){
                    io.to(id).emit("current_labels", body)
                }
            }
        })
        resolve.status(200).send('Updated')
    }
    else{
        resolve.status(400).send('Bad Request')
    }
})

app.put("/update", async (req, resolve) => {
    let body = req.body
    let currentMatch = body.current_match
    let nextMatch = body.next_match
    let id = body.id
    let data = {
        currentMatch: currentMatch,
        nextMatch: nextMatch
    }
    let tournamentRef = db.collection('tournaments').doc(id)
    let tournamentDoc = await tournamentRef.get()
    let currentMatchChanged = tournamentDoc.data().currentMatch != currentMatch
    tournamentRef.update(data)
    io.to(id).emit('update', data)

    if(currentMatchChanged){
        if(currentMatch != null){
            let labelRef = tournamentRef.collection('participant_labels')
            let matchRef = tournamentRef.collection('matches').doc(currentMatch)
            
            matchRef.set({
                round: body.round_name,
                participant1: body.participant1.id,
                participant2: body.participant2.id
            })

            var participantDataObj = {}
            var participantDatas = [
                {
                    name: body.participant1.name,
                    score: body.participant1.score
                },
                {
                    name: body.participant2.name,
                    score: body.participant2.score
                }
            ]

            participantDataObj[body.participant1.id] = participantDatas[0]
            participantDataObj[body.participant2.id] = participantDatas[1]

            let participantRefs = [
                tournamentRef.collection('participants').doc(body.participant1.id).get(),
                tournamentRef.collection('participants').doc(body.participant2.id).get()
            ]

            let matchParticipantRefs = [
                matchRef.collection('participants').doc(body.participant1.id),
                matchRef.collection('participants').doc(body.participant2.id)
            ]

            let labels = await labelRef.get()

            for (var i = 0; i < 2; i++) {
                var participantData = participantDatas[i]
                let matchParticipantRef = matchParticipantRefs[i]
                let participant = await participantRefs[i]
                var labelData = []
                labels.forEach((label) => {
                    labelData.push(getLabel(label, participant))
                })
                let participantLabels = await Promise.all(labelData)
                participantLabels.forEach((participantLabel) => {
                    participantData[participantLabel.name] = participantLabel.value
                })
                matchParticipantRef.set(participantData)
            }
            
            io.to(id).emit("current_labels", {
                match_id: currentMatch,
                round: body.round_name,
                participant1: body.participant1.id,
                participant2: body.participant2.id,
                participants: participantDataObj
            })
        }
        else{
            io.to(id).emit("current_labels", {
                match_id: null
            })
        }
    }
    
    resolve.status(200).send('Updated.')
})

app.put("/match/update/score", async (req, resolve) => {
    let body = req.body
    let user = body.user
    let key = body.key
    let id = body.id
    let match_id = body.match_id
    let match = await getMatch(id, match_id)
    if('match' in match){
        let participant1_id = match.match.player1_id
        let participant2_id = match.match.player2_id
        if('participants' in body){
            let participants = body.participants
            if(participant1_id in participants && participant2_id in participants){
                let participant1 = participants[participant1_id]
                let participant2 = participants[participant2_id]
                if('score' in participant1 && 'score' in participant2){
                    let score1 = String(participant1.score)
                    let score2 = String(participant2.score)
                    let scores_csv = score1+"-"+score2
                    updateMatchScore(user, key, id, match_id, scores_csv)
                    resolve.status(200).send('Update Requested.')
                }
                else{
                    resolve.status(400).send('Bad Request')
                }
            }
            else{
                resolve.status(400).send('Bad Request')
            }
        }
        else{
            resolve.status(400).send('Bad Request')
        }
    }
    else{
        resolve.status(404).send('Match not found.')
    }
})

app.put("/match/complete", async(req, resolve) => {
    let body = req.body
    let user = body.user
    let key = body.key
    let id = body.id
    let match_id = body.match_id
    let match = await getMatch(id, match_id)
    if('match' in match){
        let participant1_id = String(match.match.player1_id)
        let participant2_id = String(match.match.player2_id)
        if('participants' in body){
            let participants = body.participants
            if(participant1_id in participants && participant2_id in participants){
                let participant1 = participants[participant1_id]
                let participant2 = participants[participant2_id]
                if('score' in participant1 && 'score' in participant2){
                    let score1 = String(participant1.score)
                    let score2 = String(participant2.score)
                    let scores_csv = score1+"-"+score2
                    if(participant1.score > participant2.score){
                        setMatchWinner(user, key, id, match_id, participant1_id, scores_csv)
                    }
                    else if(participant1.score < participant2.score){
                        setMatchWinner(user, key, id, match_id, participant2_id, scores_csv)
                    }
                    else{
                        setMatchWinner(user, key, id, match_id, "tie", scores_csv)
                    }
                    resolve.status(200).send('Update Requested.')
                }
                else{
                    resolve.status(400).send('Bad Request')
                }
            }
            else{
                resolve.status(400).send('Bad Request')
            }
        }
        else{
            resolve.status(400).send('Bad Request')
        }
    }
    else{
        resolve.status(404).send('Match not found.')
    }
})

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

app.get("/match", async (req, resolve) => {
    let id = req.query.id
    let match_id = req.query.match_id
    let body = await getMatch(id, match_id)
    resolve.json(body)
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

app.get('/downloads/*', (req, resolve) => {
    var file = path.basename(req.originalUrl).toUpperCase()
    let download_url = process.env[file]
    console.log(file)
    if(download_url){
        resolve.redirect(download_url)
    }
    else{
        resolve.status(400).send('File not found!')
    }
})

async function getLabel(label, participant){
    let type = label.data().type
    let data = {
        name: label.id,
        type: type
    }
    if(type == 'string' || type == 'option_select' || type == 'int'){
        if(participant.exists && label.id in participant.data()){
            data.value = participant.data()[label.id]
        }
        else{
            data.value = label.data().default
        }
        return data
    }
}

async function getLabelData(label){
    let type = label.data().type
    let data = {
        name: label.id,
        type: type
    }
    if(type == 'string' || type == 'int'){
        data.default = label.data().default
        return data
    }
    else if(type == 'option_select'){
        data.default = label.data().default
        data.options = []
        let optionsRef = label.ref.collection('options')
        let options = await optionsRef.get()
        options.forEach((option) => {
            if(option.exists){
                data.options.push(option.id)
                if(option.data().default){
                    data.default = option.id
                }
            }
        })
        return data
    }
}

async function getParticipant(id, participant_id){
    return new Promise((resolve, reject) => {
        let user = challonge_user
        let key = challonge_key
        let path = 'tournaments/'+id+'/participants/'+participant_id+'.json'
        let url = "https://"+user+":"+key+"@api.challonge.com/v1/"+path
        request(url, {json: true}, (err, res, body) => {
            resolve(body)
        })
    })
}

async function getMatch(id, match_id){
    return new Promise((resolve, reject) => {
        let user = challonge_user
        let key = challonge_key
        let path = 'tournaments/'+id+'/matches/'+match_id+'.json'
        let url = "https://"+user+":"+key+"@api.challonge.com/v1/"+path
        request(url, {json: true}, (err, res, body) => {
            resolve(body)
        })
    })
}

function updateMatchScore(user, key, id, match_id, scores_csv){
    let path = 'tournaments/'+id+'/matches/'+match_id+'.json'
    let url = "https://"+user+":"+key+"@api.challonge.com/v1/"+path
    request({
        url: url,
        method: 'PUT',
        json: {
            tournament: id,
            match_id: match_id,
            match: {
                scores_csv: scores_csv
            }
        }
    })
}

function setMatchWinner(user, key, id, match_id, winner, scores_csv){
    let path = 'tournaments/'+id+'/matches/'+match_id+'.json'
    let url = "https://"+user+":"+key+"@api.challonge.com/v1/"+path
    request({
        url: url,
        method: 'PUT',
        json: {
            tournament: id,
            match_id: match_id,
            match: {
                winner_id: winner,
                scores_csv: scores_csv
            }
        }
    })
}
