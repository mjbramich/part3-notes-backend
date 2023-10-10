const notesRouter = require('express').Router();
const Note = require('../models/note');

notesRouter.get('/', (request, response) => {
	Note.find({}).then((notes) => {
		response.json(notes);
	});
});

notesRouter.post('/', (request, response, next) => {
	const body = request.body;

	const note = new Note({
		content: body.content,
		important: body.important || false,
		date: new Date(),
	});

	note.save()
		.then((savedNote) => {
			response.status(201).json(savedNote); // 201 code = created
		})
		.catch((error) => next(error));
});

notesRouter.get('/:id', (request, response, next) => {
	Note.findById(request.params.id)
		.then((note) => {
			if (note) {
				response.json(note);
			} else {
				response.status(404).end();
			}
		})
		.catch((error) => next(error));
});

notesRouter.delete('/:id', (request, response, next) => {
	Note.findByIdAndRemove(request.params.id)
		.then(() => {
			response.status(204).end();
		})
		.catch((error) => next(error));
});

notesRouter.put('/:id', (request, response, next) => {
	const { content, important } = request.body;

	Note.findByIdAndUpdate(
		request.params.id,
		{ content, important },
		{ new: true, runValidators: true, context: 'query' }
	)
		.then((updatedNote) => {
			response.json(updatedNote);
		})
		.catch((error) => next(error));
});

module.exports = notesRouter;
