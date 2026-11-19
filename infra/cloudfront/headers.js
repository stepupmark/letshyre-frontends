// CloudFront Function, runtime cloudfront-js-2.0, viewer response on every behavior of all three
// distributions (docs/deployment.md §4.3). The code is the same everywhere; flat-rate plans need a
// separate function per distribution, so create three from this file.

var HSTS = "max-age=63072000; includeSubDomains"

var COMMON = {
  "strict-transport-security": HSTS,
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
}

// by Host; anything else is the marketing site
var BY_HOST = {
  "app.letshyre.ai": {
    "referrer-policy": "strict-origin-when-cross-origin",
    // Razorpay can open a popup for UPI and netbanking
    "cross-origin-opener-policy": "same-origin-allow-popups",
    // interviews record camera and microphone
    "permissions-policy": "camera=(self), microphone=(self), geolocation=()",
    "x-robots-tag": "noindex, nofollow",
  },
  "adm.letshyre.ai": {
    "referrer-policy": "no-referrer",
    "cross-origin-opener-policy": "same-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "x-robots-tag": "noindex, nofollow",
  },
  "beta.letshyre.ai": {
    "referrer-policy": "strict-origin-when-cross-origin",
    "cross-origin-opener-policy": "same-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
    "x-robots-tag": "noindex, nofollow",
  },
  "letshyre.ai": {
    "referrer-policy": "strict-origin-when-cross-origin",
    "cross-origin-opener-policy": "same-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
  },
}

function set(headers, values) {
  for (var name in values) headers[name] = { value: values[name] }
}

function handler(event) {
  var response = event.response
  var headers = response.headers
  var host = event.request.headers.host ? event.request.headers.host.value : ""

  // the deploy writes each HTML file's policy into its S3 metadata
  var csp = headers["x-amz-meta-csp"]
  if (csp) {
    var mode = headers["x-amz-meta-csp-mode"]
    var name =
      mode && mode.value === "enforce"
        ? "content-security-policy"
        : "content-security-policy-report-only"
    headers[name] = { value: csp.value + "; frame-ancestors 'none'" }
  }
  for (var key in headers) {
    if (key.indexOf("x-amz-") === 0) delete headers[key]
  }

  set(headers, COMMON)
  set(headers, BY_HOST[host] || BY_HOST["letshyre.ai"])
  return response
}
