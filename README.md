# Crawler and Scraper

## Tech

This application was built using the following technologies:

- [Node.js]
- [node-config]
- [Puppeteer]

## Installation

- Install [Node.js] v16 (LTS).
- Clone this repository.
- Open a terminal in the cloned folder and run the following command:

```sh
npm install
```

## Usage

Open a terminal in the cloned folder and run the following command:

```sh
node index.js
```

By default, it will start crawling the https://oda.com/ website and print the results and some logging information in the console.

## Configuration

The tool can be configured by changing its configuration file in ./config/default.json

```json
{
  "instructionSet": "oda",
  "outputType": "console",

  "puppeteer": {
    "headless": true,
    "devtools": false
  },
  "htmlWriter": {
    "file": "output.html"
  },
  "delay": 2000
}
```

| Key                | Default Value | Description                                                                   |
| ------------------ | ------------- | ----------------------------------------------------------------------------- |
| instructionSet     | oda           | Configures which instruction set to run. Possible values: "oda" / "finn"      |
| outputType         | console       | Configures where to print output. Possible values: "console" / "html"         |
| puppeteer.headless | true          | Configures puppeteer to run headless (for debugging purposes)                 |
| puppeteer.devtools | false         | Configures puppeteer to open devtools (for debugging purposes)                |
| htmlWriter.file    | output.html   | When running "outputType": "html", configures the file where to store results |
| delay              | 2000          | Configures how long to wait before starting to progress to the next page      |

[//]: #
[node-config]: https://github.com/lorenwest/node-config
[puppeteer]: https://github.com/puppeteer/puppeteer
[node.js]: http://nodejs.org
