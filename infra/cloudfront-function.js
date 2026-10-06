function handler(event) {
  var request = event.request;
  var subdomain = request.headers.host.value.split(".")[0];

  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    return { statusCode: 400, statusDescription: "Bad Request" };
  }

  var uri = request.uri;
  var lastSegment = uri.substring(uri.lastIndexOf("/") + 1);

  if (uri.charAt(uri.length - 1) === "/") {
    uri += "index.html";
  } else if (lastSegment.indexOf(".") === -1) {
    uri = "/index.html";
  }

  request.uri = "/builds/" + subdomain + uri;
  return request;
}
