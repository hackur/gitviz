var chakram = require('chakram')
var expect = chakram.expect
var request = require('request')
var crypto = require('crypto')
var loader = require("fixture-loader")
var uuid = require('node-uuid')

// generate Github signature
function sign (payload, secret) {
    var hmac = crypto.createHmac ('sha1', secret)
    hmac.update (JSON.stringify (payload), 'utf-8')
    return `sha1=${hmac.digest('hex')}`
}

// load JSON fixture from file
function loadGithubEventFixture (filename) {
    const fixture_loader = loader.create (__dirname)
    return fixture_loader.loadParsedJson ('./fixtures', filename)
}

describe ("Gitviz Webhook Handler", () => {
    var secret
    var end_point
    var options

    before (() => {
        secret = process.env.X_HUB_SECRET
        end_point = 'http://localhost:3000/event'
        options = {
            headers: {
                'content-type': 'application/json',
                'User-Agent': 'GitHub-Hookshot/e4028f5',
            }
        }
        chakram.setRequestDefaults (options)
    })

    beforeEach (() => {
        // generate a unique event ID
        options.headers['X-GitHub-Delivery'] = uuid.v4()
    })

    it ("should return a 403 error when the signature is missing", () => {
        var payload = loadGithubEventFixture ('ping')
        options.headers['X-GitHub-Event'] = 'ping'
	options.headers['X-Hub-Signature'] = '' // missing signature
        var response = chakram.post (end_point, payload)
        return expect(response).to.have.status(403)
    })

    it ("should return a 403 error when signed with an incorrect secret", () => {
        var payload = loadGithubEventFixture ('ping')
        options.headers['X-GitHub-Event'] = 'ping'
	options.headers['X-Hub-Signature'] = sign (payload, 'bad secret')
        var response = chakram.post (end_point, payload)
        return expect(response).to.have.status(403)
    })

    it ("should return a 501 error when event type is not implemented", () => {
        var payload = loadGithubEventFixture ('ping')
        options.headers['X-GitHub-Event'] = 'gollum' // valid but unlikely to implement
	options.headers['X-Hub-Signature'] = sign (payload, secret)
        var response = chakram.post (end_point, payload)
        return expect(response).to.have.status(501)
    })

    it ("should return a 501 error when event type is invalid", () => {
        var payload = loadGithubEventFixture ('ping')
        options.headers['X-GitHub-Event'] = 'this is totally made up'
	options.headers['X-Hub-Signature'] = sign (payload, secret)
        var response = chakram.post (end_point, payload)
        return expect(response).to.have.status(501)
    })

    it ("should update the existing event when the event is re-delivered", () => {
        var payload = loadGithubEventFixture ('push_no_commits')
        options.headers['X-GitHub-Event'] = 'push'
	options.headers['X-Hub-Signature'] = sign (payload, secret)
        var response1 = chakram.post (end_point, payload)
        chakram.waitFor([ expect(response1).to.have.status(201) ]) // wait for 1st event
        var response2 = chakram.post (end_point, payload) // redeliver 1st event
        expect(response2).to.have.status(201) // should query DB to verify update
        return chakram.wait()
    })

    it ("should handle a ping event")

    it ("should handle a repository event")

    it ("should handle a create branch/tag event", () => {
        var payload = loadGithubEventFixture ('create')
        options.headers['X-GitHub-Event'] = 'create'
	options.headers['X-Hub-Signature'] = sign (payload, secret)
        var response = chakram.post (end_point, payload)
        return expect(response).to.have.status(201)
    })

    it ("should handle a delete branch/tag event")

    it ("should handle a push event with no commits", () => {
        var payload = loadGithubEventFixture ('push_no_commits')
        options.headers['X-GitHub-Event'] = 'push'
	options.headers['X-Hub-Signature'] = sign (payload, secret)
        var response = chakram.post (end_point, payload)
        return expect(response).to.have.status(201)
    })

    it ("should handle a push event with commits and files to add", () => {
        var payload = loadGithubEventFixture ('push_add_file')
        options.headers['X-GitHub-Event'] = 'push'
	options.headers['X-Hub-Signature'] = sign (payload, secret)
        var response = chakram.post (end_point, payload)
        return expect(response).to.have.status(201)
    })

    it ("should handle a push event with commits and files to modify", () => {
        var payload = loadGithubEventFixture ('push_modify_file')
        options.headers['X-GitHub-Event'] = 'push'
	options.headers['X-Hub-Signature'] = sign (payload, secret)
        var response = chakram.post (end_point, payload)
        return expect(response).to.have.status(201)
    })

    it ("should handle a push event with commits and files to remove", () => {
        var payload = loadGithubEventFixture ('push_remove_file')
        options.headers['X-GitHub-Event'] = 'push'
	options.headers['X-Hub-Signature'] = sign (payload, secret)
        var response = chakram.post (end_point, payload)
        return expect(response).to.have.status(201)
    })

    it ("should handle a pull request opened event")

    it ("should handle a pull request closed event")

    it ("should handle a pull request assigned event")

    it ("should handle a pull request labeled event")

    it ("should handle a pull request synchronized event")

    it ("should handle a pull request comment event")

    it ("should handle a status event")
})
