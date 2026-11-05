(function () {
  "use strict";

  const DAY_MS = 24 * 60 * 60 * 1000;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function escapeHtml(value) {
    return String(value == null ? "" : value).replaceAll("&", "&amp;").replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
  }

  function safeUrl(value) {
    const url = String(value || "");
    return url.startsWith("/") && !url.startsWith("//") && !/[\\\u0000-\u0020]/.test(url) ? url : "#";
  }

  function collectEvents(posts, year) {
    const events = [];
    posts.forEach(function (post) {
      (post.events || []).forEach(function (event) {
        if (year == null || event.date.startsWith(year + "-")) events.push(Object.assign({ post: post }, event));
      });
    });
    return events.sort(function (left, right) {
      const leftTimestamp = Date.parse(left.timestamp || left.date);
      const rightTimestamp = Date.parse(right.timestamp || right.date);
      return right.date.localeCompare(left.date) ||
        (Number.isFinite(rightTimestamp) ? rightTimestamp : 0) - (Number.isFinite(leftTimestamp) ? leftTimestamp : 0) ||
        String(left.post.title).localeCompare(String(right.post.title), "zh-CN");
    });
  }

  function renderEvent(event) {
    const create = event.kind === "create";
    return '<li class="post-history-event"><time datetime="' + escapeHtml(event.timestamp || event.date) + '">' + escapeHtml(event.date) +
      '</time><span class="post-history-kind' + (create ? ' is-create' : '') + '">' + (create ? '新建' : '修改') +
      '</span><span class="post-history-subject">' + escapeHtml(event.subject || "更新文章") + '</span><code>' +
      escapeHtml(String(event.hash || "").slice(0, 7)) + '</code></li>';
  }

  function renderCalendar(posts, year, today, selectedDate) {
    const counts = new Map();
    collectEvents(posts, year).forEach(function (event) { counts.set(event.date, (counts.get(event.date) || 0) + 1); });
    const maximum = Math.max.apply(null, [1].concat(Array.from(counts.values())));
    const firstDay = Date.UTC(year, 0, 1);
    const lastDay = Date.UTC(year, 11, 31);
    const offset = new Date(firstDay).getUTCDay();
    const columns = Math.ceil(((lastDay - firstDay) / DAY_MS + 1 + offset) / 7);
    const left = 34;
    const top = 26;
    const step = 14;
    const width = left + columns * step + 2;
    const months = MONTHS.map(function (month, index) {
      const column = Math.floor(((Date.UTC(year, index, 1) - firstDay) / DAY_MS + offset) / 7);
      return '<text class="post-history-month" x="' + (left + column * step) + '" y="13">' + month + '</text>';
    }).join('');
    const weekdays = [[1, '一'], [3, '三'], [5, '五']].map(function (item) {
      return '<text class="post-history-weekday" x="0" y="' + (top + item[0] * step + 9) + '">周' + item[1] + '</text>';
    }).join('');
    const cells = [];
    for (let timestamp = firstDay, index = offset; timestamp <= lastDay; timestamp += DAY_MS, index++) {
      const date = new Date(timestamp).toISOString().slice(0, 10);
      const count = counts.get(date) || 0;
      const future = date > today;
      const selected = date === selectedDate;
      const level = count ? Math.min(4, Math.max(1, Math.ceil(count / maximum * 4))) : 0;
      const label = date + '：' + count + ' 次文章修改' + (future ? '，尚未到来' : '');
      cells.push('<rect class="post-history-cell' + (future ? ' is-future' : '') + (selected ? ' is-selected' : '') +
        '" x="' + (left + Math.floor(index / 7) * step) + '" y="' + (top + index % 7 * step) + '" width="10" height="10" rx="2" data-date="' + date +
        '" data-level="' + (future ? 0 : level) + '" data-count="' + count + '"' +
        (future ? ' aria-disabled="true"' : ' role="button" tabindex="' + (selected ? '0' : '-1') + '" aria-pressed="' + selected + '"') +
        ' aria-label="' + escapeHtml(label) + '"><title>' + escapeHtml(label) + '</title></rect>');
    }
    return '<svg class="post-history-calendar" viewBox="0 0 ' + width + ' 127" width="' + width + '" height="127" role="group" aria-label="' + year + ' 年文章修改日历">' + months + weekdays + cells.join('') + '</svg>';
  }

  function initComponent(component) {
    if (component.dataset.historyReady) return;
    const payload = component.querySelector('[data-post-history-data]');
    if (!payload) return;
    let data;
    try { data = JSON.parse(payload.textContent); } catch (error) { return; }
    if (!data || data.version !== 1 || !Array.isArray(data.posts)) return;
    component.dataset.historyReady = 'true';
    component.classList.add('is-interactive');

    const years = component.querySelector('[data-history-years]');
    const yearButtons = years.querySelectorAll('[data-history-year-button]');
    const chart = component.querySelector('[data-history-chart]');
    const dayList = component.querySelector('[data-history-day-list]');
    const posts = data.posts;
    let selectedDate = null;
    let currentYear = Number(data.today.slice(0, 4));
    let currentEvents = [];
    yearButtons.forEach(function (button) { button.disabled = false; });

    function updateDay(date) {
      selectedDate = date;
      chart.querySelectorAll('[data-date]').forEach(function (cell) {
        const selected = cell.dataset.date === date;
        cell.classList.toggle('is-selected', selected);
        if (cell.getAttribute('aria-disabled') !== 'true') {
          cell.setAttribute('aria-pressed', String(selected));
          cell.setAttribute('tabindex', selected ? '0' : '-1');
        }
      });
      if (!chart.querySelector('[tabindex="0"]')) {
        const first = chart.querySelector('[role="button"]');
        if (first) first.setAttribute('tabindex', '0');
      }
      component.querySelector('[data-history-day-title]').textContent = date ? date + ' 的修改' : '日期记录';
      const dayEvents = currentEvents.filter(function (event) { return event.date === date; });
      component.querySelector('[data-history-day-count]').textContent = date ? dayEvents.length + ' 次' : '';
      if (!date || !dayEvents.length) {
        dayList.innerHTML = '<p class="post-history-empty">' + (date ? '这一天没有文章修改记录。' : '选择一个日期，查看当天的写作记录。') + '</p>';
        return;
      }
      const groups = new Map();
      dayEvents.forEach(function (event) {
        if (!groups.has(event.post.id)) groups.set(event.post.id, { post: event.post, events: [] });
        groups.get(event.post.id).events.push(event);
      });
      dayList.innerHTML = Array.from(groups.values()).map(function (group) {
        return '<div class="post-history-day-post"><a class="post-history-post-link" href="' + escapeHtml(safeUrl(group.post.url)) + '">' + escapeHtml(group.post.title) +
          '</a><span class="post-history-post-count">' + group.events.length + ' 次</span><ol class="post-history-events">' + group.events.map(renderEvent).join('') + '</ol></div>';
      }).join('');
    }

    function updateYear(year) {
      currentYear = year;
      currentEvents = collectEvents(posts, year);
      component.querySelector('[data-history-total]').textContent = currentEvents.length;
      component.querySelector('[data-history-days]').textContent = new Set(currentEvents.map(function (event) { return event.date; })).size;
      component.querySelector('[data-history-posts]').textContent = new Set(currentEvents.map(function (event) { return event.post.id; })).size;
      component.querySelector('[data-history-scope]').textContent = year + ' 年 · 全部文章';
      selectedDate = currentEvents[0] ? currentEvents[0].date : null;
      chart.innerHTML = renderCalendar(posts, year, data.today, selectedDate);
      yearButtons.forEach(function (button) {
        const active = Number(button.dataset.historyYearButton) === year;
        button.setAttribute('aria-pressed', String(active));
        button.classList.toggle('is-active', active);
      });
      updateDay(selectedDate);
    }

    chart.addEventListener('click', function (event) {
      const cell = event.target.closest('[data-date]');
      if (!cell || cell.getAttribute('aria-disabled') === 'true') return;
      updateDay(cell.dataset.date);
    });
    chart.addEventListener('keydown', function (event) {
      const cell = event.target.closest('[data-date]');
      if (!cell || cell.getAttribute('aria-disabled') === 'true') return;
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        updateDay(cell.dataset.date);
        return;
      }
      const directions = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 };
      if (!(event.key in directions) && event.key !== 'Home' && event.key !== 'End') return;
      event.preventDefault();
      const cells = Array.from(chart.querySelectorAll('[role="button"]'));
      const index = cells.indexOf(cell);
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? cells.length - 1 : Math.max(0, Math.min(cells.length - 1, index + directions[event.key]));
      cells.forEach(function (item) { item.setAttribute('tabindex', '-1'); });
      cells[nextIndex].setAttribute('tabindex', '0');
      cells[nextIndex].focus();
    });
    years.addEventListener('click', function (event) {
      const button = event.target.closest('[data-history-year-button]');
      if (!button || !years.contains(button) || button.disabled) return;
      const year = Number(button.dataset.historyYearButton);
      if (year !== currentYear) updateYear(year);
    });
    updateYear(currentYear);
  }

  function init() { document.querySelectorAll('[data-post-history]').forEach(initComponent); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
  if (!window.__postHistoryPjaxReady) {
    window.__postHistoryPjaxReady = true;
    document.addEventListener('pjax:success', init);
    document.addEventListener('pjax:complete', init);
  }
})();
