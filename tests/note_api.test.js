const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const { initialNotes, nonExistingId, notesInDb } = require('./test_helper');
// create superagent object
const api = supertest(app);
const Note = require('../models/note');

// beforeEach runs a function before each of the tests
beforeEach(async () => {
	await Note.deleteMany({});

	const noteObjects = initialNotes.map((note) => new Note(note));
	const promiseArray = noteObjects.map((note) => note.save());
	await Promise.all(promiseArray); //waits until all promises are fulfilled
});

test('notes are returned as json', async () => {
	await api
		.get('/api/notes')
		.expect(200)
		.expect('Content-Type', /application\/json/);
}, 10000);

test('all notes are returned', async () => {
	const response = await api.get('/api/notes');

	// execution gets here only after the HTTP request is complete,
	// the result of HTTP request is saved in  variable response
	expect(response.body).toHaveLength(initialNotes.length);
});

test('a specific note is within the returned notes', async () => {
	const response = await api.get('/api/notes');

	//create an array of the contents of each note
	const contents = response.body.map((r) => r.content);
	console.log(contents);
	expect(contents).toContain('Browser can only execute JavaScript');
});

test('a valid note can be added', async () => {
	const newNote = {
		content: 'async/await simplifies making async calls',
		important: true,
	};

	await api
		.post('/api/notes')
		.send(newNote)
		.expect(201)
		.expect('Content-Type', /application\/json/);

	const notesAtEnd = await notesInDb();
	expect(notesAtEnd).toHaveLength(initialNotes.length + 1);

	const contents = notesAtEnd.map((n) => n.content);

	expect(contents).toContain('async/await simplifies making async calls');
});

test('note without content is not added', async () => {
	const newNote = {
		important: true,
	};

	await api.post('/api/notes').send(newNote).expect(400);

	const notesAtEnd = await notesInDb();

	expect(notesAtEnd).toHaveLength(initialNotes.length);
});

test('a specific note can be viewed', async () => {
	const notesAtStart = await notesInDb();

	const noteToView = notesAtStart[0];

	const resultNote = await api
		.get(`/api/notes/${noteToView.id}`)
		.expect(200)
		.expect('Content-Type', /application\/json/);

	expect(resultNote.body).toEqual(noteToView);
});

test('a note can be deleted', async () => {
	const notesAtStart = await notesInDb();
	const noteToDelete = notesAtStart[0];

	await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

	const notesAtEnd = await notesInDb();

	expect(notesAtEnd).toHaveLength(initialNotes.length - 1);

	const contents = notesAtEnd.map((r) => r.content);

	expect(contents).not.toContain(noteToDelete.content);
});

// Disconnect from db after tests
afterAll(async () => {
	await mongoose.connection.close();
});
