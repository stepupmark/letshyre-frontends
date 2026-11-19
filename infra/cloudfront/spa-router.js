// CloudFront Function, runtime cloudfront-js-2.0, viewer request on the app and admin
// distributions' default behavior (docs/deployment.md §4.4). Create one function per distribution
// from this file and change only HOST: "app.letshyre.ai" or "adm.letshyre.ai".
var HOST = "app.letshyre.ai"

// an allowlist, not "has a dot", so a route parameter with a dot still gets the shell
var ROOT_FILES = ["/favicon.ico", "/favicon.png", "/icon.png", "/robots.txt"]
var HSTS = "max-age=63072000; includeSubDomains"

function queryOf(querystring) {
  var parts = []
  for (var key in querystring) {
    var item = querystring[key]
    var values = item.multiValue ? item.multiValue : [item]
    for (var i = 0; i < values.length; i++) {
      parts.push(values[i].value === "" ? key : key + "=" + values[i].value)
    }
  }
  return parts.length ? "?" + parts.join("&") : ""
}

function handler(event) {
  var request = event.request
  var host = request.headers.host ? request.headers.host.value : ""

  if (host !== HOST) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: {
        location: {
          value: "https://" + HOST + request.uri + queryOf(request.querystring),
        },
        "cache-control": { value: "max-age=86400" },
        "strict-transport-security": { value: HSTS },
      },
    }
  }
  if (request.uri.startsWith("/assets/")) return request
  if (ROOT_FILES.indexOf(request.uri) !== -1) return request
  request.uri = "/index.html"
  return request
}
