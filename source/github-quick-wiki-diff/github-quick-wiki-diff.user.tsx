// ==UserScript==
// @name        GitHub Quick Wiki Diff
// @description Adds a link to compare a wiki revision with the previous version.
// @namespace   https://github.com/kidonng/script/tree/main/source/github-quick-wiki-diff
// @version     1
// @match       https://github.com/*
// ==/UserScript==

import { observe } from "animation-observer";
import * as React from "react";
import { $ } from "select-dom";

function getCommit(link: HTMLAnchorElement) {
  return link.href.split("/").at(-1);
}

const linkSelector = ".text-mono a";

observe(".js-wiki-history-revision", (element) => {
  // TODO: support multiple pages
  const previousLink = $(linkSelector, element.nextElementSibling || undefined);
  const currentLink = $(linkSelector, element);

  if (!previousLink || !currentLink) return;

  const previousCommit = getCommit(previousLink);
  const currentCommit = getCommit(currentLink);

  currentLink.after(
    <div className="mt-2">
      <a
        href={location.pathname.replace(
          "_history",
          `_compare/${previousCommit}...${currentCommit}`,
        )}
      >
        Previous
      </a>
    </div>,
  );
});
