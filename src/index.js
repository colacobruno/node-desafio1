const express = require('express');
const cors = require('cors');

const {
  v4: uuidv4
} = require('uuid');
const {
  request
} = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {
    username
  } = request.headers;

  const user = users.find(user => user.username === username);

  if (!user) {
    return response.status(404).json({
      error: "Usuário não encontrado"
    })
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const {
    name,
    username,
  } = request.body;

  const existeUsuario = users.some(
    (users) => users.username === username
  );

  if (existeUsuario) {
    return response.status(400).json({
      error: "Já existe um usuário com esse username"
    })
  }

  const user = {
    name,
    username,
    id: uuidv4(),
    todos: []
  }

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const {
    user
  } = request;

  return response.json(user.todos);

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {
    user
  } = request;
  const {
    title,
    deadline
  } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    user
  } = request;

  const {
    id
  } = request.params;

  const {
    title,
    deadline
  } = request.body;

  const todo = user.todos.find((tarefa) => tarefa.id === id)

  if (!todo) {
    return response.status(404).json({
      error: "Tarefa não encontrada"
    })
  }

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {
    user
  } = request;

  const {
    id
  } = request.params;

  const todo = user.todos.find((todo) => todo.id === id)

  if (!todo) {
    return response.status(404).json({
      error: "Tarefa não encontrada"
    })
  }

  todo.done = true;

  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {
    user
  } = request;

  const {
    id
  } = request.params;

  const todo = user.todos.find((todo) => todo.id === id) // retorna a posição do array

  if (!todo) {
    return response.status(404).json({
      error: "Tarefa não encontrada"
    });
  }

  user.todos.splice(todo);

  return response.status(204).json();

});

module.exports = app;