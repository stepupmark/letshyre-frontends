// CloudFront Function, runtime cloudfront-js-2.0, viewer request on the marketing distribution's
// default behavior. Rules and their order: docs/deployment.md §4.2. apps/marketing/e2e/serve.ts
// follows the same order, so the e2e suite tests these rules against the build.

// beta.letshyre.ai until the move to the apex (docs/deployment.md §10)
var HOST = "beta.letshyre.ai"

var LOCALES = "en|hi|fr|ja|ar|te|ta|es|nl|ru|kn|ml|ur|bn|de|pt|it|ko|id"
var LOCALE_PAGE = new RegExp("^/(" + LOCALES + ")(/[a-z0-9-]+){0,3}$")
var FILE =
  /\.(html|data|js|css|json|xml|txt|webmanifest|ico|png|jpe?g|webp|avif|svg|woff2|csv|docx|xlsx)$/
// generated responses skip the viewer-response function, so they carry their own HSTS
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

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: "Moved Permanently",
    headers: {
      location: { value: location },
      // a mistaken redirect shouldn't stick in browsers for good
      "cache-control": { value: "max-age=86400" },
      "strict-transport-security": { value: HSTS },
    },
  }
}

function handler(event) {
  var request = event.request
  var uri = request.uri
  var host = request.headers.host ? request.headers.host.value : ""
  var query = queryOf(request.querystring)

  if (host !== HOST) return redirect("https://" + HOST + uri + query)
  if (uri === "/" || uri === "/index.html") return redirect("/en" + query)
  if (uri.endsWith("/index.html")) {
    return redirect(uri.slice(0, -"/index.html".length) + query)
  }
  if (uri.length > 1 && uri.endsWith("/")) {
    return redirect(uri.slice(0, -1) + query)
  }
  // the deploy's manifest lives in the bucket; a key that can't exist makes it S3's 404 page
  if (uri.startsWith("/_deploy/")) {
    request.uri = "/_deploy"
    return request
  }
  if (FILE.test(uri)) return request
  if (LOCALE_PAGE.test(uri)) request.uri = uri + "/index.html"
  return request
}
