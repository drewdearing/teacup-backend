/* NEW API */
app.get('/auth')
//takes login information (email, password)
//returns token and refresh token

app.get('/account')
//takes token
//returns document data for the given user

app.put('/account/challonge')
//takes token, challonge user and api key
//validates username and key with challonge servers
//sets username and api key in user doc
//returns {isAuthenticated}

app.get('/tournaments')
//takes token
//returns list of previously loaded tournaments sorted by last active

app.get('/tournaments/{id}')
//takes token and id
//checks whether user is authenticated by challonge
//if authenticated, checks if user is owner
//if isOwner, creates tournament in teacup db if not exist
//if not owner, returns whether tournament exists in teacup db
//if exists, return data in document (currentMatch, nextMatch, ...)
//returns {name, state, exists, isAuthenticated, isOwner, data}

app.post('/tournaments/{id}')
//takes token, id, data
//if isOwner, creates tournament in teacup db if not exist
//if isOwner, sets tournament data (currentMatch, nextMatch, ...)
//if currentMatch or nexMatch changes, broadcast "update"
//if currentMatch changes, brodcast "current_match" with GET match object data

app.get('/tournaments/{id}/labels')
//takes token and id
//returns an object of all labels for given id

app.get('/tournaments/{id}/labels/{name}')
//takes token, id, and label name
//returns label data for given label, if exists

app.put('/tournaments/{id}/labels/{name}')
//takes token, id, name, and label data.
//if user isOwner, set label with given data
//sends socketio broadcast "label_update"

app.delete('/tournaments/{id}/labels/{name}')
//takes token, id, and label name
//is user isOwner and label name exists,
//deletes label from collection
//sends socketio broadcast "label_update"

app.get('/tournaments/{id}/matches')
//takes token, id
//returns modified version of challonge's api /matches
/*
  {
    id: {
      id,
      round,
      state,
      participant1: {name, score, id},
      participant1: {name, score, id}
    },
    ...
  }
*/

app.get('/tournaments/{id}/matches/{match_id}')
//takes token, id, match_id
//if match has is in our db, return current values
//in this format, otherwise return default values
//using challonge data.
/*
  {
    "id",
    "state",
    "participant1": "{id_1}",
    "participant2": "{id_2}",
    "round",
    "participants": {
      "{id_1}": {
        name,
        score,
        label,
        ...
      },
      "{id_2}": {
        name,
        score,
        label,
        ...
      }
    }
  }
*/

app.put('/tournaments/{id}/matches/{match_id}')
//takes token, id, match_id, match object (see GET above)
//if match does not exist in database, creates it.
//sets participant1, participants2 in db
//sets round in db
//sets participant label data in db
//sets score in challonge api
//if state is "complete", complete the match in challonge api
//if state is "complete", update current_match to either null or next_match
//if match is current match, socketio broadcast "current_match"

app.get('/tournaments/{id}/matches/current')
//takes token, id
//returns current match in format above
//id is null if no current match

app.get('/tournaments/{id}/matches/next')
//takes token, id
//returens queued match in format above
//id is null if no queued match

app.get('/tournaments/{id}/participants')
//takes token, id
//returns all modified challonge api list
/*
  {
    id: {
      id,
      name,
      seed,
      labels: {
        label: value,
        ...
      }
    },
    ...
  }
*/

app.get('/tournaments/{id}/participants/{participant_id}')
//takes token, id, participant_id
//returns particpant data
/*
  {
    id,
    name,
    seed,
    labels: {
      label: value,
      ...
    }
  }
*/

app.post('/tournaments/{id}/participants/{participant_id}')
//takes token, id, participant_id, particicipant data
//updates name, seed, and default label values of particicipant
//socketio broadcast for "participant_update"
/*
  {
    id,
    name,
    seed,
    labels: {
      label: value,
      ...
    }
  }
*/