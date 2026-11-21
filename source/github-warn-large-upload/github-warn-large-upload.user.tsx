// ==UserScript==
// @name        GitHub Warn Large Upload
// @description Warns you when uploading a file exceeding the size limit.
// @match       https://github.com/*
// ==/UserScript==

import { $ } from "select-dom";
import doma from "doma";
import { insertTextIntoField } from "text-field-edit";
import "@violentmonkey/types";

const fetch = unsafeWindow.fetch;

unsafeWindow.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  if (input === "/upload/policies/assets") {
    const response = await fetch(input, init);
    const data = await response.json();

    if ("errors" in data) {
      const field = $('[data-testid="comment-composer"] textarea');
      for (const error of data.errors) {
        const message = doma(error.message).textContent.replace(/^size /, "");
        insertTextIntoField(field, `\n<!-- ${message} -->`);
      }
    }

    return Response.json(data, response);
  }

  return fetch(input, init);
};
