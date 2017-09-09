"use strict"

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const generate = require('./generate.js')
const database = require('./database.js')
const app = express()

admin.initializeApp({
	credential: admin.credential.applicationDefault(),
	databaseURL: 'https://app-localization-2f645.firebaseio.com'
})

app.get('/export/:language/android', (request, response) =>
{
	const languageCode = request.param('language')

	database.languagesRef(admin).once('value', languagesSnap =>
	{
		const language = database.languageByCode(languageCode, languagesSnap)
		
		return database.segmentsRef(admin).once('value', segmentsSnap =>
		{
			response.set('content-disposition', `attachment; filename="strings-${languageCode}.xml"`)
			response.send(generate.android(language, segmentsSnap.val()))
		})
	})
})

app.get('/export/:language/ios', (request, response) =>
{
	const languageCode = request.param('language')
	
	database.languagesRef(admin).once('value', languagesSnap =>
	{
		const language = database.languageByCode(languageCode, languagesSnap)
		
		return database.segmentsRef(admin).once('value', segmentsSnap =>
		{
			response.set('content-disposition', `attachment; filename="Localizable-${languageCode}.strings"`)
			response.send(generate.ios(language, segmentsSnap.val()))
		})
	})
})

app.get('/export/:language/xliff', (request, response) =>
{
	const languageCode = request.param('language')
	
	database.languagesRef(admin).once('value', languagesSnap =>
	{
		const language = database.languageByCode(languageCode, languagesSnap)
		
		return database.segmentsRef(admin).once('value', segmentsSnap =>
		{
			response.set('content-disposition', `attachment; filename="${languageCode}.xlf"`)
			response.send(generate.xliff(language, segmentsSnap.val()))
		})
	})
})

app.get('/export/:language/json', (request, response) =>
{
	const languageCode = request.param('language')
	
	database.languagesRef(admin).once('value', languagesSnap =>
	{
		const language = database.languageByCode(languageCode, languagesSnap)
		
		return database.segmentsRef(admin).once('value', segmentsSnap =>
		{
			response.set('content-disposition', `attachment; filename="${languageCode}.json"`)
			response.send(generate.json(language, segmentsSnap.val()))
		})
	})
})

app.get('/export/:language/yaml', (request, response) =>
{
	const languageCode = request.param('language')
	
	database.languagesRef(admin).once('value', languagesSnap =>
	{
		const language = database.languageByCode(languageCode, languagesSnap)
		
		return database.segmentsRef(admin).once('value', segmentsSnap =>
		{
			response.set('content-disposition', `attachment; filename="${languageCode}.yaml"`)
			response.send(generate.yaml(language, segmentsSnap.val()))
		})
	})
})

const api = express()
api.use('/api', app)

exports.api = functions.https.onRequest(api)

// https://github.com/firebase/functions-samples
// https://us-central1-app-localization-2f645.cloudfunctions.net/[function]
/*exports.example = functions.https.onRequest((request, response) =>
{
	response.json({property:123})
})*/

exports.addHistory = functions.database.ref('/segments/{segmentId}/translations/{translationId}/value').onUpdate(event =>
{
	const entry = {
		value: event.data.previous.val(),
		author: event.auth.variable.email,
		date: Date.now()
	}
	
	return event.data.ref.parent.child('history').push(entry)
})