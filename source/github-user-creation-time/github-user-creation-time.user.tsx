// ==UserScript==
// @name        GitHub User Creation Time
// @description Adds the creation time of a user on their profile.
// @namespace   https://github.com/kidonng/script/tree/main/source/github-user-creation-time
// @version     1
// @match       https://github.com/*
// @grant       GM_getValue
// @grant       GM_setValue
// ==/UserScript==

import * as React from "react";
import { $optional, elementExists } from "select-dom";
import Clock from "octicons-plain-react/Clock";
import "@violentmonkey/types";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "relative-time": IntrinsicElements["div"] & { dateTime: string };
    }
  }
}

async function init() {
  const vcard = $optional(".user-profile-bio ~ .vcard-details");
  if (!vcard || elementExists('[title="Member since"]', vcard)) return;

  const username = location.pathname.slice(1);
  let createdAt = GM_getValue(username, "");

  if (!createdAt) {
    const response = await fetch(`https://api.github.com/users/${username}`);
    const data = await response.json();
    createdAt = data.created_at as string;
    GM_setValue(username, createdAt);
  }

  const date = new Date(createdAt);

  vcard.append(
    <li title="Member since" className="vcard-detail pt-1">
      <Clock />
      <span>
        {"Joined "}
        <relative-time dateTime={date.toISOString()}>
          {date.toLocaleDateString()}
        </relative-time>
      </span>
    </li>,
  );
}

init();
