/* eslint no-console: off */
const React = require("react");
const ReactDOMServer = require('react-dom/server');
const ReactMarkdown = require('react-markdown'); /* https://github.com/rexxars/react-markdown */
const fs = require('fs');
const path = require("path");
const request = require('request');

const makeBlock = (dataset = undefined, query = "") => {
  return ({lines: [], dataset, query});
};

const parsePreamble = (lines) => {
  if (!lines[0].startsWith("---")) {
    return [undefined, 0];
  }
  const block = makeBlock(); /* initialise */
  const contents = {title: false, author: false, date: false, category: false};
  let n = 1;
  while (n < lines.length) {
    if (lines[n].startsWith("---")) {
      break;
    }
    const parts = lines[n].split(': ');
    if (parts.length === 2 && contents[parts[0]] === false) {
      contents[parts[0]] = parts[1];
    }
    n++;
  }
  if (contents.title) block.lines.push(`# ${contents.title}`);
  if (contents.author) block.lines.push(`* _Written by:_ **${contents.author}**`);
  if (contents.date) block.lines.push(`* _Date:_ **${contents.date}**`);
  if (contents.category) block.lines.push(`* _Category:_ **${contents.category}**`);
  return [block, ++n];
};


const parseMarkdownArray = (mdArr) => {
  const blocks = [];
  const nMax = mdArr.length;
  const reUrl = /url=[^\s/]*\/([^\s]+)\?([^\s`]*)/;
  let [preambleBlock, n] = parsePreamble(mdArr); /* modifies blocks in-place */
  if (preambleBlock) {
    blocks.push(preambleBlock);
  }
  let block = makeBlock(); /* initialise */
  while (n < nMax) {
    const line = mdArr[n];
    const reMatch = line.match(reUrl);
    if (line.startsWith('`nextstrain') && reMatch) {
      if (block.lines.length && block.lines.filter((l) => l.length).length) {
        blocks.push(block); /* push the previous block onto the stack */
      }
      block = makeBlock(reMatch[1], reMatch[2]);
      if (blocks.length === 1) { // i.e. just the preamble, give it the URL of this block
        blocks[0].dataset = reMatch[1];
        blocks[0].query = reMatch[2];
      }
    } else {
      block.lines.push(line);
    }
    n++;
  }
  blocks.push(block); /* clean up, push the last block onto the stack */
  return blocks;
};

const convertBlocksToHTML = (blocks) => {
  for (const block of blocks) {
    // eslint-disable-next-line no-underscore-dangle
    block.__html = ReactDOMServer.renderToStaticMarkup(<ReactMarkdown source={block.lines.join("\n")} />);
    delete block.lines;
  }
};

const serveNarrative = (query, res) => {
  if (global.LOCAL_DATA) {
    /* this code is syncronous, but that's ok since this is never used in production */
    const mdArr = fs.readFileSync(path.join(global.LOCAL_DATA_PATH, "narratives", query.name + ".md"), 'utf8').split("\n");
    const blocks = parseMarkdownArray(mdArr);
    convertBlocksToHTML(blocks);
    res.send(JSON.stringify(blocks).replace(/</g, '\\u003c'));
  } else {
    const reqURL = global.REMOTE_STATIC_BASEURL + "narratives/" + query.name + ".md";
    request(reqURL, (err, response, body) => {
      if (err || body.startsWith("404") || body.split("\n")[1].startsWith('<head><title>404')) {
        res.status(404).send('Post not found.');
        // console.error("Narrative file 404", reqURL, err)
        return;
      }
      const mdArr = body.split("\n");
      const blocks = parseMarkdownArray(mdArr);
      convertBlocksToHTML(blocks);
      res.send(JSON.stringify(blocks).replace(/</g, '\\u003c'));
    });
  }
};

module.exports = {
  serveNarrative
};
