"use strict"

const config = require('./config.js')

const admin = require('firebase-admin')
admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: config.databaseURL
})

const functions = require('firebase-functions')
const express   = require('express')
const database  = new (require('./database.js'))(admin)
const trigger   = new (require('./trigger.js'))(database)
const generate  = new (require('./generate.js'))(database)
const app = express()

app.get('/export/:language/android', (request, response) =>
{
	return generate.exportFile(request, response, 'strings-{language}.xml', generate.android)
})

app.get('/export/:language/ios', (request, response) =>
{
	return generate.exportFile(request, response, 'Localizable-{language}.strings', generate.ios)
})

app.get('/export/:language/xliff', (request, response) =>
{
	return generate.exportFile(request, response, '{language}.xlf', generate.xliff)
})

app.get('/export/:language/json', (request, response) =>
{
	return generate.exportFile(request, response, '{language}.json', generate.json)
})

app.get('/export/:language/yaml', (request, response) =>
{
	return generate.exportFile(request, response, '{language}.yaml', generate.yaml)
})

const api = express()
api.use('/api', app)

exports.api = functions.https.onRequest(api)

exports.onSegmentCreated = functions.database.ref('segments/{segmentId}').onCreate(event =>
{
	return trigger.onSegmentCreated(event)
})

exports.onTranslationUpdated = functions.database.ref('segments/{segmentId}/translations/{translationId}/value').onUpdate(event =>
{
	return trigger.onTranslationUpdated(event)
})

exports.onLanguageAdded = functions.database.ref('languages/{languageId}').onCreate(event =>
{
	return trigger.onLanguageAdded(event)
})

exports.onLanguageRemoved = functions.database.ref('languages/{languageId}').onDelete(event =>
{
	return trigger.onLanguageRemoved(event)
})