module.exports = {
    bind: function () {
        window.onpopstate = this.handleStateChange;
        window.addEventListener('hashchange', this.handleHashChange);
    },
    unbind: function () {
        window.onpopstate = null;
        window.removeEventListener('hashchange', this.handleHashChange);
    },
    pushState: function (url) {
        return window.history.pushState( null, null, url);
    },
    replaceState: function (url) {
        return window.history.replaceState( null, null, url);
    },
    getState: function () {
        return {
            url: window.location.href,
            hash: window.location.hash,
            pathname: window.location.pathname,
            search: window.location.search
        }
    }
}
