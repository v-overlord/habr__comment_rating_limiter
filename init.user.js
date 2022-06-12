// ==UserScript==
// @name         Comment rating limiter
// @namespace    https://github.com/v-overlord/habr__comment_rating_limiter
// @version      1.0
// @description  Hides low rated comments
// @author       v-overlord
// @match        https://habr.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=habr.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const INPUT_ID = '__my_comments_rating_limiter_input';
    const CLEAR_BTN_ID = '__my_comments_rating_limiter_clear_btn';

    const ADMIN_PANEL_HTML_TEMPLATE = `<h2 style="padding-left: 10px;">Show comments with only &gt; than <input type="text" id="${INPUT_ID}" class="search-form__field" style="width: 50px;padding: 0 5px;"> rating | <a id="${CLEAR_BTN_ID}">Clear</a></h2>`;
    const GLOBAL_CSS_RULES = `.content-list__item_comment + .content-list__item_comment !important {padding: 0;}`;

    let STATE = {
        HIDE_ON_MOUSE: true
    };

    let comment_header = document.querySelector('#comments > header');

    if (comment_header === null) {
        // It is not an article
        return null;
    }

    comment_header.insertAdjacentHTML('beforeend', ADMIN_PANEL_HTML_TEMPLATE);

    let style_el = document.createElement('style');
    style_el.innerHTML = GLOBAL_CSS_RULES;
    document.head.appendChild(style_el);

    setTimeout(setEnterHandler, 1);

    function wrapHover(el, on_enter, on_leave) {
        el.addEventListener('mouseover', function(e) { if (STATE.HIDE_ON_MOUSE) on_enter.call(this, e) });
        el.addEventListener('mouseout', function(e) { if (STATE.HIDE_ON_MOUSE) on_leave.call(this, e) });
    }

    function processClear(value) {
        STATE.HIDE_ON_MOUSE = false;

        document.querySelectorAll('#comments-list div.comment .js-score').forEach(score_el => {
            let parent_el = score_el.closest('.js-comment');

            if (parent_el === null) return null;

            const parent_comment_el = parent_el.querySelector('.comment');

            if (parent_comment_el === null) return null;
            parent_comment_el.style.opacity = '1';
        });
    }
    function processComments(value) {
        STATE.HIDE_ON_MOUSE = true;

        document.querySelectorAll('#comments-list div.comment .js-score').forEach(score_el => {
            const score = parseInt(score_el.textContent.replace('–', '-'), 10);

            if (score >= value) return true;

            let parent_el = score_el.closest('.js-comment');

            if (parent_el === null) return null;

            const parent_comment_el = parent_el.querySelector('.comment');
            parent_comment_el.style.opacity = '0.2';
            wrapHover(parent_comment_el, function (e) {
                this.style.opacity = '1';
            }, function (e) {
                this.style.opacity = '0.2';
            });

            // @TODO: Check it
            // parent_el.querySelector('.parent_id')?.remove();
            // parent_el.querySelector('.comment')?.remove();
            // parent_el.querySelector('ul.content-list').style.padding = '0';
        });
    }

    function setEnterHandler() {
        let input_el = comment_header.querySelector(`#${INPUT_ID}`);
        let clear_btn_el = comment_header.querySelector(`#${CLEAR_BTN_ID}`);

        if (input_el === null || clear_btn_el === null) {
            console.info(`[Comment rating limiter] -> Can't find the input element!`);
            return null;
        }

        input_el.addEventListener('keypress', function(e) {
            if (e.key !== 'Enter') return null;

            processComments(this.value);
        });

        clear_btn_el.addEventListener('click', function(e) {
            processClear();

            e.preventDefault();
            return false;
        });

        setTimeout(function() {
            input_el.value = 10;
            input_el.dispatchEvent(new KeyboardEvent('keypress',{'key':'Enter'}));
        }, 1);
    }
})();
