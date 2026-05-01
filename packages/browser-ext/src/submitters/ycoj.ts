// Copyright (C) 2026 Langning Chen
//
// This file is part of cph-ng.
//
// cph-ng is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// cph-ng is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with cph-ng.  If not, see <https://www.gnu.org/licenses/>.

import { BaseSubmitter } from '@b/submitters/base';
import { submitterDomains } from '@b/submitters/domains';
import type { SubmitData } from '@cph-ng/core';

export class YcojSubmitter extends BaseSubmitter {
  public readonly supportedDomains = submitterDomains.ycoj;

  public getSubmitUrl(data: SubmitData) {
    const url = new URL(data.url);
    url.pathname += '/submit';
    return url.toString();
  }

  public async fill({ sourceCode }: SubmitData): Promise<void> {
    // try CodeMirror 6 editor first
    const cmContent = document.querySelector<HTMLElement>('.cm-content');
    if (cmContent) {
      cmContent.innerText = sourceCode;
      cmContent.dispatchEvent(new Event('input', { bubbles: true }));
      cmContent.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // fallback to textarea (React-controlled)
      const sourceCodeEl = await this.waitForElement<HTMLTextAreaElement>('#code-input');
      // use native setter to bypass React's override on textarea.value
      const nativeSetter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value',
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(sourceCodeEl, sourceCode);
      } else {
        sourceCodeEl.value = sourceCode;
      }
      // React listens to 'input' event for controlled components
      sourceCodeEl.dispatchEvent(new Event('input', { bubbles: true }));
      sourceCodeEl.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // wait for editor framework to process
    await new Promise((r) => setTimeout(r, 200));

    const submitBtn = await this.waitForElement<HTMLButtonElement>('button[type="submit"]');
    submitBtn.click();
  }
}
