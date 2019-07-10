# Mock that!

## Installation

Mockserver can be installed globally if you need
to run it as a command:

```
$ npm install -g @mockthat/web

$ mockthat --path ./custom-folder --port 8080
Mock that! is currently runnig at http://localhost:8080/
Serving Files: <your-project-path>/custom-folder
```

> **Note**: You can install `@mockthat/core` if you want a version without the web browser, if you use `@mockthat/web` will be using the web from [@mockthat/web](https://github.com/mockthat/web)

### Options

- **--path** (default: `<your-project-path>/mocks`): Path that will be as root of mocks
- **--port** (default: `7000`): Where the server will be started

## Usage

You can check some demo structure at [./examples](https://github.com/mockthat/core/tree/master/examples)

Create a `./mocks` folder into the root of your project. You have the following entities:
- **Category**: is a main wrapper of module tests, you can have only one category running at time
- **Scenarios**: is the current state of the mock - there you can define `api` and `websockets`

### Category
Every folder inside `./mocks` will be considered a different "category" for mocking - you can only run one mock category at time

1. Create a sub-folder into your `./mocks` folder.
1. Inside that folder you must create:
    - `./scenarios` folder - where it you will have the scenarios for each mock state
    - `main.json` file - where you will have this category name

```
{
  "name": "Your category name"
}
```

### Scenarios

On scenario is where you define what your mock will be using (`api` or/and `websocket`) and it's under a category, for example `./category-a/scenarios/<my-scenario>`

A simple example of scenario configutarion:

```
{
  "name": "Scenario name",
  "api": {
    "active": true,
    "config": "./api/main.json"
  },
  "websocket": {
    "active": true,
    "config": "./websocket/main.json"
  }
}
```

#### API
Here you can define what port your API will be running, response code, what will reply, method and others.

Example of api JSON:

```
{
  "services": [
    {
      "api": "/balance",
      "method": "GET",
      "path": "./response/success.json",
      "code": 200,
      "header": {
        "custom-header": "Oh yeah!"
      }
    }
  ],
  "port": 5000
}
```

Please not that all paths are relative from where this JSON is located.

#### Websocket
Here you can define the repetition strategy, when it will be trigged and what messages you will be sending.

Example of Websocket JSON:

```
{
  "trigger": "IMMEDIATELY",
  "repeat": "LOOPING",
  "messages": [{
    "event": "dummy",
    "path": "./messages/1.json",
    "delay": 300
  }, {
    "event": "dummy",
    "path": "./messages/2.json",
    "delay": 300
  }, {
    "event": "dummy",
    "path": "./messages/3.json",
    "delay": 300
  }]
}

```

Please not that all paths are relative from where this JSON is located.
