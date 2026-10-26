/* ============================================================
 * 轻量 Supabase REST 客户端
 * 仅实现本项目用到的功能，替代 208KB 的官方 SDK
 * 体积约 3KB，兼容官方 keep chain 调用风格
 * ============================================================ */
(function (global) {
  'use strict';

  function enc(v) { return encodeURIComponent(v); }

  function createClient(url, key) {
    var base = String(url).replace(/\/+$/, '') + '/rest/v1/';

    function from(table) {
      var st = {
        method: 'GET',
        select: '*',
        filters: [],
        order: null,
        limit: null,
        single: false,
        wantCount: false,
        head: false,
        body: null,
        returning: false
      };

      function exec() {
        var params = [];
        if (st.select) params.push('select=' + enc(st.select));
        for (var i = 0; i < st.filters.length; i++) params.push(st.filters[i]);
        if (st.order) params.push('order=' + st.order);
        if (st.limit) params.push('limit=' + st.limit);
        var qs = params.length ? '?' + params.join('&') : '';

        var prefer = [];
        if (st.wantCount) prefer.push('count=exact');
        if (st.returning) prefer.push('return=representation');

        var headers = {
          'apikey': key,
          'Authorization': 'Bearer ' + key
        };
        if (st.body) headers['Content-Type'] = 'application/json';
        if (prefer.length) headers['Prefer'] = prefer.join(',');

        var opts = {
          method: st.head ? 'HEAD' : st.method,
          headers: headers
        };
        if (st.body) opts.body = JSON.stringify(st.body);

        return fetch(base + table + qs, opts).then(function (res) {
          var count = null;
          var cr = res.headers.get('content-range');
          if (cr && cr.indexOf('/') > -1) {
            var tail = cr.split('/')[1];
            if (tail && tail !== '*') count = parseInt(tail, 10);
          }

          if (!res.ok) {
            return res.text().then(function (t) {
              var msg = t || ('HTTP ' + res.status);
              try {
                var j = JSON.parse(t);
                msg = j.message || j.details || j.hint || t;
              } catch (e) { /* 非 JSON 错误体 */ }
              return { data: null, error: { message: msg, status: res.status }, count: count };
            });
          }

          if (st.head || res.status === 204) {
            return { data: null, error: null, count: count };
          }

          return res.text().then(function (t) {
            var data = null;
            if (t) {
              try { data = JSON.parse(t); } catch (e) { data = t; }
            }
            if (st.single && Array.isArray(data)) data = data.length ? data[0] : null;
            return { data: data, error: null, count: count };
          });
        })['catch'](function (e) {
          return {
            data: null,
            error: { message: '网络连接失败：' + (e && e.message ? e.message : e) },
            count: null
          };
        });
      }

      var b = {
        select: function (cols, opts) {
          if (typeof cols === 'string') st.select = cols;
          if (opts) {
            if (opts.count) st.wantCount = true;
            if (opts.head) st.head = true;
          }
          if (st.method === 'POST' || st.method === 'PATCH') st.returning = true;
          return b;
        },
        eq: function (col, val) {
          st.filters.push(col + '=eq.' + enc(val));
          return b;
        },
        'in': function (col, vals) {
          var list = [];
          for (var i = 0; i < vals.length; i++) list.push(enc(vals[i]));
          st.filters.push(col + '=in.(' + list.join(',') + ')');
          return b;
        },
        order: function (col, opts) {
          st.order = col + '.' + (opts && opts.ascending === false ? 'desc' : 'asc');
          return b;
        },
        limit: function (n) {
          st.limit = n;
          return b;
        },
        single: function () {
          st.single = true;
          return b;
        },
        insert: function (data) {
          st.method = 'POST';
          st.body = data;
          return b;
        },
        update: function (data) {
          st.method = 'PATCH';
          st.body = data;
          return b;
        },
        'delete': function () {
          st.method = 'DELETE';
          return b;
        },
        then: function (ok, bad) {
          return exec().then(ok, bad);
        },
        'catch': function (fn) {
          return exec()['catch'](fn);
        }
      };

      return b;
    }

    return { from: from };
  }

  global.supabase = { createClient: createClient };

})(typeof window !== 'undefined' ? window : this);
