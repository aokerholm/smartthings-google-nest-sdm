"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FfmpegProcess = void 0;
const child_process_1 = require("child_process");
class FfmpegProcess {
    constructor(cameraName, sessionId, ffmpegArgs, log, debug, delegate, callback) {
        let pathToFfmpeg = require('ffmpeg-for-homebridge');
        if (!pathToFfmpeg)
            pathToFfmpeg = 'ffmpeg';
        log.debug(`Stream command: ${pathToFfmpeg} ${ffmpegArgs}`, cameraName);
        let started = false;
        this.process = (0, child_process_1.spawn)(pathToFfmpeg, ffmpegArgs.split(/\s+/), { env: process.env });
        if (this.process.stdin) {
            this.process.stdin.on('error', (error) => {
                if (!error.message.includes('EPIPE')) {
                    log.error(error.message, cameraName);
                }
            });
        }
        if (this.process.stderr) {
            this.process.stderr.on('data', (data) => {
                if (!started) {
                    started = true;
                    if (callback) {
                        callback();
                    }
                }
                if (debug) {
                    data.toString().split(/\n/).forEach((line) => {
                        log.debug(line, cameraName);
                    });
                }
            });
        }
        this.process.on('error', (error) => {
            log.error('Failed to start stream: ' + error.message, cameraName);
            if (callback) {
                callback(new Error('FFmpeg process creation failed'));
            }
            delegate.stopStream(sessionId);
        });
        this.process.on('exit', (code, signal) => {
            const message = 'FFmpeg exited with code: ' + code + ' and signal: ' + signal;
            if (code == null || code === 255) {
                if (this.process.killed) {
                    log.debug(message + ' (Expected)', cameraName);
                }
                else {
                    log.error(message + ' (Unexpected)', cameraName);
                }
            }
            else {
                log.error(message + ' (Error)', cameraName);
                delegate.stopStream(sessionId);
                if (!started && callback) {
                    callback(new Error(message));
                }
                else {
                    delegate.getController().forceStopStreamingSession(sessionId);
                }
            }
        });
    }
    stop() {
        this.process.kill('SIGKILL');
    }
    getStdin() {
        return this.process.stdin;
    }
}
exports.FfmpegProcess = FfmpegProcess;
//# sourceMappingURL=FfMpeg.js.map