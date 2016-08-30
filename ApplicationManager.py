import os
import json
import hmac
from hashlib import sha1
from threading import Timer
from flask import Flask
from flask import request
from subprocess import Popen

app = Flask(__name__)


@app.route('/', methods=['POST'])
def git_hub_web_hook():
    payload_body = request.data

    enc_type, provided_hash = request.headers.get('X-Hub-Signature').split('=')
    if not check_secret(payload_body, provided_hash):
        print 'ERROR: Invalid secret.\n' + str(payload_body)
        return ''

    request_data = json.loads(payload_body)
    print 'Repository updated: ' + request_data['repository']['name']
    update_git_repo()
    return ''


def check_secret(payload_body, provided_hash):
    return provided_hash == hmac.new(os.environ.get('SECRET'), payload_body, digestmod=sha1).hexdigest()


def update_git_repo():
    if not hasattr(update_git_repo, 'process'):
        print 'Update git repository:'
        update_git_repo.process = Popen(['git', 'pull'], shell=False)
    elif update_git_repo.process.poll() is not None:
        print 'Update finished.'
        del update_git_repo.process
        start_demo_web_app()
        return

    # Keep calling this function every seconds until process is finished
    timer = Timer(1, update_git_repo)
    timer.start()


def start_demo_web_app():
    if not hasattr(start_demo_web_app, 'process'):
        print "Launching web application."
        start_demo_web_app.process = \
            Popen(['node', './bin/www', 'googleApiKey=' + os.environ.get('GOOGLE_API_KEY'), 'googleTrackingId=' + os.environ.get('GOOGLE_TRACKING_ID')], shell=False)
        return
    elif start_demo_web_app.process.poll() is None:
        print "Stopping web application."
        start_demo_web_app.process.kill()
    else:
        print "Web application stopped."
        del start_demo_web_app.process

    # Keep calling this function every seconds until app has started
    timer = Timer(1, start_demo_web_app)
    timer.start()


if __name__ == '__main__':
    start_demo_web_app()
    app.run(host='0.0.0.0')
